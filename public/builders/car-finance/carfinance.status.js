"use strict";

const { statusEngine } = require("../../complaint-builder/core/StatusEngine");
const config = require("./carfinance.config");

const SHELL_STATUSES = [
  "Not Started",
  "In Progress",
  "Needs Key Information",
  "Needs Evidence",
  "Ready for Review",
  "Ready to Submit"
];

function resolveCarFinanceReadinessShell(input) {
  const data = input && input.data ? input.data : {};
  const evidence = input && input.evidence ? input.evidence : [];
  const signals = input && input.confidenceSignals ? input.confidenceSignals : [];
  const base = statusEngine({ requiredFields: [] }, data, evidence, signals, input && input.submission);
  const hasIdentity = Boolean(data.fullName || data.customerName);
  const hasAgreement = Boolean(data.agreementType || data.agreementRef);
  const hasLender = Boolean(data.lender || data.manualLender || data.selectedLenderDisplayName);

  let label = "Not Started";
  if (base.draft.populatedFields > 0) label = "In Progress";
  if (base.draft.populatedFields > 0 && (!hasIdentity || !hasAgreement || !hasLender)) label = "Needs Key Information";
  if (hasIdentity && hasAgreement && hasLender && !evidence.length) label = "Needs Evidence";
  if (hasIdentity && hasAgreement && hasLender && evidence.length) label = "Ready for Review";

  return {
    ...base,
    frameworkStatus: label,
    availableStatuses: SHELL_STATUSES.slice(),
    specialistLogic: "unchanged-independent-car-finance-engine",
    builderId: config.id
  };
}

module.exports = { SHELL_STATUSES, resolveCarFinanceReadinessShell };
