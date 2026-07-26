(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.QCBFCruiseQuestions = factory();
})(typeof self !== "undefined" ? self : this, function () {
  return {
    firstQuestion: "What happened with your cruise?",
    issueTypes: [
      "Cruise was cancelled",
      "Cruise was delayed",
      "Boarding or embarkation was refused",
      "Itinerary was changed before departure",
      "Port was missed or substituted",
      "Cabin was downgraded",
      "Cabin had defects or was not as described",
      "Onboard services or facilities were missing",
      "Illness, injury or medical concern arose",
      "Shore excursion problem",
      "Baggage or property problem",
      "Refund refused or delayed",
      "Future cruise credit dispute",
      "Complaint unanswered or rejected",
      "Urgent legal or court deadline"
    ],
    outcomes: [
      "Refund",
      "Partial refund",
      "Reimbursement of documented costs",
      "Review of future cruise credit",
      "Cabin downgrade review",
      "Clear written response",
      "Complaint escalation",
      "Evidence pack only",
      "Other fair outcome"
    ],
    organisations: [
      "Cruise line",
      "Travel agent",
      "Package organiser",
      "Excursion provider",
      "Travel insurer",
      "Card provider",
      "Finance provider",
      "Port agent",
      "Other"
    ],
    evidence: [
      "Booking confirmation",
      "ATOL or package paperwork",
      "Passenger names and ticket documents",
      "Cruise itinerary",
      "Cabin grade confirmation",
      "Cruise line messages",
      "Travel agent messages",
      "Photos or videos",
      "Receipts and replacement costs",
      "Medical or accessibility documents",
      "Complaint and final response",
      "Refund or future cruise credit terms",
      "Card or finance statements"
    ]
  };
});

