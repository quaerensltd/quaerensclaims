"use strict";

(function(root, factory) {
  const config = factory();
  if (typeof module === "object" && module.exports) module.exports = config;
  root.QCBFBaggage = root.QCBFBaggage || {};
  root.QCBFBaggage.config = config;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
  return {
    id: "baggage",
    productName: "Free Lost, Delayed & Damaged Baggage Complaint Pack Builder",
    shortName: "Baggage Complaint Pack",
    pageTitle: "Free Lost, Delayed & Damaged Baggage Complaint Pack | Quaerens",
    h1: "Lost, Delayed or Damaged Luggage? Build Your Free Airline Complaint Pack",
    canonicalUrl: "https://www.quaerens.co.uk/lost-luggage.html",
    storageNamespace: "qcbf-baggage",
    storageKey: "qcbf-baggage-draft-v1",
    schemaVersion: 1,
    builderVersion: "1.0",
    frameworkVersion: "QCBF 1.2",
    migrationStatus: "native QCBF builder",
    packPrefix: "QB",
    exports: ["PDF", "Word/RTF", "TXT", "Print", "Copy"],
    stages: [
      { id: "journey", label: "Journey" },
      { id: "baggage", label: "Baggage" },
      { id: "problem", label: "Problem" },
      { id: "report", label: "Report" },
      { id: "losses", label: "Losses" },
      { id: "evidence", label: "Evidence" },
      { id: "outcome", label: "Outcome" },
      { id: "review", label: "Review" }
    ],
    essentialFields: ["leadPassenger", "airline", "flightNumber", "travelDate", "baggageIssues", "requestedOutcomes"]
  };
});
