"use strict";

(function(root, factory) {
  const documents = factory(root.QCBFBaggage && root.QCBFBaggage.analysis, root.QCBFBaggage && root.QCBFBaggage.evidence, root.QCBFBaggage && root.QCBFBaggage.submission, root.QCBFBaggage && root.QCBFBaggage.resources);
  if (typeof module === "object" && module.exports) module.exports = factory(require("./baggage.analysis"), require("./baggage.evidence"), require("./baggage.submission"), require("./baggage.resources"));
  root.QCBFBaggage = root.QCBFBaggage || {};
  root.QCBFBaggage.documents = documents;
})(typeof globalThis !== "undefined" ? globalThis : this, function(analysis, evidence, submission, resources) {
  const issueLabels = {
    delayed: "Baggage delayed",
    lost: "Baggage lost",
    damaged: "Baggage damaged",
    missingContents: "Contents missing or stolen",
    mobility: "Mobility equipment damaged, delayed or lost",
    multiple: "More than one baggage issue"
  };

  function today() {
    return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  }

  function issueText(data) {
    const issues = analysis.issueList(data);
    return issues.length ? issues.map(item => issueLabels[item] || item).join(", ") : "Not yet selected";
  }

  function routeLine(data) {
    return analysis.text(data.departureAirport) + " to " + analysis.text(data.arrivalAirport || data.finalDestination);
  }

  function buildCover(data, packReference) {
    return "QUAERENS CONSUMER COMPLAINT FILE\n\nLost, Delayed & Damaged Baggage Complaint Pack\n\nPack reference: " + analysis.text(packReference, "QB-[reference]") + "\nGenerated: " + today() + "\nPassenger: " + analysis.text(data.leadPassenger) + "\nAirline: " + analysis.text(data.airline || data.operatingAirline) + "\nFlight: " + analysis.text(data.flightNumber) + "\nTravel date: " + analysis.text(data.travelDate) + "\nIssue: " + issueText(data) + "\n\nIncludes your baggage summary, issue analysis, deadline guidance, financial schedules, evidence checklist, complaint letter, Smart Submission guidance and official resources.\n\nImportant: This is a self-service complaint pack. It does not guarantee compensation, reimbursement or any particular airline response.";
  }

  function buildSummary(data) {
    const deadline = analysis.deadlineStatus(data);
    const complete = analysis.completeness(data);
    return "BAGGAGE COMPLAINT SUMMARY\n\nPassenger count: " + analysis.passengerCount(data) + "\nLead passenger: " + analysis.text(data.leadPassenger) + "\nAdditional passengers: " + analysis.text(data.additionalPassengers, "None recorded") + "\nAirline: " + analysis.text(data.airline || data.operatingAirline) + "\nFlight number: " + analysis.text(data.flightNumber) + "\nBooking reference: " + analysis.text(data.bookingReference) + "\nRoute: " + routeLine(data) + "\nTravel date: " + analysis.text(data.travelDate) + "\nBags checked: " + analysis.text(data.checkedBags) + "\nBags affected: " + analysis.text(data.bagsAffected) + "\nBaggage issue: " + issueText(data) + "\nPIR/reference: " + analysis.text(data.pirReference || data.trackingReference || data.worldTracer) + "\nReadiness: " + complete.status + " (" + complete.percent + "%)\nDeadline status: " + deadline.label + "\n" + deadline.detail;
  }

  function buildBaggageDetails(data) {
    return "BAGGAGE DETAILS\n\nBaggage tag: " + analysis.text(data.baggageTag) + "\nBag description: " + analysis.text(data.bagDescription) + "\nBrand: " + analysis.text(data.bagBrand) + "\nColour: " + analysis.text(data.bagColour) + "\nSize: " + analysis.text(data.bagSize) + "\nDistinctive features: " + analysis.text(data.distinctiveFeatures) + "\nPassenger for affected bag: " + analysis.text(data.bagPassenger) + "\nChecked through to final destination: " + analysis.text(data.checkedThrough) + "\nConnection journey: " + analysis.text(data.connectionJourney) + "\nDifferent airlines involved: " + analysis.text(data.differentAirlines) + "\nContents summary: " + analysis.text(data.contentsInventory);
  }

  function buildProblemAnalysis(data) {
    const lines = [];
    if (analysis.issueList(data).includes("delayed")) lines.push("Delayed baggage: record when the bag was expected, when it was returned, any tracking updates, and essential purchases made while away from home.");
    if (analysis.issueList(data).includes("lost")) lines.push("Lost baggage: record how long the bag has been outstanding, whether the airline has declared it lost, and the evidence of contents and value.");
    if (analysis.issueList(data).includes("damaged")) lines.push("Damaged baggage: record photographs, inspection notes, repair quotes and whether the bag remains usable.");
    if (analysis.issueList(data).includes("missingContents")) lines.push("Missing contents: record when the missing items were discovered, whether tampering was visible, and any police or airline report.");
    if (analysis.issueList(data).includes("mobility")) lines.push("Mobility equipment: record the practical impact, replacement support requested, medical or accessibility consequences and urgent expenses.");
    if (!lines.length) lines.push("No baggage issue type has been selected yet.");
    return "WHAT HAPPENED\n\n" + lines.join("\n") + "\n\nYour description:\n" + analysis.text(data.problemDetails) + "\n\nAirline response or reason given:\n" + analysis.text(data.airlineResponse || data.rejectionReason);
  }

  function buildTimeline(data) {
    const rows = analysis.timelineRows(data);
    const base = [
      ["Travel date", data.travelDate, "Flight took place"],
      ["Baggage issue noticed", data.reportedDate || data.travelDate, data.problemDetails],
      ["Airport report/PIR", data.reportedDate, data.pirReference],
      ["Airline complaint", data.complaintDate || data.airlineContactDate, data.complaintReference],
      ["Baggage returned", data.deliveredDateTime, data.deliveryLocation],
      ["Airline response", "", data.airlineResponse || data.offerMade]
    ].filter(row => analysis.has(row[1]) || analysis.has(row[2]));
    const all = base.concat(rows.map(row => [row.date, row.event, row.response]));
    return "TIMELINE\n\n" + (all.length ? all.map((row, index) => (index + 1) + ". " + analysis.text(row[0], "Date not recorded") + " - " + analysis.text(row[1], "Event") + " - " + analysis.text(row[2], "Details not recorded")).join("\n") : "No timeline entries recorded yet.");
  }

  function buildFinancialSchedule(data) {
    const rows = analysis.itemRows(data);
    const totals = analysis.financialPosition(data);
    const insurance = "Travel insurance held: " + analysis.text(data.insuranceHeld) + "\nInsurance claim made: " + analysis.text(data.insuranceClaimMade) + "\nInsurance paid: " + analysis.text(data.insurancePaid) + "\nInsurance excess: " + analysis.text(data.insuranceExcess);
    const itemText = rows.length ? rows.map((item, index) => {
      return (index + 1) + ". " + analysis.text(item.description, "Item or expense") + " | Original price: " + analysis.money(item.originalPrice, item.currency || data.currency) + " | Current value: " + analysis.money(item.currentValue, item.currency || data.currency) + " | Replacement/repair: " + analysis.money(item.replacementAmount || item.repairAmount, item.currency || data.currency) + " | Requested: " + analysis.money(item.amountRequested, item.currency || data.currency) + " | Proof: " + analysis.text(item.proofStatus || item.receiptStatus) + " | Reimbursed elsewhere: " + analysis.money(item.reimbursedElsewhere, item.currency || data.currency);
    }).join("\n") : "No item or expense rows have been recorded yet.";
    return "ITEM AND FINANCIAL LOSS SCHEDULE\n\n" + itemText + "\n\nFinancial position:\n" + totals + "\n\nInsurance and double-counting check:\n" + insurance + "\n\nImportant: The builder does not automatically choose the highest figure or combine different currencies. Review each line before sending.";
  }

  function buildMontrealCard(data) {
    return "MONTREAL CONVENTION CONTEXT\n\nThe Montreal Convention may apply to international carriage by air. The carrier liability limit for baggage is generally expressed in Special Drawing Rights (SDR), not a fixed GBP or EUR payment. From 28 December 2024 the baggage liability limit is 1,519 SDR per passenger, subject to the applicable legal framework and evidence.\n\nThis is not a guaranteed amount and is not a tariff. It can depend on proven loss, evidence, exclusions, insurance, contributory factors, airline investigation and the facts of the journey. The limit is generally per passenger, not per bag.";
  }

  function buildRequestedOutcome(data) {
    const outcomes = Array.isArray(data.requestedOutcomes) && data.requestedOutcomes.length ? data.requestedOutcomes.join(", ") : "Not selected";
    return "REQUESTED OUTCOME\n\nRequested outcomes: " + outcomes + "\nAmount requested by passenger: " + analysis.money(data.amountRequested, data.currency) + "\nPayments already received: " + analysis.text(data.paymentsReceived) + "\nOutstanding amount: " + analysis.text(data.outstandingAmount) + "\nReasoning entered:\n" + analysis.text(data.outcomeBasis) + "\n\nEvery requested outcome should be checked against the documents and evidence before the complaint is sent.";
  }

  function buildLetter(data) {
    const smart = submission.smartSubmission(data);
    return today() + "\n\n" + analysis.text(data.leadPassenger, "[Passenger name]") + "\n" + analysis.text(data.address, "[Passenger address]") + "\n\nTo:\n" + analysis.text(data.airline || data.operatingAirline, "[Airline]") + "\n\nSubject: Baggage complaint - " + analysis.text(data.flightNumber, "[flight number]") + " - " + issueText(data) + "\n\nDear Sir or Madam,\n\nI am writing about a baggage problem connected with my journey on " + analysis.text(data.travelDate, "[date]") + " from " + routeLine(data) + ". The booking reference was " + analysis.text(data.bookingReference, "[not recorded]") + " and the baggage/PIR reference was " + analysis.text(data.pirReference || data.baggageTag || data.worldTracer, "[not recorded]") + ".\n\nIssue raised:\n" + issueText(data) + "\n\nSummary of what happened:\n" + analysis.text(data.problemDetails, "Please see the attached baggage summary and evidence schedule.") + "\n\nFinancial position:\n" + analysis.financialPosition(data) + "\n\nInsurance and double recovery:\nI have recorded any travel insurance claim or reimbursement known to me in the attached schedule. I am not seeking double recovery for amounts already paid by another source.\n\nRequested outcome:\n" + buildRequestedOutcome(data) + "\n\nPlease investigate the baggage records, provide a reasoned written response, confirm the applicable baggage liability position, and explain what documents you need if any part of the claim is disputed.\n\nDeadline and submission note:\n" + smart.deadline.detail + "\n\nThis complaint is based on the evidence currently available. It does not assume that a particular payment or outcome is guaranteed.\n\nYours faithfully,\n\n" + analysis.text(data.leadPassenger, "[Passenger name]");
  }

  function buildFull(data, options) {
    const packReference = options && options.packReference;
    const parts = [
      buildCover(data, packReference),
      buildSummary(data),
      buildBaggageDetails(data),
      analysis.completeness(data).missing.length ? "COMPLETENESS CHECK\n\nMissing or incomplete areas:\n" + analysis.completeness(data).missing.map(item => "- " + item).join("\n") : "COMPLETENESS CHECK\n\nNo key completion gaps flagged by the builder.",
      "EVIDENCE POSITION\n\n" + analysis.evidencePosition(data).label + "\nActions:\n" + analysis.evidencePosition(data).actions.map(item => "- " + item).join("\n"),
      buildTimeline(data),
      buildProblemAnalysis(data),
      buildLetter(data),
      buildFinancialSchedule(data),
      buildMontrealCard(data),
      evidence.buildEvidenceChecklist(data),
      evidence.buildMissingEvidence(data),
      buildRequestedOutcome(data),
      submission.buildSubmissionInstructions(data),
      "BEFORE SUBMITTING\n\n- Check every answer for accuracy.\n- Attach copies, not originals, unless the airline asks otherwise.\n- Keep a dated copy of the complaint and every attachment.\n- Check the airline's current official baggage complaint page before sending.\n- Do not remove insurance payments or reimbursements from the schedule if they have already been received.",
      "FOLLOW-UP TRACKER\n\nComplaint sent date: [add date]\nAirline reference: [add reference]\nExpected response date: [add date]\nFollow-up sent: [add date]\nFinal response received: [add date]",
      resources.buildResources(),
      "DISCLAIMER\n\nThis free self-service builder helps organise information and prepare a complaint pack. Quaerens does not submit this complaint automatically, does not guarantee compensation or reimbursement, and does not determine legal entitlement."
    ];
    return parts.join("\n\n---\n\n");
  }

  function buildAll(data, options) {
    const packReference = options && options.packReference;
    const docs = {
      cover: buildCover(data, packReference),
      summary: buildSummary(data),
      baggage: buildBaggageDetails(data),
      problem: buildProblemAnalysis(data),
      timeline: buildTimeline(data),
      financial: buildFinancialSchedule(data),
      montreal: buildMontrealCard(data),
      evidence: evidence.buildEvidenceChecklist(data),
      missingEvidence: evidence.buildMissingEvidence(data),
      outcome: buildRequestedOutcome(data),
      letter: buildLetter(data),
      submission: submission.buildSubmissionInstructions(data),
      resources: resources.buildResources()
    };
    docs.full = buildFull(data, options || {});
    return docs;
  }

  return { issueLabels, today, issueText, routeLine, buildCover, buildSummary, buildBaggageDetails, buildProblemAnalysis, buildTimeline, buildFinancialSchedule, buildMontrealCard, buildRequestedOutcome, buildLetter, buildFull, buildAll };
});
