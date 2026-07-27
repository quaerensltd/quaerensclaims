"use strict";

const { createDefaultRegistry } = require("./core/BuilderRegistry");
const platformMetadata = require("./platform-metadata");
const holidayConfig = require("../builders/holiday/holiday.config");
const flightConfig = require("../builders/flight/flight.config");
const templateConfig = require("../builders/template/template.config");
const baggageConfig = require("../builders/baggage/baggage.config");
const trainConfig = require("../builders/train/train.config");
const parkingConfig = require("../builders/parking/parking.config");
const gymConfig = require("../builders/gym/gym.config");
const cruiseConfig = require("../builders/cruise/cruise.config");

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

const metadataById = new Map(platformMetadata.products.map((product) => [product.id, product]));

const registry = createDefaultRegistry([
  {
    config: holidayConfig,
    publicMeta: metadataById.get("holiday"),
    status: "migrated",
    modules: ["config", "questions", "analysis", "documents", "resources", "submission", "page", "tests"],
    resources: ["travel-company-directory", "holiday-evidence-guidance"]
  },
  {
    config: flightConfig,
    publicMeta: metadataById.get("flight"),
    status: "migrated",
    modules: ["config", "questions", "lookup", "analysis", "compensation", "evidence", "expenses", "timeline", "documents", "submission", "resources", "page", "flight-card", "tests"],
    resources: ["airline-directory", "airport-directory", "flight-lookup", "smart-submission", "official-resources"],
    apiIntegration: flightConfig.apiIntegration,
    exportSupport: flightConfig.exportSupport
  },
  {
    config: baggageConfig,
    publicMeta: metadataById.get("baggage"),
    status: "migrated",
    modules: ["config", "questions", "analysis", "evidence", "documents", "resources", "submission", "page", "tests"],
    resources: ["airline-baggage-directory", "baggage-evidence-guidance", "official-baggage-resources"],
    exportSupport: baggageConfig.exports
  },
  {
    config: trainConfig,
    publicMeta: metadataById.get("train"),
    status: "migrated",
    modules: ["config", "questions", "analysis", "compensation", "evidence", "documents", "resources", "submission", "page", "tests"],
    resources: ["train-operator-directory", "rail-evidence-guidance", "rail-journey-analysis", "smart-submission", "official-rail-resources"],
    exportSupport: trainConfig.exports
  },
  {
    config: parkingConfig,
    publicMeta: metadataById.get("parking"),
    status: "migrated",
    modules: ["config", "questions", "analysis", "deadlines", "grounds", "evidence", "documents", "resources", "submission", "page", "tests"],
    resources: ["parking-issuer-routing", "parking-evidence-guidance", "parking-deadline-guidance", "official-parking-resources"],
    exportSupport: parkingConfig.exports
  },
  {
    config: gymConfig,
    publicMeta: metadataById.get("gym"),
    status: "migrated",
    modules: ["config", "questions", "analysis", "contract", "deadlines", "evidence", "documents", "resources", "submission", "page", "tests"],
    resources: ["gym-cancellation-routing", "gym-evidence-guidance", "gym-contract-review", "official-gym-resources"],
    exportSupport: gymConfig.exports
  },
  {
    config: cruiseConfig,
    publicMeta: metadataById.get("cruise"),
    status: "Native QCBF builder - production",
    modules: ["config", "questions", "analysis", "itinerary", "cabin", "excursions", "financial", "evidence", "resources", "submission", "documents", "page", "tests"],
    resources: ["cruise-evidence-guidance", "planned-vs-actual-itinerary-review", "cruise-smart-submission", "official-cruise-resources"],
    exportSupport: cruiseConfig.exports
  },
  {
    config: carFinanceConfig,
    publicMeta: metadataById.get("car-finance"),
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

module.exports = { registry, platformMetadata };
