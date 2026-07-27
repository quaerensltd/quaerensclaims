(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.QCBFCruiseConfig = factory();
})(typeof self !== "undefined" ? self : this, function () {
  return {
    id: "cruise",
    productName: "Free Cruise Refund, Compensation & Dispute Pack Builder",
    pageTitle: "Free Cruise Refund, Compensation & Dispute Pack Builder | Quaerens",
    h1: "Cruise Cancelled, Changed or Not as Promised?",
    heroHeading: "Build Your Free Cruise Refund & Complaint Pack",
    canonical: "https://www.quaerens.co.uk/cruise-compensation-recovery.html",
    storageNamespace: "qcbf-cruise",
    storageKey: "qcbf-cruise-draft",
    schemaVersion: 1,
    builderVersion: "1.0",
    frameworkVersion: "QCBF 1.2",
    migrationStatus: "Native QCBF builder - production",
    packPrefix: "QC",
    lastVerified: "2026-07-27",
    freezeStatus: "Version 1.0 launch freeze",
    heroImage: "/images/hero-cruise.jpg",
    logo: "/images/quaerens-logo.png",
    exports: ["pdf", "rtf", "txt", "copy", "print"],
    jurisdictions: ["England", "Wales", "Scotland", "Northern Ireland", "EU / EEA", "International", "Unsure"],
    currencies: ["GBP", "EUR", "USD", "Other"],
    bookingTypes: [
      "Direct with cruise line",
      "Travel agent",
      "Package holiday",
      "Cruise-only booking",
      "Fly-cruise package",
      "Credit card or finance-linked payment",
      "Gift voucher or future cruise credit",
      "Unsure"
    ],
    essentialFields: [
      "whatHappened",
      "passengerNames",
      "bookingType",
      "cruiseLine",
      "shipName",
      "departureDate",
      "returnDate",
      "requestedOutcomes"
    ]
  };
});
