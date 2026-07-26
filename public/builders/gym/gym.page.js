(function () {
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    const config = window.QCBFGymConfig;
    const docs = window.QCBFGymDocuments;
    if (!config || !docs) return;

    const QCBF = window.QCBFBrowser || {};
    const state = QCBF.createStateManager
      ? QCBF.createStateManager(config.storageKey)
      : {
          load: () => JSON.parse(localStorage.getItem(config.storageKey) || "{}"),
          save: (data) => localStorage.setItem(config.storageKey, JSON.stringify(data)),
          clear: () => localStorage.removeItem(config.storageKey)
        };

    const root = document.querySelector("[data-gym-builder]");
    if (!root) return;
    const steps = Array.from(root.querySelectorAll("[data-builder-step]"));
    const tabs = Array.from(root.querySelectorAll("[data-step-tab]"));
    const fields = () => Array.from(root.querySelectorAll("[data-qcbf-field]"));
    const preview = root.querySelector("[data-preview]");
    const status = root.querySelector("[data-status]");
    const progress = root.querySelector("[data-progress]");
    let currentStep = 0;
    let data = state.load() || {};

    if (!data.packReference) {
      const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
      data.packReference = `${config.packPrefix}-${new Date().getFullYear()}-${rand}`;
      state.save(data);
    }

    function setField(field, value) {
      if (field.type === "checkbox") field.checked = Array.isArray(value) ? value.includes(field.value) : Boolean(value);
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

    function updateBranches() {
      const selected = Array.isArray(data.whatHappened) ? data.whatHappened.join(" ") : "";
      root.querySelectorAll("[data-branch]").forEach((el) => {
        const key = el.getAttribute("data-branch");
        const show = !key || new RegExp(key, "i").test(selected);
        el.hidden = !show;
      });
    }

    function showStep(index) {
      currentStep = Math.max(0, Math.min(index, steps.length - 1));
      steps.forEach((step, i) => step.hidden = i !== currentStep);
      tabs.forEach((tab, i) => tab.classList.toggle("active", i === currentStep));
      if (progress) progress.textContent = `Step ${currentStep + 1} of ${steps.length}`;
      update();
      root.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function update() {
      updateBranches();
      const pack = docs.buildAll(data);
      if (preview) preview.textContent = pack.text;
      if (status) {
        status.innerHTML = `
          <strong>${pack.analysis.completeness.status}</strong>
          <span>${pack.analysis.issueType}</span>
          <span>${pack.analysis.evidencePosition}</span>
          <span>${pack.analysis.urgent ? "Urgent legal boundary" : "Self-service route"}</span>
        `;
      }
    }

    function downloadText(filename, type, content) {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }

    function textToRtf(text) {
      return `{\\rtf1\\ansi\\deff0 ${text.replace(/[\\{}]/g, "\\$&").replace(/\n/g, "\\par ")}}`;
    }

    function exportPack(kind) {
      collect();
      const pack = docs.buildAll(data);
      const base = (data.packReference || "QG-PACK").toLowerCase();
      if (kind === "copy") {
        navigator.clipboard && navigator.clipboard.writeText(pack.text);
        return;
      }
      if (kind === "print") {
        const win = window.open("", "_blank");
        win.document.write(`<pre>${pack.text.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]))}</pre>`);
        win.document.close();
        win.print();
        return;
      }
      if (kind === "rtf") downloadText(`${base}.rtf`, "application/rtf", textToRtf(pack.text));
      if (kind === "txt") downloadText(`${base}.txt`, "text/plain", pack.text);
      if (kind === "pdf") {
        if (window.jspdf && window.jspdf.jsPDF) {
          const pdf = new window.jspdf.jsPDF({ unit: "pt", format: "a4" });
          const lines = pdf.splitTextToSize(pack.text, 500);
          let y = 48;
          lines.forEach((line) => {
            if (y > 780) { pdf.addPage(); y = 48; }
            pdf.text(line, 48, y);
            y += 14;
          });
          pdf.save(`${base}.pdf`);
        } else downloadText(`${base}.txt`, "text/plain", pack.text);
      }
    }

    root.addEventListener("input", collect);
    root.addEventListener("change", collect);
    root.addEventListener("click", (event) => {
      const action = event.target.closest("[data-action]");
      if (!action) return;
      const name = action.getAttribute("data-action");
      if (name === "next") showStep(currentStep + 1);
      if (name === "back") showStep(currentStep - 1);
      if (name === "save") collect();
      if (name === "reset") { state.clear(); location.reload(); }
      if (name === "delete") { state.clear(); location.reload(); }
      if (name.startsWith("export-")) exportPack(name.replace("export-", ""));
    });
    tabs.forEach((tab, i) => tab.addEventListener("click", () => showStep(i)));
    restore();
    showStep(0);
  });
})();
