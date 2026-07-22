"use strict";

(function(root, factory) {
  const analysis = factory();
  if (typeof module === "object" && module.exports) module.exports = analysis;
  root.QCBFFlight = root.QCBFFlight || {};
  root.QCBFFlight.analysis = analysis;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
  function clean(value) {
    return String(value == null ? "" : value).trim();
  }

  function fallback(value, label) {
    return clean(value) || (label || "[Not known]");
  }

  function today() {
    return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  }

  function formatDate(value) {
    if (!value) return "[Not known]";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "[Not known]" : date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
  }

  function minutesBetween(start, end) {
    if (!start || !end) return null;
    const first = new Date(start);
    const second = new Date(end);
    if (Number.isNaN(first.getTime()) || Number.isNaN(second.getTime())) return null;
    return Math.round((second.getTime() - first.getTime()) / 60000);
  }

  function delayText(minutes) {
    if (minutes === null || minutes === undefined || Number.isNaN(Number(minutes))) return "Not calculated";
    const value = Number(minutes);
    const sign = value < 0 ? "-" : "";
    const abs = Math.abs(value);
    return sign + Math.floor(abs / 60) + " hours and " + (abs % 60) + " minutes";
  }

  function passengerList(data) {
    const a = data || {};
    const primary = clean(a.passengerName);
    const extra = String(a.passengerNames || "").split(/\r?\n|,/).map(clean).filter(Boolean);
    const names = [primary].concat(extra).filter(Boolean);
    const declared = Math.max(1, parseInt(a.passengerCount || String(names.length || 1), 10) || 1);
    while (names.length < declared) names.push("Passenger " + (names.length + 1));
    return names.slice(0, declared);
  }

  function passengerBlock(data) {
    const names = passengerList(data);
    return "Passenger count: " + names.length + "\nPassengers covered:\n" + names.map((name, index) => (index + 1) + ". " + name).join("\n");
  }

  function issueLabel(code) {
    const labels = {
      late: "Flight arrived late",
      cancelled: "Flight was cancelled",
      denied: "Boarding was denied",
      missedConnection: "Missed connection",
      rerouted: "Flight was rerouted",
      differentAirport: "Different airport used",
      downgrade: "Passenger was downgraded",
      care: "Inadequate care or assistance",
      expenses: "Expenses not reimbursed",
      refund: "Refund refused or delayed",
      noExplanation: "No clear explanation",
      rejected: "Previous complaint rejected",
      other: "Other flight disruption"
    };
    return labels[code] || fallback(code, "Information request");
  }

  function normaliseAnswers(data) {
    const a = Object.assign({}, data || {});
    a.issues = Array.isArray(a.issues) ? a.issues : [];
    a.careProvided = Array.isArray(a.careProvided) ? a.careProvided : [];
    a.expenses = Array.isArray(a.expenses) ? a.expenses : [];
    const calculatedDelay = minutesBetween(a.scheduledArrival, a.actualArrival);
    const manualDelay = parseInt(a.manualDelayMinutes, 10);
    a.delayMinutes = calculatedDelay !== null ? calculatedDelay : (!Number.isNaN(manualDelay) ? manualDelay : null);
    a.delaySource = calculatedDelay !== null ? "Calculated from scheduled and actual arrival times" : (!Number.isNaN(manualDelay) ? "Manual arrival delay entered because actual times were unknown" : "Not calculated");
    a.delayText = delayText(a.delayMinutes);
    return a;
  }

  function routeLine(data) {
    return fallback(data && data.departureAirport) + " to " + fallback(data && data.finalDestination);
  }

  function has(data, code) {
    return Array.isArray(data && data.issues) && data.issues.includes(code);
  }

  function primaryRoute(data) {
    const a = normaliseAnswers(data);
    if (a.preferredRoute && a.preferredRoute !== "Auto-select from answers") return a.preferredRoute;
    if (has(a, "rejected")) return "Follow-Up to Rejected Airline Complaint";
    if (has(a, "denied")) return "Denied Boarding Complaint";
    if (has(a, "cancelled")) return "Flight Cancellation Complaint";
    if (has(a, "missedConnection")) return "Missed Connection Complaint";
    if (has(a, "expenses") || a.expenses.length) return "Expense Reimbursement Request";
    if (has(a, "refund")) return "Refund and Information Request";
    if (has(a, "late")) return "Flight Delay Complaint and Compensation Request";
    return "Airline Information Request";
  }

  return { clean, fallback, today, formatDate, minutesBetween, delayText, passengerList, passengerBlock, issueLabel, normaliseAnswers, routeLine, has, primaryRoute };
});
