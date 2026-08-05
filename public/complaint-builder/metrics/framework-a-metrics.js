import { FRAMEWORK_A_VERSION, FRAMEWORK_A_BUILDERS, FRAMEWORK_A_EVENTS, METRICS_ENDPOINT } from "./framework-a-metrics-config.js";

const BUILDER_MAP = Object.freeze({ airbnb: "airbnb", section75: "section75", holiday: "holiday-compensation" });
const ACTIONS = Object.freeze({
  "[data-qcb-download-pdf]": "pdf_downloaded", "[data-qcb-download-word]": "word_downloaded",
  "[data-qcb-download-txt]": "txt_downloaded", "[data-qcb-print]": "print_selected",
  "[data-qcb-copy-letter]": "complaint_letter_copied", "[data-qcb-copy-email]": "cover_email_copied",
  "[data-qcb-honest-review]": "honest_review_clicked", "[data-qcb-share-tool]": "share_tool_clicked"
});
const deviceClass = () => window.matchMedia("(max-width: 520px)").matches ? "mobile" : window.matchMedia("(max-width: 1024px)").matches ? "tablet" : "desktop";
const randomKey = () => { const bytes = new Uint8Array(12); crypto.getRandomValues(bytes); return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join(""); };

function localState(builder) {
  const key = `qcb:metrics:${builder}`;
  try {
    const state = JSON.parse(sessionStorage.getItem(key) || "null") || { key: randomKey(), flags: {} };
    sessionStorage.setItem(key, JSON.stringify(state));
    return { key, state };
  } catch (_) { return { key, state: { key: randomKey(), flags: {} } }; }
}

function createRecorder(builder) {
  let local = localState(builder);
  const save = () => { try { sessionStorage.setItem(local.key, JSON.stringify(local.state)); } catch (_) {} };
  const record = (event, once = false) => {
    if (!FRAMEWORK_A_EVENTS.includes(event) || (once && local.state.flags[event])) return;
    if (once) { local.state.flags[event] = true; save(); }
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 2500);
    fetch(METRICS_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: { builder, event, frameworkVersion: FRAMEWORK_A_VERSION, deviceClass: deviceClass() } }), signal: controller.signal, keepalive: true }).catch(() => {}).finally(() => clearTimeout(timer));
  };
  const reset = () => { try { sessionStorage.removeItem(local.key); } catch (_) {} local = localState(builder); };
  return { record, reset };
}

function mount(root) {
  const builder = BUILDER_MAP[root.dataset.qcbBuilder];
  if (!builder || !FRAMEWORK_A_BUILDERS[builder] || root.dataset.qcbMetricsMounted) return;
  root.dataset.qcbMetricsMounted = "true"; const metrics = createRecorder(builder);
  const start = () => metrics.record("pack_started", true);
  root.addEventListener("input", start, { once: true }); root.addEventListener("change", start, { once: true });
  root.addEventListener("qcb:pack-completed", () => metrics.record("pack_completed", true));
  root.addEventListener("qcb:new-pack", metrics.reset);
  root.addEventListener("click", event => {
    if (!event.isTrusted) return;
    start();
    for (const [selector, name] of Object.entries(ACTIONS)) if (event.target.closest(selector)) { metrics.record(name); return; }
    const guided = event.target.closest(".qcb-support-card a"); if (guided) metrics.record("guided_support_clicked");
  });
  const privacy = root.querySelector(".qcb-privacy") || root.querySelector(".qcb-builder-head") || root.querySelector(".qcb-builder-intro");
  if (privacy && !root.querySelector("[data-qcb-metrics-notice]")) privacy.insertAdjacentHTML(privacy.matches("p") ? "afterend" : "beforeend", '<p class="qcb-metrics-notice" data-qcb-metrics-notice><strong>Anonymous usage totals:</strong> Quaerens records whether a Complaint Pack is started, completed or downloaded to improve the free tools. These statistics do not include your answers, identity, contact details, QCP reference or complaint information.</p>');
}

document.querySelectorAll('[data-qcb-version="4"]').forEach(mount);
export { mount };
