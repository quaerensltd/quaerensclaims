(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.QCBFEnergyConfig = factory();
})(typeof self !== "undefined" ? self : this, function () {
  return {
    id: "energy",
    productName: "Free Energy Supplier Complaint & Switching Pack Builder",
    packName: "Energy Supplier Complaint Pack(TM)",
    pageTitle: "Free Energy Supplier Complaint & Switching Pack Builder | Quaerens",
    h1: "Problems With an Energy Supplier, Bill or Switch?",
    heroHeading: "Build Your Free Energy Supplier Complaint Pack",
    canonical: "https://www.quaerens.co.uk/energy-switch.html",
    storageNamespace: "qcbf-energy",
    storageKey: "qcbf-energy-draft",
    schemaVersion: 1,
    builderVersion: "1.0-part-1a-local",
    frameworkVersion: "QCBF 1.2",
    migrationStatus: "Part 1A local implementation - awaiting Part 1B",
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
      "Energy Ombudsman escalation may be relevant. Current eligibility, timing and scheme scope must be checked before submission."
  };
});
