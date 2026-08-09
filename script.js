const feed = document.querySelector("#feed");
const form = document.querySelector("#message-form");
const messageInput = document.querySelector("#message-input");
const emptyState = document.querySelector("#empty-state");
const renderedMessageIds = new Set();

const { url: supabaseUrl, key: supabaseKey } = window.SUPABASE_CONFIG;
const userName = window.SUPABASE_CONFIG.userName?.trim() || "Doer";

if (
  supabaseUrl.startsWith("__") ||
  supabaseKey.startsWith("__")
) {
  throw new Error("config.js にSupabaseのURLとキーを設定してください");
}

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

function appendMessage(message) {
  if (message.id && renderedMessageIds.has(message.id)) return;
  if (message.id) renderedMessageIds.add(message.id);

  emptyState?.setAttribute("hidden", "");

  const row = document.createElement("article");
  row.className = "message-row";
  if (message.user_name?.trim() === userName) {
    row.classList.add("is-own");
  }

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = message.user_name?.trim().slice(0, 1).toUpperCase() || "?";

  const content = document.createElement("div");
  content.className = "message-content";

  const meta = document.createElement("div");
  meta.className = "message-meta";

  const name = document.createElement("span");
  name.className = "message-name";
  name.textContent = message.user_name || "Unknown";

  const time = document.createElement("time");
  time.className = "message-time";
  time.textContent = formatTime(message.created_at);

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = message.body;

  meta.append(name, time);
  content.append(meta, bubble);
  row.append(avatar, content);
  feed.append(row);
  feed.scrollTop = feed.scrollHeight;
}

function formatTime(createdAt) {
  const date = createdAt ? new Date(createdAt) : new Date();

  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// TODO 1: messagesに入っているメッセージを全部表示しよう

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  // TODO 2: 入力欄からmessageオブジェクトを作ろう
  // TODO 3: messageを画面へ追加しよう
});
