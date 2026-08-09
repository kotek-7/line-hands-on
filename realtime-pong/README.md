# Realtime Pong

WebSocketで作る、2人対戦のリアルタイムPong（卓球）。
WebSocketの典型的な用途である「サーバー権威型のリアルタイム同期」を最小構成で示すサンプル。

## 仕組み

```
プレイヤーA ──入力(パドル位置)──▶  サーバー  ◀──入力(パドル位置)── プレイヤーB
プレイヤーA ◀──状態(60fps)────── (物理演算) ──状態(60fps)──▶ プレイヤーB
```

- **サーバー権威型**: ボールの物理・衝突・得点はすべてサーバーで計算する。クライアントは自分のパドル位置を送るだけ。
- **状態同期**: サーバーが毎秒60回、全体の状態（ボール・両パドル・スコア）を両プレイヤーへ配信する。
- **マッチング**: 接続してきた順に2人を1ルームへ組む。片方が切断するともう片方へ通知する。
- 先に5点取ったほうが勝ち。

## 実行方法

Node.js（v18以上）が必要。

```bash
cd realtime-pong
npm install
npm start
```

ブラウザで `http://localhost:3000` を **2つのタブ（または2台の端末）** で開くと対戦が始まる。

## 操作

- マウス移動、または `↑` `↓` キーでパドルを動かす。

## ファイル構成

```
realtime-pong/
├── package.json
├── server.js          … HTTP配信 + WebSocketサーバー（ゲームロジック）
├── public/
│   ├── index.html
│   ├── style.css
│   └── main.js        … Canvas描画 + 入力送信 + 状態受信
└── README.md
```

## デプロイ

WebSocketサーバーは常駐プロセスが必要なため、GitHub Pages（静的配信）単体では動かない。
このサーバーは静的ファイルも配信するので、**Railwayへデプロイした時点でクライアントごと動く**。
GitHub Pagesは「別ホストからクライアントだけ配信したい場合」の任意ステップ。

### 1. サーバーを Railway にデプロイ

Railway CLI を使う場合（`realtime-pong/` で実行）:

```bash
npm i -g @railway/cli
railway login
railway init          # 新規プロジェクトを作成
railway up            # デプロイ
railway domain        # 公開URLを発行（例: https://xxx.up.railway.app）
```

- `PORT` は Railway が自動で渡す（`server.js` は `process.env.PORT` を使用）。
- 発行された `https://xxx.up.railway.app` をブラウザで2タブ開けば、そのまま対戦できる。

（ダッシュボード派の場合: railway.app で「Deploy from GitHub repo」→ このリポジトリ →
Root Directory を `realtime-pong` に設定 → Generate Domain。）

### 2.（任意）クライアントを GitHub Pages に置く

`public/config.js` の `serverUrl` に Railway の URL を **wss** で設定する:

```js
window.PONG_CONFIG = {
  serverUrl: "wss://xxx.up.railway.app",
};
```

`public/` 一式を Pages で配信すれば、Pages 側の画面から Railway のサーバーへ接続して対戦できる。
（`http` の Railway URL でも `wss://` を指定すること。Railway は HTTPS/WSS を終端する。）

## 設計メモ

- クライアントから届くパドル位置は、サーバー側で場外に出ないようクランプする（値を信用しすぎない）。
- 描画に使う座標は論理座標（800×480固定）。CSSでの拡大縮小はマウス座標変換側で吸収する。
- LINE教材（Supabase Realtime）が「DBの変更を購読する」高レベルなリアルタイムなのに対し、
  こちらは生のWebSocketで「双方向・低遅延・サーバー権威」を扱う対比サンプルになっている。
```
