"use strict";

(function(root, factory) {
  const resources = factory();
  if (typeof module === "object" && module.exports) module.exports = resources;
  root.QCBFBaggage = root.QCBFBaggage || {};
  root.QCBFBaggage.resources = resources;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
  const officialResources = [
    {
      title: "Civil Aviation Authority: baggage problems",
      url: "https://www.caa.co.uk/passengers/resolving-travel-problems/baggage-problems/",
      note: "UK passenger guidance on delayed, lost and damaged baggage."
    },
    {
      title: "Montreal Convention 1999",
      url: "https://www.legislation.gov.uk/uksi/2002/263/made",
      note: "UK implementation materials for international carriage by air."
    },
    {
      title: "ICAO: passenger and baggage liability limits",
      url: "https://www.icao.int/secretariat/legal/Administrative%20Packages/mtl99_en.pdf",
      note: "Convention text and liability framework. Check current official limits before relying on figures."
    },
    {
      title: "Aviation ADR information",
      url: "https://www.caa.co.uk/passengers/resolving-travel-problems/how-the-caa-can-help/alternative-dispute-resolution/",
      note: "How airline ADR routes may work where the airline participates."
    }
  ];

  const airlineRoutes = {
    "British Airways": { method: "Official baggage claim form", page: "https://www.britishairways.com/travel/feedbackclaims/public/en_gb/select" },
    "easyJet": { method: "Official baggage claim route", page: "https://www.easyjet.com/en/help/baggage/damaged-delayed-or-lost-luggage" },
    "Ryanair": { method: "Official baggage claim route", page: "https://help.ryanair.com/hc/en-gb/categories/12503115297169-Bag" },
    "TUI Airways": { method: "Official baggage claim route", page: "https://www.tui.co.uk/destinations/contact-us/after-travel" },
    "Jet2": { method: "Official baggage claim route", page: "https://www.jet2.com/faqs?topic=baggage-and-sports-equipment" },
    "KLM": { method: "Official baggage claim route", page: "https://www.klm.co.uk/information/baggage/lost-baggage" },
    "Lufthansa": { method: "Official baggage claim route", page: "https://www.lufthansa.com/gb/en/baggage-irregularities" },
    "Air France": { method: "Official baggage claim route", page: "https://wwws.airfrance.co.uk/information/bagages/bagage-manquant-airfrance" },
    "Wizz Air": { method: "Official baggage claim route", page: "https://wizzair.com/en-gb/information-and-services/travel-information/baggage" },
    "Emirates": { method: "Official baggage claim route", page: "https://www.emirates.com/uk/english/help/forms/baggage-claim/" }
  };

  function routeForAirline(airline) {
    const match = Object.keys(airlineRoutes).find(name => String(airline || "").toLowerCase().includes(name.toLowerCase()));
    if (!match) {
      return {
        method: "Check the airline's current official website before sending",
        page: "",
        verified: false
      };
    }
    return Object.assign({ verified: true }, airlineRoutes[match]);
  }

  function buildResources() {
    return "OFFICIAL RESOURCES\n\n" + officialResources.map((item, index) => (index + 1) + ". " + item.title + "\n" + item.url + "\n" + item.note).join("\n\n") + "\n\nImportant: official guidance and airline procedures can change. Check the current airline page before sending.";
  }

  return { officialResources, airlineRoutes, routeForAirline, buildResources };
});
