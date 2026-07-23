"use strict";

(function(root) {
  const QCBF = root.QCBF;
  const baggage = root.QCBFBaggage || {};
  const config = baggage.config;
  const analysis = baggage.analysis;
  const evidence = baggage.evidence;
  const documents = baggage.documents;
  const submission = baggage.submission;
  const resources = baggage.resources;
  const qs = id => document.getElementById(id);
  const qsa = selector => Array.from(document.querySelectorAll(selector));
  const state = new QCBF.StateManager(config);
  let activePreview = "summary";
  let packReference = "";
  let docs = {};

  function createPackReference() {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).slice(2, 8).toUpperCase().replace(/[^A-Z0-9]/g, "0");
    return "QB-" + year + "-" + random.padEnd(6, "0").slice(0, 6);
  }

  function ensurePackReference() {
    if (/^QB-\d{4}-[A-Z0-9]{6}$/.test(packReference)) return packReference;
    packReference = createPackReference();
    return packReference;
  }

  function value(name) {
    const el = document.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : "";
  }

  function checked(name) {
    return qsa('[name="' + name + '"]:checked').map(el => el.value);
  }

  function selected(current, value) {
    return current === value ? " selected" : "";
  }

  function collectFinancialItems() {
    return qsa("[data-item-row]").map((row, index) => {
      const get = name => {
        const el = row.querySelector('[name="' + name + '"]');
        return el ? el.value.trim() : "";
      };
      return {
        index: index + 1,
        description: get("itemDescription"),
        category: get("itemCategory"),
        currency: get("itemCurrency"),
        originalPrice: get("itemOriginalPrice"),
        currentValue: get("itemCurrentValue"),
        replacementAmount: get("itemReplacementAmount"),
        repairAmount: get("itemRepairAmount"),
        amountRequested: get("itemAmountRequested"),
        proofStatus: get("itemProofStatus"),
        receiptStatus: get("itemReceiptStatus"),
        reimbursedElsewhere: get("itemReimbursedElsewhere"),
        notes: get("itemNotes")
      };
    }).filter(item => item.description || item.amountRequested || item.currentValue || item.replacementAmount || item.repairAmount);
  }

  function collectTimeline() {
    return qsa("[data-timeline-row]").map((row, index) => {
      const get = name => {
        const el = row.querySelector('[name="' + name + '"]');
        return el ? el.value.trim() : "";
      };
      return { index: index + 1, date: get("timelineDate"), event: get("timelineEvent"), response: get("timelineResponse") };
    }).filter(item => item.date || item.event || item.response);
  }

  function data() {
    return {
      packReference: ensurePackReference(),
      leadPassenger: value("leadPassenger"),
      additionalPassengers: value("additionalPassengers"),
      email: value("email"),
      telephone: value("telephone"),
      address: value("address"),
      bookingReference: value("bookingReference"),
      ticketNumber: value("ticketNumber"),
      airline: value("airline"),
      operatingAirline: value("operatingAirline"),
      flightNumber: value("flightNumber"),
      departureAirport: value("departureAirport"),
      arrivalAirport: value("arrivalAirport"),
      connectingAirports: value("connectingAirports"),
      travelDate: value("travelDate"),
      arrivalDate: value("arrivalDate"),
      journeyDirection: value("journeyDirection"),
      finalDestination: value("finalDestination"),
      travelReason: value("travelReason"),
      passengerCount: value("passengerCount") || "1",
      checkedBags: value("checkedBags"),
      baggageTag: value("baggageTag"),
      bagDescription: value("bagDescription"),
      bagBrand: value("bagBrand"),
      bagColour: value("bagColour"),
      bagSize: value("bagSize"),
      distinctiveFeatures: value("distinctiveFeatures"),
      bagShell: value("bagShell"),
      lockFitted: value("lockFitted"),
      bagPassenger: value("bagPassenger"),
      bagsAffected: value("bagsAffected"),
      checkedThrough: value("checkedThrough"),
      connectionJourney: value("connectionJourney"),
      differentAirlines: value("differentAirlines"),
      bagContents: checked("bagContents"),
      baggageIssues: checked("baggageIssues"),
      expectedDateTime: value("expectedDateTime"),
      deliveredDateTime: value("deliveredDateTime"),
      delayedDays: value("delayedDays"),
      deliveryLocation: value("deliveryLocation"),
      awayFromHome: value("awayFromHome"),
      essentialsPurchased: value("essentialsPurchased"),
      deliveryPromised: value("deliveryPromised"),
      trackingUpdates: value("trackingUpdates"),
      lostDeclared: value("lostDeclared"),
      daysOutstanding: value("daysOutstanding"),
      contentsInventory: value("contentsInventory"),
      damageDescription: value("damageDescription"),
      damageExistedBefore: value("damageExistedBefore"),
      airlineInspected: value("airlineInspected"),
      repairOffered: value("repairOffered"),
      bagUsable: value("bagUsable"),
      missingDiscovered: value("missingDiscovered"),
      tamperingVisible: value("tamperingVisible"),
      policeReport: value("policeReport"),
      mobilityImpact: value("mobilityImpact"),
      medicalConsequences: value("medicalConsequences"),
      problemDetails: value("problemDetails"),
      reportedAtAirport: value("reportedAtAirport"),
      pirCompleted: value("pirCompleted"),
      pirReference: value("pirReference"),
      airportBaggageDesk: value("airportBaggageDesk"),
      groundHandler: value("groundHandler"),
      reportedDate: value("reportedDate"),
      reportedTime: value("reportedTime"),
      reportedTo: value("reportedTo"),
      writtenReport: value("writtenReport"),
      trackingReference: value("trackingReference"),
      worldTracer: value("worldTracer"),
      airlineContactDate: value("airlineContactDate"),
      complaintDate: value("complaintDate"),
      complaintReference: value("complaintReference"),
      airlineResponse: value("airlineResponse"),
      offerMade: value("offerMade"),
      paymentMade: value("paymentMade"),
      rejectionReason: value("rejectionReason"),
      currency: value("currency") || "GBP",
      insuranceHeld: value("insuranceHeld"),
      insuranceClaimMade: value("insuranceClaimMade"),
      insurancePaid: value("insurancePaid"),
      insuranceCovered: value("insuranceCovered"),
      insuranceExcess: value("insuranceExcess"),
      insurerNeedsAirlineResponse: value("insurerNeedsAirlineResponse"),
      financialItems: collectFinancialItems(),
      evidence: checked("evidence"),
      missingEvidence: value("missingEvidence"),
      timelineNotes: value("timelineNotes"),
      timeline: collectTimeline(),
      requestedOutcomes: checked("requestedOutcomes"),
      amountRequested: value("amountRequested"),
      outcomeBasis: value("outcomeBasis"),
      paymentsReceived: value("paymentsReceived"),
      outstandingAmount: value("outstandingAmount"),
      responseRequestedBy: value("responseRequestedBy")
    };
  }

  function cssEscape(value) {
    if (root.CSS && root.CSS.escape) return root.CSS.escape(value);
    return String(value || "").replace(/"/g, '\\"');
  }

  function itemRowHtml(item) {
    const data = item || {};
    return '<div class="builder-row item-row" data-item-row>' +
      '<label>Item or expense <input name="itemDescription" value="' + QCBF.text.escapeAttr(data.description || "") + '" placeholder="Suitcase, clothing, toiletries, repair quote"></label>' +
      '<label>Category <select name="itemCategory"><option value="">Select</option><option' + selected(data.category, "Delayed essentials") + '>Delayed essentials</option><option' + selected(data.category, "Lost contents") + '>Lost contents</option><option' + selected(data.category, "Damaged bag") + '>Damaged bag</option><option' + selected(data.category, "Missing contents") + '>Missing contents</option><option' + selected(data.category, "Mobility equipment") + '>Mobility equipment</option><option' + selected(data.category, "Other") + '>Other</option></select></label>' +
      '<label>Currency <select name="itemCurrency"><option' + selected(data.currency, "GBP") + '>GBP</option><option' + selected(data.currency, "EUR") + '>EUR</option><option' + selected(data.currency, "USD") + '>USD</option><option' + selected(data.currency, "Other") + '>Other</option></select></label>' +
      '<label>Original price <input name="itemOriginalPrice" value="' + QCBF.text.escapeAttr(data.originalPrice || "") + '" inputmode="decimal"></label>' +
      '<label>Current value <input name="itemCurrentValue" value="' + QCBF.text.escapeAttr(data.currentValue || "") + '" inputmode="decimal"></label>' +
      '<label>Replacement amount <input name="itemReplacementAmount" value="' + QCBF.text.escapeAttr(data.replacementAmount || "") + '" inputmode="decimal"></label>' +
      '<label>Repair amount <input name="itemRepairAmount" value="' + QCBF.text.escapeAttr(data.repairAmount || "") + '" inputmode="decimal"></label>' +
      '<label>Requested amount <input name="itemAmountRequested" value="' + QCBF.text.escapeAttr(data.amountRequested || "") + '" inputmode="decimal"></label>' +
      '<label>Proof of value <select name="itemProofStatus"><option value="">Select</option><option' + selected(data.proofStatus, "Available") + '>Available</option><option' + selected(data.proofStatus, "Missing") + '>Missing</option><option' + selected(data.proofStatus, "Partial") + '>Partial</option></select></label>' +
      '<label>Receipt <select name="itemReceiptStatus"><option value="">Select</option><option' + selected(data.receiptStatus, "Available") + '>Available</option><option' + selected(data.receiptStatus, "Missing") + '>Missing</option><option' + selected(data.receiptStatus, "Requested") + '>Requested</option></select></label>' +
      '<label>Reimbursed elsewhere <input name="itemReimbursedElsewhere" value="' + QCBF.text.escapeAttr(data.reimbursedElsewhere || "") + '" inputmode="decimal"></label>' +
      '<label>Notes <input name="itemNotes" value="' + QCBF.text.escapeAttr(data.notes || "") + '" placeholder="Why this amount is requested"></label>' +
    "</div>";
  }

  function timelineRowHtml(item) {
    const data = item || {};
    return '<div class="builder-row timeline-row" data-timeline-row>' +
      '<label>Date <input name="timelineDate" value="' + QCBF.text.escapeAttr(data.date || "") + '" placeholder="dd/mm/yyyy"></label>' +
      '<label>Event <input name="timelineEvent" value="' + QCBF.text.escapeAttr(data.event || "") + '" placeholder="Bag reported missing, airline replied"></label>' +
      '<label>Details or response <input name="timelineResponse" value="' + QCBF.text.escapeAttr(data.response || "") + '" placeholder="What happened or what was said"></label>' +
    "</div>";
  }

  function restore() {
    const saved = state.restore();
    if (!saved) return;
    if (/^QB-\d{4}-[A-Z0-9]{6}$/.test(saved.packReference || "")) packReference = saved.packReference;
    Object.entries(saved).forEach(([key, val]) => {
      if (key === "packReference") return;
      if (key === "financialItems" && Array.isArray(val)) {
        const wrap = qs("itemRows");
        if (wrap && val.length) wrap.innerHTML = val.map(itemRowHtml).join("");
        return;
      }
      if (key === "timeline" && Array.isArray(val)) {
        const wrap = qs("timelineRows");
        if (wrap && val.length) wrap.innerHTML = val.map(timelineRowHtml).join("");
        return;
      }
      if (Array.isArray(val)) {
        val.forEach(item => {
          const el = document.querySelector('[name="' + key + '"][value="' + cssEscape(item) + '"]');
          if (el) el.checked = true;
        });
        return;
      }
      const el = document.querySelector('[name="' + key + '"]');
      if (el && typeof val !== "object") el.value = val;
    });
  }

  function renderStatus(current) {
    const readiness = analysis.completeness(current);
    const deadline = analysis.deadlineStatus(current);
    const ev = analysis.evidencePosition(current);
    const smart = submission.smartSubmission(current);
    const route = smart.route.page ? '<a href="' + QCBF.text.escapeAttr(smart.route.page) + '" target="_blank" rel="noopener">Official complaint route</a>' : "Check the airline's current official website";
    qs("statusPanel").innerHTML =
      '<div class="status-card"><strong>' + readiness.status + '</strong><span>' + readiness.percent + '% complete</span></div>' +
      '<div class="status-card"><strong>' + deadline.label + '</strong><span>' + QCBF.text.escapeHtml(deadline.detail) + '</span></div>' +
      '<div class="status-card"><strong>Evidence: ' + ev.label + '</strong><span>' + ev.actions.map(QCBF.text.escapeHtml).join("<br>") + '</span></div>' +
      '<div class="status-card"><strong>Smart Submission</strong><span>' + route + '</span></div>';
  }

  function renderEvidence(current) {
    const rows = evidence.buildEvidenceStatus(current).map(item => '<div class="evidence-row"><span>' + QCBF.text.escapeHtml(item.label) + '</span><strong class="evidence-' + item.status.toLowerCase().replace(/\s+/g, "-") + '">' + item.status + '</strong></div>').join("");
    qs("evidenceStatus").innerHTML = rows;
  }

  function renderPreview() {
    const current = data();
    state.save(current);
    docs = documents.buildAll(current, { packReference: ensurePackReference() });
    renderStatus(current);
    renderEvidence(current);
    qs("previewText").textContent = docs[activePreview] || docs.summary;
    qs("packReference").textContent = ensurePackReference();
    QCBF.accessibility.announce("Baggage complaint pack preview updated.");
  }

  function setPreview(key) {
    activePreview = key;
    qsa("[data-preview]").forEach(btn => btn.classList.toggle("active", btn.dataset.preview === key));
    renderPreview();
  }

  function bind() {
    document.addEventListener("input", event => {
      if (event.target.matches("input, textarea, select")) renderPreview();
    });
    document.addEventListener("change", event => {
      if (event.target.matches("input, textarea, select")) renderPreview();
    });
    qsa("[data-preview]").forEach(btn => btn.addEventListener("click", () => setPreview(btn.dataset.preview)));
    const addItem = qs("addItem");
    if (addItem) addItem.addEventListener("click", () => {
      qs("itemRows").insertAdjacentHTML("beforeend", itemRowHtml({ currency: value("currency") || "GBP" }));
      renderPreview();
    });
    const addTimeline = qs("addTimeline");
    if (addTimeline) addTimeline.addEventListener("click", () => {
      qs("timelineRows").insertAdjacentHTML("beforeend", timelineRowHtml({}));
      renderPreview();
    });
    const clear = qs("clearSaved");
    if (clear) clear.addEventListener("click", () => {
      state.clear();
      root.location.reload();
    });
    const copy = qs("copyPack");
    if (copy) copy.addEventListener("click", () => navigator.clipboard.writeText(docs.full || "").then(() => QCBF.accessibility.announce("Complaint pack copied.")));
    const print = qs("printPack");
    if (print) print.addEventListener("click", () => {
      qs("printOutput").textContent = docs.full || "";
      root.print();
    });
    const txt = qs("downloadTxt");
    if (txt) txt.addEventListener("click", () => QCBF.downloadBlob("quaerens-baggage-complaint-file.txt", "text/plain;charset=utf-8", docs.full || ""));
    const rtf = qs("downloadRtf");
    if (rtf) rtf.addEventListener("click", () => QCBF.downloadBlob("quaerens-baggage-complaint-file.rtf", "application/rtf", QCBF.textToRtf(docs.full || "")));
    const pdf = qs("downloadPdf");
    if (pdf) pdf.addEventListener("click", () => QCBF.downloadPdf("quaerens-baggage-complaint-file.pdf", "Quaerens Consumer Complaint File", docs.full || ""));
  }

  function init() {
    const itemWrap = qs("itemRows");
    if (itemWrap && !itemWrap.children.length) itemWrap.innerHTML = itemRowHtml({ currency: "GBP" });
    const timelineWrap = qs("timelineRows");
    if (timelineWrap && !timelineWrap.children.length) timelineWrap.innerHTML = timelineRowHtml({});
    restore();
    bind();
    renderPreview();
  }

  root.QCBFBaggage = root.QCBFBaggage || {};
  root.QCBFBaggage.page = { init, data, renderPreview, itemRowHtml, timelineRowHtml };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(typeof globalThis !== "undefined" ? globalThis : window);
