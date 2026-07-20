"use strict";

module.exports = {
  id: "flight",
  productName: "Free Flight Compensation Pack Builder",
  shortName: "Flight Compensation",
  pageTitle: "Free Flight Compensation Pack Builder | Delay & Cancellation Claims | Quaerens",
  h1: "Claim Flight Delay or Cancellation Compensation Yourself",
  canonicalUrl: "https://www.quaerens.co.uk/freeflightclaim.html",
  storageNamespace: "freeflightclaim",
  schemaVersion: 1,
  packPrefix: "QF",
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
  essentialFields: ["airline", "flightNumber", "flightDate", "departureAirport", "finalDestination", "passengerName"]
};
