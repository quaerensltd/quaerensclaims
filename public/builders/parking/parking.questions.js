"use strict";

(function(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.QCBFParking = root.QCBFParking || {};
  root.QCBFParking.questions = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
  const noticeTypes = [
    "Council or local authority PCN",
    "Transport for London PCN",
    "Private parking charge notice",
    "Police or Fixed Penalty Notice",
    "Excess Charge Notice or Standard Charge Notice",
    "Railway station parking notice",
    "Windscreen notice",
    "Postal notice or ANPR notice",
    "Notice to Owner",
    "Notice of Rejection",
    "Charge Certificate",
    "Order for Recovery",
    "Debt collector letter",
    "Letter Before Claim",
    "County Court claim",
    "Unsure"
  ];

  const currentStages = [
    "Notice just received",
    "Discount period still open",
    "Informal challenge stage",
    "Formal representations stage",
    "Appeal to tribunal or independent appeal stage",
    "Notice of Rejection received",
    "Debt collector stage",
    "Letter Before Claim received",
    "Court claim received",
    "Bailiff or enforcement stage",
    "Paid but still want a refund review",
    "Unsure"
  ];

  const jurisdictions = ["England", "Wales", "Scotland", "Northern Ireland", "Unsure"];
  const regions = ["London", "England outside London", "Wales", "Scotland", "Northern Ireland", "Unsure"];

  const whatHappened = [
    "I paid but the payment was not recognised",
    "I entered the wrong vehicle registration",
    "The signage was unclear or not visible",
    "The machine or payment app failed",
    "I had a permit or authorisation",
    "I was loading, unloading or making a delivery",
    "There was a Blue Badge or disability-related issue",
    "The vehicle broke down or there was an emergency",
    "The alleged overstay is disputed",
    "The car park was unsafe, poorly lit or difficult to understand",
    "The Notice to Keeper or postal notice may be late or defective",
    "The amount, add-ons or debt costs look wrong",
    "I was not the driver",
    "I was a hirer, leaseholder or company vehicle user",
    "The vehicle had been sold, cloned or used without permission",
    "Other"
  ];

  const requestedOutcomes = [
    "Cancel the parking charge or PCN",
    "Accept discounted payment if cancellation is not accepted",
    "Refund a payment already made",
    "Remove debt collection add-ons",
    "Provide evidence and photographs",
    "Provide a POPLA, IAS or tribunal appeal code",
    "Put enforcement or debt action on hold while reviewed",
    "Consider a disability, emergency or vulnerability issue",
    "Other fair outcome"
  ];

  const documentTypes = [
    "Parking appeal pack",
    "Informal council challenge",
    "Formal representations",
    "Private operator appeal",
    "POPLA or IAS appeal preparation",
    "Landowner cancellation request",
    "Debt dispute response",
    "Evidence request",
    "Refund request",
    "Court or enforcement facts and evidence summary"
  ];

  return {
    noticeTypes,
    currentStages,
    jurisdictions,
    regions,
    whatHappened,
    requestedOutcomes,
    documentTypes,
    multiValueFields: ["noticeDocuments", "whatHappened", "potentialGrounds", "evidence", "requestedOutcomes", "documentTypes"]
  };
});
