"use strict";

(function(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.QCBFParking = root.QCBFParking || {};
  root.QCBFParking.deadlines = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
  function parseDate(value) {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(value + "T12:00:00");
    const match = String(value).match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
    if (!match) return null;
    const year = match[3].length === 2 ? "20" + match[3] : match[3];
    return new Date(Number(year), Number(match[2]) - 1, Number(match[1]), 12);
  }

  function daysUntil(value, now) {
    const date = parseDate(value);
    if (!date) return null;
    const today = now ? new Date(now) : new Date();
    today.setHours(12, 0, 0, 0);
    return Math.round((date.getTime() - today.getTime()) / 86400000);
  }

  function describeDeadline(label, value, now) {
    const days = daysUntil(value, now);
    if (days === null) return { label, value: value || "", status: "Not recorded", tone: "neutral" };
    if (days < 0) return { label, value, status: Math.abs(days) + " day(s) overdue", tone: "urgent" };
    if (days <= 3) return { label, value, status: days + " day(s) remaining - check urgently", tone: "urgent" };
    if (days <= 14) return { label, value, status: days + " day(s) remaining", tone: "watch" };
    return { label, value, status: days + " day(s) remaining", tone: "ok" };
  }

  function deadlineSummary(data, now) {
    const items = [
      describeDeadline("Discount deadline", data.discountDeadline, now),
      describeDeadline("Appeal or representation deadline", data.appealDeadline, now),
      describeDeadline("Full payment deadline", data.fullPaymentDeadline, now)
    ];
    const urgent = items.some(item => item.tone === "urgent") || /Court claim|Order for Recovery|Bailiff|Letter Before Claim|Charge Certificate/i.test([data.currentStage, data.noticeType].join(" "));
    return {
      items,
      urgent,
      message: urgent
        ? "This file may involve a short deadline or enforcement stage. Check the notice itself and consider urgent specialist help where court, enforcement or statutory declaration steps are involved."
        : "Record the dates from the notice and submit through the official route before the relevant deadline."
    };
  }

  return { parseDate, daysUntil, describeDeadline, deadlineSummary };
});
