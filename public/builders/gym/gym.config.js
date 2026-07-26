(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.QCBFGymConfig = factory();
})(typeof self !== "undefined" ? self : this, function () {
  return {
    id: "gym",
    productName: "Gym Membership Cancellation & Dispute Pack Builder",
    pageTitle: "Free Gym Membership Cancellation & Dispute Builder | Quaerens",
    h1: "Need to Cancel a Gym Membership or Dispute Gym Charges?",
    canonical: "https://www.quaerens.co.uk/gym-cancellation.html",
    storageNamespace: "qcbf-gym",
    storageKey: "qcbf-gym-draft",
    schemaVersion: 1,
    builderVersion: "1.0-production",
    frameworkVersion: "QCBF 1.2",
    packPrefix: "QG",
    lastVerified: "2026-07-26",
    heroImage: "/images/hero-gym1.jpg",
    logo: "/images/logo-gymcanceltemp.png",
    exports: ["pdf", "rtf", "txt", "copy", "print"],
    jurisdictions: ["England", "Wales", "Scotland", "Northern Ireland", "Unsure"],
    stages: [
      "Considering cancellation",
      "Notice already given",
      "Cancellation refused",
      "Payments taken after cancellation",
      "Refund requested",
      "Debt collector contacted me",
      "Letter Before Claim received",
      "Court or enforcement document received",
      "Unsure"
    ],
    essentialFields: [
      "whatHappened",
      "jurisdiction",
      "memberName",
      "gymName",
      "membershipType",
      "currentStage",
      "requestedOutcomes"
    ]
  };
});
