(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.QCBFCruiseItinerary = factory();
})(typeof self !== "undefined" ? self : this, function () {
  function splitLines(value) {
    return String(value || "").split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  }

  function compare(data) {
    const planned = splitLines(data.plannedItinerary);
    const actual = splitLines(data.actualItinerary);
    const plannedText = planned.join(" | ").toLowerCase();
    const missed = planned.filter((port) => !actual.join(" | ").toLowerCase().includes(port.toLowerCase()));
    const added = actual.filter((port) => !plannedText.includes(port.toLowerCase()));
    const plannedCount = planned.length;
    const visitedCount = actual.filter((port) => plannedText.includes(port.toLowerCase())).length;
    const deliveryPercent = plannedCount ? Math.round((visitedCount / plannedCount) * 100) : null;
    return {
      planned,
      actual,
      missed,
      added,
      counts: {
        plannedPortCalls: plannedCount,
        recordedPortCallsDelivered: visitedCount,
        missedOrSubstitutedPortCalls: missed.length,
        additionalOrSubstitutedPortCalls: added.length
      },
      deliveryIndicator: {
        label: "Recorded Cruise Delivery Indicator",
        value: deliveryPercent === null ? "Not enough itinerary information recorded" : `${deliveryPercent}% of planned port calls appear recorded as delivered`,
        caution: "This is only a factual itinerary comparison. It is not a compensation calculation or legal conclusion."
      },
      hasChange: Boolean(missed.length || added.length || data.itineraryChangeNotes),
      caution: "A missed, substituted or shortened port call does not automatically create a fixed entitlement. The complaint route depends on the booking terms, reason for the change, notice given, evidence and any response received."
    };
  }

  return { compare, splitLines };
});
