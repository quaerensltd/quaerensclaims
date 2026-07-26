"use strict";

(function(root, factory) {
  const config = factory();
  if (typeof module === "object" && module.exports) module.exports = config;
  root.QCBFParking = root.QCBFParking || {};
  root.QCBFParking.config = config;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
  return {
    id: "parking",
    productName: "Free Parking Ticket & Parking Charge Appeal Pack Builder",
    shortName: "Parking Appeal Pack",
    pageTitle: "Free Parking Ticket & Parking Charge Appeal Builder | Quaerens",
    h1: "Received a Parking Ticket or Private Parking Charge? Build Your Free Appeal Pack",
    canonicalUrl: "https://www.quaerens.co.uk/parking-appeal.html",
    storageNamespace: "qcbf-parking",
    storageKey: "qcbf-parking-draft-v1",
    schemaVersion: 1,
    builderVersion: "1.0-production",
    frameworkVersion: "QCBF 1.2",
    migrationStatus: "native QCBF builder",
    packPrefix: "QP",
    exports: ["PDF", "Word/RTF", "TXT", "Print", "Copy"],
    stages: [
      { id: "notice-stage", label: "Notice Type & Stage" },
      { id: "keeper-vehicle", label: "Motorist, Keeper & Vehicle" },
      { id: "parking-event", label: "Parking Event" },
      { id: "what-happened", label: "What Happened" },
      { id: "appeal-grounds", label: "Appeal Grounds" },
      { id: "evidence-timeline", label: "Evidence & Timeline" },
      { id: "requested-outcome", label: "Requested Outcome" },
      { id: "review", label: "Review & Downloads" }
    ],
    essentialFields: ["noticeType", "currentStage", "issuerName", "jurisdiction", "location", "eventDate", "vehicleReg", "requestedOutcomes"]
  };
});
