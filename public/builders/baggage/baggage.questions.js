"use strict";

(function(root, factory) {
  const questions = factory();
  if (typeof module === "object" && module.exports) module.exports = questions;
  root.QCBFBaggage = root.QCBFBaggage || {};
  root.QCBFBaggage.questions = questions;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
  return {
    multiValueFields: ["baggageIssues", "bagContents", "evidence", "requestedOutcomes"],
    stages: [
      { id: "journey", fields: ["leadPassenger", "additionalPassengers", "email", "telephone", "address", "bookingReference", "ticketNumber", "flightNumber", "operatingAirline", "airline", "departureAirport", "arrivalAirport", "connectingAirports", "travelDate", "arrivalDate", "journeyDirection", "finalDestination", "travelReason", "passengerCount", "checkedBags"] },
      { id: "baggage", fields: ["baggageTag", "bagDescription", "bagBrand", "bagColour", "bagSize", "distinctiveFeatures", "bagShell", "lockFitted", "bagPassenger", "bagsAffected", "checkedThrough", "connectionJourney", "differentAirlines", "bagContents"] },
      { id: "problem", fields: ["baggageIssues", "expectedDateTime", "deliveredDateTime", "delayedDays", "deliveryLocation", "awayFromHome", "essentialsPurchased", "deliveryPromised", "trackingUpdates", "lostDeclared", "daysOutstanding", "contentsInventory", "damageDescription", "damageExistedBefore", "airlineInspected", "repairOffered", "bagUsable", "missingDiscovered", "tamperingVisible", "policeReport", "mobilityImpact", "medicalConsequences", "problemDetails"] },
      { id: "report", fields: ["reportedAtAirport", "pirCompleted", "pirReference", "airportBaggageDesk", "groundHandler", "reportedDate", "reportedTime", "reportedTo", "writtenReport", "trackingReference", "worldTracer", "airlineContactDate", "complaintDate", "complaintReference", "airlineResponse", "offerMade", "paymentMade", "rejectionReason"] },
      { id: "losses", fields: ["currency", "insuranceHeld", "insuranceClaimMade", "insurancePaid", "insuranceCovered", "insuranceExcess", "insurerNeedsAirlineResponse", "financialItems"] },
      { id: "evidence", fields: ["evidence", "missingEvidence", "timelineNotes"] },
      { id: "outcome", fields: ["requestedOutcomes", "amountRequested", "outcomeBasis", "paymentsReceived", "outstandingAmount", "responseRequestedBy"] }
    ]
  };
});
