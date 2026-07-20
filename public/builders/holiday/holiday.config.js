"use strict";

module.exports = {
  id: "holiday",
  productName: "Free Holiday & Package Travel Complaint Pack Builder",
  shortName: "Holiday Compensation",
  pageTitle: "Free Holiday & Package Travel Complaint Pack Builder | Quaerens",
  h1: "Build Your Holiday Complaint Pack",
  canonicalUrl: "https://www.quaerens.co.uk/freeholidaycompensation.html",
  storageNamespace: "freeholidaycompensation",
  schemaVersion: 1,
  packPrefix: "QH",
  stages: [
    { id: "booking", label: "Booking" },
    { id: "travellers", label: "Travellers" },
    { id: "problems", label: "Problems" },
    { id: "evidence", label: "Evidence" },
    { id: "losses", label: "Losses" },
    { id: "complaint", label: "Complaint" },
    { id: "review", label: "Review" },
    { id: "ready", label: "Ready to submit" }
  ],
  essentialFields: ["leadTraveller", "organiser", "bookingReference", "destination", "mainProblem"]
};
