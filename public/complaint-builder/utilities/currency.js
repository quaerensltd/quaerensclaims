"use strict";

function numberValue(value) {
  const n = Number(String(value == null ? "" : value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function formatCurrency(amount, currency) {
  const code = currency || "GBP";
  const value = numberValue(amount);
  const symbol = code === "EUR" ? "EUR " : code === "GBP" ? "GBP " : code + " ";
  return symbol + value.toLocaleString("en-GB", { minimumFractionDigits: value % 1 ? 2 : 0, maximumFractionDigits: 2 });
}

function totalsByCurrency(items) {
  return (items || []).reduce((totals, item) => {
    if (item && item.included === false) return totals;
    const code = item && item.currency ? item.currency : "GBP";
    totals[code] = (totals[code] || 0) + numberValue(item && item.amount);
    return totals;
  }, {});
}

module.exports = { numberValue, formatCurrency, totalsByCurrency };
