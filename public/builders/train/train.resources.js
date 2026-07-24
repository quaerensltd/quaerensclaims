"use strict";

(function(root, factory) {
  const resources = factory();
  if (typeof module === "object" && module.exports) module.exports = resources;
  root.QCBFTrain = root.QCBFTrain || {};
  root.QCBFTrain.resources = resources;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
  const checkedDate = "24 July 2026";

  const officialSources = [
    {
      title: "National Rail - Compensation and refunds",
      url: "https://www.nationalrail.co.uk/help-and-assistance/compensation-and-refunds/",
      rule: "National Rail explains that Delay Repay, refunds and complaints are separate routes and passengers should check the relevant operator or retailer process.",
      checkedDate,
      scheme: "Industry guidance",
      limitation: "Operator schemes and ticket rules can differ."
    },
    {
      title: "National Rail Conditions of Travel",
      url: "https://www.nationalrail.co.uk/travel-information/your-rights-and-obligations-as-a-passenger/",
      rule: "Current Conditions of Travel set out passenger contract terms, refund context and passenger responsibilities.",
      checkedDate,
      scheme: "National Rail Conditions",
      limitation: "Specific operator Passenger Charters may add scheme details."
    },
    {
      title: "Office of Rail and Road - Passenger information and complaints",
      url: "https://www.orr.gov.uk/monitoring-regulation/rail/passengers",
      rule: "ORR guidance explains passenger rights oversight and directs complaints through operators and relevant escalation routes.",
      checkedDate,
      scheme: "Regulatory guidance",
      limitation: "ORR does not decide every individual passenger complaint through this builder."
    },
    {
      title: "Rail Ombudsman - How to complain",
      url: "https://www.railombudsman.org/",
      rule: "Escalation may be available after the operator has had time to respond or a final/deadlock response has been issued, subject to current eligibility rules.",
      checkedDate,
      scheme: "Ombudsman escalation",
      limitation: "Eligibility and time limits must be checked against the current Ombudsman rules."
    },
    {
      title: "National Rail - Passenger Assist",
      url: "https://www.nationalrail.co.uk/help-and-assistance/passenger-assist/",
      rule: "Passenger Assist records can be relevant where accessibility support failed or affected the journey.",
      checkedDate,
      scheme: "Accessibility support",
      limitation: "Compensation or remedy depends on facts, evidence and operator response."
    }
  ];

  const operatorDirectory = [
    operator("avanti", "Avanti West Coast", "Delay Repay 15", 15, "https://www.avantiwestcoast.co.uk/help-and-support/delay-repay", "https://www.avantiwestcoast.co.uk/help-and-support/refunds", "https://www.avantiwestcoast.co.uk/help-and-support/contact-us", "https://www.avantiwestcoast.co.uk/help-and-support/passenger-charter"),
    operator("gwr", "Great Western Railway", "Delay Repay 15", 15, "https://www.gwr.com/help-and-support/refunds-and-compensation/delay-repay", "https://www.gwr.com/help-and-support/refunds-and-compensation/refunds", "https://www.gwr.com/help-and-support/contact-us", "https://www.gwr.com/about-gwr/our-business/passenger-charter"),
    operator("lner", "LNER", "Delay Repay 30", 30, "https://www.lner.co.uk/customer-service/refunds/delay-repay/", "https://www.lner.co.uk/customer-service/refunds/", "https://www.lner.co.uk/customer-service/contact-us/", "https://www.lner.co.uk/customer-service/passenger-charter/"),
    operator("northern", "Northern", "Delay Repay 15", 15, "https://www.northernrailway.co.uk/help/delay-repay", "https://www.northernrailway.co.uk/help/refunds", "https://www.northernrailway.co.uk/help/contact", "https://www.northernrailway.co.uk/about-us/passenger-charter"),
    operator("crosscountry", "CrossCountry", "Delay Repay 30", 30, "https://www.crosscountrytrains.co.uk/customer-service/delay-repay", "https://www.crosscountrytrains.co.uk/customer-service/refunds", "https://www.crosscountrytrains.co.uk/customer-service/contact-us", "https://www.crosscountrytrains.co.uk/customer-service/passenger-charter"),
    operator("emr", "East Midlands Railway", "Delay Repay 15", 15, "https://www.eastmidlandsrailway.co.uk/help-manage/about-delay-repay", "https://www.eastmidlandsrailway.co.uk/help-manage/manage/refunds", "https://www.eastmidlandsrailway.co.uk/help-manage/contact-us", "https://www.eastmidlandsrailway.co.uk/help-manage/about-us/passenger-charter"),
    operator("scotrail", "ScotRail", "Delay Repay 30", 30, "https://www.scotrail.co.uk/help-and-support/delay-repay", "https://www.scotrail.co.uk/help-and-support/refunds", "https://www.scotrail.co.uk/help-and-support/contact-us", "https://www.scotrail.co.uk/about-scotrail/passenger-charter"),
    operator("tfw", "Transport for Wales", "Delay Repay 15", 15, "https://tfw.wales/help-and-contact/rail/delay-repay", "https://tfw.wales/help-and-contact/rail/refunds", "https://tfw.wales/help-and-contact", "https://tfw.wales/about-us/customer/policies-and-reports/passenger-charter"),
    operator("swr", "South Western Railway", "Delay Repay 15", 15, "https://www.southwesternrailway.com/contact-and-help/refunds-and-compensation/delay-repay", "https://www.southwesternrailway.com/contact-and-help/refunds-and-compensation/refunds", "https://www.southwesternrailway.com/contact-and-help/contact-us", "https://www.southwesternrailway.com/other/about-us/passenger-charter"),
    operator("southeastern", "Southeastern", "Delay Repay 15", 15, "https://www.southeasternrailway.co.uk/help-and-contact/refunds-and-compensation/delay-repay", "https://www.southeasternrailway.co.uk/help-and-contact/refunds-and-compensation/refunds", "https://www.southeasternrailway.co.uk/help-and-contact/contact-us", "https://www.southeasternrailway.co.uk/about-us/passenger-charter"),
    operator("c2c", "c2c", "Delay Repay 2", 2, "https://www.c2c-online.co.uk/help-centre/refunds-compensation/delay-repay/", "https://www.c2c-online.co.uk/help-centre/refunds-compensation/refunds/", "https://www.c2c-online.co.uk/help-centre/contact-us/", "https://www.c2c-online.co.uk/about-us/our-passenger-charter/"),
    unverified("chiltern", "Chiltern Railways"),
    unverified("greater-anglia", "Greater Anglia"),
    unverified("merseyrail", "Merseyrail"),
    unverified("thameslink", "Thameslink"),
    unverified("southern", "Southern"),
    unverified("great-northern", "Great Northern"),
    unverified("gatwick-express", "Gatwick Express"),
    unverified("transpennine", "TransPennine Express"),
    unverified("west-midlands", "West Midlands Railway"),
    unverified("london-northwestern", "London Northwestern Railway"),
    unverified("hull-trains", "Hull Trains"),
    unverified("grand-central", "Grand Central"),
    unverified("caledonian-sleeper", "Caledonian Sleeper"),
    unverified("elizabeth-line", "Elizabeth line"),
    unverified("london-overground", "London Overground"),
    unverified("northern-ireland", "Northern Ireland Railways")
  ];

  function operator(id, name, schemeType, minimumDelay, delayRepayPage, refundPage, complaintPage, passengerCharter) {
    return {
      id,
      name,
      tradingName: name,
      schemeType,
      minimumQualifyingDelay: minimumDelay,
      singleTicketTreatment: "Cautious estimate based on recorded ticket price and verified scheme threshold.",
      returnTicketTreatment: "Return-ticket calculations vary by scheme. Review the operator's passenger charter before submitting.",
      seasonTicketTreatment: "Season-ticket and Flexi Season rules need operator-specific checking.",
      flexiSeasonTreatment: "Check the operator's current Flexi Season Delay Repay rules.",
      delayRepayPage,
      refundPage,
      complaintPage,
      passengerCharter,
      officialWebsite: new URL(delayRepayPage).origin,
      railOmbudsmanParticipation: "Check current Rail Ombudsman eligibility.",
      lastVerified: checkedDate,
      verified: true,
      sources: [delayRepayPage, refundPage, complaintPage, passengerCharter],
      cautionNotes: "Estimate only. Subject to operator investigation, ticket terms, journey data and evidence."
    };
  }

  function unverified(id, name) {
    return {
      id,
      name,
      tradingName: name,
      schemeType: "Check current operator scheme",
      minimumQualifyingDelay: null,
      delayRepayPage: "",
      refundPage: "",
      complaintPage: "",
      passengerCharter: "",
      officialWebsite: "",
      railOmbudsmanParticipation: "Check current Rail Ombudsman eligibility.",
      lastVerified: "",
      verified: false,
      sources: [],
      cautionNotes: "Check the operator's current official Delay Repay scheme before submitting."
    };
  }

  const operators = operatorDirectory.map(item => item.name);

  function operatorRecord(name) {
    const normal = String(name || "").trim().toLowerCase();
    return operatorDirectory.find(item => item.name.toLowerCase() === normal || item.id === normal) || unverified("unknown", name || "");
  }

  function buildResources() {
    return "OFFICIAL RAIL RESOURCES\n\n" + officialSources.map((source, index) => {
      return (index + 1) + ". " + source.title + "\n" + source.url + "\nRule/context: " + source.rule + "\nChecked: " + source.checkedDate + "\nScope: " + source.scheme + "\nLimitation: " + source.limitation;
    }).join("\n\n");
  }

  return { checkedDate, officialSources, operatorDirectory, operators, operatorRecord, buildResources };
});
