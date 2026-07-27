(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./cruise.questions"));
  else root.QCBFCruiseEvidence = factory(root.QCBFCruiseQuestions);
})(typeof self !== "undefined" ? self : this, function (questions) {
  function array(value) {
    return Array.isArray(value) ? value : value ? [value] : [];
  }

  function checklist(data) {
    const issues = array(data.whatHappened).join(" ");
    const bookingType = String(data.bookingType || "");
    const items = [
      "Booking confirmation, invoice and passenger names",
      "Cruise line, travel agent or organiser terms supplied at booking",
      "Cruise itinerary, tickets and any later change notices",
      "Complaint correspondence and final response, if received",
      "Receipts, invoices and bank or card evidence for documented costs"
    ];
    if (/package|agent|fly-cruise/i.test(bookingType)) items.push("Package, ATOL, organiser or travel-agent paperwork showing who sold the trip");
    if (/cancel|delay|boarding|embark/i.test(issues)) items.push("Cancellation, delay, boarding or embarkation notices and timing evidence");
    if (/port|itinerary/i.test(issues)) items.push("Original itinerary compared with actual port calls, substituted ports and onboard notices");
    if (/cabin|downgrade|facility|onboard/i.test(issues)) items.push("Cabin grade confirmation, deck plan, photos, videos and onboard defect reports");
    if (/medical|illness|injury/i.test(issues)) items.push("Medical, incident or accessibility paperwork, if relevant and safe to share");
    if (/excursion/i.test(issues)) items.push("Excursion confirmation showing whether it was booked with the cruise line, organiser, agent or independently");
    if (/refund|credit/i.test(issues)) items.push("Refund, voucher or future cruise credit correspondence and terms");
    if (/baggage|property/i.test(issues)) items.push("Property irregularity report, photos, receipts and replacement-cost evidence");
    if (/card|finance/i.test(String(data.paymentRoute || ""))) items.push("Card, finance or Section 75 correspondence and payment statements");
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
