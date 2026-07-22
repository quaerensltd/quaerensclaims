"use strict";

const { createDefaultRegistry } = require("./core/BuilderRegistry");
const holidayConfig = require("../builders/holiday/holiday.config");
const flightConfig = require("../builders/flight/flight.config");
const templateConfig = require("../builders/template/template.config");

let carFinanceConfig = null;
try {
  carFinanceConfig = require("../builders/car-finance/config.json");
} catch (error) {
  carFinanceConfig = {
    id: "car-finance",
    productName: "Car Finance Complaint Pack Builder",
    shortName: "Car Finance",
    packPrefix: "QCF",
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
    config: carFinanceConfig,
    status: "pending migration",
    modules: ["config"],
    resources: ["finance-evidence-guidance"]
  },
  {
    config: templateConfig,
    status: "template",
    modules: ["config", "scaffold"],
    resources: []
  }
]);

module.exports = { registry };
