"use strict";

const crypto = require("crypto");
const { evaluateFinancialRange } = require("./financialRangeEvaluator");
const { compareFinancialRanges } = require("./financialRangeComparator");
const { RELEASE, RELEASE_HASH } = require("./financialRangeManifest");

const ELIGIBLE = new Set(["solar", "nl-solar", "spray-foam"]);
const DETAIL_COLLECTION = "quaerensCoreShadowComparisons";
const METRICS_COLLECTION = "quaerensCoreShadowMetricsDaily";
const get = (object, path) => path.split(".").reduce((value, key) => value && value[key], object);
const first = (data, paths) => {
  for (const path of paths) {
    const value = get(data, path);
    if (value !== undefined && value !== null && String(value).trim() !== "") return value;
  }
  return null;
};
const numeric = (value) => {
  if (value == null || value === "") return null;
  const text = String(value).trim();
  if (/^(unknown|not applicable|n\/a|not known|don't know|dont know)$/i.test(text)) return null;
  const cleaned = text.replace(/[^0-9.-]/g, "");
  if (!cleaned || cleaned === "-" || cleaned === ".") return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};
const toMinor = (value) => {
  const parsed = numeric(value);
  return parsed == null ? null : Math.round(parsed * 100);
};
const toMetric = (value) => numeric(value);
const firstPositiveMinor = (data, paths) => {
  for (const path of paths) {
    const value = toMinor(get(data, path));
    if (value != null && value > 0) return value;
  }
  return null;
};

function buildCoreEnvelope(category, data, evaluationId = crypto.randomBytes(16).toString("hex"), release = RELEASE) {
  let coreCategory, jurisdiction, locale, currency, inputs;
  if (category === "solar") {
    coreCategory = "UK_SOLAR"; jurisdiction = "UK"; locale = "en-GB"; currency = "GBP";
    inputs = {
      purchasePriceMinor: toMinor(first(data, ["installation.systemPrice", "installation.price"])),
      outstandingBalanceMinor: toMinor(first(data, ["finance.outstandingBalance"])),
      settlementFigureMinor: toMinor(first(data, ["finance.settlementFigure", "finance.currentSettlementFigure"])),
      directCostMinor: toMinor(first(data, ["financial.engineerCost", "history.engineerCost"])),
      expectedGeneration: toMetric(first(data, ["performance.projectedGeneration"])),
      actualGeneration: toMetric(first(data, ["performance.actualGeneration"])),
      expectedSavingMinor: toMinor(first(data, ["performance.projectedSavings"])),
      actualSavingMinor: toMinor(first(data, ["performance.actualSavings"])),
    };
  } else if (category === "nl-solar") {
    coreCategory = "NL_SOLAR"; jurisdiction = "NL"; locale = "nl-NL"; currency = "EUR";
    inputs = {
      purchasePriceMinor: toMinor(first(data, ["contract.purchasePrice"])),
      outstandingBalanceMinor: toMinor(first(data, ["finance.outstandingBalance"])),
      settlementFigureMinor: toMinor(first(data, ["finance.settlementFigure"])),
      directCostMinor: firstPositiveMinor(data, ["engineer.cost", "engineer.repairPaid"]),
      expectedGeneration: toMetric(first(data, ["performance.expectedGeneration"])),
      actualGeneration: toMetric(first(data, ["performance.actualGeneration"])),
      expectedSavingMinor: toMinor(first(data, ["performance.expectedSavings"])),
      actualSavingMinor: toMinor(first(data, ["performance.actualSavings"])),
    };
  } else if (category === "spray-foam") {
    coreCategory = "SPRAY_FOAM"; jurisdiction = "UK"; locale = "en-GB"; currency = "GBP";
    inputs = {
      installationPriceMinor: toMinor(first(data, ["installation.cost"])),
      removalQuoteMinor: toMinor(first(data, ["remedial.removalQuote"])),
      removalPaidMinor: toMinor(first(data, ["remedial.amountPaid"])),
      inspectionPaidMinor: toMinor(first(data, ["professional.cost"])),
      furtherRemedialMinor: toMinor(first(data, ["remedial.secondRemoval"])),
      targetedRepairMinor: toMinor(first(data, ["remedial.repairCost"])),
      roofReplacementMinor: toMinor(first(data, ["remedial.roofReplacementCost"])),
      roofIncludesRemoval: /includes?\s+(?:the\s+)?(?:spray\s+foam\s+)?removal|removal\s+included/i.test(String(first(data, ["remedial.details"]) || "")),
      feesMinor: toMinor(first(data, ["lending.additionalFees"])),
      otherCostsMinor: toMinor(first(data, ["financial.otherCosts"])),
      creditsMinor: toMinor(first(data, ["financial.credits"])) || 0,
    };
  } else throw new TypeError("Category is not authorised for Core shadow evaluation.");
  return Object.freeze({
    evaluationId, framework: "B", category: coreCategory, jurisdiction, locale, currency,
    methodologyVersion: release.methodologyVersion, rulesetVersion: release.releaseId,
    inputs: Object.freeze(inputs), evidenceStates: Object.freeze({}),
  });
}

const latencyBand = (ms) => ms < 10 ? "LT_10_MS" : ms < 50 ? "10_49_MS" : ms < 100 ? "50_99_MS" : ms < 250 ? "100_249_MS" : "GE_250_MS";
async function recordComparison({ db, admin, record }) {
  if (!db || !admin) return;
  const day = new Date().toISOString().slice(0, 10), increment = admin.firestore.FieldValue.increment(1);
  const expiresAt = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 86400000));
  const batch = db.batch();
  batch.set(db.collection(DETAIL_COLLECTION).doc(record.evaluationId), { ...record, expiresAt, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  batch.set(db.collection(METRICS_COLLECTION).doc(day), {
    reportingDate: day, rulesetVersion: record.rulesetVersion,
    totals: { attempted: increment, [record.comparisonStatus]: increment },
    categories: { [record.category]: { [record.comparisonStatus]: increment } },
    jurisdictions: { [record.jurisdiction]: { [record.comparisonStatus]: increment } },
    latencyBands: { [latencyBand(record.latencyMs)]: increment },
    authorities: record.authorityCode ? { [record.authorityCode]: increment } : {},
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  await batch.commit();
}

function timeoutAfter(ms) {
  return new Promise((_, reject) => setTimeout(() => {
    const error = new Error("Quaerens Core shadow timeout."); error.code = "CORE_TIMEOUT"; reject(error);
  }, ms));
}

async function runFinancialRangeShadow({ category, publicInput, authoritativeResult, db, admin,
  enabled = process.env.QUAERENS_CORE_FINANCIAL_SHADOW_ENABLED !== "false", evaluator = evaluateFinancialRange,
  timeoutMs = 75, deploymentRevision = process.env.K_REVISION || process.env.FUNCTION_TARGET || "local",
  release = RELEASE, expectedManifestHash = RELEASE_HASH, persistRecord = true, authorityCode = "" }) {
  if (!enabled || !ELIGIBLE.has(category)) return Object.freeze({ comparisonStatus: "DISABLED", recordPromise: Promise.resolve() });
  const started = process.hrtime.bigint();
  let envelope, core, comparison, comparisonStatus = "CORE_ERROR", mismatchedFields = [], authoritativeResultHash = null, coreResultHash = null;
  try {
    envelope = buildCoreEnvelope(category, publicInput, crypto.randomBytes(16).toString("hex"), release);
    core = await Promise.race([Promise.resolve().then(() => evaluator(envelope, { release, expectedManifestHash })), timeoutAfter(timeoutMs)]);
    if (!core || core.evaluationId !== envelope.evaluationId || core.rulesetVersion !== release.releaseId ||
        !core.lower || !core.upper || !Array.isArray(core.appliedRules) || !/^[a-f0-9]{64}$/i.test(core.resultHash || "")) {
      const invalid = new Error("Quaerens Core returned an invalid response."); invalid.code = "CORE_INVALID_RESPONSE"; throw invalid;
    }
    comparison = compareFinancialRanges(authoritativeResult, core);
    comparisonStatus = comparison.status; mismatchedFields = comparison.mismatchedFields;
    authoritativeResultHash = comparison.authoritativeResultHash; coreResultHash = comparison.coreResultHash;
  } catch (error) {
    if (error && error.code === "CORE_TIMEOUT") comparisonStatus = "CORE_TIMEOUT";
    else if (error && error.code === "CORE_MANIFEST_INVALID") comparisonStatus = "CORE_MANIFEST_INVALID";
    else if (error && error.code === "CORE_INVALID_RESPONSE") comparisonStatus = "CORE_INVALID";
    else if (error instanceof TypeError) comparisonStatus = "CORE_REJECTED_INPUT";
  }
  const latencyMs = Number(process.hrtime.bigint() - started) / 1e6;
  const record = Object.freeze({
    evaluationId: envelope ? envelope.evaluationId : crypto.randomBytes(16).toString("hex"),
    category: envelope ? envelope.category : category, jurisdiction: envelope ? envelope.jurisdiction : "UNKNOWN",
    rulesetVersion: release.releaseId, methodologyVersion: release.methodologyVersion,
    comparisonStatus, mismatchedFields, authoritativeResultHash, coreResultHash,
    appliedRuleCount: core && Array.isArray(core.appliedRules) ? core.appliedRules.length : 0, latencyMs: Number(latencyMs.toFixed(3)),
    deploymentRevision, authorityCode,
  });
  const recordPromise = persistRecord ? recordComparison({ db, admin, record }).catch(() => undefined) : Promise.resolve();
  return Object.freeze({ ...record, coreResult: core || null, recordPromise });
}

async function settleShadowRecord(shadow, maximumWaitMs = 150) {
  if (!shadow || !shadow.recordPromise) return;
  await Promise.race([shadow.recordPromise, new Promise((resolve) => setTimeout(resolve, maximumWaitMs))]);
}

module.exports = { ELIGIBLE, DETAIL_COLLECTION, METRICS_COLLECTION, buildCoreEnvelope, recordComparison, runFinancialRangeShadow, settleShadowRecord };
