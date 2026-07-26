"use strict";

(function(root) {
  const QCBF = root.QCBF || {};
  const parking = root.QCBFParking || {};
  const config = parking.config;
  const questions = parking.questions;
  const analysis = parking.analysis;
  const documents = parking.documents;
  const submission = parking.submission;
  if (!config || !questions || !analysis || !documents || !submission) return;

  const qsa = selector => Array.from(document.querySelectorAll(selector));
  const qs = id => document.getElementById(id);
  const state = new QCBF.StateManager(config);
  let activeStep = 0;
  let activePreview = "summary";
  let packReference = "";
  let docs = {};

  function createPackReference() {
    const random = Math.random().toString(36).slice(2, 8).toUpperCase().replace(/[^A-Z0-9]/g, "0");
    return config.packPrefix + "-" + new Date().getFullYear() + "-" + random.padEnd(6, "0").slice(0, 6);
  }

  function ensurePackReference() {
    if (/^QP-\d{4}-[A-Z0-9]{6}$/.test(packReference)) return packReference;
    packReference = createPackReference();
    return packReference;
  }

  function fieldValue(name) {
    const el = document.querySelector('[name="' + name + '"]');
    return el ? String(el.value || "").trim() : "";
  }

  function checked(name) {
    return qsa('[name="' + name + '"]:checked').map(el => el.value);
  }

  function collectTimeline() {
    return qsa("[data-timeline-row]").map((row, index) => {
      const get = name => {
        const el = row.querySelector('[name="' + name + '"]');
        return el ? String(el.value || "").trim() : "";
      };
      return { index: index + 1, date: get("timelineDate"), event: get("timelineEvent"), note: get("timelineNote") };
    }).filter(row => row.date || row.event || row.note);
  }

  function collectData() {
    const data = { packReference: ensurePackReference() };
    qsa("[data-qcbf-field]").forEach(el => {
      if (!el.name) return;
      if (el.type === "checkbox") return;
      data[el.name] = String(el.value || "").trim();
    });
    (questions.multiValueFields || []).forEach(name => {
      data[name] = checked(name);
    });
    data.timelineRows = collectTimeline();
    return data;
  }

  function setCheck(name, values) {
    const current = new Set(values || []);
    qsa('[name="' + name + '"]').forEach(el => {
      el.checked = current.has(el.value);
    });
  }

  function restore() {
    const saved = state.restore();
    if (!saved) return;
    if (/^QP-\d{4}-[A-Z0-9]{6}$/.test(saved.packReference || "")) packReference = saved.packReference;
    qsa("[data-qcbf-field]").forEach(el => {
      if (!el.name || el.type === "checkbox") return;
      if (Object.prototype.hasOwnProperty.call(saved, el.name)) el.value = saved[el.name] || "";
    });
    (questions.multiValueFields || []).forEach(name => setCheck(name, saved[name]));
    if (Array.isArray(saved.timelineRows) && saved.timelineRows.length) {
      const wrap = qs("parkingTimelineRows");
      if (wrap) wrap.innerHTML = saved.timelineRows.map(timelineRowHtml).join("");
    }
  }

  function timelineRowHtml(row) {
    const data = row || {};
    return '<div class="timeline-row" data-timeline-row>' +
      '<label>Date <input data-qcbf-field name="timelineDate" value="' + QCBF.text.escapeAttr(data.date || "") + '" placeholder="dd/mm/yyyy"></label>' +
      '<label>Event <input data-qcbf-field name="timelineEvent" value="' + QCBF.text.escapeAttr(data.event || "") + '" placeholder="Notice received, appeal sent, issuer replied"></label>' +
      '<label>Note <input data-qcbf-field name="timelineNote" value="' + QCBF.text.escapeAttr(data.note || "") + '" placeholder="What happened or what was said"></label>' +
    "</div>";
  }

  function renderStep() {
    qsa("[data-builder-step]").forEach((panel, index) => {
      panel.hidden = index !== activeStep;
    });
    qsa("[data-step-dot]").forEach((dot, index) => {
      dot.classList.toggle("active", index === activeStep);
      dot.setAttribute("aria-current", index === activeStep ? "step" : "false");
    });
    const count = qs("parkingStepCount");
    if (count) count.textContent = "Step " + (activeStep + 1) + " of " + config.stages.length + " - " + config.stages[activeStep].label;
    const progress = qs("parkingProgress");
    if (progress) progress.style.width = (((activeStep + 1) / config.stages.length) * 100) + "%";
  }

  function renderStatus(current) {
    const result = analysis.analyse(current);
    const status = qs("parkingStatus");
    if (!status) return;
    const deadlineRows = result.deadline.items.map(item => '<li><strong>' + QCBF.text.escapeHtml(item.label) + ':</strong> ' + QCBF.text.escapeHtml(item.value || "not recorded") + ' - ' + QCBF.text.escapeHtml(item.status) + '</li>').join("");
    status.innerHTML =
      '<div class="status-card"><span>Readiness</span><strong>' + QCBF.text.escapeHtml(result.completeness.status) + '</strong></div>' +
      '<div class="status-card"><span>Evidence position</span><strong>' + QCBF.text.escapeHtml(result.evidencePosition.level) + '</strong><small>' + QCBF.text.escapeHtml(result.evidencePosition.explanation) + '</small></div>' +
      '<div class="status-card"><span>Issuer route</span><strong>' + QCBF.text.escapeHtml(result.issuerRoute) + '</strong><small>' + QCBF.text.escapeHtml(result.jurisdictionCaution) + '</small></div>' +
      '<div class="status-card deadline"><span>Deadlines</span><ul>' + deadlineRows + '</ul><small>' + QCBF.text.escapeHtml(result.deadline.message) + '</small></div>';
  }

  function renderSubmission(current) {
    const smart = submission.smartSubmission(current);
    const box = qs("parkingSubmission");
    if (!box) return;
    box.innerHTML = '<h3>Quaerens Smart Submission</h3>' +
      '<p><strong>Preferred complaint method:</strong> ' + QCBF.text.escapeHtml(smart.preferredMethod) + '</p>' +
      '<p><strong>Route:</strong> ' + QCBF.text.escapeHtml(smart.route.name) + '</p>' +
      '<ul>' + smart.checks.map(item => '<li>' + QCBF.text.escapeHtml(item) + '</li>').join("") + '</ul>' +
      '<p class="' + (smart.urgent ? 'urgent-note' : 'support-note') + '">' + QCBF.text.escapeHtml(smart.warning) + '</p>';
  }

  function update() {
    const current = collectData();
    docs = documents.buildAll(current, { packReference: ensurePackReference() });
    state.save(current);
    renderStatus(current);
    renderSubmission(current);
    const ref = qs("parkingPackRef");
    if (ref) ref.textContent = ensurePackReference();
    const preview = qs("parkingPreviewText");
    if (preview) preview.textContent = docs[activePreview] || docs.full || "";
  }

  function download(type) {
    update();
    const base = ensurePackReference().toLowerCase();
    if (type === "pdf") return QCBF.downloadPdf(base + "-parking-appeal-pack.pdf", "Quaerens Parking Appeal Pack", docs.full);
    if (type === "rtf") return QCBF.downloadBlob(base + "-parking-appeal-pack.rtf", "application/rtf", QCBF.textToRtf(docs.full));
    if (type === "txt") return QCBF.downloadBlob(base + "-parking-appeal-pack.txt", "text/plain;charset=utf-8", docs.full);
    if (type === "copy") {
      navigator.clipboard.writeText(docs.full);
      QCBF.accessibility.announce("Parking appeal pack copied.");
      return;
    }
    if (type === "print") {
      const win = window.open("", "_blank");
      if (!win) return window.print();
      win.document.write("<pre>" + QCBF.text.escapeHtml(docs.full) + "</pre>");
      win.document.close();
      win.print();
    }
  }

  function bind() {
    qsa("[data-qcbf-field]").forEach(el => {
      el.addEventListener("input", update);
      el.addEventListener("change", update);
    });
    qsa("[data-preview-tab]").forEach(button => {
      button.addEventListener("click", () => {
        activePreview = button.getAttribute("data-preview-tab");
        qsa("[data-preview-tab]").forEach(tab => tab.classList.toggle("active", tab === button));
        update();
      });
    });
    qsa("[data-download]").forEach(button => {
      button.addEventListener("click", () => download(button.getAttribute("data-download")));
    });
    qsa("[data-step-action]").forEach(button => {
      button.addEventListener("click", () => {
        const action = button.getAttribute("data-step-action");
        if (action === "next") activeStep = Math.min(config.stages.length - 1, activeStep + 1);
        if (action === "back") activeStep = Math.max(0, activeStep - 1);
        if (action === "review") activeStep = config.stages.length - 1;
        renderStep();
        update();
        const builder = qs("parkingBuilder");
        if (builder) builder.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    const addTimeline = qs("addParkingTimeline");
    if (addTimeline) addTimeline.addEventListener("click", () => {
      const wrap = qs("parkingTimelineRows");
      if (wrap) wrap.insertAdjacentHTML("beforeend", timelineRowHtml({}));
      bindDynamicTimeline();
      update();
    });
    const clear = qs("clearParkingDraft");
    if (clear) clear.addEventListener("click", () => {
      state.clear();
      window.location.reload();
    });
  }

  function bindDynamicTimeline() {
    qsa("#parkingTimelineRows [data-qcbf-field]").forEach(el => {
      if (el.dataset.bound) return;
      el.dataset.bound = "true";
      el.addEventListener("input", update);
      el.addEventListener("change", update);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    packReference = createPackReference();
    restore();
    bind();
    bindDynamicTimeline();
    renderStep();
    update();
  });
})(typeof globalThis !== "undefined" ? globalThis : window);
