(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(
    require("./cruise.config"),
    require("./cruise.itinerary"),
    require("./cruise.cabin"),
    require("./cruise.excursions"),
    require("./cruise.financial"),
    require("./cruise.evidence"),
    require("./cruise.resources")
  );
  else root.QCBFCruiseAnalysis = factory(root.QCBFCruiseConfig, root.QCBFCruiseItinerary, root.QCBFCruiseCabin, root.QCBFCruiseExcursions, root.QCBFCruiseFinancial, root.QCBFCruiseEvidence, root.QCBFCruiseResources);
})(typeof self !== "undefined" ? self : this, function (config, itinerary, cabin, excursions, financial, evidence, resources) {
  function array(value) {
    return Array.isArray(value) ? value : value ? [value] : [];
  }

  function issueType(data) {
    const text = array(data.whatHappened).join(" ");
    if (/court|urgent|legal/i.test(text)) return "Urgent legal boundary";
    if (/cancel/i.test(text)) return "Cancellation or major change review";
    if (/delay/i.test(text)) return "Cruise delay review";
    if (/boarding|embark/i.test(text)) return "Embarkation or refused boarding review";
    if (/itinerary|port/i.test(text)) return "Itinerary, port or route change review";
    if (/cabin|downgrade/i.test(text)) return "Cabin downgrade or cabin condition review";
    if (/illness|injury|medical/i.test(text)) return "Medical, illness or incident evidence boundary";
    if (/excursion/i.test(text)) return "Shore excursion review";
    if (/baggage|property/i.test(text)) return "Baggage or property review";
    if (/refund|credit/i.test(text)) return "Refund or future cruise credit review";
    return "Cruise complaint pack review";
  }

  function urgent(data) {
    return /court|letter before claim|limitation|injury|death|crime|police|assault|urgent/i.test(array(data.whatHappened).concat(data.urgentNotes || "").join(" "));
  }

  function completeness(data) {
    const missing = config.essentialFields.filter((field) => {
      const value = data[field];
      return Array.isArray(value) ? value.length === 0 : !value;
    });
    return { status: missing.length ? "Needs key information" : "Ready to review", missing };
  }

  function bookingStructure(data) {
    const bookingType = String(data.bookingType || "Unsure");
    const organiser = data.organiserName || data.travelAgentName || "";
    const paymentRoute = String(data.paymentRoute || "");
    const likelyPackage = /package|fly-cruise|agent|organiser/i.test(bookingType);
    const direct = /direct|cruise-only/i.test(bookingType);
    return {
      bookingType,
      likelyPackage,
      direct,
      organiserRecorded: Boolean(organiser),
      paymentRoute,
      note: likelyPackage
        ? "The booking appears to involve a package, organiser or travel agent route. Check the confirmation and invoice before submitting."
        : direct
          ? "The booking appears to be direct or cruise-only, so the cruise line route may be the clearest starting point."
          : "The responsible organisation has not yet been confirmed. Check the booking confirmation, invoice and applicable terms before submitting."
    };
  }

  function maritimeBoundary(data) {
    const issueText = array(data.whatHappened).join(" ");
    const hasDelay = /delay|cancel|boarding|embark/i.test(issueText);
    return {
      mayBeRelevant: hasDelay,
      note: hasDelay
        ? "Maritime passenger rights may be relevant to some delay, cancellation or boarding issues, but the service, port, operator and facts must be checked."
        : "Maritime passenger rights are not assumed from the current answers. The complaint can still be organised around the booking, evidence and response received."
    };
  }

  function analyse(data) {
    const out = {
      packReference: data.packReference,
      issueType: issueType(data),
      urgent: urgent(data),
      bookingStructure: bookingStructure(data),
      maritimeBoundary: maritimeBoundary(data),
      itinerary: itinerary.compare(data),
      cabin: cabin.review(data),
      excursion: excursions.review(data),
      financial: financial.schedule(data),
      evidenceChecklist: evidence.checklist(data),
      evidencePosition: evidence.position(data),
      completeness: completeness(data)
    };
    out.routeAnalysis = resources.route(data, out);
    out.caution = out.urgent
      ? "This pack can organise facts and evidence, but urgent legal, court, serious injury, medical or crime-related issues may require specialist support and strict deadline checks."
      : "This is a self-service complaint pack. It does not guarantee a refund, compensation, reimbursement or outcome.";
    return out;
  }

  return { analyse, issueType, urgent, completeness };
});
