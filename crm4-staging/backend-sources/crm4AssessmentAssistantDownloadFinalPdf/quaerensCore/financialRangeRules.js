"use strict";

const EFFECTIVE_DATE = "2026-08-17";
const SOURCE = "FRAMEWORK-B-FINANCIAL-RANGE-v1 certified production baseline at e7ce0c2";

function rule(id, jurisdiction, category, family, typedInputs, trigger, consequence, safeguards = []) {
  return Object.freeze({
    id, jurisdiction, framework: "B", category, family, version: 1,
    effectiveDate: EFFECTIVE_DATE, sourceReference: SOURCE, typedInputs,
    triggerConditions: trigger, evidenceDependencies: [], calculationConsequence: consequence,
    safeguards, status: "SHADOW", supersedes: null, lastReviewed: EFFECTIVE_DATE,
    reviewRole: "Quaerens Core administrator",
  });
}

const RULES = Object.freeze([
  rule("QRE-ALL-FIN-STATUS-001", "ALL", "FINANCIAL_RANGE", "STATUS", ["lowerMinor", "upperMinor"], "Neither boundary is safely calculable", "Set PENDING; never invent zero", ["unknown-is-not-zero"]),
  rule("QRE-ALL-FIN-STATUS-002", "ALL", "FINANCIAL_RANGE", "STATUS", ["lowerMinor", "upperMinor"], "Exactly one boundary is safely calculable", "Set PARTIAL", ["no-synthetic-boundary"]),
  rule("QRE-ALL-FIN-STATUS-003", "ALL", "FINANCIAL_RANGE", "STATUS", ["lowerMinor", "upperMinor"], "Both boundaries are safely calculable", "Set PROVISIONAL", ["evidence-dependent"]),
  rule("QRE-ALL-FIN-SAFE-001", "ALL", "FINANCIAL_RANGE", "SAFE", ["lowerMinor", "upperMinor"], "Both boundaries exist", "Reject lower boundary above upper boundary", ["lower-must-not-exceed-upper"]),
  rule("QRE-ALL-FIN-SAFE-002", "ALL", "FINANCIAL_RANGE", "SAFE", ["all monetary inputs"], "Input is missing, blank, unknown or not applicable", "Preserve absence; do not coerce to zero", ["unknown-is-not-zero"]),
  rule("QRE-ALL-FIN-SAFE-003", "ALL", "FINANCIAL_RANGE", "SAFE", ["transaction-related monetary inputs"], "Amounts may describe the same underlying transaction", "Keep scenario boundaries non-cumulative", ["anti-double-counting"]),
  rule("QRE-UK-SOLAR-RANGE-001", "UK", "UK_SOLAR", "RANGE", ["settlementFigureMinor", "outstandingBalanceMinor", "directCostMinor"], "A narrower supported anchor exists", "Prefer settlement, then outstanding balance, then direct cost as lower boundary"),
  rule("QRE-UK-SOLAR-RANGE-002", "UK", "UK_SOLAR", "RANGE", ["purchasePriceMinor"], "Purchase value exists", "Use purchase value as broader upper scenario", ["not-an-entitlement"]),
  rule("QRE-UK-SOLAR-EVD-001", "UK", "UK_SOLAR", "EVD", ["expectedGeneration", "actualGeneration", "expectedSavingMinor", "actualSavingMinor"], "Comparable performance values exist", "Calculate non-negative generation and savings indicators"),
  rule("QRE-NL-SOLAR-RANGE-001", "NL", "NL_SOLAR", "RANGE", ["settlementFigureMinor", "outstandingBalanceMinor", "directCostMinor"], "A narrower supported anchor exists", "Prefer settlement, then outstanding balance, then direct cost as lower boundary"),
  rule("QRE-NL-SOLAR-RANGE-002", "NL", "NL_SOLAR", "RANGE", ["purchasePriceMinor"], "Purchase value exists", "Use purchase value as broader upper scenario", ["not-an-entitlement"]),
  rule("QRE-NL-SOLAR-EVD-001", "NL", "NL_SOLAR", "EVD", ["expectedGeneration", "actualGeneration", "expectedSavingMinor", "actualSavingMinor"], "Comparable performance values exist", "Calculate Dutch generation and savings indicators"),
  rule("QRE-UK-SPRAY-FIN-001", "UK", "SPRAY_FOAM", "FIN", ["removalPaidMinor", "removalQuoteMinor"], "Removal payment and/or quotation exists", "Prefer paid removal; never add quote and payment", ["quote-payment-deduplication"]),
  rule("QRE-UK-SPRAY-SAFE-001", "UK", "SPRAY_FOAM", "SAFE", ["roofIncludesRemoval", "removalPaidMinor", "removalQuoteMinor", "roofReplacementMinor"], "Roof scope includes removal", "Exclude separate removal amount", ["overlap-deduplication"]),
  rule("QRE-UK-SPRAY-FIN-002", "UK", "SPRAY_FOAM", "FIN", ["direct cost components", "creditsMinor"], "Non-overlapping direct costs exist", "Sum direct components and deduct related credit once", ["credit-deduplication", "non-negative-floor"]),
  rule("QRE-UK-SPRAY-RANGE-001", "UK", "SPRAY_FOAM", "RANGE", ["direct cost components"], "Direct cost anchor exists", "Use direct cost as lower scenario", ["evidence-and-causation-review"]),
  rule("QRE-UK-SPRAY-RANGE-002", "UK", "SPRAY_FOAM", "RANGE", ["installationPriceMinor", "direct cost components"], "Installation and/or direct cost exists", "Use installation plus separate direct cost as broader scenario", ["not-an-entitlement", "non-overlapping-only"]),
  rule("QRE-UK-SPRAY-EVD-001", "UK", "SPRAY_FOAM", "EVD", ["installationPriceMinor", "removalPaidMinor", "removalQuoteMinor"], "Reference amounts exist", "Return installation and removal supporting indicators"),
]);

const RULE_MAP = new Map(RULES.map((item) => [item.id, item]));
const byId = (id) => {
  const found = RULE_MAP.get(id);
  if (!found) throw new Error(`Unknown Quaerens rule: ${id}`);
  return found;
};

module.exports = { RULES, RULE_MAP, byId };
