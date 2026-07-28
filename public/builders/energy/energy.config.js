(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.QCBFEnergyConfig = factory();
})(typeof self !== "undefined" ? self : this, function () {
  return {
    id: "energy",
    productName: "Free Energy Supplier Complaint & Switching Pack Builder",
    packName: "Energy Supplier Complaint Pack\u2122",
    pageTitle: "Free Energy Supplier Complaint & Switching Pack Builder | Quaerens",
    h1: "Problems With Your Energy Supplier, Bill or Switch?",
    heroHeading: "Build Your Free Energy Supplier Complaint Pack",
    canonical: "https://www.quaerens.co.uk/energy-switch.html",
    storageNamespace: "qcbf-energy",
    storageKey: "qcbf-energy-draft",
    schemaVersion: 1,
    builderVersion: "1.0-part-2a-local",
    frameworkVersion: "QCBF 1.2",
    migrationStatus: "Part 2A local verification - awaiting Part 2B",
    resourcesVersion: "2026-07-28-official-sources",
    packPrefix: "QE",
    heroImage: "/images/hero-energy3.jpg",
    logo: "/images/logo-energytemp.png",
    exports: ["preview"],
    jurisdictions: ["England", "Wales", "Scotland", "Northern Ireland", "Unsure"],
    energyTypes: [
      "Electricity only",
      "Gas only",
      "Dual fuel",
      "Prepayment electricity",
      "Prepayment gas",
      "Smart prepayment",
      "Economy or multi-rate electricity",
      "Communal supply",
      "Heat network",
      "LPG or oil",
      "Unknown"
    ],
    essentialFields: [
      "whatHappened",
      "jurisdiction",
      "propertyCountry",
      "accountResidential",
      "consumerName",
      "supplierName",
      "energyType",
      "requestedOutcomes"
    ],
    steps: [
      "What Happened?",
      "Consumer, Property & Account",
      "Supplier, Tariff & Meter",
      "Switching, Billing or Service Problem",
      "Payments, Credit & Amounts",
      "Evidence, Complaint History & Timeline",
      "Requested Outcome",
      "Review, Downloads & Submission"
    ],
    officialBoundary:
      "Energy Ombudsman escalation may be relevant. Current eligibility, timing and scheme scope must be checked before submission.",
    publicDisclaimer: [
      "This free Complaint Pack helps organise information and prepare a structured complaint.",
      "Quaerens does not automatically submit complaints.",
      "Quaerens does not guarantee refunds, compensation or any particular outcome.",
      "Complex legal matters may require additional professional advice."
    ]
  };
});
