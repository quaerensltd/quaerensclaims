(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.QCBFCruiseFinancial = factory();
})(typeof self !== "undefined" ? self : this, function () {
  function amount(value) {
    const parsed = Number(String(value || "").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function money(value, currency) {
    if (!value) return "Not recorded";
    return `${currency || "GBP"} ${amount(value).toFixed(2)}`;
  }

  function schedule(data) {
    const currency = data.currency || "GBP";
    const cashLines = [
      ["Cruise price paid", amount(data.cruisePricePaid), "cost"],
      ["Cash refund received", amount(data.refundReceived), "credit"],
      ["Replacement travel or accommodation", amount(data.replacementCosts), "cost"],
      ["Excursion costs", amount(data.excursionCosts), "cost"],
      ["Baggage or property costs", amount(data.propertyCosts), "cost"],
      ["Medical or accessibility costs", amount(data.medicalCosts), "cost"],
      ["Other documented costs", amount(data.otherCosts), "cost"]
    ];
    const lines = cashLines
      .filter(([, value]) => value !== 0)
      .map(([label, value, sign]) => ({ label, value: sign === "credit" ? -value : value, display: money(value, currency), sign }));
    const estimated = lines.reduce((sum, item) => sum + item.value, 0);
    const futureCruiseCredit = amount(data.futureCruiseCreditValue);
    const warnings = [
      "Estimated only. Do not double-count refunds, future cruise credits or mixed currencies.",
      "A future cruise credit or voucher is recorded separately because it may not be the same as cash already recovered.",
      "Not every cost will be recoverable. The available route, terms, evidence and response received all matter."
    ];
    if (data.secondaryCurrency) warnings.push("Mixed currencies should be converted and explained separately before relying on a total.");
    return {
      currency,
      lines,
      futureCruiseCredit: futureCruiseCredit ? { value: futureCruiseCredit, display: money(futureCruiseCredit, currency), sign: "separate credit or voucher" } : null,
      estimatedPosition: Math.max(0, estimated),
      displayTotal: money(Math.max(0, estimated), currency),
      warnings,
      caution: warnings.join(" ")
    };
  }

  return { amount, money, schedule };
});
