(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.QCBFGymQuestions = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const whatHappened = [
    "I want to cancel my membership",
    "The gym refused to cancel",
    "I have been charged after cancelling",
    "I am still within a cooling-off period",
    "I joined online, by telephone or away from the gym",
    "I cannot use the gym because of illness or injury",
    "I have moved home",
    "I have lost my job or my financial circumstances changed",
    "The gym increased the membership price",
    "The gym changed or removed important facilities",
    "The gym closed or moved location",
    "I was misled when joining",
    "The contract length was not explained clearly",
    "The cancellation terms were not explained",
    "The membership renewed automatically",
    "My membership was frozen but payments continued",
    "I disputed a Direct Debit or card payment",
    "I want a refund",
    "I am being chased for payment",
    "A debt collector has contacted me",
    "I received a Letter Before Claim",
    "I received court documents",
    "Another issue"
  ];

  const membershipTypes = [
    "Monthly rolling membership",
    "Fixed-term membership",
    "Annual membership",
    "Student membership",
    "Family membership",
    "Corporate membership",
    "Premium or multi-club membership",
    "Personal-training package",
    "Classes-only membership",
    "Health-club or leisure-club membership",
    "Online fitness subscription",
    "Sports-club membership",
    "Unknown"
  ];

  const joiningMethods = [
    "Joined at the gym",
    "Joined online",
    "Joined through an app",
    "Joined by telephone",
    "Joined at a promotional stand",
    "Joined at work",
    "Joined away from business premises",
    "Joined through a third-party salesperson",
    "Upgraded an existing membership",
    "Renewed automatically",
    "Unsure"
  ];

  const evidence = [
    "Signed contract or digital terms",
    "Welcome email or membership confirmation",
    "Key facts or membership summary",
    "Direct Debit mandate or recurring-card authority",
    "App screenshots",
    "Cancellation policy",
    "Freeze policy",
    "Promotional material",
    "Salesperson messages",
    "Cancellation request",
    "Cancellation acknowledgement",
    "Gym refusal or final response",
    "Payment receipts or bank statements",
    "Price increase notice",
    "Facility closure or service-change evidence",
    "Debt collector or Letter Before Claim paperwork",
    "Timeline of what happened",
    "No documents yet"
  ];

  const requestedOutcomes = [
    "Cancel the membership",
    "Confirm the final cancellation date",
    "Stop future payments after the effective date",
    "Refund payments taken after cancellation",
    "Refund duplicate or disputed charges",
    "Waive an early-termination charge",
    "Freeze the membership",
    "Reduce or explain the balance demanded",
    "Provide contract and payment records",
    "Withdraw debt collection while the dispute is reviewed",
    "Provide a final written response",
    "Other"
  ];

  return { whatHappened, membershipTypes, joiningMethods, evidence, requestedOutcomes };
});
