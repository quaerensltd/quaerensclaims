"use strict";

(function(root, factory) {
  const resources = factory();
  if (typeof module === "object" && module.exports) module.exports = resources;
  root.QCBFHoliday = root.QCBFHoliday || {};
  root.QCBFHoliday.resources = resources;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
  return {
    officialResources: [
      { label: "Package Travel and Linked Travel Arrangements Regulations 2018", url: "https://www.legislation.gov.uk/uksi/2018/634/contents" },
      { label: "Citizens Advice: holiday cancellations and compensation", url: "https://www.citizensadvice.org.uk/consumer/holiday-cancellations-and-compensation/" },
      { label: "Competition and Markets Authority: unfair contract terms", url: "https://www.gov.uk/guidance/unfair-contract-terms-cma37" }
    ],
    relatedRoutes: [
      "Travel Insurance Disputes",
      "Airbnb Refunds",
      "Flight Delay Compensation",
      "Complaint Letters",
      "Section 75 Support"
    ]
  };
});
