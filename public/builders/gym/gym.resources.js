(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.QCBFGymResources = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const officialSources = [
    { label: "GOV.UK: Consumer rights", url: "https://www.gov.uk/consumer-protection-rights" },
    { label: "GOV.UK: Cancelling goods or services", url: "https://www.gov.uk/accepting-returns-and-giving-refunds" },
    { label: "Citizens Advice: Cancelling a service", url: "https://www.citizensadvice.org.uk/consumer/get-more-help/Solve-an-ongoing-consumer-problem/" },
    { label: "Financial Ombudsman Service: complaints about payments", url: "https://www.financial-ombudsman.org.uk/consumers/how-to-complain" },
    { label: "GOV.UK: Make a court claim or respond to a claim", url: "https://www.gov.uk/respond-money-claim" }
  ];

  function officialRoute(data) {
    const gym = data.gymName || "the gym or membership administrator";
    if (/debt|letter before|court/i.test([data.currentStage, data.whatHappened].flat().join(" "))) {
      return {
        method: "Review the formal document first",
        detail: "Use the gym or debt collector's stated dispute route, but court documents may require a separate official response process.",
        status: "Urgent legal boundary"
      };
    }
    return {
      method: "Gym cancellation or complaints route",
      detail: `Submit through ${gym}'s current cancellation email, portal, app or written complaints address shown in the contract or latest correspondence.`,
      status: "Check contract"
    };
  }

  return { officialSources, officialRoute };
});
