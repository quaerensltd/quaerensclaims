"use strict";

(function(root, factory) {
  const questions = factory();
  if (typeof module === "object" && module.exports) module.exports = questions;
  root.QCBFHoliday = root.QCBFHoliday || {};
  root.QCBFHoliday.questions = questions;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
  return {
    stages: [
      {
        id: "holiday",
        fields: ["holidayType", "packageSold", "bookingDate", "bookedDate", "travelStart", "travelEnd", "destination", "country", "travellers", "nights", "leadPassenger", "additionalTravellers"]
      },
      {
        id: "booking",
        fields: ["travelCompany", "travelAgent", "accommodationProvider", "bookingReference", "whoTookPayment", "whoIssuedConfirmation", "paymentMethod", "totalPrice", "currency", "amountPaid", "companyOther"]
      },
      {
        id: "problem",
        fields: ["accommodationName", "accommodationType", "advertisedStarRating", "roomTypeBooked", "boardBasis", "accessibilityRequirements", "facilitiesAdvertised", "keyPromises", "promiseSource", "complaintTypes", "problemDate", "problemEnd", "continuedWholeHoliday", "problemFixed", "alternativeOffered", "acceptedAlternative", "issueDetails"]
      },
      {
        id: "impact",
        fields: ["complaintDate", "reportedDuringHoliday", "complaintMethod", "complaintReference", "responseReceived", "remedyOffered", "remedyAccepted", "currentStatus", "timelineNotes"]
      },
      {
        id: "evidence",
        fields: ["evidence", "missingEvidence"]
      },
      {
        id: "outcome",
        fields: ["outcomes", "holidayPriceClaimed", "currencyLoss", "refundAlreadyReceived", "voucherReceived", "losses", "requestedOutcomeReason", "expenses"]
      }
    ],
    multiValueFields: ["facilitiesAdvertised", "promiseSource", "complaintTypes", "evidence", "outcomes"]
  };
});
