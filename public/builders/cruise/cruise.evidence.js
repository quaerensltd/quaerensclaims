(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./cruise.questions"));
  else root.QCBFCruiseEvidence = factory(root.QCBFCruiseQuestions);
})(typeof self !== "undefined" ? self : this, function (questions) {
  function array(value) {
    return Array.isArray(value) ? value : value ? [value] : [];
  }

  function checklist(data) {
    const issues = array(data.whatHappened).join(" ");
    const items = questions.evidence.slice(0, 7);
    if (/cabin|downgrade/i.test(issues)) items.push("Cabin grade comparison and cabin photos");
    if (/port|itinerary/i.test(issues)) items.push("Original and changed itinerary notices");
    if (/medical|illness|injury/i.test(issues)) items.push("Medical or incident paperwork, if relevant and safe to share");
    if (/refund|credit/i.test(issues)) items.push("Refund, voucher or future cruise credit correspondence");
    if (/baggage|property/i.test(issues)) items.push("Property report, photos and receipts");
    return Array.from(new Set(items));
  }

  function position(data) {
    const selected = array(data.evidenceHeld);
    if (!selected.length) return "Needs evidence list";
    if (selected.length < 4) return "Some evidence recorded";
    return "Evidence base looks stronger";
  }

  return { checklist, position };
});

