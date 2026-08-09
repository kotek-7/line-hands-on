# 講師用メモ

参加者にはルートの `script.js` を編集してもらいます。このディレクトリにはSupabaseの準備と完成コードだけ置いてあります。

## 事前準備

1. 講座用のSupabaseプロジェクトを作る
2. SQL Editorで `schema.sql` を実行する
3. ルートの `config.js` にProject URLとPublishable keyまたはAnon keyを設定する
4. `instructor/complete.js` を一時的に `script.js` と差し替え、2つのブラウザで送受信を確認する
5. 配布前に `script.js` をスターターへ戻す

`schema.sql` は講座用に、匿名クライアントから `messages` のSELECT/INSERTを許可します。個人情報や秘密情報を入れる用途では使わないでください。

## 講座中の完成まで

スターターから最終形へ一気に答えを見せるのではなく、スライドに合わせて次の順でコードを変えます。

1. `messages.forEach(...)` とフォーム送信時の `appendMessage(message)`
2. `loadMessages()` の `select` とフォーム送信時の `insert`
3. `setInterval(loadMessages, 1000)`
4. Pollingを外し、RealtimeのINSERTイベントを `console.log(payload)`
5. `appendMessage(payload.new)` を追加
6. 送信直後の `appendMessage(message)` を削除

`complete.js` は6まで終えた状態です。
