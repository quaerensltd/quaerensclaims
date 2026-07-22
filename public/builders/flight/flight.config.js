"use strict";

module.exports = {
  id: "flight",
  productName: "Free Flight Compensation Pack Builder",
  shortName: "Flight Compensation",
  pageTitle: "Free Flight Compensation Pack Builder | Delay & Cancellation Claims | Quaerens",
  h1: "Claim Flight Delay or Cancellation Compensation Yourself",
  canonicalUrl: "https://www.quaerens.co.uk/freeflightclaim.html",
  publicPage: "/freeflightclaim.html",
  storageNamespace: "qcbf-flight",
  legacyStorageKeys: ["quaerensFlightComplaintPackDraftV1", "qcbf:freeflightclaim:1"],
  frameworkVersion: "QCBF 1.2",
  builderVersion: "1.2.0",
  schemaVersion: 1,
  packPrefix: "QF",
  apiIntegration: {
    provider: "AeroDataBox",
    endpoint: "/api/flight-lookup",
    cloudFunctionFallback: "https://us-central1-quaerensclaims.cloudfunctions.net/lookupFlight",
    modes: ["exact", "route", "airlineDeparture", "nearby", "manual"]
  },
  exportSupport: ["PDF", "Word/RTF", "TXT", "Print", "Copy"],
  stages: [
    { id: "flight", label: "Flight details" },
    { id: "passengers", label: "Passengers" },
    { id: "disruption", label: "Disruption" },
    { id: "evidence", label: "Evidence" },
    { id: "expenses", label: "Expenses" },
    { id: "submission", label: "Submission" },
    { id: "review", label: "Review" },
    { id: "ready", label: "Ready to submit" }
  ],
  essentialFields: ["airline", "flightNumber", "flightDate", "departureAirport", "finalDestination", "passengerName"],
  seo: {
    title: "Free Flight Compensation Pack Builder | Delay & Cancellation Claims | Quaerens",
    h1: "Claim Flight Delay or Cancellation Compensation Yourself",
    faqCount: 14,
    canonicalUrl: "https://www.quaerens.co.uk/freeflightclaim.html"
  }
};
