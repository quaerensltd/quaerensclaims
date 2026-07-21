"use strict";

(function(root, factory) {
  const config = factory();
  if (typeof module === "object" && module.exports) module.exports = config;
  root.QCBFHoliday = root.QCBFHoliday || {};
  root.QCBFHoliday.config = config;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
  return {
    id: "holiday",
    productName: "Free Holiday & Package Travel Complaint Pack Builder",
    shortName: "Holiday Compensation",
    pageTitle: "Free Holiday & Package Travel Complaint Pack Builder | Quaerens",
    h1: "Build Your Holiday Complaint Pack",
    canonicalUrl: "https://www.quaerens.co.uk/freeholidaycompensation.html",
    storageNamespace: "freeholidaycompensation",
    storageKey: "quaerensHolidayComplaintPackV1",
    schemaVersion: 1,
    frameworkVersion: "QCBF 2.0",
    packPrefix: "QH",
    stages: [
      { id: "holiday", label: "Holiday" },
      { id: "booking", label: "Booking" },
      { id: "problem", label: "What Went Wrong" },
      { id: "impact", label: "Impact" },
      { id: "evidence", label: "Evidence" },
      { id: "outcome", label: "Outcome" },
      { id: "review", label: "Review" },
      { id: "submit", label: "Submit" }
    ],
    essentialFields: ["holidayType", "travelCompany", "destination", "leadPassenger", "complaintTypes"]
  };
});
