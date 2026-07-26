(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.QCBFGymContract = factory();
})(typeof self !== "undefined" ? self : this, function () {
  function contractReview(data) {
    const issues = Array.isArray(data.whatHappened) ? data.whatHappened : [data.whatHappened].filter(Boolean);
    const review = [];
    if (data.membershipType) review.push(`Membership type recorded as ${data.membershipType}.`);
    if (data.minimumTerm) review.push(`Minimum term recorded as ${data.minimumTerm}.`);
    if (data.noticePeriod) review.push(`Notice period recorded as ${data.noticePeriod}.`);
    if (data.cancellationMethod) review.push(`Cancellation method recorded as ${data.cancellationMethod}.`);
    if (issues.some((x) => /price/i.test(x))) review.push("Price-increase term and notice should be checked for transparency.");
    if (issues.some((x) => /facility|closed|moved/i.test(x))) review.push("Promised facilities should be compared with current availability using evidence.");
    if (issues.some((x) => /renew/i.test(x))) review.push("Automatic-renewal wording and renewal notice should be checked.");
    if (!review.length) review.push("Contract wording has not yet been recorded.");
    return review;
  }

  function fairnessReview(data) {
    const points = [];
    const joined = String(data.joiningMethod || "");
    if (/online|telephone|away|app/i.test(joined)) points.push("Distance or off-premises joining route may require cancellation-right information to be checked.");
    if (data.priceIncreaseAmount || data.newMonthlyFee) points.push("A recorded price increase may need checking against the contract term and notice given.");
    if (data.facilityChanged) points.push("A material facility or service change may need comparing with what was promised and what the contract allows.");
    if (data.automaticRenewalNotice === "No" || data.automaticRenewalNotice === "Unsure") points.push("Automatic-renewal transparency may need review.");
    if (data.cancellationRefusalReason) points.push("The refusal reason should be compared with the contract clause relied upon.");
    return points.length ? points : ["No specific fairness concern has been identified from the recorded answers yet."];
  }

  return { contractReview, fairnessReview };
});
