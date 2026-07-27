(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.QCBFCruiseResources = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const officialSources = [
    {
      label: "Package Travel and Linked Travel Arrangements Regulations 2018",
      issuingBody: "UK legislation",
      subject: "Package holiday organiser duties and traveller rights",
      jurisdiction: "United Kingdom",
      officialUrl: "https://www.legislation.gov.uk/uksi/2018/634/contents",
      lastVerified: "2026-07-27",
      limitation: "Whether a cruise is a package depends on the booking documents and parties involved."
    },
    {
      label: "Consumer Rights Act 2015",
      issuingBody: "UK legislation",
      subject: "Consumer services and digital/content contract context",
      jurisdiction: "United Kingdom",
      officialUrl: "https://www.legislation.gov.uk/ukpga/2015/15/contents",
      lastVerified: "2026-07-27",
      limitation: "The Act does not create an automatic fixed cruise compensation tariff."
    },
    {
      label: "Maritime passenger rights Regulation 1177/2010",
      issuingBody: "Retained/EU maritime passenger rights legislation",
      subject: "Passenger rights for certain sea and inland waterway services",
      jurisdiction: "UK/EU context",
      officialUrl: "https://www.legislation.gov.uk/eur/2010/1177/contents",
      lastVerified: "2026-07-27",
      limitation: "Application can depend on the service, port, operator and circumstances."
    },
    {
      label: "ABTA help and complaints",
      issuingBody: "ABTA",
      subject: "Travel complaint guidance and ABTA member routes",
      jurisdiction: "United Kingdom",
      officialUrl: "https://www.abta.com/help-and-complaints",
      lastVerified: "2026-07-27",
      limitation: "ABTA routes depend on membership and the booking party."
    },
    {
      label: "Citizens Advice consumer guidance",
      issuingBody: "Citizens Advice",
      subject: "General consumer complaint guidance",
      jurisdiction: "England and Wales consumer guidance",
      officialUrl: "https://www.citizensadvice.org.uk/consumer/",
      lastVerified: "2026-07-27",
      limitation: "General guidance only; individual travel facts still matter."
    },
    {
      label: "Financial Ombudsman Service - how to complain",
      issuingBody: "Financial Ombudsman Service",
      subject: "Complaints about regulated financial firms",
      jurisdiction: "United Kingdom",
      officialUrl: "https://www.financial-ombudsman.org.uk/consumers/how-to-complain",
      lastVerified: "2026-07-27",
      limitation: "Only relevant where a financial business is involved."
    }
  ];

  function route(data, analysis) {
    const issue = analysis.issueType || "";
    const bookingType = String(data.bookingType || "");
    const paymentRoute = String(data.paymentRoute || "");
    const excursionBookedBy = String(data.excursionBookedBy || "");
    const outcomeText = Array.isArray(data.requestedOutcomes) ? data.requestedOutcomes.join(" ") : String(data.requestedOutcomes || "");
    const urgentContext = [
      issue,
      data.urgentNotes,
      data.deadlineNotes,
      data.medicalNotes,
      data.injuryNotes,
      data.crimeNotes,
      data.courtNotes
    ].filter(Boolean).join(" ");
    const cards = [];
    let primary = "Cruise line complaint route";
    let responsiblePartyNote = "The cruise line is the likely starting point, unless your booking documents show that a package organiser, travel agent, insurer, card provider or finance firm is responsible for the issue.";
    let smartSubmissionMethod = "Use the cruise line's official complaint channel or the contact method stated in the booking documents.";
    let urgentBoundary = false;

    if (/court|urgent|legal|letter before claim|serious injury|medical|crime|deadline/i.test(urgentContext)) {
      urgentBoundary = true;
      primary = "Urgent boundary check";
      responsiblePartyNote = "A formal deadline, court document, serious injury, medical incident or crime-related issue should not be treated as ordinary complaint wording.";
      smartSubmissionMethod = "Pause before sending and check the formal deadline or specialist route.";
      cards.push("Check any formal document, limitation date, insurer requirement or court deadline before using a self-service pack.");
    }

    if (!urgentBoundary && /package|fly-cruise|agent|organiser/i.test(bookingType)) {
      primary = "Package organiser or travel agent route";
      responsiblePartyNote = "Where the booking is a package or was arranged through a travel agent, the organiser or agent may need to be included before or alongside the cruise line.";
      smartSubmissionMethod = "Start with the organiser or agent named on the booking confirmation, then copy the cruise line if the paperwork supports that.";
      cards.push("Review the booking confirmation, ATOL/package documents, invoice and terms to identify the contracting party.");
    }

    if (/direct|cruise-only/i.test(bookingType)) {
      cards.push("For a direct or cruise-only booking, the cruise line complaint route is usually the clearest starting point.");
    }

    if (/card|credit|finance|section 75/i.test(paymentRoute) || /card|finance/i.test(bookingType)) {
      cards.push("A card, Section 75 or finance-provider complaint may need a separate evidence route if payment or credit was involved.");
    }

    if (/insurance/i.test(outcomeText + " " + paymentRoute)) {
      cards.push("Travel insurance may be relevant for insured losses, but policy wording and exclusions need checking.");
    }

    if (/independent/i.test(excursionBookedBy)) {
      cards.push("Independent shore excursions should be separated from cruise-line or package complaints.");
    } else if (/cruise|agent|organiser/i.test(excursionBookedBy)) {
      cards.push("Cruise-line, organiser or agent-booked excursions can be reviewed with the main booking evidence.");
    }

    if (/unsure/i.test(bookingType) || (!bookingType && !data.cruiseLine && !data.organiserName)) {
      responsiblePartyNote = "The responsible organisation has not yet been confirmed. Check the booking confirmation, invoice and applicable terms before submitting.";
      smartSubmissionMethod = "Identify the contracting party before sending the pack.";
      cards.push(responsiblePartyNote);
    }

    return {
      primary,
      responsiblePartyNote,
      smartSubmissionMethod,
      cards: Array.from(new Set(cards)),
      caution: "Route guidance is evidence-led and preliminary. It does not decide liability or guarantee a refund, compensation, reimbursement or outcome.",
      sourceLabels: officialSources.map((source) => source.label)
    };
  }

  return { officialSources, route };
});
