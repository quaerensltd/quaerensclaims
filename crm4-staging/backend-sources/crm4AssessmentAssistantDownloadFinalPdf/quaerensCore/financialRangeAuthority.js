"use strict";

const { normaliseAuthoritative } = require("./financialRangeComparator");
const { RELEASE, RELEASE_HASH } = require("./financialRangeManifest");
const { recordComparison, runFinancialRangeShadow } = require("./financialRangeShadow");
const { sha256 } = require("./stable");

const AUTHORITY = Object.freeze({
  CORE_MATCHED: "CORE_MATCHED",
  LEGACY_FALLBACK_CORE_ERROR: "LEGACY_FALLBACK_CORE_ERROR",
  LEGACY_FALLBACK_CORE_TIMEOUT: "LEGACY_FALLBACK_CORE_TIMEOUT",
  LEGACY_FALLBACK_CORE_MISMATCH: "LEGACY_FALLBACK_CORE_MISMATCH",
  LEGACY_FALLBACK_CORE_INVALID: "LEGACY_FALLBACK_CORE_INVALID",
  LEGACY_ONLY_KILL_SWITCH: "LEGACY_ONLY_KILL_SWITCH",
  SAFETY_COMPARATOR_FAILURE: "SAFETY_COMPARATOR_FAILURE",
});
const CATEGORY_STATE_COLLECTION = "quaerensCoreAuthorityCategoryState";
const CATEGORY_ENV = Object.freeze({
  solar: "QUAERENS_CORE_UK_SOLAR_MODE",
  "nl-solar": "QUAERENS_CORE_NL_SOLAR_MODE",
  "spray-foam": "QUAERENS_CORE_SPRAY_FOAM_MODE",
});
const VALID_CATEGORIES = new Set(Object.keys(CATEGORY_ENV));

const legacyHash = (legacyResult) => sha256(normaliseAuthoritative(legacyResult));
const freezeRange = (value) => Object.freeze(value);

function coreToCanonicalRange(core, legacyResult) {
  if (!core || !legacyResult) throw new TypeError("Core and legacy financial ranges are required.");
  return freezeRange({
    methodology_version: core.methodologyVersion,
    locale: core.locale,
    currency: core.currency,
    status: core.status,
    display_range: core.displayRange,
    lower: freezeRange({ amount: core.lower.minorUnits == null ? null : core.lower.minorUnits / 100, display: core.lower.display, basis: core.lower.basis }),
    upper: freezeRange({ amount: core.upper.minorUnits == null ? null : core.upper.minorUnits / 100, display: core.upper.display, basis: core.upper.basis }),
    missing_information: freezeRange([...(core.missingInformation || [])]),
    supporting_indicators: freezeRange([...(core.indicators || [])]),
    relationship_notes: freezeRange([...(core.safeguards || [])]),
    caveat: legacyResult.caveat,
    agent_summary: legacyResult.agent_summary,
  });
}

function configuredMode(category, environment = process.env) {
  if (!VALID_CATEGORIES.has(category)) return "LEGACY_ONLY";
  if (environment.QUAERENS_CORE_FINANCIAL_SHADOW_ENABLED === "false") return "LEGACY_ONLY";
  const globalMode = String(environment.QUAERENS_CORE_FINANCIAL_AUTHORITY_MODE || "CORE_PRIMARY").toUpperCase();
  const categoryMode = String(environment[CATEGORY_ENV[category]] || globalMode).toUpperCase();
  return categoryMode === "CORE_PRIMARY" ? "CORE_PRIMARY" : "LEGACY_ONLY";
}

async function categoryStateMode(db, category) {
  if (!db || !VALID_CATEGORIES.has(category)) return null;
  try {
    const snapshot = await db.collection(CATEGORY_STATE_COLLECTION).doc(category).get();
    return snapshot.exists && snapshot.data().mode === "LEGACY_ONLY" ? "LEGACY_ONLY" : null;
  } catch (_) {
    return "LEGACY_ONLY";
  }
}

async function tripCategory(db, admin, category, diagnostic) {
  if (!db || !admin || process.env.QUAERENS_CORE_AUTO_TRIP_ON_MISMATCH === "false") return;
  await db.collection(CATEGORY_STATE_COLLECTION).doc(category).set({
    mode: "LEGACY_ONLY",
    reason: AUTHORITY.LEGACY_FALLBACK_CORE_MISMATCH,
    comparisonStatus: diagnostic.comparisonStatus,
    rulesetVersion: diagnostic.rulesetVersion,
    coreResultHash: diagnostic.coreResultHash,
    legacyResultHash: diagnostic.authoritativeResultHash,
    trippedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

function authorityForStatus(status) {
  if (status === "MATCH") return AUTHORITY.CORE_MATCHED;
  if (status === "MISMATCH") return AUTHORITY.LEGACY_FALLBACK_CORE_MISMATCH;
  if (status === "CORE_TIMEOUT") return AUTHORITY.LEGACY_FALLBACK_CORE_TIMEOUT;
  if (["CORE_INVALID", "CORE_REJECTED_INPUT", "CORE_MANIFEST_INVALID"].includes(status)) return AUTHORITY.LEGACY_FALLBACK_CORE_INVALID;
  return AUTHORITY.LEGACY_FALLBACK_CORE_ERROR;
}

async function selectFinancialRangeAuthority({
  category, publicInput, legacyResult, db, admin, evaluator, timeoutMs = 75,
  environment = process.env, release = RELEASE, expectedManifestHash = RELEASE_HASH,
  deploymentRevision = process.env.K_REVISION || process.env.FUNCTION_TARGET || "local",
}) {
  if (!legacyResult || typeof legacyResult !== "object") {
    const error = new Error("Legacy safety comparator did not return a financial range.");
    error.code = AUTHORITY.SAFETY_COMPARATOR_FAILURE;
    throw error;
  }
  const stateMode = await categoryStateMode(db, category);
  const mode = stateMode || configuredMode(category, environment);
  if (mode !== "CORE_PRIMARY") {
    const diagnostic = {
      evaluationId: require("crypto").randomBytes(16).toString("hex"), category, jurisdiction: category === "nl-solar" ? "NL" : "UK",
      rulesetVersion: release.releaseId, methodologyVersion: release.methodologyVersion,
      comparisonStatus: "DISABLED", mismatchedFields: [], authoritativeResultHash: legacyHash(legacyResult), coreResultHash: null,
      appliedRuleCount: 0, latencyMs: 0, deploymentRevision, authorityCode: AUTHORITY.LEGACY_ONLY_KILL_SWITCH,
      authorityReason: stateMode ? "CATEGORY_CIRCUIT_BREAKER" : "CONFIGURED_LEGACY_ONLY",
    };
    const recordPromise = recordComparison({ db, admin, record: diagnostic }).catch(() => undefined);
    return Object.freeze({ canonicalResult: legacyResult, ...diagnostic, recordPromise });
  }
  const shadow = await runFinancialRangeShadow({
    category, publicInput, authoritativeResult: legacyResult, db, admin, evaluator,
    timeoutMs, deploymentRevision, release, expectedManifestHash, persistRecord: false,
  });
  const authorityCode = authorityForStatus(shadow.comparisonStatus);
  const canonicalResult = authorityCode === AUTHORITY.CORE_MATCHED ? coreToCanonicalRange(shadow.coreResult, legacyResult) : legacyResult;
  const diagnostic = {
    evaluationId: shadow.evaluationId, category: shadow.category, jurisdiction: shadow.jurisdiction,
    rulesetVersion: shadow.rulesetVersion, methodologyVersion: shadow.methodologyVersion,
    comparisonStatus: shadow.comparisonStatus, mismatchedFields: shadow.mismatchedFields,
    authoritativeResultHash: shadow.authoritativeResultHash || legacyHash(legacyResult), coreResultHash: shadow.coreResultHash,
    appliedRuleCount: shadow.appliedRuleCount, latencyMs: shadow.latencyMs, deploymentRevision,
    authorityCode, authorityReason: authorityCode === AUTHORITY.CORE_MATCHED ? "VALID_CORE_AND_LEGACY_MATCH" : shadow.comparisonStatus,
  };
  if (authorityCode === AUTHORITY.LEGACY_FALLBACK_CORE_MISMATCH) await tripCategory(db, admin, category, diagnostic).catch(() => undefined);
  const recordPromise = recordComparison({ db, admin, record: diagnostic }).catch(() => undefined);
  return Object.freeze({ canonicalResult, coreResult: shadow.coreResult || null, ...diagnostic, recordPromise });
}

function applyFinancialRangeAuthority(projection, selection) {
  if (!projection || !selection || !selection.canonicalResult) {
    const error = new Error("Financial range safety contract could not select a canonical result.");
    error.code = AUTHORITY.SAFETY_COMPARATOR_FAILURE;
    throw error;
  }
  return Object.freeze({ ...projection, financial_assessment_range: selection.canonicalResult });
}

module.exports = {
  AUTHORITY, CATEGORY_ENV, CATEGORY_STATE_COLLECTION, applyFinancialRangeAuthority,
  configuredMode, coreToCanonicalRange, selectFinancialRangeAuthority,
};
