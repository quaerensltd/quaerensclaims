(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.QCBFCruiseSubmission = factory();
})(typeof self !== "undefined" ? self : this, function () {
  function smartSubmission(data, analysis) {
    const route = analysis.routeAnalysis || {};
    return {
      method: analysis.urgent ? "Check urgent boundary before submitting" : (route.smartSubmissionMethod || "Submit to the cruise line, organiser or travel agent identified in the pack"),
      status: analysis.completeness.status,
      detail: route.responsiblePartyNote || "Check the booking documents before submitting.",
      checklist: [
        "Review all passenger names and booking references.",
        "Attach booking confirmation, itinerary and complaint correspondence.",
        "Check refunds or future cruise credits have not been double-counted.",
        ...(route.cards || []),
        "Keep medical, incident or legal issues factual and do not guess.",
        "Send the pack yourself through the official complaint route."
      ]
    };
  }

  return { smartSubmission };
});
