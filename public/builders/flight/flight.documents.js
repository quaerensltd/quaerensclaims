"use strict";

(function(root, factory) {
  const docs = factory(root.QCBFFlight && root.QCBFFlight.analysis, root.QCBFFlight && root.QCBFFlight.compensation, root.QCBFFlight && root.QCBFFlight.evidence, root.QCBFFlight && root.QCBFFlight.expenses, root.QCBFFlight && root.QCBFFlight.timeline, root.QCBFFlight && root.QCBFFlight.submission, root.QCBFFlight && root.QCBFFlight.resources);
  if (typeof module === "object" && module.exports) module.exports = factory(require("./flight.analysis"), require("./flight.compensation"), require("./flight.evidence"), require("./flight.expenses"), require("./flight.timeline"), require("./flight.submission"), require("./flight.resources"));
  root.QCBFFlight = root.QCBFFlight || {};
  root.QCBFFlight.documents = docs;
})(typeof globalThis !== "undefined" ? globalThis : this, function(analysis, compensation, evidence, expenses, timeline, submission, resources) {
  function buildSubject(a) {
    if (a.flightNumber) return "Flight disruption complaint and information request - Flight " + a.flightNumber + (a.flightDate ? ", " + a.flightDate : "");
    if (a.bookingReference) return "Flight disruption complaint - Booking " + a.bookingReference;
    return "Flight disruption complaint and information request";
  }

  function buildBackground(a) {
    let text = "I am writing about the journey from " + analysis.routeLine(a) + " on " + analysis.fallback(a.flightDate, "[date not known]") + ".";
    if (a.flightNumber) text += " The flight number was " + a.flightNumber + ".";
    if (a.bookingReference) text += " The booking reference was " + a.bookingReference + ".";
    if (a.delayMinutes !== null) text += " The reported final-destination arrival delay is " + a.delayText + ".";
    if (a.airlineReason && a.airlineReason !== "No explanation") text += " The explanation given was: " + a.airlineReason + (a.exactExplanation ? " - " + a.exactExplanation : "") + ".";
    else text += " I have not received a precise explanation of the disruption.";
    return text;
  }

  function buildConcerns(a) {
    const lines = [];
    if (analysis.has(a, "late")) lines.push("The flight arrived at my final destination approximately " + a.delayText + " later than scheduled.");
    if (analysis.has(a, "cancelled")) lines.push("The flight was cancelled" + (a.cancelNotice ? ", and I was informed " + a.cancelNotice : "") + ".");
    if (analysis.has(a, "missedConnection")) lines.push(a.oneBooking === "No, separately booked" ? "I missed a separately booked onward connection and ask that the booking structure is recorded accurately." : "The disruption to the first flight caused me to miss the onward connection included within the same booking.");
    if (analysis.has(a, "denied")) lines.push(a.volunteered === "Yes" ? "I volunteered to give up my seat, so I am asking for a clear record of the agreed rerouting, assistance and any agreed payment or reimbursement." : "I was denied boarding and ask the airline to explain the reason, check-in records, booking status and any rerouting, assistance or compensation position.");
    if (analysis.has(a, "expenses") || a.expenses.length) lines.push("I incurred reasonable additional expenses as a direct result of the disruption and have retained the available receipts where possible.");
    if (analysis.has(a, "refund")) lines.push("A refund request has been refused, delayed or not clearly explained.");
    if (analysis.has(a, "noExplanation")) lines.push("I have not received a sufficiently clear explanation of the cause of the disruption.");
    if (analysis.has(a, "rejected")) lines.push("The airline previously rejected or did not fully address my complaint, and I request a clearer response to the points raised.");
    if (analysis.has(a, "other") && a.whatHappened) lines.push(a.whatHappened);
    if (!lines.length) lines.push("I am asking the airline to review the disruption and provide a clear written explanation based on the journey records.");
    return lines;
  }

  function buildOutcome(a) {
    const parts = ["investigate the matters raised", "provide a reasoned written explanation"];
    if (analysis.has(a, "late") || analysis.has(a, "cancelled") || analysis.has(a, "denied") || analysis.has(a, "missedConnection")) parts.push("consider any compensation that may be due under the passenger-rights rules applicable to the journey");
    if (analysis.has(a, "expenses") || a.expenses.length || analysis.has(a, "care")) parts.push("review reimbursement of reasonable documented expenses");
    if (analysis.has(a, "refund")) parts.push("process or explain any outstanding ticket refund");
    parts.push("provide copies of relevant journey and complaint records where appropriate", "confirm the complaint reference", "preserve relevant records");
    return "Please " + parts.join(", ") + ".";
  }

  function buildJourneyAnalysis(data, records) {
    const a = analysis.normaliseAnswers(data);
    const c = compensation.analyse(a, records);
    return "FLIGHT DISRUPTION JOURNEY ANALYSIS\n\n" + analysis.passengerBlock(a) + "\n\nAirline: " + analysis.fallback(a.airline) + "\nOperating airline: " + analysis.fallback(a.operatingAirline || a.airline) + "\nFlight number: " + analysis.fallback(a.flightNumber) + "\nBooking reference: " + analysis.fallback(a.bookingReference) + "\nTravel date: " + analysis.fallback(a.flightDate) + "\nDeparture airport: " + analysis.fallback(a.departureAirport) + "\nArrival airport: " + analysis.fallback(a.finalDestination) + "\nCountry of departure: " + analysis.fallback(a.countryDeparture) + "\nCountry of arrival: " + analysis.fallback(a.countryDestination) + "\nApplicable regulation: " + c.regulation + "\nGreat-circle distance: " + (c.distanceKm ? c.distanceKm + " km" : "Further review required") + "\nScheduled departure: " + analysis.formatDate(a.scheduledDeparture) + "\nActual departure: " + analysis.formatDate(a.actualDeparture) + "\nScheduled arrival: " + analysis.formatDate(a.scheduledArrival) + "\nActual arrival: " + analysis.formatDate(a.actualArrival) + "\nArrival delay: " + a.delayText + "\nDelay source: " + analysis.fallback(a.delaySource) + "\nFlight status: " + (a.issues.length ? a.issues.map(analysis.issueLabel).join(", ") : "Not selected") + "\nExtraordinary circumstances stated by airline: " + analysis.fallback(a.extraordinaryCircumstances, "Unsure");
  }

  function buildCompensationAnalysis(data, records) {
    const a = analysis.normaliseAnswers(data);
    const c = compensation.analyse(a, records);
    const ev = evidence.evidencePosition(a);
    return "ESTIMATED UK261 / EC261 COMPENSATION ANALYSIS\n\nApplicable regulation: " + c.regulation + "\nFlight distance: " + (c.distanceKm ? c.distanceKm + " km" : "Further review required") + "\nArrival delay: " + c.delayText + "\nCompensation per passenger: " + (c.perPassenger ? compensation.money(c.perPassenger, c.currency) : "No monetary estimate shown") + "\nPassengers: " + c.passengers + "\nEstimated statutory compensation: " + (c.statutoryTotal ? compensation.money(c.statutoryTotal, c.currency) : "No monetary estimate shown") + "\nEstimated total requested: " + compensation.totalRequestedText(a, records) + "\nEvidence position: " + ev.level + " (" + ev.reasons + ")\n\nImportant note:\nThis estimate is based on the information you have entered. The airline may dispute liability, for example by relying on extraordinary circumstances or other legal defences.\n\n" + c.note;
  }

  function buildLetter(data, records) {
    const a = analysis.normaliseAnswers(data);
    const c = compensation.analyse(a, records);
    return analysis.today() + "\n\n" + analysis.fallback(a.passengerName, "[Passenger name]") + "\n" + analysis.fallback(a.passengerAddress, "[Passenger address]") + "\n\nTo:\n" + analysis.fallback(a.airline, "[Airline]") + "\n\nSubject:\n" + buildSubject(a) + "\n\nDear Sir or Madam,\n\nJOURNEY DETAILS\n\n" + analysis.passengerBlock(a) + "\nBooking reference: " + analysis.fallback(a.bookingReference) + "\nFlight: " + analysis.fallback(a.flightNumber) + "\nDate: " + analysis.fallback(a.flightDate) + "\nRoute: " + analysis.routeLine(a) + "\nFinal destination: " + analysis.fallback(a.finalDestination) + "\nApplicable regulation: " + c.regulation + "\nGreat-circle distance: " + (c.distanceKm ? c.distanceKm + " km" : "Further review required") + "\nScheduled arrival: " + analysis.formatDate(a.scheduledArrival) + "\nActual arrival: " + analysis.formatDate(a.actualArrival) + "\nReported arrival delay: " + a.delayText + "\nDelay source: " + analysis.fallback(a.delaySource) + "\n\nBACKGROUND\n\n" + buildBackground(a) + "\n\nESTIMATED COMPENSATION AND EXPENSES\n\n" + buildCompensationAnalysis(a, records) + "\n\nMY CONCERNS\n\n" + buildConcerns(a).map((item, index) => (index + 1) + ". " + item).join("\n") + "\n\nOUTCOME REQUESTED\n\n" + buildOutcome(a) + "\n\nPlease consider this complaint under the passenger-rights rules applicable to the journey, including UK Regulation 261 or EU Regulation 261 where relevant. This request is made without assuming that any particular regulation or outcome definitely applies.\n\nYours faithfully,\n\n" + analysis.fallback(a.passengerName, "[Passenger name]");
  }

  function buildSummary(data, records, packReference) {
    const a = analysis.normaliseAnswers(data);
    const c = compensation.analyse(a, records);
    const mainIssues = a.issues.length ? a.issues.map(item => "[x] " + analysis.issueLabel(item)).join("\n") : "[x] Information request";
    return "QUAERENS CONSUMER COMPLAINT FILE\n\nFree Flight Compensation Pack\n\nComplaint Summary\n\nPack reference: " + analysis.fallback(packReference, "QF-[reference]") + "\nGenerated: " + analysis.today() + "\nSmart Submission stage: Quaerens Smart Submission™\n\nPASSENGER AND JOURNEY\n" + analysis.passengerBlock(a) + "\nAirline: " + analysis.fallback(a.airline) + "\nOperating airline: " + analysis.fallback(a.operatingAirline || a.airline) + "\nFlight number: " + analysis.fallback(a.flightNumber) + "\nBooking reference: " + analysis.fallback(a.bookingReference) + "\nTravel date: " + analysis.fallback(a.flightDate) + "\nJourney: " + analysis.routeLine(a) + "\nApplicable regulation: " + c.regulation + "\nGreat-circle distance: " + (c.distanceKm ? c.distanceKm + " km" : "Further review required") + "\nEstimated final-destination delay: " + a.delayText + "\nEstimated statutory compensation: " + (c.statutoryTotal ? compensation.money(c.statutoryTotal, c.currency) : "No monetary estimate shown") + "\nEstimated total requested: " + compensation.totalRequestedText(a, records) + "\nComplaint route: " + analysis.primaryRoute(a) + "\n\nMAIN ISSUES RAISED\n" + mainIssues + "\n\nIMPORTANT REVIEW NOTE\n\nThis pack is a self-service starting point. Check every answer, remove anything inaccurate and only send documents that reflect your own journey and circumstances. It does not determine legal entitlement, compensation, refund or reimbursement.";
  }

  function buildAll(data, options) {
    const records = options && options.records;
    const packReference = options && options.packReference;
    const docs = {
      summary: buildSummary(data, records, packReference),
      journey: buildJourneyAnalysis(data, records),
      compensation: buildCompensationAnalysis(data, records),
      letter: buildLetter(data, records),
      evidence: evidence.buildEvidenceChecklist(data),
      timeline: timeline.buildTimeline(data),
      submissionDetails: submission.buildSubmissionInstructions(data, records),
      resources: resources.buildResources()
    };
    const expenseDoc = expenses.buildExpenseSchedule(data);
    if (expenseDoc) docs.expenses = expenseDoc;
    docs.full = "QUAERENS CONSUMER COMPLAINT FILE\n\nIncludes your Journey Analysis, Compensation Analysis, Complaint Letter, Evidence Checklist, Timeline, Expense Schedule where relevant and Smart Submission guidance.\n\n---\n\n" + Object.keys(docs).filter(key => key !== "full").map(key => docs[key]).join("\n\n---\n\n");
    return docs;
  }

  return { buildSubject, buildJourneyAnalysis, buildCompensationAnalysis, buildLetter, buildSummary, buildAll };
});
