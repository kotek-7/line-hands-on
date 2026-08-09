import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, normalize, extname } from "node:path";
import { WebSocketServer } from "ws";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "public");
const PORT = process.env.PORT || 3000;

// ---- ゲーム設定（サーバーとクライアントで共有する論理座標系）----
const FIELD = { width: 800, height: 480 };
const PADDLE = { width: 12, height: 90, margin: 24, speed: 480 };
const BALL = { radius: 9, speed: 360, maxSpeed: 720 };
const WIN_SCORE = 5;
const TICK_HZ = 60;

// ---- 静的ファイル配信 ----
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

const server = http.createServer(async (req, res) => {
  const urlPath = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  const filePath = normalize(join(PUBLIC_DIR, urlPath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  try {
    const body = await readFile(filePath);
    res.writeHead(200, { "Content-Type": MIME[extname(filePath)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end("Not Found");
  }
});

// ---- WebSocket ----
const wss = new WebSocketServer({ server });

/** マッチング待ちのソケット（最大1人）。2人揃ったらルームを作る。 */
let waiting = null;

function send(socket, message) {
  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

class Room {
  constructor(left, right) {
    this.players = { left, right };
    left.side = "left";
    right.side = "right";
    left.room = this;
    right.room = this;
    left.paddleY = right.paddleY = FIELD.height / 2;
    this.scores = { left: 0, right: 0 };
    this.ball = {};
    this.resetBall(Math.random() < 0.5 ? 1 : -1);
    this.over = false;

    send(left, { type: "start", side: "left", field: FIELD, paddle: PADDLE, ball: BALL, winScore: WIN_SCORE });
    send(right, { type: "start", side: "right", field: FIELD, paddle: PADDLE, ball: BALL, winScore: WIN_SCORE });

    this.lastTime = Date.now();
    this.timer = setInterval(() => this.tick(), 1000 / TICK_HZ);
  }

  resetBall(direction) {
    // ゆるい角度で中央から発射する
    const angle = (Math.random() * 0.5 - 0.25) * Math.PI;
    this.ball = {
      x: FIELD.width / 2,
      y: FIELD.height / 2,
      vx: Math.cos(angle) * BALL.speed * direction,
      vy: Math.sin(angle) * BALL.speed,
    };
  }

  tick() {
    const now = Date.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (this.over) return;

    const ball = this.ball;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // 上下の壁で反射
    if (ball.y < BALL.radius) {
      ball.y = BALL.radius;
      ball.vy = Math.abs(ball.vy);
    } else if (ball.y > FIELD.height - BALL.radius) {
      ball.y = FIELD.height - BALL.radius;
      ball.vy = -Math.abs(ball.vy);
    }

    // パドルとの衝突判定
    this.collidePaddle("left", this.players.left.paddleY);
    this.collidePaddle("right", this.players.right.paddleY);

    // 得点判定
    if (ball.x < -BALL.radius) {
      this.scores.right += 1;
      this.afterScore(1);
    } else if (ball.x > FIELD.width + BALL.radius) {
      this.scores.left += 1;
      this.afterScore(-1);
    }

    this.broadcast({
      type: "state",
      ball: { x: round(ball.x), y: round(ball.y) },
      paddles: {
        left: round(this.players.left.paddleY),
        right: round(this.players.right.paddleY),
      },
      scores: this.scores,
    });
  }

  collidePaddle(side, paddleY) {
    const ball = this.ball;
    const paddleX = side === "left" ? PADDLE.margin + PADDLE.width : FIELD.width - PADDLE.margin - PADDLE.width;
    const movingToward = side === "left" ? ball.vx < 0 : ball.vx > 0;
    if (!movingToward) return;

    const hitX = side === "left"
      ? ball.x - BALL.radius <= paddleX && ball.x > paddleX - PADDLE.width
      : ball.x + BALL.radius >= paddleX && ball.x < paddleX + PADDLE.width;
    const within = ball.y >= paddleY - PADDLE.height / 2 && ball.y <= paddleY + PADDLE.height / 2;

    if (hitX && within) {
      // 当たった位置で跳ね返り角度を変える（中心=まっすぐ、端=鋭角）
      const offset = (ball.y - paddleY) / (PADDLE.height / 2); // -1..1
      const speed = Math.min(Math.hypot(ball.vx, ball.vy) * 1.05, BALL.maxSpeed);
      const dir = side === "left" ? 1 : -1;
      const angle = offset * (Math.PI / 3); // 最大60度
      ball.vx = Math.cos(angle) * speed * dir;
      ball.vy = Math.sin(angle) * speed;
      ball.x = side === "left" ? paddleX + BALL.radius : paddleX - BALL.radius;
    }
  }

  afterScore(nextDirection) {
    const winner =
      this.scores.left >= WIN_SCORE ? "left" : this.scores.right >= WIN_SCORE ? "right" : null;
    if (winner) {
      this.over = true;
      this.broadcast({ type: "gameover", winner, scores: this.scores });
      clearInterval(this.timer);
      return;
    }
    this.resetBall(nextDirection);
  }

  setPaddle(socket, y) {
    // クライアントから届いた位置をサーバー側でクランプする
    const half = PADDLE.height / 2;
    socket.paddleY = Math.max(half, Math.min(FIELD.height - half, y));
  }

  broadcast(message) {
    send(this.players.left, message);
    send(this.players.right, message);
  }

  close(leaver) {
    clearInterval(this.timer);
    const other = leaver === this.players.left ? this.players.right : this.players.left;
    send(other, { type: "opponent_left" });
    other.room = null;
  }
}

function round(n) {
  return Math.round(n);
}

wss.on("connection", (socket) => {
  socket.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }
    if (msg.type === "input" && socket.room && typeof msg.y === "number") {
      socket.room.setPaddle(socket, msg.y);
    }
  });

  socket.on("close", () => {
    if (waiting === socket) {
      waiting = null;
    } else if (socket.room) {
      socket.room.close(socket);
    }
  });

  // マッチング
  if (waiting && waiting.readyState === waiting.OPEN) {
    const opponent = waiting;
    waiting = null;
    new Room(opponent, socket);
  } else {
    waiting = socket;
    send(socket, { type: "waiting" });
  }
});

server.listen(PORT, () => {
  console.log(`Realtime Pong: http://localhost:${PORT}`);
});
