// Pong が接続する WebSocket サーバーの URL。
//
// - 空文字 ""            : いま表示しているホストへ接続する（ローカル開発 / Railway 直アクセス用）
// - "wss://xxx.up.railway.app" : 別ホスト（GitHub Pages 等）から Railway のサーバーへ接続する場合に設定
//
// GitHub Pages で配信するときだけ、下の serverUrl に Railway の公開 URL を入れてください。
window.PONG_CONFIG = {
  serverUrl: "",
};
