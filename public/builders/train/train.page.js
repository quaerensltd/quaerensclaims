"use strict";

(function(root, factory) {
  const train = root.QCBFTrain || {};
  const api = factory(train.config, train.questions, train.analysis, train.evidence, train.submission, train.documents, train.resources);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.QCBFTrain = root.QCBFTrain || {};
  root.QCBFTrain.page = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function(config, questions, analysis, evidence, submission, documents, resources) {
  if (!config && typeof require === "function") config = require("./train.config");
  if (!questions && typeof require === "function") questions = require("./train.questions");
  if (!analysis && typeof require === "function") analysis = require("./train.analysis");
  if (!evidence && typeof require === "function") evidence = require("./train.evidence");
  if (!submission && typeof require === "function") submission = require("./train.submission");
  if (!documents && typeof require === "function") documents = require("./train.documents");
  if (!resources && typeof require === "function") resources = require("./train.resources");

  function createPackReference(seed) {
    const suffix = String(seed || Math.random().toString(36).slice(2, 8)).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6).padEnd(6, "X");
    return config.packPrefix + "-" + new Date().getFullYear() + "-" + suffix;
  }

  function buildPreviewCards(data, context) {
    const result = analysis.analyse(data || {});
    const evidenceStatus = evidence.buildEvidenceStatus(data || {});
    const route = submission.buildSubmissionPlaceholder(data || {});
    const packReference = (context && context.packReference) || createPackReference("TRAIN");
    return [
      { title: "Journey Summary", body: result.route },
      { title: "Journey Analysis", body: "Recorded delay: " + result.recordedDelay + ". Route: " + result.requestedOutcome + "." },
      { title: "Compensation Summary", body: "Estimated total requested: " + result.compensation.estimatedTotalRequested.toFixed(2) + " GBP. " + result.compensation.estimatedOnly },
      { title: "Evidence Position", body: result.evidencePosition.level + " - " + result.evidencePosition.explanation },
      { title: "Complaint Pack Completeness", body: result.completeness.status },
      { title: "Requested Outcome", body: ((data && data.requestedOutcomes) || []).join(", ") || "Not recorded" },
      { title: "Operator", body: route.operator + ". " + route.preferredComplaintMethod },
      { title: "Timeline", body: (data && data.timelineNotes) || "Timeline notes not recorded" },
      { title: "Pack Reference", body: packReference },
      { title: "Downloads", body: "PDF, Word/RTF, TXT, copy and print are available from one Quaerens Consumer Complaint File." },
      { title: "Evidence Items", body: evidenceStatus.map(item => item.label + ": " + item.status).join("; ") || "No evidence recorded" }
    ];
  }

  function browserInit() {
    if (typeof document === "undefined") return;
    const runtimeRoot = typeof globalThis !== "undefined" ? globalThis : window;
    const QCBF = runtimeRoot.QCBF || {};
    const packReference = createPackReference("RAIL01");
    let activePreview = "summary";

    function byId(id) {
      return document.getElementById(id);
    }

    function checkedValues(name) {
      return Array.from(document.querySelectorAll("input[name='" + name + "']:checked")).map(input => input.value);
    }

    function inputValue(name) {
      const el = document.querySelector("[name='" + name + "']");
      return el ? el.value.trim() : "";
    }

    function collectRows(prefix) {
      return Array.from(document.querySelectorAll("[data-row='" + prefix + "']")).map(row => {
        const item = {};
        Array.from(row.querySelectorAll("[name]")).forEach(input => {
          item[input.name.replace(prefix + "-", "")] = input.value;
        });
        return item;
      }).filter(row => Object.values(row).some(Boolean));
    }

    function collectData() {
      return {
        journeyIssues: checkedValues("journeyIssues"),
        leadPassenger: inputValue("leadPassenger"),
        additionalPassengers: inputValue("additionalPassengers"),
        email: inputValue("email"),
        telephone: inputValue("telephone"),
        journeyDate: inputValue("journeyDate"),
        departureStation: inputValue("departureStation"),
        arrivalStation: inputValue("arrivalStation"),
        departureTime: inputValue("departureTime"),
        scheduledArrival: inputValue("scheduledArrival"),
        actualArrival: inputValue("actualArrival"),
        manualDelayMinutes: inputValue("manualDelayMinutes"),
        trainOperator: inputValue("trainOperator"),
        connectingOperator: inputValue("connectingOperator"),
        ticketType: inputValue("ticketType"),
        singleReturn: inputValue("singleReturn"),
        ticketPrice: inputValue("ticketPrice"),
        travellerCount: inputValue("travellerCount"),
        railcard: inputValue("railcard"),
        splitTickets: inputValue("splitTickets"),
        bookingReference: inputValue("bookingReference"),
        seatReservation: inputValue("seatReservation"),
        ticketNumber: inputValue("ticketNumber"),
        journeyComplete: inputValue("journeyComplete"),
        delayRepayClaimed: inputValue("delayRepayClaimed"),
        refundRequested: inputValue("refundRequested"),
        operatorResponse: inputValue("operatorResponse"),
        claimReference: inputValue("claimReference"),
        requestedOutcomes: checkedValues("requestedOutcomes"),
        evidence: checkedValues("evidence"),
        timelineNotes: inputValue("timelineNotes"),
        expenses: collectRows("expense"),
        timelineRows: collectRows("timeline")
      };
    }

    function renderChecks(targetId, options, name) {
      const target = byId(targetId);
      if (!target) return;
      target.innerHTML = options.map(option => (
        "<label class=\"check-card\"><input type=\"checkbox\" name=\"" + name + "\" value=\"" + option.id + "\"> <span>" + option.label + "</span></label>"
      )).join("");
    }

    function renderOperatorList() {
      const target = byId("operator-options");
      if (!target) return;
      target.innerHTML = resources.operatorDirectory.map(item => "<option value=\"" + item.name + "\"></option>").join("");
    }

    function renderEvidenceStatus(data) {
      const target = byId("evidence-status");
      if (!target) return;
      target.innerHTML = evidence.buildEvidenceChecklist(data).map(item => (
        "<div class=\"status-row\"><strong>" + item.label + "</strong><span>" + item.status + "</span></div>"
      )).join("");
    }

    function renderCards(data) {
      const target = byId("preview-cards");
      if (!target) return;
      target.innerHTML = buildPreviewCards(data, { packReference: packReference }).slice(0, 8).map(card => (
        "<article class=\"preview-card\"><h3>" + card.title + "</h3><p>" + card.body + "</p></article>"
      )).join("");
    }

    function renderStatus(data) {
      const result = analysis.analyse(data);
      const target = byId("builder-status");
      if (!target) return;
      target.innerHTML = [
        "<strong>" + result.completeness.status + "</strong>",
        "<span>" + result.completeness.percent + "% complete</span>",
        "<small>Evidence position: " + result.evidencePosition.level + "</small>"
      ].join("");
      const bar = byId("progress-bar");
      if (bar) bar.style.width = result.completeness.percent + "%";
    }

    function renderPreview(data) {
      const docs = documents.buildAll(data, { packReference: packReference });
      const target = byId("document-preview");
      if (target) target.textContent = docs[activePreview] || docs.full;
    }

    function renderFinancial(data) {
      const result = analysis.analyse(data);
      const target = byId("financial-summary");
      if (!target) return;
      target.innerHTML = [
        "<div><strong>Estimated Delay Repay</strong><span>" + result.compensation.grossDelayRepay.toFixed(2) + " GBP</span></div>",
        "<div><strong>Possible refund route</strong><span>" + result.compensation.possibleRefund.toFixed(2) + " GBP</span></div>",
        "<div><strong>Documented expenses</strong><span>" + result.compensation.expenses.toFixed(2) + " GBP</span></div>",
        "<div><strong>Estimated total requested</strong><span>" + result.compensation.estimatedTotalRequested.toFixed(2) + " GBP</span></div>"
      ].join("");
    }

    function update() {
      const data = collectData();
      renderStatus(data);
      renderCards(data);
      renderEvidenceStatus(data);
      renderFinancial(data);
      renderPreview(data);
      const save = byId("save-progress");
      if (save && save.checked && QCBF.StateManager) {
        const manager = new QCBF.StateManager(config);
        manager.save(data);
      }
    }

    function exportText(kind) {
      const data = collectData();
      const docs = documents.buildAll(data, { packReference: packReference });
      const base = "quaerens-rail-consumer-complaint-file";
      if (kind === "pdf" && QCBF.downloadPdf) QCBF.downloadPdf(base + ".pdf", "Quaerens Consumer Complaint File", docs.full);
      if (kind === "rtf" && QCBF.downloadBlob) QCBF.downloadBlob(base + ".rtf", "application/rtf", QCBF.textToRtf ? QCBF.textToRtf(docs.full) : docs.full);
      if (kind === "txt" && QCBF.downloadBlob) QCBF.downloadBlob(base + ".txt", "text/plain;charset=utf-8", docs.full);
      if (kind === "copy" && navigator.clipboard) navigator.clipboard.writeText(docs.full);
      if (kind === "print") {
        const win = window.open("", "_blank");
        if (win) {
          win.document.write("<pre>" + docs.full.replace(/[&<>]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[char])) + "</pre>");
          win.document.close();
          win.print();
        }
      }
    }

    function restore() {
      if (!QCBF.StateManager) return;
      const manager = new QCBF.StateManager(config);
      const data = typeof manager.restore === "function" ? manager.restore() : null;
      if (!data) return;
      Object.keys(data).forEach(key => {
        const value = data[key];
        if (Array.isArray(value)) {
          value.forEach(item => {
            const input = document.querySelector("input[name='" + key + "'][value='" + item + "']");
            if (input) input.checked = true;
          });
        } else {
          const input = document.querySelector("[name='" + key + "']");
          if (input) input.value = value;
        }
      });
    }

    renderChecks("issue-options", questions.journeyIssueOptions, "journeyIssues");
    renderChecks("outcome-options", questions.requestedOutcomeOptions, "requestedOutcomes");
    renderChecks("evidence-options", questions.evidenceOptions, "evidence");
    renderOperatorList();
    restore();
    document.addEventListener("input", update);
    document.addEventListener("change", update);
    document.querySelectorAll("[data-preview-tab]").forEach(button => {
      button.addEventListener("click", () => {
        activePreview = button.getAttribute("data-preview-tab");
        document.querySelectorAll("[data-preview-tab]").forEach(tab => {
          const selected = tab === button;
          tab.classList.toggle("active", selected);
          tab.setAttribute("aria-selected", String(selected));
        });
        update();
      });
    });
    const initialPreviewTab = document.querySelector('[data-preview-tab="summary"]');
    if (initialPreviewTab) {
      initialPreviewTab.classList.add("active");
      initialPreviewTab.setAttribute("aria-selected", "true");
    }
    document.querySelectorAll("[data-export]").forEach(button => {
      button.addEventListener("click", () => exportText(button.getAttribute("data-export")));
    });
    update();
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", browserInit);
    else browserInit();
  }

  return {
    createPackReference: createPackReference,
    buildPreviewCards: buildPreviewCards,
    browserInit: browserInit
  };
});
