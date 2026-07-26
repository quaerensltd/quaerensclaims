(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.QCBFCruiseCabin = factory();
})(typeof self !== "undefined" ? self : this, function () {
  function review(data) {
    const text = [data.cabinBooked, data.cabinReceived, data.cabinIssues, data.whatHappened].flat().join(" ");
    const downgrade = /downgrade|lower|inside|obstructed|different grade/i.test(text);
    const defect = /defect|noise|leak|smell|mould|air con|unsafe|dirty|broken/i.test(text);
    return {
      downgrade,
      defect,
      summary: downgrade
        ? "Cabin grade, cabin number, deck, obstruction, accessibility and pricing evidence should be compared carefully."
        : defect
          ? "Cabin condition evidence should be kept factual and supported by photos, reports, dates and crew responses."
          : "Cabin issues can be reviewed where the promised cabin and actual cabin experience are clearly recorded."
    };
  }

  return { review };
});

