(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./cruise.config"), require("./cruise.analysis"), require("./cruise.submission"), require("./cruise.resources"));
  else root.QCBFCruiseDocuments = factory(root.QCBFCruiseConfig, root.QCBFCruiseAnalysis, root.QCBFCruiseSubmission, root.QCBFCruiseResources);
})(typeof self !== "undefined" ? self : this, function (config, analysisEngine, submissionEngine, resources) {
  function value(v, fallback) {
    if (Array.isArray(v)) return v.length ? v.join(", ") : fallback;
    return v || fallback;
  }

  function line(label, val, fallback) {
    return `${label}: ${value(val, fallback || "Not yet recorded")}`;
  }

  function cover(data, analysis) {
    return [
      "QUAERENS CONSUMER COMPLAINT FILE",
      config.productName,
      "",
      line("Pack reference", data.packReference),
      line("Generated", new Date().toLocaleDateString("en-GB")),
      line("Passenger count", data.passengerCount, "Passenger count not yet recorded"),
      line("Passengers", data.passengerNames, "Passenger names not yet recorded"),
      line("Cruise line", data.cruiseLine, "Cruise line not yet recorded"),
      line("Ship", data.shipName, "Ship not yet recorded"),
      line("Booking reference", data.bookingReference, "Booking reference not yet recorded"),
      line("Primary issue", analysis.issueType),
      line("Pack status", analysis.completeness.status)
    ].join("\n");
  }

  function journey(data, analysis) {
    return [
      "Planned Cruise and Actual Position",
      line("Booking type", data.bookingType),
      line("Travel agent or organiser", data.organiserName, "Not recorded"),
      line("Departure date", data.departureDate),
      line("Return date", data.returnDate),
      line("Departure port", data.departurePort),
      line("Final port", data.returnPort),
      "",
      "Planned itinerary",
      value(analysis.itinerary.planned.map((x) => `- ${x}`).join("\n"), "Not recorded"),
      "",
      "Actual itinerary",
      value(analysis.itinerary.actual.map((x) => `- ${x}`).join("\n"), "Not recorded"),
      "",
      `Itinerary note: ${analysis.itinerary.caution}`
    ].join("\n");
  }

  function financial(data, analysis) {
    return [
      "Refunds, Credits, Costs and Financial Impact",
      ...analysis.financial.lines.map((x) => `- ${x.label}: ${x.display} (${x.sign})`),
      `Estimated financial position: ${analysis.financial.displayTotal}`,
      analysis.financial.caution,
      "",
      line("Financial notes", data.financialNotes, "No additional financial notes recorded")
    ].join("\n");
  }

  function evidence(data, analysis) {
    return [
      "Evidence Checklist",
      ...analysis.evidenceChecklist.map((x) => `- ${x}`),
      "",
      line("Evidence held", data.evidenceHeld, "No evidence selected yet"),
      line("Evidence gaps", data.evidenceGaps, "No evidence gaps recorded"),
      `Evidence position: ${analysis.evidencePosition}`
    ].join("\n");
  }

  function letter(data, analysis) {
    return [
      "Draft Complaint Wording",
      "",
      `To ${value(data.cruiseLine || data.organiserName, "the cruise line, travel agent or organiser")},`,
      "",
      `I am writing about booking ${value(data.bookingReference, "[booking reference not recorded]")} for ${value(data.shipName, "the cruise")}.`,
      `The issue I want reviewed is: ${analysis.issueType}.`,
      `What happened: ${value(data.issueSummary, "The detailed circumstances still need to be added.")}`,
      "",
      `Requested outcome: ${value(data.requestedOutcomes, "Please review the evidence and provide a written response.")}`,
      "",
      "I have organised the booking, itinerary, correspondence, evidence and financial schedule so the matter can be reviewed clearly.",
      analysis.urgent ? "This letter is not intended to deal with court deadlines, personal injury valuation or urgent legal processes." : "",
      "",
      "Yours faithfully,",
      value(data.primaryPassengerName, "[passenger name]")
    ].filter(Boolean).join("\n");
  }

  function buildAll(data) {
    const analysis = analysisEngine.analyse(data);
    const submission = submissionEngine.smartSubmission(data, analysis);
    const sections = {
      cover: cover(data, analysis),
      summary: [
        "Cruise Complaint Summary",
        line("What happened", data.whatHappened, "Issue not yet selected"),
        line("Requested outcome", data.requestedOutcomes, "Requested outcome not yet recorded"),
        line("Issue summary", data.issueSummary, "No additional summary recorded"),
        `Analysis: ${analysis.issueType}`,
        `Route: ${analysis.routeAnalysis}`,
        analysis.caution
      ].join("\n"),
      journey: journey(data, analysis),
      cabin: ["Cabin and Onboard Review", analysis.cabin.summary, line("Cabin booked", data.cabinBooked), line("Cabin received", data.cabinReceived), line("Cabin notes", data.cabinIssues, "No cabin notes recorded")].join("\n"),
      excursions: ["Excursion Review", analysis.excursion.routeNote, analysis.excursion.caution, line("Excursion provider", data.excursionBookedBy, "Not recorded")].join("\n"),
      financial: financial(data, analysis),
      evidence: evidence(data, analysis),
      timeline: ["Voyage Timeline", line("Booking date", data.bookingDate), line("Problem date", data.problemDate), line("Complaint date", data.complaintDate), line("Response date", data.responseDate), line("Timeline notes", data.timelineNotes, "No timeline notes recorded")].join("\n"),
      letter: letter(data, analysis),
      submission: ["Quaerens Smart Submission", `Method: ${submission.method}`, `Status: ${submission.status}`, submission.detail, "", "Before You Submit", ...submission.checklist.map((x) => `- ${x}`)].join("\n"),
      resources: ["Official and Authoritative Resources", ...resources.officialSources.map((x) => `- ${x.label}: ${x.url}`)].join("\n"),
      disclaimer: "Self-Service Disclaimer\nThis pack organises information for a self-service complaint. Quaerens does not submit the complaint for you and does not guarantee a refund, compensation, reimbursement or outcome."
    };
    return {
      title: "Quaerens Consumer Complaint File",
      subtitle: config.productName,
      analysis,
      sections,
      text: Object.values(sections).join("\n\n---\n\n")
    };
  }

  return { buildAll };
});

