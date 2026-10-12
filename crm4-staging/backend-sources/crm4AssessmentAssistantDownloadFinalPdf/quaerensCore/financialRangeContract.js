"use strict";

const CONTRACT_VERSION = "QUAERENS-CORE-FINANCIAL-RANGE-v1";
const MAX_MINOR_UNITS = 100000000000;
const MAX_METRIC = 1000000000;
const TOP_LEVEL_KEYS = ["category", "currency", "evaluationId", "evidenceStates", "framework", "inputs", "jurisdiction", "locale", "methodologyVersion", "rulesetVersion"];
const CATEGORY = Object.freeze({
  UK_SOLAR: { jurisdiction: "UK", locale: "en-GB", currency: "GBP", inputs: ["actualGeneration", "actualSavingMinor", "directCostMinor", "expectedGeneration", "expectedSavingMinor", "outstandingBalanceMinor", "purchasePriceMinor", "settlementFigureMinor"] },
  NL_SOLAR: { jurisdiction: "NL", locale: "nl-NL", currency: "EUR", inputs: ["actualGeneration", "actualSavingMinor", "directCostMinor", "expectedGeneration", "expectedSavingMinor", "outstandingBalanceMinor", "purchasePriceMinor", "settlementFigureMinor"] },
  SPRAY_FOAM: { jurisdiction: "UK", locale: "en-GB", currency: "GBP", inputs: ["creditsMinor", "feesMinor", "furtherRemedialMinor", "inspectionPaidMinor", "installationPriceMinor", "otherCostsMinor", "removalPaidMinor", "removalQuoteMinor", "roofIncludesRemoval", "roofReplacementMinor", "targetedRepairMinor"] },
});
const PII_PATTERN = /(name|surname|email|telephone|phone|mobile|address|postcode|postal|agent|uid|crm|qar|account|agreement|narrative|document|witness)/i;
const DANGEROUS_KEYS = new Set(["__proto__", "prototype", "constructor"]);

function keysExact(value, expected, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${label} must be an object.`);
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) throw new TypeError(`${label} contains unexpected or missing fields.`);
}
function validateInteger(value, label, limit = MAX_MINOR_UNITS) {
  if (value == null) return;
  if (!Number.isSafeInteger(value) || value < 0 || value > limit) throw new TypeError(`${label} must be a bounded non-negative safe integer.`);
}
function inspectKeys(value, path = "request") {
  if (!value || typeof value !== "object") return;
  for (const key of Object.keys(value)) {
    if (DANGEROUS_KEYS.has(key) || PII_PATTERN.test(key)) throw new TypeError(`${path} contains a prohibited field.`);
    inspectKeys(value[key], `${path}.${key}`);
  }
}
function validateRequest(request, release) {
  inspectKeys(request);
  keysExact(request, TOP_LEVEL_KEYS, "Core request");
  if (!/^[a-f0-9]{32}$/i.test(request.evaluationId || "")) throw new TypeError("evaluationId must be an opaque random identifier.");
  if (request.framework !== "B") throw new TypeError("Unsupported framework.");
  if (request.methodologyVersion !== release.methodologyVersion || request.rulesetVersion !== release.releaseId) throw new TypeError("Unknown or unpinned Core ruleset/methodology.");
  const config = CATEGORY[request.category];
  if (!config) throw new TypeError("Unsupported Core category.");
  for (const key of ["jurisdiction", "locale", "currency"]) if (request[key] !== config[key]) throw new TypeError(`Incompatible ${key} for Core category.`);
  keysExact(request.inputs, config.inputs, "Core inputs");
  keysExact(request.evidenceStates, [], "Core evidenceStates");
  for (const [key, value] of Object.entries(request.inputs)) {
    if (key === "roofIncludesRemoval") {
      if (typeof value !== "boolean") throw new TypeError("roofIncludesRemoval must be boolean.");
    } else if (/Generation$/.test(key)) {
      if (value != null && (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > MAX_METRIC)) throw new TypeError(`${key} must be a bounded non-negative number.`);
    }
    else validateInteger(value, key);
  }
  return config;
}

module.exports = { CONTRACT_VERSION, CATEGORY, TOP_LEVEL_KEYS, PII_PATTERN, validateRequest };
