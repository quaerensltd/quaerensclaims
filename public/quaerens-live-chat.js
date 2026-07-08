import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDvB3_HCvt7s3QBILj9BPH1afofE3PqGhE",
  authDomain: "quaerensclaims.firebaseapp.com",
  projectId: "quaerensclaims",
  storageBucket: "quaerensclaims.firebasestorage.app",
  messagingSenderId: "577982936989",
  appId: "1:577982936989:web:ab0b4b5a0c3ad8e0d2f7f8"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

const SESSION_KEY = "quaerens_chat_session_id";
const CHAT_COLLECTION = "siteChatMessages";
const REPLY_COLLECTION = "siteChatReplies";

const pageTopic = document.title.replace(/\s+/g, " ").trim() || "Quaerens website";
const currentUrl = window.location.href;

function getSessionId() {
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const sessionId = `chat_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(SESSION_KEY, sessionId);
  return sessionId;
}

const sessionId = getSessionId();

function addStyles() {
  if (document.getElementById("quaerens-live-chat-styles")) return;
  const style = document.createElement("style");
  style.id = "quaerens-live-chat-styles";
  style.textContent = `
    .q-live-chat, .q-live-chat * { box-sizing: border-box; }
    .q-live-chat {
      position: fixed;
      right: 18px;
      bottom: 18px;
      z-index: 2147483000;
      font-family: Inter, Arial, sans-serif;
      color: #071735;
    }
    .q-live-chat__prompt {
      position: absolute;
      right: 0;
      bottom: 78px;
      width: 216px;
      border: 1px solid rgba(37, 99, 235, .22);
      border-radius: 16px 16px 4px 16px;
      background: rgba(255, 255, 255, .96);
      box-shadow: 0 18px 50px rgba(15, 23, 42, .18);
      padding: 12px 14px;
      font-size: 13px;
      line-height: 1.35;
      opacity: 0;
      transform: translateY(8px);
      pointer-events: none;
      transition: opacity .25s ease, transform .25s ease;
    }
    .q-live-chat--prompt .q-live-chat__prompt {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
    .q-live-chat__toast {
      width: 206px;
      min-height: 76px;
      border: 2px solid #fff;
      border-radius: 18px;
      background: linear-gradient(135deg, #1d4ed8, #0f2f7a);
      color: #fff;
      box-shadow: 0 16px 44px rgba(15, 23, 42, .28), inset 0 0 16px rgba(255,255,255,.18);
      display: grid;
      grid-template-columns: 62px 1fr;
      gap: 10px;
      align-items: center;
      padding: 9px 12px 9px 9px;
      cursor: pointer;
      text-align: left;
    }
    .q-live-chat__avatar {
      width: 58px;
      height: 58px;
      border-radius: 999px;
      border: 3px solid rgba(255,255,255,.88);
      object-fit: cover;
      background: #fff;
    }
    .q-live-chat__headline {
      display: block;
      font-size: 16px;
      line-height: 1.05;
      font-weight: 900;
      letter-spacing: .01em;
      text-transform: uppercase;
    }
    .q-live-chat__sub {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 6px;
      font-size: 13px;
      font-weight: 800;
    }
    .q-live-chat__panel {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 392px;
      max-width: calc(100vw - 28px);
      max-height: calc(100vh - 28px);
      display: none;
      overflow: hidden;
      border-radius: 20px;
      border: 1px solid rgba(191, 219, 254, .95);
      background: #fff;
      box-shadow: 0 24px 70px rgba(15, 23, 42, .28);
    }
    .q-live-chat--open .q-live-chat__panel { display: block; }
    .q-live-chat--open .q-live-chat__toast,
    .q-live-chat--open .q-live-chat__prompt { display: none; }
    .q-live-chat__header {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 16px;
      color: #fff;
      background: linear-gradient(135deg, #2563eb, #0f2f7a);
    }
    .q-live-chat__header img {
      width: 48px;
      height: 48px;
      border-radius: 999px;
      border: 3px solid rgba(255,255,255,.78);
      object-fit: cover;
    }
    .q-live-chat__title { margin: 0; font-size: 17px; font-weight: 900; }
    .q-live-chat__copy { margin: 3px 0 0; font-size: 13px; line-height: 1.35; color: rgba(255,255,255,.86); }
    .q-live-chat__close {
      margin-left: auto;
      width: 34px;
      height: 34px;
      border: 1px solid rgba(255,255,255,.42);
      border-radius: 999px;
      background: rgba(255,255,255,.14);
      color: #fff;
      cursor: pointer;
      font-size: 22px;
      line-height: 1;
    }
    .q-live-chat__body {
      padding: 16px;
      max-height: calc(100vh - 160px);
      overflow-y: auto;
    }
    .q-live-chat__form { display: grid; gap: 10px; }
    .q-live-chat__field label {
      display: block;
      margin-bottom: 5px;
      font-size: 12px;
      font-weight: 800;
      color: #0f2460;
    }
    .q-live-chat__field input,
    .q-live-chat__field select,
    .q-live-chat__field textarea {
      width: 100%;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 11px 12px;
      font: inherit;
      font-size: 14px;
      outline: none;
      background: #fff;
    }
    .q-live-chat__field textarea { min-height: 92px; resize: vertical; }
    .q-live-chat__field input:focus,
    .q-live-chat__field select:focus,
    .q-live-chat__field textarea:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, .12);
    }
    .q-live-chat__submit {
      border: 0;
      border-radius: 999px;
      background: #2563eb;
      color: #fff;
      padding: 13px 16px;
      font-weight: 900;
      cursor: pointer;
    }
    .q-live-chat__submit:disabled { opacity: .65; cursor: wait; }
    .q-live-chat__privacy {
      margin: 2px 0 0;
      font-size: 11px;
      line-height: 1.35;
      color: #64748b;
    }
    .q-live-chat__actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 12px;
    }
    .q-live-chat__actions a {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 42px;
      border: 1px solid #bfdbfe;
      border-radius: 999px;
      color: #0f4bd8;
      font-weight: 900;
      text-decoration: none;
      background: #f8fbff;
    }
    .q-live-chat__thread {
      display: none;
      margin-top: 14px;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
    }
    .q-live-chat--submitted .q-live-chat__thread { display: block; }
    .q-live-chat__status {
      display: none;
      margin: 0 0 10px;
      padding: 10px 12px;
      border-radius: 12px;
      background: #ecfdf5;
      color: #065f46;
      font-size: 13px;
      font-weight: 800;
    }
    .q-live-chat--submitted .q-live-chat__status { display: block; }
    .q-live-chat__messages { display: grid; gap: 8px; }
    .q-live-chat__message {
      border-radius: 14px;
      padding: 9px 11px;
      font-size: 13px;
      line-height: 1.4;
      background: #eef4ff;
      color: #0f172a;
    }
    .q-live-chat__message--staff {
      background: #0f2f7a;
      color: #fff;
    }
    .q-live-chat__message small {
      display: block;
      margin-top: 4px;
      opacity: .7;
      font-size: 11px;
    }
    @media (max-width: 640px) {
      .q-live-chat { right: 10px; bottom: 10px; }
      .q-live-chat__toast { width: 164px; min-height: 66px; grid-template-columns: 48px 1fr; }
      .q-live-chat__avatar { width: 46px; height: 46px; }
      .q-live-chat__headline { font-size: 13px; }
      .q-live-chat__sub { font-size: 12px; }
      .q-live-chat__prompt { display: none; }
      .q-live-chat__panel { width: calc(100vw - 20px); }
      .q-live-chat__actions { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(style);
}

function buildWidget() {
  if (document.body.dataset.disableLiveChat === "true") return null;
  if (document.getElementById("quaerens-live-chat")) return null;

  addStyles();

  const root = document.createElement("div");
  root.id = "quaerens-live-chat";
  root.className = "q-live-chat";
  root.innerHTML = `
    <button class="q-live-chat__toast" type="button" aria-label="Open Quaerens live chat">
      <img class="q-live-chat__avatar" src="/images/operator.jpg" alt="" loading="lazy" decoding="async">
      <span>
        <strong class="q-live-chat__headline">We can help</strong>
        <span class="q-live-chat__sub">Chat now</span>
      </span>
    </button>
    <button class="q-live-chat__prompt" type="button">Need help finding the right route? Send us a quick message.</button>
    <section class="q-live-chat__panel" aria-label="Quaerens live chat">
      <header class="q-live-chat__header">
        <img src="/images/operator.jpg" alt="" loading="lazy" decoding="async">
        <div>
          <p class="q-live-chat__title">Speak to Quaerens</p>
          <p class="q-live-chat__copy">Send a quick message. If the team is offline, this becomes a callback request.</p>
        </div>
        <button class="q-live-chat__close" type="button" aria-label="Close chat">&times;</button>
      </header>
      <div class="q-live-chat__body">
        <p class="q-live-chat__status">Thanks. Your message has been sent to the Quaerens team.</p>
        <form class="q-live-chat__form">
          <div class="q-live-chat__field">
            <label for="q-chat-name">Name</label>
            <input id="q-chat-name" name="name" autocomplete="name" required>
          </div>
          <div class="q-live-chat__field">
            <label for="q-chat-contact">Phone or email</label>
            <input id="q-chat-contact" name="contact" autocomplete="email" required>
          </div>
          <div class="q-live-chat__field">
            <label for="q-chat-topic">What is this about?</label>
            <select id="q-chat-topic" name="topic">
              <option value="">Select a topic</option>
              <option>Spray foam insulation</option>
              <option>Solar panels</option>
              <option>Car finance</option>
              <option>Equity release</option>
              <option>Bank scam refund</option>
              <option>Section 75 or card dispute</option>
              <option>Holiday park or caravan</option>
              <option>Other consumer dispute</option>
            </select>
          </div>
          <div class="q-live-chat__field">
            <label for="q-chat-message">Message</label>
            <textarea id="q-chat-message" name="message" required placeholder="Briefly tell us what happened."></textarea>
          </div>
          <button class="q-live-chat__submit" type="submit">Send message</button>
          <p class="q-live-chat__privacy">Your details are used to respond to your enquiry. Please do not send bank card details or passwords.</p>
        </form>
        <div class="q-live-chat__actions">
          <a href="tel:+442080500725">Call us</a>
          <a href="https://wa.me/442080500725" target="_blank" rel="noopener">WhatsApp</a>
        </div>
        <div class="q-live-chat__thread">
          <strong>Conversation</strong>
          <div class="q-live-chat__messages"></div>
        </div>
      </div>
    </section>
  `;

  document.body.appendChild(root);
  return root;
}

function renderMessage(container, text, author, createdAt) {
  const item = document.createElement("div");
  item.className = `q-live-chat__message${author === "staff" ? " q-live-chat__message--staff" : ""}`;
  const stamp = createdAt?.toDate ? createdAt.toDate().toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" }) : "";
  item.innerHTML = `${escapeHtml(text)}${stamp ? `<small>${author === "staff" ? "Quaerens" : "You"} - ${stamp}</small>` : ""}`;
  container.appendChild(item);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initWidget() {
  const root = buildWidget();
  if (!root) return;

  const toast = root.querySelector(".q-live-chat__toast");
  const prompt = root.querySelector(".q-live-chat__prompt");
  const close = root.querySelector(".q-live-chat__close");
  const form = root.querySelector(".q-live-chat__form");
  const submit = root.querySelector(".q-live-chat__submit");
  const messages = root.querySelector(".q-live-chat__messages");

  const open = () => {
    root.classList.add("q-live-chat--open");
    root.classList.remove("q-live-chat--prompt");
  };
  const closePanel = () => root.classList.remove("q-live-chat--open");

  toast.addEventListener("click", open);
  prompt.addEventListener("click", open);
  close.addEventListener("click", closePanel);
  window.setTimeout(() => root.classList.add("q-live-chat--prompt"), 9000);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    submit.disabled = true;
    submit.textContent = "Sending...";
    const formData = new FormData(form);
    const payload = {
      sessionId,
      name: String(formData.get("name") || "").trim(),
      contact: String(formData.get("contact") || "").trim(),
      topic: String(formData.get("topic") || "").trim() || pageTopic,
      message: String(formData.get("message") || "").trim(),
      pageTitle: pageTopic,
      pageUrl: currentUrl,
      referrer: document.referrer || "",
      status: "new",
      source: "live_chat_widget",
      userAgent: navigator.userAgent,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    if (!payload.name || !payload.contact || !payload.message) {
      submit.disabled = false;
      submit.textContent = "Send message";
      return;
    }

    const messageRef = await addDoc(collection(db, CHAT_COLLECTION), payload);
    await addDoc(collection(db, "emailQueue"), {
      to: "info@quaerens.co.uk",
      subject: `New website chat: ${payload.topic}`,
      body: `Name: ${payload.name}\nContact: ${payload.contact}\nTopic: ${payload.topic}\nPage: ${payload.pageUrl}\n\nMessage:\n${payload.message}`,
      status: "pending",
      source: "live_chat_widget",
      createdAt: serverTimestamp()
    }).catch(() => null);

    root.dataset.messageId = messageRef.id;
    root.classList.add("q-live-chat--submitted");
    form.reset();
    submit.disabled = false;
    submit.textContent = "Send another message";
    messages.innerHTML = "";
    renderMessage(messages, payload.message, "visitor");
    watchReplies(messageRef.id, messages);
  });
}

function watchReplies(messageId, messages) {
  const repliesQuery = query(
    collection(db, REPLY_COLLECTION),
    where("messageId", "==", messageId)
  );

  onSnapshot(repliesQuery, (snapshot) => {
    messages.querySelectorAll(".q-live-chat__message--staff").forEach((node) => node.remove());
    const replies = snapshot.docs
      .map((replyDoc) => replyDoc.data())
      .sort((a, b) => {
        const first = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const second = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return first - second;
      });
    replies.forEach((data) => {
      renderMessage(messages, data.message || "", "staff", data.createdAt);
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWidget);
} else {
  initWidget();
}
