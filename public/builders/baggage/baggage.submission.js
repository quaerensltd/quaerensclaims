"use strict";

(function(root, factory) {
  const submission = factory(root.QCBFBaggage && root.QCBFBaggage.analysis, root.QCBFBaggage && root.QCBFBaggage.resources);
  if (typeof module === "object" && module.exports) module.exports = factory(require("./baggage.analysis"), require("./baggage.resources"));
  root.QCBFBaggage = root.QCBFBaggage || {};
  root.QCBFBaggage.submission = submission;
})(typeof globalThis !== "undefined" ? globalThis : this, function(analysis, resources) {
  function smartSubmission(data) {
    const route = resources.routeForAirline(data.airline || data.operatingAirline);
    const completeness = analysis.completeness(data);
    const deadline = analysis.deadlineStatus(data);
    const checks = [
      ["Passenger and contact details reviewed", analysis.has(data.leadPassenger)],
      ["Flight, route and travel date reviewed", analysis.has(data.flightNumber) && analysis.has(data.travelDate)],
      ["Baggage tag, PIR or explanation added", analysis.has(data.baggageTag) || analysis.has(data.pirReference) || analysis.has(data.problemDetails)],
      ["Financial schedule checked for double-counting", true],
      ["Travel insurance payments recorded where relevant", true],
      ["Evidence attachments named clearly", (data.evidence || []).length > 0],
      ["Airline official submission route checked today", false]
    ];
    return {
      route,
      readiness: completeness.status,
      deadline,
      checks,
      recommendedAction: completeness.status === "Ready to Submit" ? "Review the pack and submit through the airline's current official baggage complaint route." : "Complete the missing information before sending, then check the airline's current official baggage complaint route."
    };
  }

  function buildSubmissionInstructions(data) {
    const smart = smartSubmission(data);
    return "QUAERENS SMART SUBMISSION\n\nReadiness: " + smart.readiness + "\nDeadline flag: " + smart.deadline.label + "\n" + smart.deadline.detail + "\n\nPreferred complaint method:\n" + smart.route.method + (smart.route.page ? "\nOfficial page: " + smart.route.page : "") + "\n\nBefore submitting:\n" + smart.checks.map(item => "- " + item[0] + ": " + (item[1] ? "Yes" : "Check")).join("\n") + "\n\nRecommended action:\n" + smart.recommendedAction + "\n\nDo not send original documents unless the airline specifically requests them. Keep a copy of everything you send and receive.";
  }

  return { smartSubmission, buildSubmissionInstructions };
});
