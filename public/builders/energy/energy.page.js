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

    const steps = Array.from(root.querySelectorAll("[data-builder-step]"));
    const tabs = Array.from(root.querySelectorAll("[data-step-tab]"));
    const preview = root.querySelector("[data-preview]");
    const status = root.querySelector("[data-status]");
    const progress = root.querySelector("[data-progress]");
    const warning = root.querySelector("[data-urgent-warning]");
    const jurisdiction = root.querySelector("[data-jurisdiction-warning]");
    const cards = root.querySelector("[data-summary-cards]");
    const evidenceList = root.querySelector("[data-evidence-list]");
    let currentStep = 0;
    let data = state.load() || {};

    if (!data.packReference) {
      data.packReference = `${config.packPrefix}-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      state.save(data);
    }

    function fields() {
      return Array.from(root.querySelectorAll("[data-qcbf-field]"));
    }

    function setField(field, value) {
      if (field.type === "checkbox") field.checked = Array.isArray(value) ? value.includes(field.value) : false;
      else field.value = value || "";
    }

    function restore() {
      fields().forEach((field) => setField(field, data[field.name]));
    }

    function collect() {
      const next = { packReference: data.packReference };
      fields().forEach((field) => {
        if (!field.name) return;
        if (field.type === "checkbox") {
          if (!next[field.name]) next[field.name] = [];
          if (field.checked) next[field.name].push(field.value);
        } else {
          next[field.name] = field.value.trim();
        }
      });
      data = next;
      state.save(data);
      update();
    }

    function showStep(index, scroll) {
      currentStep = Math.max(0, Math.min(index, steps.length - 1));
      steps.forEach((step, i) => step.hidden = i !== currentStep);
      tabs.forEach((tab, i) => tab.classList.toggle("active", i === currentStep));
      if (progress) progress.style.width = `${Math.round(((currentStep + 1) / steps.length) * 100)}%`;
      if (scroll) root.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function renderList(target, items) {
      if (!target) return;
      target.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
    }

    function update() {
      const analysis = analysisEngine.analyse(data);
      if (preview) preview.textContent = docs.build(data);
      if (status) {
        status.innerHTML = docs.status(data).map((item) => `<span>${item}</span>`).join("");
      }
      if (warning) warning.hidden = !analysis.urgent;
      if (jurisdiction) {
        jurisdiction.hidden = !analysis.jurisdictionWarning;
        jurisdiction.textContent = analysis.jurisdictionWarning;
      }
      if (cards) {
        cards.innerHTML = analysis.cards.map((card) => `<article class="card"><h3>${card.title}</h3><p>${card.body}</p></article>`).join("");
      }
      renderList(evidenceList, analysis.evidence);
    }

    root.addEventListener("input", collect);
    root.addEventListener("change", collect);
    tabs.forEach((tab, i) => tab.addEventListener("click", () => showStep(i, true)));
    root.querySelectorAll("[data-next]").forEach((btn) => btn.addEventListener("click", () => showStep(currentStep + 1, true)));
    root.querySelectorAll("[data-back]").forEach((btn) => btn.addEventListener("click", () => showStep(currentStep - 1, true)));
    root.querySelectorAll("[data-reset]").forEach((btn) => btn.addEventListener("click", () => {
      if (!confirm("Delete the saved Energy Complaint Pack draft on this device?")) return;
      state.clear();
      data = { packReference: `${config.packPrefix}-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}` };
      state.save(data);
      restore();
      update();
      showStep(0, true);
    }));
    root.querySelectorAll("[data-copy-preview]").forEach((btn) => btn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(docs.build(data));
      btn.textContent = "Copied";
      setTimeout(() => btn.textContent = "Copy Current Preview", 1400);
    }));

    restore();
    update();
    showStep(0, false);
  });
})();
