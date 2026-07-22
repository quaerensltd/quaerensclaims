"use strict";

(function(root, factory) {
  const resources = factory();
  if (typeof module === "object" && module.exports) module.exports = resources;
  root.QCBFFlight = root.QCBFFlight || {};
  root.QCBFFlight.resources = resources;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
  const officialResources = [
    ["UK Civil Aviation Authority passenger rights", "https://www.caa.co.uk/passengers/resolving-travel-problems/how-the-caa-can-help/"],
    ["UK CAA airline complaints and ADR", "https://www.caa.co.uk/passengers/resolving-travel-problems/how-to-complain/"],
    ["UK legislation: Regulation 261 as retained", "https://www.legislation.gov.uk/eur/2004/261/contents"],
    ["European Commission passenger rights", "https://transport.ec.europa.eu/transport-themes/passenger-rights/air_en"]
  ];

  function buildResources() {
    return "Official Resources\n\n" + officialResources.map((item, index) => (index + 1) + ". " + item[0] + "\n   " + item[1]).join("\n\n") + "\n\nCheck official sources before sending or escalating a complaint because airline routes and passenger-rights guidance can change.";
  }

  return { officialResources, buildResources };
});
