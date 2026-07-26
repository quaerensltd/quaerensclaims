(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.QCBFCruiseResources = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const officialSources = [
    { label: "Package Travel and Linked Travel Arrangements Regulations 2018", url: "https://www.legislation.gov.uk/uksi/2018/634/contents" },
    { label: "Consumer Rights Act 2015", url: "https://www.legislation.gov.uk/ukpga/2015/15/contents" },
    { label: "Maritime passenger rights Regulation 1177/2010", url: "https://www.legislation.gov.uk/eur/2010/1177/contents" },
    { label: "ABTA complaints guidance", url: "https://www.abta.com/help-and-complaints" },
    { label: "Citizens Advice consumer guidance", url: "https://www.citizensadvice.org.uk/consumer/" },
    { label: "Financial Ombudsman Service - how to complain", url: "https://www.financial-ombudsman.org.uk/consumers/how-to-complain" }
  ];

  function route(data, analysis) {
    const issue = analysis.issueType || "";
    if (/court|urgent|legal/i.test(issue)) return "Urgent boundary - check any formal document, deadline or court process separately.";
    if (/finance|card|section 75/i.test(String(data.paymentRoute || ""))) return "Finance or card provider route may need review alongside the cruise complaint.";
    if (/package|agent|organiser/i.test(String(data.bookingType || ""))) return "Package organiser or travel agent complaint route may be relevant.";
    return "Cruise line complaint route is the likely starting point, supported by the booking, itinerary, evidence and financial schedule.";
  }

  return { officialSources, route };
});

