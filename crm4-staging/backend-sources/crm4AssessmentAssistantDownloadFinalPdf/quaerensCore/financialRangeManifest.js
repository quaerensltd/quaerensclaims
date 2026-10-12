"use strict";

const { RULES } = require("./financialRangeRules");
const { sha256 } = require("./stable");

const SHADOW_RELEASE = Object.freeze({
  releaseId: "QRE-CORE-FINANCIAL-RANGE-SHADOW-2026-08-v1",
  contractVersion: "QUAERENS-CORE-FINANCIAL-RANGE-v1",
  methodologyVersion: "FRAMEWORK-B-FINANCIAL-RANGE-v1",
  supportedCategories: Object.freeze(["UK_SOLAR", "NL_SOLAR", "SPRAY_FOAM"]),
  supportedJurisdictions: Object.freeze(["UK", "NL"]),
  supportedCurrencies: Object.freeze(["GBP", "EUR"]),
  effectiveShadowDate: "2026-08-17",
  rules: Object.freeze(RULES.map(({ id, version }) => Object.freeze({ id, version }))),
});

const SHADOW_RELEASE_HASH = "b83b288a180f51bcb3eabf5b7da84d095f59eeabf32a91ea0647e2cc3a831f9f";
const ACTIVE_RELEASE = Object.freeze({
  releaseId: "QRE-CORE-FINANCIAL-RANGE-ACTIVE-2026-08-v1",
  contractVersion: "QUAERENS-CORE-FINANCIAL-RANGE-v1",
  methodologyVersion: "FRAMEWORK-B-FINANCIAL-RANGE-v1",
  supportedCategories: Object.freeze(["UK_SOLAR", "NL_SOLAR", "SPRAY_FOAM"]),
  supportedJurisdictions: Object.freeze(["UK", "NL"]),
  supportedCurrencies: Object.freeze(["GBP", "EUR"]),
  effectiveAuthorityDate: "2026-08-17",
  predecessorReleaseId: SHADOW_RELEASE.releaseId,
  predecessorManifestHash: SHADOW_RELEASE_HASH,
  rules: Object.freeze(RULES.map(({ id, version }) => Object.freeze({ id, version }))),
});
const ACTIVE_RELEASE_HASH = "063947c1393bc01e962d37aefd9a5017034bfd9d9af34cb137ead2317db6d6d7";
const RELEASE = ACTIVE_RELEASE;
const RELEASE_HASH = ACTIVE_RELEASE_HASH;
const calculateManifestHash = (release = RELEASE) => sha256(release);
const assertManifestIntegrity = (release = RELEASE, expectedHash = RELEASE_HASH) => {
  const actual = calculateManifestHash(release);
  if (actual !== expectedHash) {
    const error = new Error("Quaerens Core ruleset manifest integrity check failed.");
    error.code = "CORE_MANIFEST_INVALID";
    throw error;
  }
  return actual;
};

module.exports = {
  RELEASE, RELEASE_HASH, ACTIVE_RELEASE, ACTIVE_RELEASE_HASH,
  SHADOW_RELEASE, SHADOW_RELEASE_HASH, calculateManifestHash, assertManifestIntegrity,
};
