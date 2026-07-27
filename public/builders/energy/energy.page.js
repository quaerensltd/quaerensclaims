(function () {
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    const config = window.QCBFEnergyConfig;
    const analysisEngine = window.QCBFEnergyAnalysis;
    const docs = window.QCBFEnergyDocuments;
    if (!config || !analysisEngine || !docs) return;

    const root = document.querySelector("[data-energy-builder]");
    if (!root) return;

    const state = {
      load: function () {
        try { return JSON.parse(localStorage.getItem(config.storageKey) || "{}"); }
        catch (_) { return {}; }
      },
      save: function (data) { localStorage.setItem(config.storageKey, JSON.stringify(data)); },
      clear: function () { localStorage.removeItem(config.storageKey); }
    };

    const steps = Array.from(root.querySelectorAll("[data-energy-step], [data-builder-step]"));
    const tabs = Array.from(root.querySelectorAll("[data-energy-tab], [data-step-tab]"));
    const preview = root.querySelector("[data-energy-preview], [data-preview]");
    const status = root.querySelector("[data-energy-status], [data-status]");
    const progress = root.querySelector("[data-energy-progress], [data-progress]");
    const warning = root.querySelector("[data-energy-urgent], [data-urgent-warning]");
    const jurisdiction = root.querySelector("[data-energy-jurisdiction], [data-jurisdiction-warning]");
    const cards = root.querySelector("[data-energy-summary-cards], [data-summary-cards]");
    const evidenceList = root.querySelector("[data-energy-evidence-list], [data-evidence-list]");
    const healthSummary = root.querySelector("[data-energy-health-summary]");
    const financialPosition = root.querySelector("[data-energy-financial-position]");
    const timeline = root.querySelector("[data-energy-timeline]");
    const smartSubmission = root.querySelector("[data-energy-smart-submission]");
    const architecture = root.querySelector("[data-energy-architecture]");
    let currentStep = 0;
    let data = state.load() || {};

    if (!data.packReference) {
      data.packReference = `${config.packPrefix}-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      state.save(data);
    }

    function key(field) {
      return field.name || field.dataset.qcbfField;
    }

    function fields() {
      return Array.from(root.querySelectorAll("[data-qcbf-field]"));
    }

    function setField(field, value) {
      if (field.type === "checkbox") field.checked = Array.isArray(value) ? value.includes(field.value) : false;
      else field.value = value || "";
    }

    function restore() {
      fields().forEach((field) => setField(field, data[key(field)]));
    }

    function collect() {
      const next = { packReference: data.packReference };
      fields().forEach((field) => {
        const fieldKey = key(field);
        if (!fieldKey) return;
        if (field.type === "checkbox") {
          if (!next[fieldKey]) next[fieldKey] = [];
          if (field.checked) next[fieldKey].push(field.value);
        } else {
          next[fieldKey] = field.value.trim();
        }
      });
      data = next;
      state.save(data);
      update();
    }

    function showStep(index, scroll) {
      currentStep = Math.max(0, Math.min(index, steps.length - 1));
      steps.forEach((step, i) => {
        step.hidden = i !== currentStep;
        step.classList.toggle("is-active", i === currentStep);
      });
      tabs.forEach((tab, i) => {
        tab.classList.toggle("active", i === currentStep);
        tab.classList.toggle("is-active", i === currentStep);
      });
      if (progress) progress.style.width = `${Math.round(((currentStep + 1) / steps.length) * 100)}%`;
      if (scroll) root.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function escape(value) {
      return String(value || "").replace(/[&<>"']/g, function (char) {
        return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char];
      });
    }

    function renderList(target, items) {
      if (!target) return;
      target.innerHTML = `<ul>${items.map((item) => `<li>${escape(item)}</li>`).join("")}</ul>`;
    }

    function renderRows(target, rows, className) {
      if (!target) return;
      target.innerHTML = `<table class="${className || "energy-table"}"><tbody>${rows.map((row) => `<tr><th>${escape(row[0] || row.label)}</th><td>${escape(row[1] || row.value)}</td></tr>`).join("")}</tbody></table>`;
    }

    function renderTimeline(target, analysis) {
      if (!target) return;
      const events = analysis.timeline.events;
      const warnings = analysis.timeline.warnings;
      target.innerHTML = [
        events.length
          ? `<ol class="energy-timeline">${events.map((event) => `<li><strong>${escape(event.date || "Date not recorded")}</strong><span>${escape(event.event || "Event")}</span><p>${escape(event.description || "")}</p></li>`).join("")}</ol>`
          : `<p class="small">Add dates in the earlier steps to build a chronological energy timeline.</p>`,
        warnings.length ? `<div class="notice">${warnings.map(escape).join("<br>")}</div>` : ""
      ].join("");
    }

    function renderArchitecture(target) {
      if (!target || !docs.architectures) return;
      const rows = Object.entries(docs.architectures).map(([name, details]) => [
        name.toUpperCase(),
        `${details.status}: ${(details.sections || details.supports || details.retain || []).join(", ")}`
      ]);
      renderRows(target, rows, "energy-table");
    }

    function update() {
      const analysis = analysisEngine.analyse(data);
      if (preview) preview.textContent = docs.build(data);
      if (status) {
        status.innerHTML = docs.status(data).map((item) => `<span class="badge">${escape(item)}</span>`).join("");
      }
      if (warning) {
        warning.hidden = !analysis.urgent;
        warning.textContent = analysis.urgent ? "Urgent safety, disconnection, warrant, prepayment or court issues may need immediate specialist or supplier support before using this self-service pack." : "";
      }
      if (jurisdiction) {
        jurisdiction.hidden = !analysis.jurisdictionWarning;
        jurisdiction.textContent = analysis.jurisdictionWarning;
      }
      if (cards) {
        cards.innerHTML = analysis.cards.map((card) => `<article class="card"><h3>${escape(card.title)}</h3><p>${escape(card.body)}</p></article>`).join("");
      }
      renderList(evidenceList, analysis.evidence);
      renderRows(healthSummary, analysis.healthSummary.rows, "energy-table");
      renderRows(financialPosition, analysis.financialPosition.rows, "energy-table");
      renderTimeline(timeline, analysis);
      renderRows(smartSubmission, analysis.smartSubmission.rows, "energy-table readiness-table");
      if (smartSubmission) {
        smartSubmission.insertAdjacentHTML("afterbegin", `<p class="small">${escape(analysis.smartSubmission.message)}</p>`);
      }
      renderArchitecture(architecture);
    }

    root.addEventListener("input", collect);
    root.addEventListener("change", collect);
    tabs.forEach((tab, i) => tab.addEventListener("click", () => showStep(i, true)));
    root.querySelectorAll("[data-energy-next], [data-next]").forEach((btn) => btn.addEventListener("click", () => showStep(currentStep + 1, true)));
    root.querySelectorAll("[data-energy-prev], [data-back]").forEach((btn) => btn.addEventListener("click", () => showStep(currentStep - 1, true)));
    root.querySelectorAll("[data-energy-reset], [data-reset]").forEach((btn) => btn.addEventListener("click", () => {
      if (!confirm("Delete the saved Energy Complaint Pack draft on this device?")) return;
      state.clear();
      data = { packReference: `${config.packPrefix}-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}` };
      state.save(data);
      restore();
      update();
      showStep(0, true);
    }));
    root.querySelectorAll("[data-energy-copy], [data-copy-preview]").forEach((btn) => btn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(docs.build(data));
      btn.textContent = "Copied";
      setTimeout(() => btn.textContent = "Copy Current Preview", 1400);
    }));
    root.querySelectorAll("[data-energy-copy-mode]").forEach((btn) => btn.addEventListener("click", async () => {
      const copies = docs.buildCopy(data);
      await navigator.clipboard.writeText(copies[btn.dataset.energyCopyMode] || docs.build(data));
      btn.textContent = "Copied";
      setTimeout(() => btn.textContent = btn.dataset.originalLabel || "Copy", 1400);
    }));
    root.querySelectorAll("[data-energy-print]").forEach((btn) => btn.addEventListener("click", () => window.print()));

    restore();
    update();
    showStep(0, false);
  });
})();
