"use strict";

(function(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.QCBFParking = root.QCBFParking || {};
  root.QCBFParking.resources = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
  const officialSources = [
    { name: "GOV.UK: Parking tickets", url: "https://www.gov.uk/parking-tickets", verified: "2026-07" },
    { name: "Traffic Penalty Tribunal", url: "https://www.trafficpenaltytribunal.gov.uk/", verified: "2026-07" },
    { name: "London Tribunals", url: "https://www.londontribunals.gov.uk/", verified: "2026-07" },
    { name: "POPLA", url: "https://www.popla.co.uk/", verified: "2026-07" },
    { name: "IAS", url: "https://www.theias.org/", verified: "2026-07" },
    { name: "British Parking Association", url: "https://www.britishparking.co.uk/", verified: "2026-07" },
    { name: "International Parking Community", url: "https://theipc.info/", verified: "2026-07" },
    { name: "GOV.UK: Blue Badge scheme", url: "https://www.gov.uk/blue-badge-scheme-information-council", verified: "2026-07" },
    { name: "Protection of Freedoms Act 2012 Schedule 4", url: "https://www.legislation.gov.uk/ukpga/2012/9/schedule/4", verified: "2026-07" },
    { name: "Money Claim Online guidance", url: "https://www.gov.uk/make-court-claim-for-money", verified: "2026-07" }
  ];

  const operatorHints = [
    { pattern: /parkingeye/i, name: "ParkingEye", method: "Use the appeal route shown on the ParkingEye notice." },
    { pattern: /euro car parks/i, name: "Euro Car Parks", method: "Use the operator portal or postal route printed on the notice." },
    { pattern: /apcoa/i, name: "APCOA", method: "Use the official APCOA appeal route shown on the notice." },
    { pattern: /ncp/i, name: "NCP", method: "Use the NCP appeal or customer service route shown on the notice." },
    { pattern: /ukpc/i, name: "UKPC", method: "Use the UKPC appeal route printed on the charge notice." },
    { pattern: /horizon/i, name: "Horizon Parking", method: "Use the Horizon Parking appeal route printed on the notice." },
    { pattern: /smart parking/i, name: "Smart Parking", method: "Use the Smart Parking appeal route printed on the notice." },
    { pattern: /civil enforcement/i, name: "Civil Enforcement", method: "Use the route and deadline printed on the notice." },
    { pattern: /excel|vehicle control services|vcs/i, name: "Excel/VCS", method: "Use the operator appeal route and keep copies of every submission." }
  ];

  function operatorRoute(data) {
    const name = data.issuerName || "";
    const matched = operatorHints.find(item => item.pattern.test(name));
    if (matched) return matched;
    if (/council|local authority|borough|county|city/i.test(name) || /Council|local authority|TfL|Notice to Owner/i.test([data.noticeType, data.issuerCategory].join(" "))) {
      return { name: data.issuerName || "Council or public authority", method: "Use the official online, postal or email route printed on the PCN or Notice to Owner." };
    }
    if (/transport for london|tfl/i.test(name)) {
      return { name: "Transport for London", method: "Use the TfL PCN challenge route printed on the notice." };
    }
    return { name: data.issuerName || "Issuer not recorded", method: "Use the official route printed on the notice. Do not rely on an unverified third-party address." };
  }

  return { officialSources, operatorHints, operatorRoute };
});
