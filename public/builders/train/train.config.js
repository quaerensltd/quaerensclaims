"use strict";

(function(root, factory) {
  const config = factory();
  if (typeof module === "object" && module.exports) module.exports = config;
  root.QCBFTrain = root.QCBFTrain || {};
  root.QCBFTrain.config = config;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
  return {
    id: "train",
    productName: "Free Rail Journey Disruption & Compensation Builder",
    shortName: "Rail Disruption Builder",
    pageTitle: "Free Rail Journey Disruption & Compensation Builder | Quaerens",
    h1: "Build Your Rail Journey Disruption & Compensation Pack",
    canonicalUrl: "https://www.quaerens.co.uk/train-delay.html",
    storageNamespace: "qcbf-train",
    storageKey: "qcbf-train-draft-v1",
    schemaVersion: 1,
    builderVersion: "1.0-phase1",
    frameworkVersion: "QCBF 1.2",
    migrationStatus: "native QCBF builder",
    packPrefix: "QT",
    exports: ["Phase 2 placeholder only"],
    stages: [
      { id: "what-happened", label: "What Happened" },
      { id: "passenger-journey", label: "Passenger & Journey" },
      { id: "operator-ticket", label: "Operator & Ticket" },
      { id: "journey-analysis", label: "Journey Analysis" },
      { id: "expenses", label: "Expenses" },
      { id: "evidence", label: "Evidence & Timeline" },
      { id: "requested-outcome", label: "Requested Outcome" },
      { id: "review", label: "Review" }
    ],
    essentialFields: ["journeyIssues", "leadPassenger", "journeyDate", "departureStation", "arrivalStation", "trainOperator", "requestedOutcomes"]
  };
});
