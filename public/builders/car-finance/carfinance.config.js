"use strict";

const { QCBF_VERSION_LABEL } = require("../../complaint-builder/version");

const BUILDER_ID = "car-finance";
const BUILDER_VERSION = "car-finance-qcbf-phase1-2026-07-22";
const STORAGE_NAMESPACE = "qcbf-car-finance";
const SCHEMA_VERSION = 1;
const DRAFT_VERSION = "1";

const config = {
  id: BUILDER_ID,
  productName: "Free Car Finance Complaint Pack Builder",
  shortName: "Car Finance",
  builderVersion: BUILDER_VERSION,
  frameworkVersion: QCBF_VERSION_LABEL,
  migrationStatus: "partial integration",
  status: "partial integration",
  canonicalUrl: "https://www.quaerens.co.uk/car-finance.html",
  publicPage: "/car-finance.html",
  packPrefix: "QC",
  storageNamespace: STORAGE_NAMESPACE,
  schemaVersion: SCHEMA_VERSION,
  draftVersion: DRAFT_VERSION,
  draftStorageKey: "qcbf:car-finance:1:draft",
  rememberedDraftStorageKey: "qcbf:car-finance:1:remembered",
  legacyStorageKeys: [
    "quaerensCarFinanceToolDraftV1",
    "quaerensCarFinanceToolRememberedV1",
    "quaerensCarFinancePackDraftV1",
    "quaerensCarFinancePackDraftRememberedV1"
  ],
  documentTitle: "Quaerens Consumer Complaint File - Car Finance",
  directoryType: "motor-finance-lender-directory",
  disclaimerReference: "self-service-browser-first-car-finance-v1",
  stages: [
    { id: "about-you", label: "About You" },
    { id: "vehicle", label: "Your Vehicle" },
    { id: "provider-dealer", label: "Finance Provider and Dealer" },
    { id: "agreement", label: "Agreement Details" },
    { id: "payments-status", label: "Payments and Agreement Status" },
    { id: "sales-context", label: "What You Were Told" },
    { id: "commission", label: "Commission and Disclosure" },
    { id: "evidence", label: "Documents and Evidence" },
    { id: "review", label: "Review Your Information" },
    { id: "generate", label: "Generate Your Analysis and Complaint Pack" }
  ],
  exportSupport: [
    "PDF",
    "Word/RTF",
    "TXT",
    "Copy Consumer Complaint File",
    "Copy Complaint Letter",
    "Copy Cover Email",
    "Copy Email Subject",
    "Print",
    "Evidence Checklist",
    "Timeline"
  ],
  sharedComponentsAdopted: [
    "builder registration",
    "framework metadata",
    "pack reference",
    "storage namespace",
    "accessibility shell",
    "readiness status shell",
    "document model adapter scaffold",
    "export interface scaffold"
  ],
  specialistEngine: "independent",
  modules: [
    "config",
    "pack-reference",
    "storage-adapter",
    "accessibility-shell",
    "readiness-shell",
    "document-adapter",
    "export-adapter",
    "tests"
  ],
  resources: [
    "motor-finance-lender-directory",
    "car-finance-regulatory-status",
    "car-finance-redress-methodology",
    "finance-evidence-guidance"
  ],
  data: {
    lenders: "/data/lenders.json",
    regulatoryStatus: "/data/car-finance-regulatory-status.json",
    redressMethodology: "/data/car-finance-redress-methodology.json"
  }
};

module.exports = config;
module.exports.constants = { BUILDER_ID, BUILDER_VERSION, STORAGE_NAMESPACE, SCHEMA_VERSION, DRAFT_VERSION };
