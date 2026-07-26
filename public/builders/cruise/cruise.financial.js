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
    const lines = [
      ["Cruise price paid", amount(data.cruisePricePaid)],
      ["Refund received", -amount(data.refundReceived)],
      ["Future cruise credit value", -amount(data.futureCruiseCreditValue)],
      ["Replacement travel or accommodation", amount(data.replacementCosts)],
      ["Excursion costs", amount(data.excursionCosts)],
      ["Baggage or property costs", amount(data.propertyCosts)],
      ["Medical or accessibility costs", amount(data.medicalCosts)],
      ["Other documented costs", amount(data.otherCosts)]
    ];
    const positive = lines.filter(([, value]) => value !== 0);
    const estimated = positive.reduce((sum, [, value]) => sum + value, 0);
    return {
      currency,
      lines: positive.map(([label, value]) => ({ label, value, display: money(Math.abs(value), currency), sign: value < 0 ? "credit" : "cost" })),
      estimatedPosition: Math.max(0, estimated),
      displayTotal: money(Math.max(0, estimated), currency),
      caution: "Estimated only. Do not double-count refunds, future cruise credits or mixed currencies. Not every cost will be recoverable."
    };
  }

  return { amount, money, schedule };
});

