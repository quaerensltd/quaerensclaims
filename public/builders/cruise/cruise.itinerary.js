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
    return {
      planned,
      actual,
      missed,
      added,
      hasChange: Boolean(missed.length || added.length || data.itineraryChangeNotes),
      caution: "A missed, substituted or shortened port call does not automatically create a fixed entitlement. The complaint route depends on the booking terms, reason for the change, notice given, evidence and any response received."
    };
  }

  return { compare, splitLines };
});

