"use strict";

(function(root, factory) {
  const train = root.QCBFTrain || {};
  const api = factory(train.resources, train.analysis);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.QCBFTrain = root.QCBFTrain || {};
  root.QCBFTrain.submission = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function(resources, analysis) {
  if (!resources && typeof require === "function") resources = require("./train.resources");
  if (!analysis && typeof require === "function") analysis = require("./train.analysis");

  function operatorRoute(data) {
    const operator = resources.operatorRecord((data && data.trainOperator) || "");
    const verified = !!operator.verified;
    const hasComplexRoute = !!(data && (String(data.connectingOperator || "").trim() || String(data.splitTickets || "").toLowerCase().includes("yes")));
    return {
      operator: operator.name || (data && data.trainOperator) || "Not recorded",
      preferredComplaintMethod: verified && !hasComplexRoute ? "Use the operator's official Delay Repay, refund or customer relations route shown below." : "Verify the operator's current official complaint and Delay Repay route before submitting.",
      officialWebsite: operator.officialWebsite || "",
      delayRepayPage: operator.delayRepayPage || "",
      refundPage: operator.refundPage || "",
      customerRelations: operator.customerRelations || "",
      railOmbudsmanRoute: operator.railOmbudsmanRoute || "Rail Ombudsman may be relevant after the operator's final response or unresolved complaint period.",
      lastVerified: operator.lastVerified || "Not verified",
      note: operator.note || "Check the current official operator page before submitting."
    };
  }

  function ombudsmanReadiness(data) {
    const response = String((data && data.operatorResponse) || "").toLowerCase();
    const hasFinal = response.includes("final") || response.includes("deadlock") || response.includes("rejected");
    if (hasFinal) {
      return "Potentially ready for ombudsman review once the operator's process and applicable time limits have been checked.";
    }
    return "Usually submit to the operator first and keep the operator response before considering the Rail Ombudsman.";
  }

  function smartSubmission(data) {
    const result = analysis.analyse(data || {});
    const route = operatorRoute(data || {});
    const checks = [
      "Check the passenger and journey details are accurate.",
      "Attach the ticket, booking and relevant operator messages.",
      "Keep Delay Repay, refund and expense requests clearly separated.",
      "Review the estimated figures before submitting.",
      "Use the operator's current official route and keep proof of submission."
    ];
    return {
      stage: "Quaerens Smart Submission",
      readiness: result.completeness.status,
      operatorRoute: route,
      ombudsmanReadiness: ombudsmanReadiness(data || {}),
      checks: checks,
      warning: "Quaerens does not automatically submit this complaint pack. You review and send it yourself."
    };
  }

  function buildSubmissionPlaceholder(data) {
    const route = operatorRoute(data || {});
    return {
      operator: route.operator,
      preferredComplaintMethod: route.preferredComplaintMethod,
      officialWebsite: route.officialWebsite,
      delayRepayPage: route.delayRepayPage,
      refundPage: route.refundPage,
      customerRelations: route.customerRelations,
      railOmbudsmanRoute: route.railOmbudsmanRoute,
      lastVerified: route.lastVerified,
      note: route.note
    };
  }

  return {
    operatorRoute: operatorRoute,
    smartSubmission: smartSubmission,
    buildSubmissionPlaceholder: buildSubmissionPlaceholder,
    ombudsmanReadiness: ombudsmanReadiness
  };
});
