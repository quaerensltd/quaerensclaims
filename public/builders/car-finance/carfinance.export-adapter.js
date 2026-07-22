"use strict";

const config = require("./carfinance.config");

const SUPPORTED_EXPORTS = Object.freeze([
  "pdf",
  "word-rtf",
  "txt",
  "copy-pack",
  "copy-letter",
  "copy-email",
  "copy-subject",
  "print",
  "evidence-checklist",
  "timeline"
]);

function canExport(format) {
  return SUPPORTED_EXPORTS.includes(String(format || "").toLowerCase());
}

function describeExportSupport() {
  return {
    builderId: config.id,
    engine: "current-car-finance-page-renderer",
    qcbfStatus: "interface scaffold only",
    formats: SUPPORTED_EXPORTS.slice(),
    labels: config.exportSupport.slice()
  };
}

function createExportManifest(packReference) {
  return {
    builderId: config.id,
    packReference,
    documentTitle: config.documentTitle,
    formats: describeExportSupport().formats,
    currentRendererRemainsAuthoritative: true
  };
}

module.exports = { SUPPORTED_EXPORTS, canExport, describeExportSupport, createExportManifest };
