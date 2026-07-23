"use strict";

const { createDefaultRegistry } = require("./core/BuilderRegistry");
const holidayConfig = require("../builders/holiday/holiday.config");
const flightConfig = require("../builders/flight/flight.config");
const templateConfig = require("../builders/template/template.config");
const baggageConfig = require("../builders/baggage/baggage.config");

let carFinanceConfig = null;
try {
  carFinanceConfig = require("../builders/car-finance/carfinance.config");
} catch (error) {
  carFinanceConfig = {
    id: "car-finance",
    productName: "Car Finance Complaint Pack Builder",
    shortName: "Car Finance",
    packPrefix: "QC",
    frameworkVersion: "QCBF 1.2",
    migrationStatus: "partial integration",
    stages: [],
    canonicalUrl: "https://www.quaerens.co.uk/car-finance.html"
  };
}

const registry = createDefaultRegistry([
  {
    config: holidayConfig,
    status: "migrated",
    modules: ["config", "questions", "analysis", "documents", "resources", "submission", "page", "tests"],
    resources: ["travel-company-directory", "holiday-evidence-guidance"]
  },
  {
    config: flightConfig,
    status: "migrated",
    modules: ["config", "questions", "lookup", "analysis", "compensation", "evidence", "expenses", "timeline", "documents", "submission", "resources", "page", "flight-card", "tests"],
    resources: ["airline-directory", "airport-directory", "flight-lookup", "smart-submission", "official-resources"],
    apiIntegration: flightConfig.apiIntegration,
    exportSupport: flightConfig.exportSupport
  },
  {
    config: baggageConfig,
    status: "migrated",
    modules: ["config", "questions", "analysis", "evidence", "documents", "resources", "submission", "page", "tests"],
    resources: ["airline-baggage-directory", "baggage-evidence-guidance", "official-baggage-resources"],
    exportSupport: baggageConfig.exports
  },
  {
    config: carFinanceConfig,
    status: "partial integration",
    modules: ["config", "pack-reference", "storage-adapter", "accessibility-shell", "readiness-shell", "document-adapter", "export-adapter", "tests"],
    resources: ["motor-finance-lender-directory", "car-finance-regulatory-status", "car-finance-redress-methodology", "finance-evidence-guidance"],
    exportSupport: carFinanceConfig.exportSupport
  },
  {
    config: templateConfig,
    status: "template",
    modules: ["config", "scaffold"],
    resources: []
  }
]);

module.exports = { registry };
