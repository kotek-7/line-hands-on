# LINE 作ってみようの会

Webアプリ開発入門 第3回のハンズオン用リポジトリです。

今回は、LINE風のグループチャットを作りながら、DBに保存したメッセージを別のブラウザへリアルタイムに反映するところまで進めます。

## 使うもの

- HTML / CSS / JavaScript
- Supabase Database
- Supabase Realtime (Postgres Changes)
- VS Code + Live Server

## はじめる

1. このリポジトリをVS Codeで開く
2. `config.js` に講師から案内されたSupabaseのURLとPublishable/Anon keyを入れる
3. `index.html` をLive Serverで開く

最初は見た目だけ完成しています。`script.js` の `TODO` を埋めながら進めます。

```text
line-hands-on/
├── index.html
├── style.css
├── script.js
├── config.js
└── instructor/
    ├── README.md
    ├── complete.js
    └── schema.sql
```

`instructor/` は講師用です。

## 今日やること

1. 配列のメッセージを画面に出す
2. 送信したメッセージをSupabaseへ保存する
3. Pollingで別ブラウザの更新を拾ってみる
4. RealtimeでINSERTを待ち受ける
5. 二重表示を直して、チャットを完成させる

## Supabaseについて

講座では、`messages` テーブルとRealtimeの設定が終わった共通プロジェクトを使う想定です。講師側の準備は [instructor/README.md](instructor/README.md) を参照してください。
