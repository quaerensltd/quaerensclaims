"use strict";

const resources = require("./train.resources");

function buildSubmissionPlaceholder(data) {
  const operator = resources.operatorRecord(data.trainOperator);
  return {
    operator: operator.name || "Not recorded",
    preferredComplaintMethod: operator.verified ? "Use the verified operator complaint route." : "Verify the operator's current official complaint route before submitting.",
    officialWebsite: operator.officialWebsite,
    delayRepayPage: operator.delayRepayPage,
    refundPage: operator.refundPage,
    customerRelations: operator.customerRelations,
    railOmbudsmanRoute: operator.railOmbudsmanRoute,
    lastVerified: operator.lastVerified || "Not verified in Phase 1",
    note: operator.note
  };
}

module.exports = { buildSubmissionPlaceholder };
