"use strict";

(function(root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(require("./holiday.analysis"), require("./holiday.evidence"), require("./holiday.submission"));
    return;
  }
  root.QCBFHoliday = root.QCBFHoliday || {};
  root.QCBFHoliday.documents = factory(root.QCBFHoliday.analysis, root.QCBFHoliday.evidence, root.QCBFHoliday.submission);
})(typeof globalThis !== "undefined" ? globalThis : this, function(analysis, evidence, submission) {
  function buildLetter(a) {
    const issues = a.complaintTypes.length ? a.complaintTypes.join(", ") : "holiday complaint issues";
    const outcomes = a.outcomes.length ? a.outcomes.join(", ") : "an appropriate response based on the evidence";
    return "INITIAL HOLIDAY AND PACKAGE TRAVEL COMPLAINT\n\nTo: " + analysis.fallback(a.travelCompany || a.companyOther) + "\n\nBooking reference: " + analysis.fallback(a.bookingReference) + "\nLead traveller: " + analysis.fallback(a.leadPassenger) + "\nDestination: " + analysis.fallback(a.destination) + ", " + analysis.fallback(a.country) + "\nTravel dates: " + analysis.fallback(a.travelStart) + " to " + analysis.fallback(a.travelEnd) + "\n\nDear Customer Relations Team,\n\nI am writing about the holiday booking above. I would like you to review the circumstances and provide a clear written response.\n\nThe main issues I would like reviewed are: " + issues + ".\n\nWhat was booked or promised:\n" + analysis.fallback(a.keyPromises) + "\n\nWhat happened:\n" + analysis.fallback(a.issueDetails || a.timelineNotes) + "\n\nComplaint and response history:\nReported while away: " + analysis.fallback(a.reportedDuringHoliday) + "\nComplaint method: " + analysis.fallback(a.complaintMethod) + "\nComplaint reference: " + analysis.fallback(a.complaintReference) + "\nResponse received: " + analysis.fallback(a.responseReceived) + "\nRemedy offered: " + analysis.fallback(a.remedyOffered) + "\n\nEvidence available:\n" + analysis.lines(a.evidence) + "\n\nFinancial loss and impact:\n" + analysis.expenseLines(a.expenses, a.currencyLoss || a.currency) + "\n\nOther impact:\n" + analysis.fallback(a.losses) + "\n\nPotential outcome requested:\nI ask that you review the evidence and explain what outcome may be appropriate. The outcome I would like considered includes: " + outcomes + ".\n\nWhy this appears fair:\n" + analysis.fallback(a.requestedOutcomeReason) + "\n\nPlease provide a written response explaining your position, the evidence you have considered, any documents you need from me and the route for further escalation if we cannot resolve this directly.\n\nYours faithfully,\n\n" + analysis.fallback(a.leadPassenger);
  }

  function buildAll(a) {
    const docs = {
      summary: analysis.buildSummary(a),
      letter: buildLetter(a),
      evidence: evidence.buildEvidence(a),
      timeline: analysis.buildTimeline(a),
      expenses: analysis.buildLosses(a),
      submit: submission.buildSubmit(a)
    };
    docs.full = "QUAERENS CONSUMER COMPLAINT FILE\nHoliday & Package Travel Complaint Pack\n\nIncludes your Holiday Analysis, Complaint Letter, Evidence Checklist, Missing Evidence Schedule, Timeline, Financial Loss Schedule, Potential Remedy Summary and Smart Submission guidance.\n\n---\n\n" + [docs.summary, docs.letter, docs.evidence, docs.timeline, docs.expenses, docs.submit].join("\n\n---\n\n");
    return docs;
  }

  return { buildLetter, buildAll };
});
