"use strict";

(function(root, factory) {
  const parking = root.QCBFParking || {};
  const api = factory(parking.deadlines, parking.grounds, parking.evidence, parking.config);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.QCBFParking = root.QCBFParking || {};
  root.QCBFParking.analysis = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function(deadlines, grounds, evidence, config) {
  if (!deadlines && typeof require === "function") deadlines = require("./parking.deadlines");
  if (!grounds && typeof require === "function") grounds = require("./parking.grounds");
  if (!evidence && typeof require === "function") evidence = require("./parking.evidence");
  if (!config && typeof require === "function") config = require("./parking.config");

  function includesAny(data, regex) {
    return regex.test([data.noticeType, data.currentStage, data.issuerCategory, data.narrative].concat(data.noticeDocuments || []).join(" "));
  }

  function classifyIssuer(data) {
    const text = [data.issuerCategory, data.noticeType, data.issuerName].join(" ");
    if (/TfL|Transport for London/i.test(text)) return "Transport for London";
    if (/Council|local authority|Notice to Owner|tribunal/i.test(text)) return "Council or public authority";
    if (/Private|parking charge|POPLA|IAS|operator/i.test(text)) return "Private parking operator";
    if (/Police|Fixed Penalty|criminal/i.test(text)) return "Police or fixed penalty route";
    if (/Railway|station/i.test(text)) return "Railway or station parking route";
    return "Issuer route needs checking";
  }

  function stage(data) {
    const urgent = includesAny(data, /Court claim|Order for Recovery|Bailiff|enforcement|Letter Before Claim|judgment|Fixed Penalty|clamping|removal/i);
    return {
      name: data.currentStage || data.noticeType || "Stage not recorded",
      urgent,
      caution: urgent
        ? "This may involve court, enforcement, fixed-penalty or statutory steps. The builder can organise facts and evidence, but it does not create court forms, statutory declarations, witness statements or legal defences."
        : "Use the official appeal route shown on the notice and keep a copy of the submission."
    };
  }

  function completeness(data) {
    const missing = (config.essentialFields || []).filter(field => {
      const value = data[field];
      return Array.isArray(value) ? value.length === 0 : !String(value || "").trim();
    });
    if (!data.noticeType) return { status: "Not Started", missing };
    if (missing.length > 3) return { status: "Needs Key Information", missing };
    if ((data.evidence || []).length < 2) return { status: "Needs Evidence", missing };
    if (missing.length) return { status: "In Progress", missing };
    return { status: "Ready to Submit", missing };
  }

  function financialPosition(data) {
    const amount = Number(String(data.amount || "").replace(/[^0-9.]/g, "")) || 0;
    const discounted = Number(String(data.discountedAmount || "").replace(/[^0-9.]/g, "")) || 0;
    const debt = Number(String(data.debtAmount || "").replace(/[^0-9.]/g, "")) || 0;
    const paid = Number(String(data.amountPaidIfPaid || "").replace(/[^0-9.]/g, "")) || 0;
    return {
      amount,
      discounted,
      debt,
      paid,
      totalAtRisk: Math.max(amount, debt, paid, 0),
      summary: [
        amount ? "Notice amount: GBP " + amount.toFixed(2) : "Notice amount not recorded",
        discounted ? "Discounted amount: GBP " + discounted.toFixed(2) : "Discounted amount not recorded",
        debt ? "Debt or add-on figure recorded: GBP " + debt.toFixed(2) : "No debt add-on recorded",
        paid ? "Already paid: GBP " + paid.toFixed(2) : "No payment already recorded"
      ]
    };
  }

  function analyse(data) {
    const current = data || {};
    const stageInfo = stage(current);
    const deadline = deadlines.deadlineSummary(current);
    const ev = evidence.evidencePosition(current);
    const foundGrounds = grounds.inferGrounds(current);
    const readiness = completeness(current);
    const jurisdiction = current.jurisdiction || "Unsure";
    return {
      builder: config.productName,
      issuerRoute: classifyIssuer(current),
      stage: stageInfo,
      deadline,
      evidencePosition: ev,
      grounds: foundGrounds,
      completeness: readiness,
      jurisdiction,
      jurisdictionCaution: jurisdiction === "Unsure"
        ? "The rules can differ by jurisdiction. Check where the parking event happened before relying on a route."
        : "Jurisdiction recorded as " + jurisdiction + ". Check the notice route before submitting.",
      financial: financialPosition(current)
    };
  }

  return { analyse, classifyIssuer, stage, completeness, financialPosition };
});
