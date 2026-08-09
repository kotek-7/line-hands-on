# Webアプリ開発入門 第3回
## 「LINE 作ってみようの会」詳細スライドプラン

作成日: 2026-08-09

想定枚数: 76枚

題材: LINE風グループチャット

技術テーマ: Supabase Realtime（Postgres Changes）

---

## この資料の使い方

各スライドを次の4項目で記述する。

- **スライドに載せるテキスト**: Canva上にそのまま置く文言
- **画面・図版**: スクリーンショット、コード、矢印などの構成
- **進行**: 講師が話すこと、参加者にしてもらうこと
- **到達状態**: そのスライドを終えた時点の教材コードまたは理解

スライド上部の紫色ラベル、白背景の説明スライド、紫色グラデーションの章扉は第1・2回を踏襲する。実習スライドでは、左に手順、右にコードまたは実行結果を置く。結果や違和感を扱うスライドは情報を増やさず、「消えた」「来た！」「スマートか？」のような短い言葉を大きく見せる。

`Challenge`は講師側の設計単位であり、スライドには原則として表示しない。「まず動かしてみよう」「リロードしてみよう」「原因を探してみよう」と自然な課題として渡す。

---

## 講座全体の流れ

> LINEを動かす
> → リロードすると消える
> → DBに保存する
> → 相手の画面には出ない
> → 1秒ごとに読み直す
> → 動くが、無駄が多い
> → DBの変更を待ち受ける
> → 自分の投稿だけ二重になる
> → 表示経路を整理する
> → 完成

| 範囲 | 章 | 参加者が解く課題 |
|---|---|---|
| 1–6 | 導入 | 完成版を触り、今日作る動きを知る |
| 7–9 | 0. 環境構築 | スターターを起動する |
| 10–24 | 1. まずLINEを動かしてみよう | 配列表示とフォーム送信を組み合わせる |
| 25–41 | 2. メッセージをDBに残そう | `select`と`insert`で永続化する |
| 42–53 | 3. なんとかして相手にも出したい | Pollingを実装し、限界を確かめる |
| 54–66 | 4. 変更されたときだけ受け取ろう | INSERTを購読し、画面へつなぐ |
| 67–76 | 5. LINEを完成させよう | 二重表示を診断し、IDで同じメッセージを見分ける |

---

# 導入 1–6

## Slide 01 — タイトル

**スライドに載せるテキスト**

```text
LINE 作ってみようの会

Webアプリ開発入門 第3回
2026年8月　Do’er
```

**画面・図版**

- 第1・2回と同じ紫色グラデーションの全面背景
- 中央にタイトル
- サブタイトルと日付は小さく下へ置く

**進行**

「第3回はLINEのような、複数人で同時に使えるWebアプリを作ります」とだけ伝える。Realtimeの説明はしない。

---

## Slide 02 — また自己紹介

**スライドに載せるテキスト**

```text
また自己紹介

名前：kotek（鈴木 倖人）

同志社大学プログラミングサークル Do’er 代表
同志社大学ロボット研究会
電子工学科3回生
ハッカソンに出たりロボコンもやってたり
ご飯とかカラオケとか誘ってください！

@kotek__D　　@kotek-7
```

**画面・図版**

- 第2回の自己紹介スライドと同じレイアウト
- 右下にX、GitHubのアイコンとID

**進行**

長く説明せず、前回までと同じ内容で終える。

---

## Slide 03 — 今日作るもの

**スライドに載せるテキスト**

```text
今日作るもの

Aが送ると、Bにも届く
```

**画面・図版**

- 左にブラウザA、右にブラウザBの完成画面
- Aの入力欄に「こんにちは！」
- AとBの両方に同じ吹き出しが現れた状態
- AからBへ細い紫の矢印

**進行**

「今日は、みんなで同じチャットに入ります。誰かが送ると、自分の画面にも他の人の画面にも出ます」と伝える。

---

## Slide 04 — まず完成版を触る

**スライドに載せるテキスト**

```text
まず、完成版を触ってみよう！

1. 一言送る
2. ほかの人の画面を見る
```

**画面・図版**

- 左に3ステップ
- 右に完成版のQRコードまたはURL
- 下に小さく「まだ仕組みは考えなくてOK」

**進行**

2〜3分。参加者全員に一言送ってもらう。送信者だけでなく、周囲の画面にも同じメッセージが出ることを確認する。

**到達状態**

今日の完成像を操作として知っている。

---

## Slide 05 — シリーズの現在地

**スライドに載せるテキスト**

```text
作るもの

第1回：Xを作ってみよう！
テーマ：UI

第2回：Instagramを作ってみよう！
テーマ：データベース

今回：LINEを作ってみよう！
テーマ：リアルタイム通信

第4回：クッキークリッカーを作ってみよう！
テーマ：Webアプリの公開
```

**画面・図版**

- 第1・2回の「作るもの」と同じ縦並び
- 「今回」の行だけ紫で強調

**進行**

「前回はデータを保存しました。今回は、保存された変化を別の画面にも届けます」とつなぐ。

---

## Slide 06 — 今日の流れ

**スライドに載せるテキスト**

```text
今日の流れ

0. 環境構築
1. まずLINEを動かしてみよう
2. メッセージをDBに残そう
3. なんとかして相手にも出したい
4. 変更されたときだけ受け取ろう
5. LINEを完成させよう
```

**画面・図版**

- 目次のみ
- 技術名ではなく、アプリが変化する順で並べる

**進行**

各項目は読み上げない。「最初から手を動かします」とだけ伝える。

---

# 0. 環境構築 7–9

## Slide 07 — 章扉

**スライドに載せるテキスト**

```text
0. 環境構築
```

**画面・図版**

- 紫色グラデーション背景
- 中央に章番号と章名

---

## Slide 08 — 今日のプロジェクトを開く

**スライドに載せるテキスト**

```text
今日のプロジェクトを開く

1. line-hands-on を取得
2. VS Codeでフォルダを開く
3. config.js にURL・キー・名前を入力
4. index.html を Live Server で開く
```

```bash
git clone https://github.com/Doer-org/line-hands-on
```

**画面・図版**

- 左に4ステップ
- 右上にGitHubのリポジトリ画面
- 右下にVS Codeのフォルダ構成

```js
window.SUPABASE_CONFIG = {
  url: "講師から案内されたURL",
  key: "講師から案内されたキー",
  userName: "自分の名前",
};
```

```text
line-hands-on/
├── index.html
├── style.css
├── script.js
└── config.js
```

**進行**

講師がSupabase URLとPublishable keyまたはAnon keyを提示する。参加者は`userName`だけ自分の名前へ変更する。`service_role` keyは配布しない。環境準備で詰まった参加者を個別に支援する。

**到達状態**

`index.html`がLive Serverで開いている。

---

## Slide 09 — いまは見た目だけ

**スライドに載せるテキスト**

```text
いまは「見た目だけ」のLINE

・メッセージは表示されない
・送信ボタンを押しても何も起きない
```

**画面・図版**

- ブラウザの初期画面を大きく表示
- 空のチャット欄にある文言を見える大きさで載せる

```text
まだメッセージはありません
script.js を動かして表示してみよう
```

**進行**

送信ボタンを一度押して、何も起きないことを確認する。「HTML/CSSは完成済みです。今日は`script.js`だけを触ります」と伝える。

---

# 1. まずLINEを動かしてみよう 10–24

## Slide 10 — 最初の課題

**スライドに載せるテキスト**

```text
1. まずLINEを動かしてみよう

まず、ここまで動かしてみよう！

1. messages の3件を全部表示する
2. フォームから新しいメッセージを追加する
```

**画面・図版**

- 左に課題文
- 右に完成状態のブラウザ
- 3件の初期メッセージと、フォームから追加した1件を表示

**進行**

1件表示の練習は挟まない。配列、オブジェクト、`submit`イベントを組み合わせる課題として渡す。

---

## Slide 11 — スタート地点

**スライドに載せるテキスト**

```text
スタート地点

script.js の TODO 1〜3を埋める
```

```js
const messages = [
  { user_name: "Taro", body: "こんにちは！" },
  { user_name: "Hanako", body: "やっほー" },
  { user_name: "Doer", body: "LINEを作ろう" },
];

// TODO 1: messagesを全部表示

form.addEventListener("submit", (event) => {
  event.preventDefault();

  // TODO 2: 入力からmessageを作る
  // TODO 3: messageを画面へ追加
});
```

**画面・図版**

- コードをスライドの大部分に置く
- `TODO 1`〜`TODO 3`を紫の枠で囲む

**進行**

`appendMessage(message)`は教材側ですでに用意されていると伝える。中身は読ませない。

---

## Slide 12 — まず10分

**スライドに載せるテキスト**

```text
まず自分で動かしてみよう！

10 min
```

**画面・図版**

- 白背景
- 中央に課題文を大きく表示
- 右下に小さく完成条件

```text
✓ 最初から3件表示される
✓ 送信すると1件増える
```

**進行**

タイマーを開始し、講師は机を回る。参加者の進み方を見てSlide 13、14を順に出す。

---

## Slide 13 — ヒント1

**スライドに載せるテキスト**

```text
詰まったら：ヒント1

配列の全要素について処理する
```

```js
messages.forEach((message) => {
  // messageを使う
});
```

```text
入力欄の値を読む
```

```js
userName
messageInput.value
```

**画面・図版**

- 上段に`forEach`
- 下段に`config.js`から読んだ`userName`と入力欄の`.value`
- 完成コードにはしない

**進行**

開始から4〜5分後に表示する。すでに進めている人はそのまま続けてもらう。

---

## Slide 14 — ヒント2

**スライドに載せるテキスト**

```text
詰まったら：ヒント2

1件のメッセージを画面に追加する関数
```

```js
appendMessage(message);
```

```text
messageの形
```

```js
const message = {
  user_name: userName,
  body: /* 本文 */,
};
```

**進行**

「必要な部品はすべて出ています。どこで組み合わせるか考えてください」と伝える。

---

## Slide 15 — 最初の3件を表示

**スライドに載せるテキスト**

```text
messages を全部表示
```

```js
messages.forEach((message) => {
  appendMessage(message);
});
```

**画面・図版**

- 左にコード
- 右に3件表示されたブラウザ
- `message`から吹き出しへ紫の矢印

**進行**

参加者と一緒に答え合わせする。`forEach`自体の再講義はしない。

**到達状態**

ページを開くと、配列の3件が表示される。

---

## Slide 16 — フォームから追加

**スライドに載せるテキスト**

```text
フォームからメッセージを追加
```

```js
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const message = {
    user_name: userName,
    body: messageInput.value,
  };

  appendMessage(message);
});
```

**画面・図版**

- コードの`message`と`appendMessage(message)`を同じ紫色で対応させる
- 右下に送信後の吹き出し。`userName`と一致する自分のメッセージは、右側の緑色の吹き出しとして見せる

**進行**

本文を変えて2回ほど送る。名前は`config.js`の`userName`から入り、フォームから読むのは本文だけであることを確認する。

---

## Slide 17 — 動いた！

**スライドに載せるテキスト**

```text
動いた！
```

**画面・図版**

- ブラウザの完成状態を大きく表示
- 3件の初期メッセージと、自分で追加した吹き出し
- 余計な説明は置かない

**進行**

参加者の画面でも同じ状態になっていることを確認する。

---

## Slide 18 — いま扱っていたもの

**スライドに載せるテキスト**

```text
いま扱っていたもの

message　= 1件のメッセージ
messages = messageの配列
```

```js
const message = {
  user_name: "Taro",
  body: "こんにちは！",
};
```

**画面・図版**

- 左に`message`
- 右に吹き出し1件
- 下に小さく「第2回の post / posts と同じ形」

**進行**

実装後に名前を回収する。「新しいデータ構造を覚えたわけではなく、前回の投稿がメッセージに変わっただけ」と伝える。

---

## Slide 19 — 2本の入口、1つの表示処理

**スライドに載せるテキスト**

```text
2本の入口、1つの表示処理
```

```text
messages ─┐
          ├→ message → appendMessage → 吹き出し
form ─────┘
```

**画面・図版**

- 上の流れを中央に大きく配置
- `messages`と`form`は紫
- `appendMessage`は黒いコード風の箱

**進行**

「最初からあるデータも、フォームから作ったデータも、最後は同じ関数に渡しています」と確認する。この構図は後半の`payload.new`で再利用する。

---

## Slide 20 — これでLINE完成？

**スライドに載せるテキスト**

```text
これでLINE完成？
```

**画面・図版**

- 白背景に問いだけ

**進行**

参加者から「リロードすると消える」「他の人には届かない」などの反応を待つ。答えが出なくても次へ進む。

---

## Slide 21 — リロードしてみよう

**スライドに載せるテキスト**

```text
リロードしてみよう

Windows：Ctrl + R
Mac：Command + R
```

**画面・図版**

- リロードアイコンを大きく表示

**進行**

全員に実際にリロードしてもらう。講師は先に結果を言わない。

---

## Slide 22 — 消えた

**スライドに載せるテキスト**

```text
消えた
```

**画面・図版**

- リロード前後を左右に並べる
- フォームから追加したメッセージだけが消えている

**進行**

「最初の3件はコードに書いてあるので戻りました。自分で送った分はどこにも残していません」と伝える。

---

## Slide 23 — どこにあった？

**スライドに載せるテキスト**

```text
送ったメッセージは、どこにあった？

ブラウザの中だけ
```

```text
フォーム → message → 画面
                      × 保存先なし
```

**画面・図版**

- `保存先なし`を紫の手書き丸で囲む

**進行**

DBの一般論は話さない。現在のデータの流れに保存先がないことだけ確認する。

---

## Slide 24 — 次の課題

**スライドに載せるテキスト**

```text
リロードしても残るようにしよう！
```

**画面・図版**

- 白背景
- 下に小さく`ブラウザ → DB`の矢印

**進行**

前回使ったSupabaseへ接続する。

---

# 2. メッセージをDBに残そう 25–41

## Slide 25 — 章扉

**スライドに載せるテキスト**

```text
2. メッセージをDBに残そう

messagesをブラウザの外へ
```

**画面・図版**

- 紫色グラデーション背景

---

## Slide 26 — messagesテーブル

**スライドに載せるテキスト**

```text
今回の messages テーブル
```

| column | 中身 | 例 |
|---|---|---|
| `id` | ID | `12` |
| `user_name` | 名前 | `Taro` |
| `body` | 本文 | `こんにちは！` |
| `created_at` | 送信日時 | `2026-08-09 ...` |

```text
Supabaseとの接続とテーブル作成は済んでいます
```

**画面・図版**

- 左に表
- 右にSupabase Table Editorのスクリーンショット

**進行**

`user_name`と`body`が、先ほどの`message`と同じ名前であることを指す。

---

## Slide 27 — 今度はここまで

**スライドに載せるテキスト**

```text
今度はここまで

1. 起動時にDBから過去メッセージを全部読む
2. 送信したmessageをDBへ保存する

完成条件
✓ リロードしても履歴が戻る
✓ Table Editorにも行が増える
```

**画面・図版**

- 左に2要件
- 右に「リロード前／後で同じ履歴」の比較

**進行**

2つを一つの課題として渡す。既存の`messages.forEach(...)`はDBからの読込に置き換えることを明示する。

---

## Slide 28 — 使える道具

**スライドに載せるテキスト**

```text
使える道具

DBから読む：select
```

```js
const { data } = await supabase
  .from("messages")
  .select();
```

```text
DBへ保存：insert
```

```js
const { data } = await supabase
  .from("messages")
  .insert(message)
  .select()
  .single();
```

**画面・図版**

- 上下2段
- `select`と`insert`だけ紫で強調

**進行**

APIの逐語解説はしない。`select`では`data`に配列が返り、`insert(...).select().single()`では保存された1行が`data`へ返る、とだけ伝える。返された行にはDBが付けた`id`と`created_at`も入る。

---

## Slide 29 — await

**スライドに載せるテキスト**

```text
前提知識：await

Supabaseの処理が終わるまで、ここで待つ
```

```js
const { data } = await supabase
  .from("messages")
  .select();
```

**画面・図版**

- `await`に下線
- `ブラウザ → Supabase → 結果`の小さな往復矢印

**進行**

Promiseや非同期処理全般には広げない。フォーム側で`await`を使うため、イベント関数に`async`が必要になることは個別に示す。

---

## Slide 30 — まず15分

**スライドに載せるテキスト**

```text
ローカルのmessagesを
DB版に置き換えてみよう！

15 min
```

**画面・図版**

- 中央に課題文
- 右下に小さく対象箇所

```text
・ページを開いたとき
・フォームを送信したとき
```

**進行**

7分ほど自力で進めたあとSlide 31を出す。

---

## Slide 31 — ヒント

**スライドに載せるテキスト**

```text
詰まったら：ヒント

dataは、さっきのmessagesとほぼ同じ配列
```

```js
data.forEach((message) => {
  appendMessage(message);
});
```

```text
formで作ったmessageは、そのままinsertできる
```

```js
const { data } = await supabase
  .from("messages")
  .insert(message)
  .select()
  .single();
```

**進行**

`loadMessages`という関数名も口頭で与えてよい。表示前に既存の`.message-row`を削除する必要は、次の答え合わせで扱う。

---

## Slide 32 — DBから読む

**スライドに載せるテキスト**

```text
DBからメッセージを読む
```

```js
async function loadMessages() {
  const { data } = await supabase
    .from("messages")
    .select()
    .order("created_at", { ascending: true });

  feed.querySelectorAll(".message-row")
    .forEach((row) => row.remove());

  data.forEach((message) => {
    appendMessage(message);
  });
}

await loadMessages();
```

**画面・図版**

- コードを大きく表示
- `select → data → forEach → appendMessage`を番号1〜4で示す

**進行**

ローカル配列を表示していた`messages.forEach(...)`は削除する。`.order(...)`は送信日時の古い順に並べるためと短く説明する。

**到達状態**

ページを開くとDBの全メッセージが古い順に表示される。

---

## Slide 33 — dataを見てみる

**スライドに載せるテキスト**

```text
dataを見てみよう
```

```js
console.log(data);
```

```text
あれ、messagesと同じだ
```

**画面・図版**

- DevTools Consoleで配列を展開したスクリーンショット
- 1要素の`user_name`と`body`を紫で囲む

**進行**

参加者にもConsoleで展開してもらう。「保存場所がJavaScriptファイルからDBへ変わっても、画面側が受け取る形は同じ」と確認する。

---

## Slide 34 — DBへ送る

**スライドに載せるテキスト**

```text
送ったmessageをDBへ保存
```

```js
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = {
    user_name: userName,
    body: messageInput.value.trim(),
  };

  const { data } = await supabase
    .from("messages")
    .insert(message)
    .select()
    .single();

  appendMessage(data);
});
```

**画面・図版**

- `async`、`.insert(message)`、`.select().single()`を順に紫の番号で示す
- `appendMessage(data)`には「DBから返った1行を表示」と注釈

**進行**

この時点では`appendMessage(data)`で送信直後に表示する。後半では、同じ行がRealtimeからも届くため二重表示が起きる。

---

## Slide 35 — Table Editorを確認

**スライドに載せるテキスト**

```text
本当に保存された？

Supabase → Table Editor → messages
```

**画面・図版**

- Table Editorのスクリーンショット
- 追加された最新行を紫の枠で囲む
- `user_name`、`body`、`created_at`へ矢印

**進行**

参加者が一件送ったあと、講師画面でTable Editorを更新する。ブラウザの見た目だけでなく、DBに行が増えたことを確認する。

---

## Slide 36 — リロードしても残る

**スライドに載せるテキスト**

```text
リロードしても残ってる！
```

**画面・図版**

- リロード前後のブラウザ
- 同じメッセージが残っている

**進行**

全員にリロードしてもらう。第2回と同じ「DBへ保存できた」到達点を一度完成させる。

---

## Slide 37 — 2人でLINEしてみよう

**スライドに載せるテキスト**

```text
じゃあ、2人でLINEしてみよう！

隣の人と同じチャットを開く
```

**画面・図版**

- PC AとPC Bを左右に置く
- 両方が同じ`messages`テーブルへつながる図

**進行**

同じPCで試す場合は、`config.js`の`userName`が同一になるため、自分・相手の見た目は区別しにくい。講座では別PCを使い、それぞれの`config.js`へ別の名前を設定する。

---

## Slide 38 — AとBを準備

**スライドに載せるテキスト**

```text
A　　　　　　　　　B

config.js　　　　　 config.js
userName: "Taro"　　userName: "Hanako"

両方とも、いま同じ履歴が見えている
```

**画面・図版**

- AとBのブラウザを等幅で並べる
- 現時点の履歴が同じであることを示す

**進行**

Bはそのまま触らず、次のスライドでAだけ操作する。

---

## Slide 39 — Aから送る

**スライドに載せるテキスト**

```text
Aから送信

こんにちは！
```

**画面・図版**

- A側の入力と送信ボタンを拡大
- A側には新しい吹き出しが表示された状態

**進行**

Aから送る。参加者にはB側の画面も同時に見てもらう。

---

## Slide 40 — Bには出ない

**スライドに載せるテキスト**

```text
B：……
```

**画面・図版**

- Bの画面だけを大きく表示
- 新しいメッセージはない

**進行**

数秒待つ。何も起こらないことを十分に見せる。

---

## Slide 41 — DBにはある。でもBにはない

**スライドに載せるテキスト**

```text
DBにはある
でも、Bの画面にはない
```

```text
A ── insert ──→ DB

B　　　　　　 何もしていない
```

**画面・図版**

- 左にTable Editorの最新行
- 右に更新されないBの画面
- 中央に上の流れ

**進行**

「保存できること」と「ほかの画面が変わること」は別だと、挙動から確認する。

---

# 3. なんとかして相手にも出したい 42–53

## Slide 42 — 章扉

**スライドに載せるテキスト**

```text
3. なんとかして相手にも出したい
```

**画面・図版**

- 紫色グラデーション背景
- `Realtime`という語はまだ出さない

---

## Slide 43 — Bに表示させるには？

**スライドに載せるテキスト**

```text
Bに表示させるには？

いま知っている方法で考えてみよう
```

**画面・図版**

- 問いを大きく表示
- 右下に小さく`select / loadMessages()`

**進行**

30秒ほど考えてもらう。「もう一度DBから読めばよい」という答えを拾う。

---

## Slide 44 — Bをリロード

**スライドに載せるテキスト**

```text
Bをリロードしてみる

出た！
```

**画面・図版**

- リロード後のBに「こんにちは！」が出た状態

**進行**

DBには保存済みなので、`loadMessages()`がもう一度動けば表示されることを確認する。

---

## Slide 45 — 自動で読み直せば？

**スライドに載せるテキスト**

```text
じゃあ、自動で読み直せば？
```

```text
1秒待つ → loadMessages()
1秒待つ → loadMessages()
1秒待つ → loadMessages()
　　　　…
```

**画面・図版**

- 繰り返しを縦に並べる
- ブラウザ全体のリロードではなく`loadMessages()`を強調

**進行**

「画面全体をリロードする必要はありません。DBから読む関数だけ繰り返します」と伝える。

---

## Slide 46 — 1秒ごとに読み直す

**スライドに載せるテキスト**

```text
1秒ごとに loadMessages() を実行しよう
```

```js
setInterval(実行したい関数, ミリ秒);
```

```text
1000ミリ秒 = 1秒
```

**画面・図版**

- APIの形だけ提示
- 答えは空欄にする

**進行**

3分の小課題。`setInterval`の第1引数へ何を渡すか考えてもらう。

---

## Slide 47 — Pollingを実装

**スライドに載せるテキスト**

```text
1秒ごとにDBから読み直す
```

```js
setInterval(loadMessages, 1000);
```

```text
script.js の loadMessages() の下へ追加
```

**画面・図版**

- コードを中央に大きく表示
- `loadMessages`と`1000`へ注釈

**進行**

保存して両方のブラウザを再読み込みする。

**到達状態**

各ブラウザが1秒ごとに全メッセージを再取得する。

---

## Slide 48 — 2人でもう一度

**スライドに載せるテキスト**

```text
2人でもう一度

Aから送る → Bを見る
```

**画面・図版**

- Aの送信
- 約1秒後、Bに同じメッセージが出る連続画面

**進行**

参加者同士で再テストする。「一応、動いた」という感触を先に成立させる。

---

## Slide 49 — Polling

**スライドに載せるテキスト**

```text
これを Polling という

一定間隔で
「変わった？」と聞きに行く方法
```

```text
ブラウザ ──「変わった？」──→ DB
ブラウザ ←──「変わってない」── DB
```

**画面・図版**

- 上の往復を2〜3回繰り返して見せる

**進行**

動かしたあとで技術名を与える。Pollingの評価はまだしない。

---

## Slide 50 — Networkを開く

**スライドに載せるテキスト**

```text
何も送らず、待ってみよう

1. 開発者ツールを開く
2. Networkタブを開く
3. Fetch/XHRで絞り込む
4. 5秒待つ
```

**画面・図版**

- DevTools Networkタブの場所を紫枠で示す

**進行**

メッセージを送らないまま、リクエストが増える様子を参加者自身に見てもらう。

---

## Slide 51 — 何も起きていないのに

**スライドに載せるテキスト**

```text
何も起きていないのに
```

```text
messages?select=*...
messages?select=*...
messages?select=*...
messages?select=*...
messages?select=*...
```

**画面・図版**

- Network一覧のスクリーンショットを大きく表示
- 連続する`select`リクエストを紫枠で囲む

**進行**

「5秒でだいたい5回、何も変わっていなくてもDBに聞いています」と、いま見えている事実だけ述べる。

---

## Slide 52 — スマートか？

**スライドに載せるテキスト**

```text
スマートか？

1. 変更がなくても問い合わせる
2. 1秒間隔なら、最大約1秒遅れる
3. 間隔を短くすると、問い合わせが増える
```

**画面・図版**

- 第1回p.45と同じ言葉・余白感
- 3点だけを左揃え

**進行**

第1回の大量コピーを覚えていれば触れる。「動いてはいる。ただ、必要のないときまで問い合わせています」とまとめる。

---

## Slide 53 — 欲しい動き

**スライドに載せるテキスト**

```text
変更されたときだけ、教えてほしい
```

```text
DBでINSERTが起きる
        ↓
ブラウザへ知らせる
```

**画面・図版**

- 中央に要求文
- 下に最小の流れ

**進行**

`setInterval(loadMessages, 1000)`をコメントアウトまたは削除してから次章へ進む。

---

# 4. 変更されたときだけ受け取ろう 54–66

## Slide 54 — 章扉

**スライドに載せるテキスト**

```text
4. Realtime

「取りに行く」から「待ち受ける」へ
```

**画面・図版**

- 紫色グラデーション背景

**進行**

ここで初めてRealtimeという技術名を出す。

---

## Slide 55 — Supabase Realtime

**スライドに載せるテキスト**

```text
Supabase Realtime

DBで変化が起きたら、
ブラウザ側でイベントを受け取れる
```

```text
今回待つもの

messages テーブルへの INSERT
```

**画面・図版**

- 左に定義
- 右に`DB → ブラウザ`の一方向矢印
- `INSERT`を紫で強調

**進行**

UPDATE、DELETE、Presenceなどには広げない。今回使う範囲をINSERTに絞る。

---

## Slide 56 — まずConsoleまで

**スライドに載せるテキスト**

```text
まず、ここまで

messagesにINSERTされたら
Consoleにpayloadを出す
```

```text
成功条件
別のPCから送ると、Consoleに何か出る
```

**画面・図版**

- 左に課題
- 右にConsoleへ`{...}`が現れた完成図

**進行**

UI表示まで一気に進めない。「本当にイベントが届く」を最初の成功にする。

---

## Slide 57 — 準備済みの設定

**スライドに載せるテキスト**

```text
Realtimeの準備は済んでいます

messages テーブル
  ↓
supabase_realtime の対象に追加済み
```

**画面・図版**

- SupabaseのPublications設定画面またはSQLの一部

```sql
alter publication supabase_realtime
add table public.messages;
```

**進行**

参加者には設定操作をさせない。アプリのデータの流れに時間を使う。

---

## Slide 58 — INSERTを待ち受ける

**スライドに載せるテキスト**

```text
messagesへのINSERTを待ち受ける
```

```js
supabase
  .channel("messages")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
    },
    (payload) => {
      console.log(payload);
    },
  )
  .subscribe();
```

**画面・図版**

- コードを大きく表示
- `event: "INSERT"`と`table: "messages"`だけ紫枠

**進行**

コードは`script.js`の末尾へ追加する。`.channel()`、`.on()`、`.subscribe()`の説明は動作確認後に回す。

**到達状態**

Pollingは削除済み。Realtime購読は開始されているが、UIへの反映はまだない。

---

## Slide 59 — 別のPCから送る

**スライドに載せるテキスト**

```text
Consoleを開いたまま、待つ

別のPCから1件送ってみよう
```

**画面・図版**

- 左に送信側のブラウザ
- 右に受信側のConsole

**進行**

受信側はConsoleを開いておく。送信側から一件送る。

---

## Slide 60 — 来た！

**スライドに載せるテキスト**

```text
来た！
```

**画面・図版**

- Consoleに表示されたpayloadを大きく見せる
- `commit_timestamp`、`eventType`、`new`などが見える状態

**進行**

画面にメッセージはまだ出ていないが、別のPCで起きたINSERTが届いたことを確認する。

---

## Slide 61 — 動いたコードを読む

**スライドに載せるテキスト**

```text
いま書いたコードを読む
```

| コード | 今回の意味 |
|---|---|
| `.channel("messages")` | 待ち受ける単位を作る |
| `.on("postgres_changes", ...)` | DB変更イベントを受ける |
| `.subscribe()` | 待ち受けを開始する |

```text
注目する条件
event: "INSERT"
table: "messages"
```

**画面・図版**

- 表と条件だけ
- メソッドの一般仕様までは載せない

**進行**

動作したコードを後から読む。参加者に暗記させる意図はないと伝えてよい。

---

## Slide 62 — payloadを探る

**スライドに載せるテキスト**

```text
新しいメッセージは、どこに入っている？

payloadを開いて探してみよう
```

**画面・図版**

- 展開前のpayload
- `▶`をクリックする手の注釈

**進行**

30秒〜1分。講師はすぐ答えを言わず、参加者にConsole上のオブジェクトを展開してもらう。

---

## Slide 63 — payload.new

**スライドに載せるテキスト**

```text
payload.new

新しく追加された行
```

```js
{
  id: 12,
  user_name: "Taro",
  body: "こんにちは！",
  created_at: "2026-08-09T..."
}
```

```text
これも、messageオブジェクト
```

**画面・図版**

- 左にConsoleの`new`
- 右に整形したオブジェクト
- `user_name`と`body`を対応させる

**進行**

DBから読んだ`data`の1要素、フォームで作った`message`と同じ形であることを確認する。

---

## Slide 64 — 画面に出せる？

**スライドに載せるテキスト**

```text
じゃあ、画面に出せる？

payload.newを
もう知っている何に渡せばよい？
```

```js
// ここを書き換える
(payload) => {
  console.log(payload);
}
```

**画面・図版**

- 問いと変更対象コード
- 答えは載せない

**進行**

2分の小課題。Slide 19の「1つの表示処理」を思い出させる。

---

## Slide 65 — payload.newを表示

**スライドに載せるテキスト**

```text
payload.newを画面へ
```

```js
(payload) => {
  appendMessage(payload.new);
}
```

```text
Realtime → payload.new → appendMessage → 吹き出し
```

**画面・図版**

- 上にコード
- 下にデータの流れ
- Slide 19と同じ`appendMessage`の箱を再利用

**進行**

「新しい表示処理を作ったのではなく、既存の表示関数に新しい入口をつないだ」と確認する。

---

## Slide 66 — 今度こそLINEになった

**スライドに載せるテキスト**

```text
Aから送る
　　　↓
Bにすぐ出る

今度こそLINEになった！
```

**画面・図版**

- AとBの画面を左右に並べる
- 同じメッセージが両方へ現れた状態
- Pollingのリクエスト一覧は表示しない

**進行**

参加者同士で送受信を確認する。送信側に同じメッセージが二重表示されるはずだが、ここではすぐ説明せず次へ送る。

---

# 5. LINEを完成させよう 67–76

## Slide 67 — あれ？

**スライドに載せるテキスト**

```text
あれ？

自分が送ったメッセージだけ2個ある
```

**画面・図版**

- 送信側の画面を大きく表示
- 同じ吹き出し2件を紫の括弧でまとめる

**進行**

受信側は1件、送信側だけ2件であることを全員で確認する。

---

## Slide 68 — 原因を探す

**スライドに載せるテキスト**

```text
3分で原因を探してみよう

送信した1件は、
どの経路で画面に来ている？
```

```text
確認する場所
・submitの中
・Realtimeの中
```

**画面・図版**

- 左に課題
- 右に`script.js`の該当2箇所を離して表示
- まだ両方の`appendMessage`を線で結ばない

**進行**

参加者にコードを追ってもらう。答えが分かった人には、2つの経路から来たデータが同じメッセージだと判定する方法も考えてもらう。

---

## Slide 69 — 2本の表示経路

**スライドに載せるテキスト**

```text
1回のinsert、2回の表示
```

```text
form
  ↓
insert
  ├→ data → appendMessage(data) ───┐
  │                                ├→ 2個
  └→ Realtime → payload.new ───────┘
                   ↓
          appendMessage(payload.new)
```

**画面・図版**

- データの流れを大きく表示
- 2つの`appendMessage`を同色で囲む

**進行**

「DBへの追加は1回ですが、画面へ追加するコードが2回動いています」と説明する。

---

## Slide 70 — 同じメッセージだと分かる？

**スライドに載せるテキスト**

```text
2つは、同じメッセージ？
```

```js
// insertから返ったdata
{ id: 12, user_name: "Taro", body: "こんにちは！", ... }

// Realtimeのpayload.new
{ id: 12, user_name: "Taro", body: "こんにちは！", ... }
```

**画面・図版**

- 2つのオブジェクトを上下に置く
- 両方の`id: 12`を紫の線で結ぶ

**進行**

`body`だけでは同じ文章を別の人が送る可能性がある。DBが各行へ付けた`id`なら、同じ行かどうかを判定できると導く。

---

## Slide 71 — 表示済みのIDを覚える

**スライドに載せるテキスト**

```text
同じidは、2回表示しない
```

```js
const renderedMessageIds = new Set();

function appendMessage(message) {
  if (message.id && renderedMessageIds.has(message.id)) return;
  if (message.id) renderedMessageIds.add(message.id);

  // これまでの表示処理
}
```

```text
Set = 値を重複なしで覚えておくもの
```

**画面・図版**

- `has(message.id)`に「すでに表示した？」の注釈
- `add(message.id)`に「表示済みとして覚える」の注釈
- `return`に「ここで表示をやめる」の注釈

**進行**

`renderedMessageIds`はDOM取得の下、ガード処理は`appendMessage`の先頭へ追加する。送信側とRealtime側のどちらが先に届いても、先に来た方だけを表示し、もう一方を止められる。

---

## Slide 72 — 最終コード整理

**スライドに載せるテキスト**

```text
残すもの / 外すもの
```

```js
// 残す：送信直後の表示
appendMessage(data);

// 残す：Realtimeで届いた行の表示
appendMessage(payload.new);

// 外す：Polling
setInterval(loadMessages, 1000);
```

```text
重複は appendMessage() の先頭で止める
```

**画面・図版**

- 2つの`appendMessage`にはチェックマーク
- `setInterval`には取り消し線

**進行**

`setInterval`だけが削除され、2つの表示経路と`renderedMessageIds`が残っていることを全員で確認する。

---

## Slide 73 — 最終テスト

**スライドに載せるテキスト**

```text
A / B 最終テスト

□ Aから送ると、Aに1件だけ出る
□ 同じ1件がBにも出る
□ Bから送っても同じ
□ リロードすると履歴が戻る
```

**画面・図版**

- 左にチェックリスト
- 右にA/Bの画面

**進行**

1項目ずつ参加者と確認する。不具合がある人は、この4条件のどこで失敗するかを切り分ける。

**到達状態**

- 初期履歴: `select`
- 送信: `insert(...).select().single()`
- 新着表示: Realtimeの`payload.new`
- 重複防止: `renderedMessageIds`
- Pollingなし
- 二重表示なし

---

## Slide 74 — みんなでLINE

**スライドに載せるテキスト**

```text
みんなでLINEしてみよう！

config.js の名前を確認して、一言送る
```

**画面・図版**

- 教室全体のメッセージが並んだ完成画面
- 右下に小さく「同じmessagesテーブルを使っています」

**進行**

3〜5分。全員同じテーブルへ送る。送信が集中しても各画面へ追加されることを確認する。

---

## Slide 75 — 今日使ったもの

**スライドに載せるテキスト**

```text
今日使ったもの
```

| やりたいこと | 使ったもの |
|---|---|
| 最初の履歴を読む | `select` |
| 新しいメッセージを送る | `insert` |
| 新着メッセージを待つ | Realtime / `subscribe` |
| 同じメッセージの二重表示を防ぐ | `id` / `Set` |

```text
画面へ出す処理は、全部 appendMessage(message)
```

**画面・図版**

- 表を中心に置く
- 下の一文を紫で強調

**進行**

技術用語だけで終わらせず、アプリ上の目的と対応させて振り返る。

---

## Slide 76 — クロージング

**スライドに載せるテキスト**

```text
保存できる
　　　↓
つながっている

DBに保存できるWebアプリから、
誰かの操作で画面が変わるWebアプリへ

ご参加ありがとうございました！
```

**画面・図版**

- 紫色グラデーション背景
- `保存できる → つながっている`を最も大きく表示
- 完成したチャット画面を薄く背景に使ってもよい

**進行**

冒頭で触った完成版と同じ動きを、自分のコードで作ったことを確認して終える。

---

# 実装状態の確認用コード

この節はスライドには載せない。講師がスライド制作時と進行時に、コードの状態を照合するために使う。

## Chapter 1終了時

```js
const userName = window.SUPABASE_CONFIG.userName?.trim() || "Doer";

messages.forEach((message) => {
  appendMessage(message);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const message = {
    user_name: userName,
    body: messageInput.value.trim(),
  };

  appendMessage(message);
});
```

## Chapter 2終了時

ローカルの`messages.forEach(...)`は削除する。

```js
async function loadMessages() {
  const { data } = await supabase
    .from("messages")
    .select()
    .order("created_at", { ascending: true });

  feed.querySelectorAll(".message-row")
    .forEach((row) => row.remove());

  data.forEach((message) => {
    appendMessage(message);
  });
}

await loadMessages();

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = {
    user_name: userName,
    body: messageInput.value.trim(),
  };

  const { data } = await supabase
    .from("messages")
    .insert(message)
    .select()
    .single();

  appendMessage(data);
});
```

## Polling実験中

```js
setInterval(loadMessages, 1000);
```

Realtimeへ進む前に、この行を削除またはコメントアウトする。

## Realtime追加直後

送信側の`appendMessage(data)`はまだ残す。`renderedMessageIds`もまだ追加しない。これによりSlide 67で二重表示が起きる。

```js
supabase
  .channel("messages")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
    },
    (payload) => {
      appendMessage(payload.new);
    },
  )
  .subscribe();
```

## 完成時

送信直後の`data`とRealtimeの`payload.new`は、同じDB行なら同じ`id`を持つ。2つの表示経路を残し、`appendMessage`の先頭で表示済みIDを判定する。

```js
const feed = document.querySelector("#feed");
const form = document.querySelector("#message-form");
const messageInput = document.querySelector("#message-input");
const emptyState = document.querySelector("#empty-state");
const renderedMessageIds = new Set();

const { url: supabaseUrl, key: supabaseKey } = window.SUPABASE_CONFIG;
const userName = window.SUPABASE_CONFIG.userName?.trim() || "Doer";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

function appendMessage(message) {
  if (message.id && renderedMessageIds.has(message.id)) return;
  if (message.id) renderedMessageIds.add(message.id);

  // avatar、名前、時刻、吹き出しを生成する既存処理
}

async function loadMessages() {
  const { data, error } = await supabase
    .from("messages")
    .select()
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  feed.querySelectorAll(".message-row").forEach((row) => row.remove());
  data.forEach((message) => appendMessage(message));
}

await loadMessages();

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = {
    user_name: userName,
    body: messageInput.value.trim(),
  };

  if (!message.user_name || !message.body) return;

  const { data, error } = await supabase
    .from("messages")
    .insert(message)
    .select()
    .single();

  if (error) {
    console.error(error);
    return;
  }

  appendMessage(data);
  messageInput.value = "";
  messageInput.focus();
});

supabase
  .channel("messages")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
    },
    (payload) => {
      appendMessage(payload.new);
    },
  )
  .subscribe();
```

---

# 制作時の表現ルール

## 上部ラベル

第1・2回と同様に、通常スライドの左上へ小さな紫色ラベルを置く。

| 範囲 | ラベル文言 |
|---|---|
| 10–24 | `LINEを動かす` |
| 25–41 | `Supabaseに接続する` |
| 42–53 | `相手にも表示する` |
| 54–66 | `Realtime` |
| 67–75 | `LINEを完成させる` |

## コードの見せ方

- 黒背景のコードブロックを使う
- そのスライドで変更する行だけを紫または黄色で囲む
- 1枚にファイル全体を載せず、変更対象と前後の文脈だけを載せる
- コードを載せた次のスライドでは、原則としてブラウザまたはConsoleの結果を見せる

## 実習中のヒント

- 最初から完成コードを表示しない
- 課題提示 → 自力で試す → 部品だけのヒント → 答え合わせ、の順にする
- 早く終わった参加者には、入力欄のクリアや空文字チェックを追加課題として口頭で渡してよいが、本編の必須条件にはしない

## 強い一言のスライド

次のスライドは余白を多く取り、説明を足さない。

- Slide 17 `動いた！`
- Slide 22 `消えた`
- Slide 40 `B：……`
- Slide 52 `スマートか？`
- Slide 60 `来た！`
- Slide 67 `あれ？`

---

# 技術上の前提

- Supabase JavaScript client v2をCDNから読み込む
- `messages`テーブルは`id`, `user_name`, `body`, `created_at`を持つ
- RLSを有効化し、講座用にanon roleの`SELECT`と`INSERT`を許可する
- `messages`を`supabase_realtime` publicationへ追加しておく
- ブラウザへ配布するのはPublishable keyまたはAnon keyであり、`service_role` keyは使わない
- 本講座では、因果が見えやすく実装量が少ないPostgres Changesを使う

Supabase公式資料:

- [Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
- [JavaScript: select](https://supabase.com/docs/reference/javascript/select)
- [JavaScript: insert](https://supabase.com/docs/reference/javascript/insert)