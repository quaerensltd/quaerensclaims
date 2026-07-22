"use strict";

(function(root, factory) {
  const expenses = factory(root.QCBFFlight && root.QCBFFlight.analysis, root.QCBFFlight && root.QCBFFlight.compensation);
  if (typeof module === "object" && module.exports) module.exports = factory(require("./flight.analysis"), require("./flight.compensation"));
  root.QCBFFlight = root.QCBFFlight || {};
  root.QCBFFlight.expenses = expenses;
})(typeof globalThis !== "undefined" ? globalThis : this, function(analysis, compensation) {
  function sortExpenses(items, sortBy) {
    const key = sortBy || "date";
    return (items || []).slice().sort((a, b) => String(a[key] || "").localeCompare(String(b[key] || "")));
  }

  function buildExpenseSchedule(data) {
    const a = analysis.normaliseAnswers(data);
    if (!a.expenses.length) return "";
    const totals = compensation.expenseTotals(a.expenses);
    const rows = a.expenses.map((item, index) => [
      analysis.fallback(item.date, "[date]"),
      analysis.fallback(item.location, "[airport]"),
      analysis.fallback([item.type, item.expense].filter(Boolean).join(" - "), "expense"),
      analysis.fallback(item.reason),
      analysis.fallback(item.amount),
      analysis.fallback(item.currency, "GBP"),
      analysis.fallback(item.receipt),
      analysis.fallback(item.evidence, "receipt / record " + (index + 1))
    ].join("\t"));
    const totalLines = Object.keys(totals).map(currency => currency + " " + totals[currency].toFixed(2));
    return "Expense Schedule\n\nDate\tAirport\tExpense\tReason\tAmount\tCurrency\tReceipt\tReference\n" + rows.join("\n") + "\n\nRecorded expense totals: " + (totalLines.length ? totalLines.join(", ") : "No monetary total entered");
  }

  return { sortExpenses, buildExpenseSchedule };
});
