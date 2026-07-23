"use strict";

(function(root, factory) {
  const analysis = factory();
  if (typeof module === "object" && module.exports) module.exports = analysis;
  root.QCBFBaggage = root.QCBFBaggage || {};
  root.QCBFBaggage.analysis = analysis;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
  function has(value) {
    return value !== undefined && value !== null && String(value).trim() !== "";
  }

  function number(value) {
    const parsed = Number(String(value || "").replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function text(value, fallback) {
    return has(value) ? String(value).trim() : fallback || "Not yet recorded";
  }

  function issueList(data) {
    return Array.isArray(data.baggageIssues) ? data.baggageIssues.filter(Boolean) : [];
  }

  function passengerCount(data) {
    const parsed = Math.max(1, Math.round(number(data.passengerCount || 1)));
    return parsed || 1;
  }

  function itemRows(data) {
    return Array.isArray(data.financialItems) ? data.financialItems.filter(item => item && (has(item.description) || has(item.amountRequested) || has(item.currentValue) || has(item.replacementAmount))) : [];
  }

  function timelineRows(data) {
    return Array.isArray(data.timeline) ? data.timeline.filter(item => item && (has(item.event) || has(item.date) || has(item.response))) : [];
  }

  function money(value, currency) {
    if (!has(value)) return "Not yet recorded";
    const parsed = number(value);
    return (currency || "GBP") + " " + parsed.toLocaleString("en-GB", { minimumFractionDigits: parsed % 1 ? 2 : 0, maximumFractionDigits: 2 });
  }

  function itemTotals(data) {
    const byCurrency = {};
    itemRows(data).forEach(item => {
      const currency = item.currency || data.currency || "GBP";
      const requested = number(item.amountRequested || item.replacementAmount || item.currentValue);
      const reimbursed = number(item.reimbursedElsewhere);
      byCurrency[currency] = byCurrency[currency] || { requested: 0, reimbursed: 0, outstanding: 0 };
      byCurrency[currency].requested += requested;
      byCurrency[currency].reimbursed += reimbursed;
      byCurrency[currency].outstanding += Math.max(0, requested - reimbursed);
    });
    if (has(data.insurancePaid)) {
      const currency = data.currency || "GBP";
      byCurrency[currency] = byCurrency[currency] || { requested: 0, reimbursed: 0, outstanding: 0 };
      byCurrency[currency].reimbursed += number(data.insurancePaid);
      byCurrency[currency].outstanding = Math.max(0, byCurrency[currency].requested - byCurrency[currency].reimbursed);
    }
    return byCurrency;
  }

  function financialPosition(data) {
    const totals = itemTotals(data);
    const lines = Object.keys(totals).map(currency => {
      const t = totals[currency];
      return currency + " requested " + t.requested.toFixed(2) + ", reimbursed/insured " + t.reimbursed.toFixed(2) + ", outstanding recorded " + Math.max(0, t.outstanding).toFixed(2);
    });
    return lines.length ? lines.join("; ") : "No financial schedule recorded yet";
  }

  function deadlineStatus(data) {
    const issues = issueList(data).join(" ").toLowerCase();
    if (!has(data.complaintDate) && !has(data.deliveredDateTime) && !has(data.travelDate)) {
      return { label: "Deadline information incomplete", detail: "Add the travel date, return or delivery date, and any complaint date so the pack can flag time-sensitive points." };
    }
    if (issues.includes("damaged") || issues.includes("missing") || issues.includes("stolen")) {
      return { label: "Time-sensitive", detail: "Damaged baggage and missing-item complaints should be made promptly. Check the airline's current official procedure and keep the PIR where available." };
    }
    if (issues.includes("delayed")) {
      return { label: "Submit promptly", detail: "Delayed baggage expense complaints should normally be made in writing within 21 days after the baggage is returned. Deadline rules can depend on the facts, route and applicable law." };
    }
    return { label: "Deadline may be approaching", detail: "Submit the complaint promptly and check the airline's current official baggage procedure." };
  }

  function completeness(data) {
    const requirements = [
      ["Passenger identity", has(data.leadPassenger)],
      ["Flight details", has(data.flightNumber) && has(data.travelDate)],
      ["Airline", has(data.operatingAirline || data.airline)],
      ["Baggage problem type", issueList(data).length > 0],
      ["Baggage tag or explanation", has(data.baggageTag) || has(data.problemDetails)],
      ["Airport report or explanation", has(data.pirReference) || has(data.reportedAtAirport) || has(data.problemDetails)],
      ["Loss or damage description", has(data.problemDetails) || has(data.damageDescription) || has(data.contentsInventory)],
      ["Financial schedule where money is requested", itemRows(data).length > 0 || has(data.amountRequested) || !String(data.requestedOutcomes || "").includes("payment")],
      ["Supporting evidence", (data.evidence || []).length > 0],
      ["Requested outcome", (data.requestedOutcomes || []).length > 0]
    ];
    const done = requirements.filter(item => item[1]).length;
    const percent = Math.round((done / requirements.length) * 100);
    let status = "Not Started";
    if (percent > 15) status = "In Progress";
    if (percent >= 45) status = "Needs Key Information";
    if (percent >= 65 && !(data.evidence || []).length) status = "Needs Evidence";
    if (percent >= 75 && (data.evidence || []).length) status = "Ready for Review";
    if (percent >= 90) status = "Ready to Submit";
    return { percent, status, requirements, missing: requirements.filter(item => !item[1]).map(item => item[0]) };
  }

  function evidencePosition(data) {
    const count = (data.evidence || []).length;
    const missing = [];
    if (!has(data.baggageTag)) missing.push("baggage tag");
    if (!has(data.pirReference)) missing.push("PIR or airport report");
    if (!itemRows(data).some(item => item.receiptStatus === "Available")) missing.push("receipts or proof of value");
    if (!has(data.airlineResponse)) missing.push("airline response or complaint reference");
    let label = "Limited";
    if (count >= 3) label = "Developing";
    if (count >= 6 && missing.length <= 2) label = "Supported";
    if (count >= 8 && !missing.length) label = "Well Supported";
    return {
      label,
      available: data.evidence || [],
      missing,
      actions: missing.length ? missing.map(item => "Request or upload " + item) : ["Review the pack carefully before sending", "Attach the evidence listed in the schedule"]
    };
  }

  return { has, number, text, issueList, passengerCount, itemRows, timelineRows, money, itemTotals, financialPosition, deadlineStatus, completeness, evidencePosition };
});
