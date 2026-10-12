"use strict";

const { sha256, stableStringify } = require("./stable");

const minor = (amount) => amount == null ? null : Math.round(Number(amount) * 100);
function normaliseAuthoritative(result) {
  return {
    methodologyVersion: result.methodology_version, status: result.status,
    lowerMinor: minor(result.lower && result.lower.amount), upperMinor: minor(result.upper && result.upper.amount),
    lowerBasis: result.lower && result.lower.basis, upperBasis: result.upper && result.upper.basis,
    missingInformation: result.missing_information || [], indicators: result.supporting_indicators || [],
    safeguards: result.relationship_notes || [], currency: result.currency, locale: result.locale,
  };
}
function normaliseCore(result) {
  return {
    methodologyVersion: result.methodologyVersion, status: result.status,
    lowerMinor: result.lower && result.lower.minorUnits, upperMinor: result.upper && result.upper.minorUnits,
    lowerBasis: result.lower && result.lower.basis, upperBasis: result.upper && result.upper.basis,
    missingInformation: result.missingInformation || [], indicators: result.indicators || [],
    safeguards: result.safeguards || [], currency: result.currency, locale: result.locale,
  };
}
function compareFinancialRanges(authoritative, core) {
  const a = normaliseAuthoritative(authoritative), b = normaliseCore(core);
  const fields = Object.keys(a).filter((key) => stableStringify(a[key]) !== stableStringify(b[key]));
  return Object.freeze({
    status: fields.length ? "MISMATCH" : "MATCH", mismatchedFields: fields,
    authoritativeResultHash: sha256(a), coreResultHash: sha256(b),
  });
}

module.exports = { normaliseAuthoritative, normaliseCore, compareFinancialRanges };
