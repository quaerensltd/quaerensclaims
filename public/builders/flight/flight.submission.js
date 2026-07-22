"use strict";

(function(root, factory) {
  const submission = factory(root.QCBFFlight && root.QCBFFlight.analysis);
  if (typeof module === "object" && module.exports) module.exports = factory(require("./flight.analysis"));
  root.QCBFFlight = root.QCBFFlight || {};
  root.QCBFFlight.submission = submission;
})(typeof globalThis !== "undefined" ? globalThis : this, function(analysis) {
  const airlineDirectory = [
    { name: "British Airways", iata: "BA", legalName: "British Airways Plc", preferred: "Official Online Complaint Form", form: "https://www.britishairways.com/travel/customerportal/public/en_gb", website: "https://www.britishairways.com", verified: "Check current airline website before sending" },
    { name: "easyJet", iata: "U2", legalName: "easyJet Airline Company Limited", preferred: "Official Online Complaint Form", form: "https://www.easyjet.com/en/help/contact", website: "https://www.easyjet.com", verified: "Check current airline website before sending" },
    { name: "Ryanair", iata: "FR", legalName: "Ryanair DAC", preferred: "Official Online Complaint Form", form: "https://onlineform.ryanair.com/gb/en/eu-261", website: "https://www.ryanair.com", verified: "Check current airline website before sending" },
    { name: "Jet2", iata: "LS", legalName: "Jet2.com Limited", preferred: "Official Online Complaint Form", form: "https://www.jet2.com/contact-us", website: "https://www.jet2.com", verified: "Check current airline website before sending" },
    { name: "TUI Airways", iata: "BY", legalName: "TUI Airways Limited", preferred: "Official Online Complaint Form", form: "https://www.tui.co.uk/destinations/contact-us", website: "https://www.tui.co.uk", verified: "Check current airline website before sending" }
  ];

  function normalise(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  }

  function resolveAirline(data, records) {
    const selected = records && records.airline;
    const wanted = normalise((data && (data.operatingAirline || data.airline)) || "");
    const record = selected || airlineDirectory.find(item => wanted && (normalise(item.name).includes(wanted) || normalise(item.iata) === wanted || wanted.includes(normalise(item.name))));
    const name = (data && (data.operatingAirline || data.airline)) || (record && record.name) || "Airline not selected";
    return {
      status: record ? "matched" : "not-listed",
      name,
      legal: (record && record.legalName) || name,
      preferred: (record && record.preferred) || "Further review required",
      form: (record && record.form) || "",
      email: (record && record.email) || "",
      postal: (record && record.postal) || "",
      website: (record && record.website) || "",
      verified: (record && record.verified) || "Check current airline website before sending"
    };
  }

  function buildSubmissionInstructions(data, records) {
    const s = resolveAirline(data, records);
    return "QUAERENS SMART SUBMISSION™\n\nAIRLINE SUBMISSION DETAILS\n\nAirline: " + s.name + "\nOperating or legal entity where known: " + s.legal + "\nPreferred submission method: " + s.preferred + "\nOfficial complaint form: " + analysis.fallback(s.form, "Use the airline official website or current CAA guidance") + "\nComplaint email: " + analysis.fallback(s.email, "Not published in the local airline directory") + "\nPostal address: " + analysis.fallback(s.postal, "Not published in the local airline directory") + "\nOfficial website: " + analysis.fallback(s.website, "Not listed") + "\nLast verified: " + analysis.fallback(s.verified) + "\n\nHOW TO SUBMIT YOUR COMPLAINT\n\n1. Review your complaint letter and remove anything inaccurate.\n2. Attach the documents that support your journey and expenses.\n3. Use the airline official complaint form or published complaint route.\n4. If using an online form, copy the relevant wording from the plain text version.\n5. Save a copy before sending.\n6. Request acknowledgement where possible.\n7. Keep any reference number and proof of submission.\n8. Follow the airline published complaints process before escalating.";
  }

  return { airlineDirectory, resolveAirline, buildSubmissionInstructions };
});
