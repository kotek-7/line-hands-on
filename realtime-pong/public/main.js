const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const scoreLeftEl = document.getElementById("score-left");
const scoreRightEl = document.getElementById("score-right");

// サーバーの start メッセージで上書きされる（初期値は保険）
let config = {
  field: { width: 800, height: 480 },
  paddle: { width: 12, height: 90, margin: 24 },
  ball: { radius: 9 },
  winScore: 5,
};

let side = null; // "left" | "right"
let paddleY = config.field.height / 2;
let running = false;

// サーバー権威なので、描画に使う状態はサーバーからの state をそのまま持つ
let state = {
  ball: { x: config.field.width / 2, y: config.field.height / 2 },
  paddles: { left: config.field.height / 2, right: config.field.height / 2 },
  scores: { left: 0, right: 0 },
};

// ---- WebSocket 接続 ----
// config.js に serverUrl があればそこへ、無ければ表示中のホストへ接続する
const configuredUrl = window.PONG_CONFIG && window.PONG_CONFIG.serverUrl;
const wsUrl = configuredUrl || `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}`;
const ws = new WebSocket(wsUrl);

ws.addEventListener("open", () => showOverlay("対戦相手を探しています…"));
ws.addEventListener("close", () => {
  running = false;
  showOverlay("接続が切れました。<br />リロードしてください。");
});

ws.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);

  switch (msg.type) {
    case "waiting":
      showOverlay("対戦相手を探しています…");
      break;

    case "start":
      config = { field: msg.field, paddle: msg.paddle, ball: msg.ball, winScore: msg.winScore };
      side = msg.side;
      paddleY = config.field.height / 2;
      canvas.width = config.field.width;
      canvas.height = config.field.height;
      running = true;
      hideOverlay();
      break;

    case "state":
      state = msg;
      updateScore();
      break;

    case "gameover":
      running = false;
      updateScore();
      showOverlay(
        msg.winner === side
          ? "🏆 あなたの勝ち！<br />リロードで再戦"
          : "😢 あなたの負け…<br />リロードで再戦",
      );
      break;

    case "opponent_left":
      running = false;
      showOverlay("対戦相手が退出しました。<br />リロードしてください。");
      break;
  }
});

// ---- 入力: パドル位置をサーバーへ送る ----
function sendPaddle() {
  if (running && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "input", y: paddleY }));
  }
}

canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  const scale = config.field.height / rect.height;
  paddleY = (event.clientY - rect.top) * scale;
  sendPaddle();
});

const keys = { up: false, down: false };
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") keys.up = true;
  if (e.key === "ArrowDown") keys.down = true;
});
document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowUp") keys.up = false;
  if (e.key === "ArrowDown") keys.down = false;
});

// キー操作は毎フレームなめらかに動かし、位置をサーバーへ送る
setInterval(() => {
  if (!running) return;
  if (keys.up || keys.down) {
    const step = 8;
    paddleY += (keys.down ? step : 0) - (keys.up ? step : 0);
    const half = config.paddle.height / 2;
    paddleY = Math.max(half, Math.min(config.field.height - half, paddleY));
    sendPaddle();
  }
}, 1000 / 60);

// ---- 描画ループ ----
function draw() {
  const { width, height } = config.field;
  ctx.clearRect(0, 0, width, height);

  // センターライン
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 14]);
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();
  ctx.setLineDash([]);

  // パドル
  const p = config.paddle;
  ctx.fillStyle = "#7c5cff";
  drawPaddle(p.margin, state.paddles.left);
  ctx.fillStyle = "#ff6b9d";
  drawPaddle(width - p.margin - p.width, state.paddles.right);

  // 自分側を示すマーカー
  if (side) {
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "14px system-ui";
    ctx.textAlign = "center";
    const x = side === "left" ? width * 0.25 : width * 0.75;
    ctx.fillText("YOU", x, height - 16);
  }

  // ボール
  ctx.fillStyle = "#f4f4fb";
  ctx.beginPath();
  ctx.arc(state.ball.x, state.ball.y, config.ball.radius, 0, Math.PI * 2);
  ctx.fill();

  requestAnimationFrame(draw);
}

function drawPaddle(x, centerY) {
  const p = config.paddle;
  const y = centerY - p.height / 2;
  ctx.beginPath();
  ctx.roundRect(x, y, p.width, p.height, 6);
  ctx.fill();
}

function updateScore() {
  scoreLeftEl.textContent = state.scores.left;
  scoreRightEl.textContent = state.scores.right;
}

function showOverlay(html) {
  overlay.innerHTML = html;
  overlay.classList.remove("hidden");
}

function hideOverlay() {
  overlay.classList.add("hidden");
}

requestAnimationFrame(draw);
