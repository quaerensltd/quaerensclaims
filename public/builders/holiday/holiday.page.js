"use strict";

(function(root) {
  const QCBF = root.QCBF;
  const holiday = root.QCBFHoliday || {};
  const config = holiday.config;
  const questions = holiday.questions || { multiValueFields: [] };
  const documents = holiday.documents;
  const qs = id => document.getElementById(id);
  const qsa = selector => Array.from(document.querySelectorAll(selector));
  const state = new QCBF.StateManager(config);
  const stepper = new QCBF.StepController(config.stages);
  let activePreview = "summary";
  let docs = {};

  function value(name) {
    const el = document.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : "";
  }

  function checked(name) {
    return qsa('[name="' + name + '"]:checked').map(el => el.value);
  }

  function radio(name) {
    const el = document.querySelector('[name="' + name + '"]:checked');
    return el ? el.value : "";
  }

  function selected(current, value) {
    return current === value ? " selected" : "";
  }

  function collectExpenses() {
    return qsa("[data-expense-row]").map((row, index) => {
      const get = name => {
        const el = row.querySelector('[name="' + name + '"]');
        return el ? el.value.trim() : "";
      };
      return {
        index: index + 1,
        description: get("expenseDescription"),
        amount: get("expenseAmount"),
        receipt: get("expenseReceipt"),
        reason: get("expenseReason")
      };
    }).filter(item => item.description || item.amount || item.reason);
  }

  function expenseRowHtml(item) {
    const data = item || {};
    return '<div class="expense-row" data-expense-row>' +
      '<label>Cost description <input name="expenseDescription" value="' + QCBF.text.escapeAttr(data.description || "") + '" placeholder="Replacement hotel, taxi, meals, calls"></label>' +
      '<label>Amount <input name="expenseAmount" value="' + QCBF.text.escapeAttr(data.amount || "") + '" inputmode="decimal" placeholder="e.g. 125.50"></label>' +
      '<label>Receipt available? <select name="expenseReceipt"><option value="">Select</option><option' + selected(data.receipt, "Yes") + '>Yes</option><option' + selected(data.receipt, "No") + '>No</option><option' + selected(data.receipt, "Partly") + '>Partly</option></select></label>' +
      '<label>Why was this cost incurred? <input name="expenseReason" value="' + QCBF.text.escapeAttr(data.reason || "") + '" placeholder="Explain briefly"></label>' +
    "</div>";
  }

  function data() {
    return {
      holidayType: radio("holidayType"),
      packageSold: value("packageSold"),
      bookingDate: value("bookingDate"),
      bookedDate: value("bookedDate"),
      travelStart: value("travelStart"),
      travelEnd: value("travelEnd"),
      destination: value("destination"),
      country: value("country"),
      travellers: value("travellers") || "1",
      nights: value("nights"),
      leadPassenger: value("leadPassenger"),
      additionalTravellers: value("additionalTravellers"),
      travelCompany: value("travelCompany"),
      travelAgent: value("travelAgent"),
      accommodationProvider: value("accommodationProvider"),
      bookingReference: value("bookingReference"),
      whoTookPayment: value("whoTookPayment"),
      whoIssuedConfirmation: value("whoIssuedConfirmation"),
      paymentMethod: value("paymentMethod"),
      totalPrice: value("totalPrice"),
      currency: value("currency"),
      amountPaid: value("amountPaid"),
      companyOther: value("companyOther"),
      accommodationName: value("accommodationName"),
      accommodationType: value("accommodationType"),
      advertisedStarRating: value("advertisedStarRating"),
      roomTypeBooked: value("roomTypeBooked"),
      boardBasis: value("boardBasis"),
      accessibilityRequirements: value("accessibilityRequirements"),
      facilitiesAdvertised: checked("facilitiesAdvertised"),
      keyPromises: value("keyPromises"),
      promiseSource: checked("promiseSource"),
      complaintTypes: checked("complaintTypes"),
      problemDate: value("problemDate"),
      problemEnd: value("problemEnd"),
      continuedWholeHoliday: value("continuedWholeHoliday"),
      problemFixed: value("problemFixed"),
      alternativeOffered: value("alternativeOffered"),
      acceptedAlternative: value("acceptedAlternative"),
      issueDetails: value("issueDetails"),
      complaintDate: value("complaintDate"),
      reportedDuringHoliday: value("reportedDuringHoliday"),
      complaintMethod: value("complaintMethod"),
      complaintReference: value("complaintReference"),
      responseReceived: value("responseReceived"),
      remedyOffered: value("remedyOffered"),
      remedyAccepted: value("remedyAccepted"),
      currentStatus: value("currentStatus"),
      timelineNotes: value("timelineNotes"),
      evidence: checked("evidence"),
      missingEvidence: value("missingEvidence"),
      outcomes: checked("outcomes"),
      holidayPriceClaimed: value("holidayPriceClaimed"),
      currencyLoss: value("currencyLoss"),
      refundAlreadyReceived: value("refundAlreadyReceived"),
      voucherReceived: value("voucherReceived"),
      losses: value("losses"),
      requestedOutcomeReason: value("requestedOutcomeReason"),
      expenses: collectExpenses()
    };
  }

  function cssEscape(value) {
    if (root.CSS && root.CSS.escape) return root.CSS.escape(value);
    return String(value || "").replace(/"/g, '\\"');
  }

  function restore() {
    const saved = state.restore();
    if (!saved) return;
    Object.entries(saved).forEach(([key, val]) => {
      if (key === "expenses" && Array.isArray(val)) {
        const wrap = qs("expenseRows");
        if (wrap && val.length) wrap.innerHTML = val.map(expenseRowHtml).join("");
        return;
      }
      if (Array.isArray(val)) {
        val.forEach(item => {
          const el = document.querySelector('[name="' + key + '"][value="' + cssEscape(item) + '"]');
          if (el) el.checked = true;
        });
        return;
      }
      const radioEl = document.querySelector('[name="' + key + '"][value="' + cssEscape(val || "") + '"]');
      if (radioEl && radioEl.type === "radio") radioEl.checked = true;
      const input = document.querySelector('[name="' + key + '"]:not([type="radio"]):not([type="checkbox"])');
      if (input) input.value = val || "";
    });
  }

  function render() {
    qsa(".wizard-step").forEach((el, index) => el.classList.toggle("active", index === stepper.index));
    const progressBar = qs("progressBar");
    if (progressBar) progressBar.style.width = (((stepper.index + 1) / config.stages.length) * 100) + "%";
    const progressText = qs("progressText");
    if (progressText) progressText.innerHTML = "<strong>Step " + (stepper.index + 1) + " of " + config.stages.length + " - " + config.stages[stepper.index].label + "</strong>";
    const prevBtn = qs("prevBtn");
    const nextBtn = qs("nextBtn");
    if (prevBtn) prevBtn.disabled = stepper.index === 0;
    if (nextBtn) nextBtn.textContent = stepper.index === config.stages.length - 1 ? "Review Pack" : "Next Step";
    docs = documents.buildAll(data());
    const preview = qs("livePreview");
    if (preview) preview.textContent = docs[activePreview] || docs.summary;
    const editor = qs("docEditor");
    if (editor) editor.value = docs.full || "";
    const printArea = qs("printArea");
    if (printArea) printArea.textContent = docs.full || "";
    state.save(data());
  }

  function bind() {
    const nextBtn = qs("nextBtn");
    const prevBtn = qs("prevBtn");
    const clearBtn = qs("clearBtn");
    const generatePackBtn = qs("generatePackBtn");
    const holidayForm = qs("holidayForm");
    const addExpenseBtn = qs("addExpenseBtn");

    if (nextBtn) nextBtn.addEventListener("click", () => {
      stepper.next();
      render();
      if (stepper.index === config.stages.length - 1 && qs("holiday-tool")) qs("holiday-tool").scrollIntoView({ behavior: "smooth" });
    });
    if (prevBtn) prevBtn.addEventListener("click", () => { stepper.previous(); render(); });
    if (clearBtn) clearBtn.addEventListener("click", () => {
      if (confirm("Clear all answers on this page?")) {
        holidayForm.reset();
        state.clear();
        stepper.set(0);
        render();
      }
    });
    if (generatePackBtn) generatePackBtn.addEventListener("click", () => {
      docs = documents.buildAll(data());
      render();
      if (qs("downloads")) qs("downloads").scrollIntoView({ behavior: "smooth" });
    });
    if (holidayForm) {
      holidayForm.addEventListener("input", render);
      holidayForm.addEventListener("change", render);
    }
    if (addExpenseBtn) addExpenseBtn.addEventListener("click", () => {
      qs("expenseRows").insertAdjacentHTML("beforeend", expenseRowHtml());
      render();
    });
    qsa(".doc-tab").forEach(btn => btn.addEventListener("click", () => {
      qsa(".doc-tab").forEach(other => other.classList.remove("active"));
      btn.classList.add("active");
      activePreview = btn.dataset.preview;
      render();
    }));
    const togglePreview = qs("togglePreview");
    if (togglePreview) togglePreview.addEventListener("click", () => {
      const pre = qs("livePreview");
      pre.classList.toggle("hidden");
      togglePreview.textContent = pre.classList.contains("hidden") ? "Show Preview" : "Hide Preview";
    });
    qs("downloadPdfBtn").addEventListener("click", () => QCBF.downloadPdf("quaerens-holiday-complaint-pack.pdf", "Quaerens Consumer Complaint File", docs.full || documents.buildAll(data()).full));
    qs("downloadRtfBtn").addEventListener("click", () => QCBF.downloadBlob("quaerens-holiday-complaint-pack.rtf", "application/rtf", QCBF.textToRtf(docs.full || documents.buildAll(data()).full)));
    qs("downloadTxtBtn").addEventListener("click", () => QCBF.downloadBlob("quaerens-holiday-complaint-pack.txt", "text/plain;charset=utf-8", docs.full || documents.buildAll(data()).full));
    qs("copyDocBtn").addEventListener("click", async () => {
      await navigator.clipboard.writeText(qs("docEditor").value);
      qs("copyDocBtn").textContent = "Copied";
      setTimeout(() => qs("copyDocBtn").textContent = "Copy This Document", 1200);
    });
    qs("printBtn").addEventListener("click", () => root.print());
    qsa(".faq-btn").forEach(btn => btn.addEventListener("click", () => btn.closest(".faq-item").classList.toggle("active")));
  }

  if (!QCBF || !config || !documents) return;
  restore();
  render();
  bind();
  root.QCBFHoliday.collectData = data;
  root.QCBFHoliday.currentDocuments = () => docs;
})(typeof globalThis !== "undefined" ? globalThis : window);
