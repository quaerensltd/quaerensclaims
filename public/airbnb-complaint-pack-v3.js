(function () {
  "use strict";

  function initialiseComplaintPack(root) {
  const builderId = root.dataset.qcbBuilder;
  const category = window.QCBFrameworkACategories && window.QCBFrameworkACategories.get(builderId);
  if (!category) throw new Error(`Unsupported Framework A category: ${builderId}`);
  const layoutProfile = category.layoutProfile || "standard";
  if (!["standard", "complex"].includes(layoutProfile)) throw new Error(`Unsupported Framework A layout profile: ${layoutProfile}`);
  root.dataset.qcbLayoutProfile = layoutProfile;
  const isSection75 = builderId === "section75";
  const isHoliday = builderId === "holiday";
  const isFlight = builderId === "flight";
  const isBaggage = builderId === "baggage";
  const adapterRegistry = window.QCBFrameworkACategoryAdapters;
  const adapter = category.adapter ? adapterRegistry && adapterRegistry.get(category.id) : null;
  if (category.adapter && !adapter) throw new Error(`Missing allow-listed Framework A adapter: ${category.id}`);

  const form = root.querySelector(".qcb-form");
  const $ = (selector) => root.querySelector(selector);
  const $$ = (selector) => Array.from(root.querySelectorAll(selector));
  const STORAGE_KEY = category.storageKey;
  const evidenceItems = category.evidence;
  let step = 1;
  let timeline = [];
  let losses = [];
  let evidence = {};
  let previewTimer;
  const MAX_STEP = root.querySelectorAll("[data-qcb-step]").length;

  const esc = (value) => String(value == null ? "" : value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  const text = (value, fallback = "Not provided") => String(value || "").trim() || fallback;
  const money = (value) => `£${(Number(value) || 0).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const date = (value) => {
    if (!value) return "Not provided";
    const parsed = new Date(`${value}T12:00:00`);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  };
  const slugDate = () => new Date().toISOString().slice(0, 10);
  const fields = () => Object.fromEntries(new FormData(form).entries());
  const checked = (name) => $$(`input[name="${name}"]:checked`).map((input) => input.value);
  const applicantName = (f) => [f.applicantTitle, f.applicantFirstName, f.applicantLastName].filter(Boolean).join(" ") || "Applicant";
  const jointName = (f) => f.jointComplaint === "yes" ? [f.jointTitle, f.jointFirstName, f.jointLastName].filter(Boolean).join(" ") : "";
  const applicantNames = (f) => [applicantName(f), jointName(f)].filter(Boolean).join(" and ");
  const applicantAddress = (f) => [f.applicantAddress1, f.applicantAddress2, f.applicantCity, f.applicantCounty, f.applicantPostcode, f.applicantCountry].filter(Boolean).join("\n");
  const declaration = "I confirm that the information contained in this Complaint Pack is true and accurate to the best of my knowledge.";

  function caseData() {
    const f = fields();
    const basePrice = f[category.baseAmount];
    const bookingPosition = Math.max(0, (Number(basePrice) || 0) - (category.deductRefund === false ? 0 : (Number(f.refundReceived) || 0)));
    const statedOutstanding = Number(f[category.outstandingAmount]) || 0;
    const extra = losses.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
    const available = evidenceItems.filter(([key]) => evidence[key] === "available").length;
    const relevant = evidenceItems.filter(([key]) => evidence[key] !== "na").length;
    const score = relevant ? Math.round((available / relevant) * 100) : 0;
    const data = {
      f,
      issues: checked("issue"),
      routes: checked("route"),
      timeline: [...timeline].sort((a, b) => String(a.date).localeCompare(String(b.date))),
      losses: [...losses], evidence: { ...evidence }, score,
      bookingPosition, extra, total: (statedOutstanding || bookingPosition) + extra,
      metadata: { frameworkVersion: window.QCBFrameworkACategories.version, complaintPackReference: f.complaintPackReference, applicantDetails: { title: f.applicantTitle, firstName: f.applicantFirstName, lastName: f.applicantLastName, addressLine1: f.applicantAddress1, addressLine2: f.applicantAddress2, city: f.applicantCity, county: f.applicantCounty, postcode: f.applicantPostcode, country: f.applicantCountry, email: f.applicantEmail, telephone: f.applicantTelephone, preferredContact: f.preferredContact, jointComplaint: f.jointComplaint === "yes", jointApplicant: f.jointComplaint === "yes" ? { title: f.jointTitle, firstName: f.jointFirstName, lastName: f.jointLastName, email: f.jointEmail, telephone: f.jointTelephone, address: f.jointAddressDifferent === "yes" ? f.jointAddress : "Same as primary applicant" } : null } }
    };
    if (adapter && adapter.deriveFinancials) Object.assign(data, adapter.deriveFinancials(data, adapterContext()));
    return data;
  }

  function adapterContext() {
    return Object.freeze({ esc, text, money, date, rowTable, summaryGrid, applicantNames, applicantAddress, declaration, category });
  }

  function qualityScore(d) {
    if (adapter && adapter.quality) return Math.max(0, Math.min(100, Number(adapter.quality(d, adapterContext())) || 0));
    const completedTimeline = d.timeline.filter((row) => row.date && row.description).length;
    const supportedLosses = d.losses.filter((row) => row.description && Number(row.amount) > 0 && row.evidence).length;
    const checks = isBaggage ? [
      [Boolean(d.f.airline), 8], [Boolean(d.f.bookingReference && d.f.travelDate), 8],
      [Boolean(d.f.flightNumber && d.f.baggageTag), 7], [Boolean(d.f.departureAirport && d.f.arrivalAirport), 6],
      [d.issues.length > 0, 10], [Boolean(d.f.problemDetails), 10], [completedTimeline > 0, 8],
      [d.score >= 40, 8], [d.score >= 70, 7], [Boolean(d.f.pirReference || d.f.trackingReference), 7],
      [Boolean(d.f.requestedOutcome), 7], [d.routes.length > 0, 5],
      [d.losses.every((row) => !row.description || supportedLosses > 0), 5], [Boolean(d.f.airlineResponse || d.f.complaintDate), 4]
    ] : isFlight ? [
      [Boolean(d.f.airline), 8], [Boolean(d.f.flightNumber && d.f.flightDate), 9],
      [Boolean(d.f.departureAirport && d.f.arrivalAirport), 8], [Boolean(d.f.scheduledArrival && d.f.actualArrival), 9],
      [d.issues.length > 0, 10], [Boolean(d.f.actual), 10], [completedTimeline > 0, 8],
      [d.score >= 40, 8], [d.score >= 70, 7], [Boolean(d.f.reasonProvided || d.f.airlineResponse), 5],
      [Boolean(d.f.requestedOutcome), 7], [d.routes.length > 0, 5],
      [d.losses.every((row) => !row.description || supportedLosses > 0), 6]
    ] : isSection75 ? [
      [Boolean(d.f.supplierName), 7], [Boolean(d.f.cardProvider), 7],
      [Boolean(d.f.purchaseDate && d.f.purchasePrice), 8], [Boolean(d.f.cardType), 5],
      [d.issues.length > 0, 10], [Boolean(d.f.promised && d.f.actual), 12],
      [completedTimeline > 0, 8], [d.score >= 40, 8], [d.score >= 70, 7],
      [Boolean(d.f.supplierResponse || d.f.cardProviderResponse), 6],
      [Boolean(d.f.requestedOutcome), 8], [d.routes.length > 0, 5],
      [d.losses.every((row) => !row.description || supportedLosses > 0), 4],
      [Boolean(d.f.cashPriceConfirmed), 5]
    ] : isHoliday ? [
      [Boolean(d.f.holidayCompany), 8], [Boolean(d.f.bookingRef), 7],
      [Boolean(d.f.holidayType && d.f.destination), 7], [Boolean(d.f.travelDate && d.f.returnDate), 6],
      [d.issues.length > 0, 10], [Boolean(d.f.promised && d.f.actual), 12],
      [completedTimeline > 0, 9], [d.score >= 40, 8], [d.score >= 70, 7],
      [Boolean(d.f.supplierResponse), 6], [Boolean(d.f.requestedOutcome), 8],
      [d.routes.length > 0, 5], [d.losses.every((row) => !row.description || supportedLosses > 0), 4],
      [Boolean(d.f.holidayPrice), 3]
    ] : [
      [Boolean(d.f.bookingRef), 10], [Boolean(d.f.propertyName), 7],
      [Boolean(d.f.checkIn && d.f.checkOut), 8], [d.issues.length > 0, 10],
      [Boolean(d.f.issueDetails), 12], [completedTimeline > 0, 10],
      [d.score >= 40, 10], [d.score >= 70, 8],
      [Boolean(d.f.hostResponse || d.f.airbnbResponse), 7],
      [Boolean(d.f.requestedOutcome), 8], [d.routes.length > 0, 5],
      [d.losses.every((row) => !row.description || supportedLosses > 0), 5]
    ];
    return checks.reduce((total, [passed, weight]) => total + (passed ? weight : 0), 0);
  }

  function qualityLabel(score) {
    if (score >= 85) return "Ready for a final accuracy review before submission.";
    if (score >= 65) return "Well organised, with a small number of details still worth strengthening.";
    if (score >= 40) return "A sound foundation is in place; complete the remaining evidence and chronology.";
    return "Complete the core case details to improve pack quality.";
  }

  function eligibilityResult(d) {
    if (!isSection75) return { label: "Not assessed", summary: "" };
    const f = d.f;
    const creditCard = f.cardType === "Personal credit card" || f.cardType === "Credit card — unsure of type";
    const price = Number(f.purchasePrice) || 0;
    const priceInTypicalRange = price >= 100 && price <= 30000;
    const supplierLink = f.supplierRelationship === "Paid supplier directly" || f.supplierRelationship === "Supplier-arranged payment";
    if (creditCard && priceInTypicalRange && supplierLink) return { label: "Potentially within the usual Section 75 route", summary: "The recorded payment type, cash price and supplier relationship indicate that Section 75 may be relevant, but eligibility is not confirmed and must be assessed against the complete facts." };
    if (f.cardType && f.purchasePrice && f.supplierRelationship) return { label: "Further eligibility review needed", summary: "One or more recorded facts may complicate Section 75 eligibility. Check the credit arrangement, cash price and debtor-creditor-supplier relationship before relying on this route." };
    return { label: "Insufficient information to assess", summary: "The builder cannot yet indicate whether Section 75 may be relevant because key payment, cash-price or supplier-relationship facts are missing." };
  }

  function executiveSummary(d) {
    if (adapter && adapter.analysis) return adapter.analysis(d, adapterContext());
    if (isBaggage) {
      const issues = d.issues.length ? d.issues.join(", ").toLowerCase() : "the recorded baggage disruption";
      const evidenceAssessment = d.score >= 70 ? "The baggage records are well organised" : d.score >= 40 ? "The available records provide a useful foundation, with missing items identified in the evidence schedule" : "Further baggage tags, airport reports, tracing records, receipts or correspondence would materially improve the file";
      return `This prepared complaint concerns ${issues} following travel with ${text(d.f.airline, "the recorded airline")} on flight ${text(d.f.flightNumber)} on ${date(d.f.travelDate)}. ${evidenceAssessment}. The recorded financial position is ${money(d.total)}, subject to receipts, proof of value, insurance payments and any airline payment. The Montreal Convention may provide a liability framework but does not create a fixed tariff or guaranteed outcome.`;
    }
    if (isFlight) {
      const issues = d.issues.length ? d.issues.join(", ").toLowerCase() : "the recorded flight disruption";
      const amount = d.bookingPosition ? `Possible statutory compensation guidance is ${money(d.bookingPosition)}, shown separately from ${money(d.extra)} of additional recorded expenses.` : `No statutory compensation amount is shown without sufficient route, timing and disruption data; additional recorded expenses are ${money(d.extra)}.`;
      return `This prepared complaint concerns ${issues} involving flight ${text(d.f.flightNumber)} operated by ${text(d.f.airline)} on ${date(d.f.flightDate)}. Evidence readiness is ${d.score}%. ${amount} These figures are organisational guidance only and do not guarantee UK261 or EC261 entitlement, reimbursement or outcome.`;
    }
    if (isSection75) {
      const issuePhrase = d.issues.length ? d.issues.map((issue) => issue.toLowerCase()).join(", ") : "the purchase concerns recorded in this file";
      const evidenceAssessment = d.score >= 70 ? "The available records are well organised and provide a strong documentary foundation" : d.score >= 40 ? "The available records provide a useful foundation, although the missing items in the evidence schedule should be obtained where possible" : "Further payment, contract and complaint records would materially improve the presentation";
      const financialAssessment = d.total > 0 ? `The current estimated financial exposure is ${money(d.total)}, subject to verification against statements, invoices, receipts and any refund already received.` : "The financial schedule should be completed and checked against the underlying payment records.";
      return `This prepared complaint concerns a purchase from ${text(d.f.supplierName, "the recorded supplier")} and ${issuePhrase}. ${evidenceAssessment}. ${eligibilityResult(d).summary} ${financialAssessment} This is organisational guidance only: Section 75 eligibility and the outcome remain for the card provider or other appropriate decision-maker to determine.`;
    }
    if (isHoliday) {
      const issuePhrase = d.issues.length ? d.issues.map((issue) => issue.toLowerCase()).join(", ") : "the holiday concerns recorded in this file";
      const evidenceAssessment = d.score >= 70 ? "The supporting holiday records are well organised and provide a strong documentary foundation" : d.score >= 40 ? "The available records provide a useful foundation, although the missing evidence should be obtained where possible" : "Further booking, photographic, medical, receipt or correspondence evidence would materially improve the presentation";
      const timelineAssessment = d.timeline.filter((row) => row.date && row.description).length > 1 ? "The chronology presents the material events in a clear sequence" : "The chronology would benefit from further dated entries before submission";
      const financialAssessment = d.total > 0 ? `The estimated financial exposure is ${money(d.total)}, subject to verification against invoices, receipts and any refund already received.` : "The financial schedule should be completed and checked against the underlying booking and expense records.";
      return `This prepared complaint concerns ${text(d.f.holidayType, "a holiday booking")} with ${text(d.f.holidayCompany, "the recorded holiday company")} and ${issuePhrase}. ${evidenceAssessment}. ${timelineAssessment}. ${financialAssessment} The file organises the consumer's account and does not determine legal entitlement or guarantee an outcome.`;
    }
    const issuePhrase = d.issues.length ? d.issues.map((issue) => issue.toLowerCase()).join(", ") : "the concerns recorded in this file";
    const evidenceAssessment = d.score >= 70 ? "The supporting material appears well organised and provides a strong documentary foundation" : d.score >= 40 ? "The available material provides a useful foundation, although the missing items identified in the evidence schedule should be obtained where possible" : "The complaint is capable of being organised, but further supporting records would materially improve the presentation";
    const timelineAssessment = d.timeline.filter((row) => row.date && row.description).length > 1 ? "The chronology presents the relevant events in a clear sequence" : "The chronology would benefit from further dated entries before the file is submitted";
    const financialAssessment = d.total > 0 ? `The current financial exposure is recorded at ${money(d.total)}, subject to verification against the supporting receipts and payment records.` : "No quantified financial exposure has yet been recorded, so any amount requested should be checked against the underlying payment records.";
    return `Based on the information provided, this complaint concerns ${issuePhrase}. ${evidenceAssessment}. ${timelineAssessment}. ${financialAssessment} The completed file should be reviewed for factual accuracy and submitted through the selected official complaint route with clearly named attachments.`;
  }

  function complaintLetterCore(d) {
    if (adapter && adapter.complaintLetter) return adapter.complaintLetter(d, adapterContext());
    const f = d.f;
    if (isBaggage) {
      const events = d.timeline.length ? d.timeline.map((event) => `${date(event.date)} — ${text(event.category, "Event")}: ${text(event.description)}`).join("\n") : "A detailed chronology is enclosed in the Complaint Pack.";
      return `Subject: Formal baggage complaint — ${text(f.bookingReference)} / ${text(f.baggageTag)}\n\nDear Baggage Claims Team,\n\nI am asking ${text(f.airline, "the airline")} to investigate the ${d.issues.length ? d.issues.join(", ") : "baggage problem"} affecting my journey on flight ${text(f.flightNumber)} from ${text(f.departureAirport)} to ${text(f.arrivalAirport)} on ${date(f.travelDate)}.\n\nWhat happened\n${text(f.problemDetails, "The material circumstances are set out in the enclosed chronology and evidence schedule.")}\n\nAirport report and tracing\nPIR/reference: ${text(f.pirReference || f.trackingReference)}. ${text(f.trackingUpdates, "No further tracking update has been recorded.")}\n\nMaterial chronology\n${events}\n\nAirline response\n${text(f.airlineResponse, "No substantive airline response has been recorded.")}\n\nFinancial position\nThe current documented amount is ${money(d.total)}, subject to verification, proof of value, insurance payments and any payment already received.\n\nRequested resolution\n${text(f.requestedOutcome, "Please investigate, provide a reasoned written response and reimburse or compensate any evidenced loss found due.")}\n\nPlease acknowledge receipt, confirm the complaint reference and preserve the relevant baggage tracing and handling records.\n\nYours faithfully,\nPassenger`;
    }
    if (isFlight) {
      const events = d.timeline.length ? d.timeline.map((event) => `${date(event.date)} — ${text(event.category, "Event")}: ${text(event.description)}`).join("\n") : "A detailed chronology is enclosed in the Complaint Pack.";
      return `Subject: Formal flight disruption complaint — ${text(f.flightNumber)} on ${date(f.flightDate)}\n\nDear Complaints Team,\n\nI am asking ${text(f.airline, "the airline")} to investigate the disruption affecting flight ${text(f.flightNumber)}, travelling from ${text(f.departureAirport)} to ${text(f.arrivalAirport)}. The issues recorded are ${d.issues.length ? d.issues.join(", ") : "set out in the enclosed file"}.\n\nWhat happened\n${text(f.actual, "The material circumstances are set out in the enclosed chronology.")}\n\nReason provided\n${text(f.reasonProvided, "No clear reason has been recorded.")}\n\nMaterial chronology\n${events}\n\nAirline response\n${text(f.airlineResponse, "No substantive response has been recorded.")}\n\nFinancial position\nPossible statutory compensation guidance: ${money(d.bookingPosition)}. Additional documented expenses: ${money(d.extra)}. These amounts are subject to verification and do not establish entitlement.\n\nRequested resolution\n${text(f.requestedOutcome, "Please investigate the disruption, explain the applicable passenger-rights position and provide any compensation, reimbursement, refund or other remedy found due.")}\n\nPlease acknowledge receipt, provide a complaint reference and issue a reasoned written response.\n\nYours faithfully,\nPassenger`;
    }
    if (isSection75) {
      const issues = d.issues.length ? d.issues.join(", ") : "the purchase problems described below";
      const events = d.timeline.length ? d.timeline.map((event) => `${date(event.date)} — ${text(event.category, "Event")}: ${text(event.description)}`).join("\n") : "A detailed chronology is enclosed in the complaint pack.";
      const lossLine = d.total ? `The current estimated financial exposure is ${money(d.total)}, subject to verification against the enclosed records and deduction of any refund already received.` : "I ask that the financial position and appropriate redress are assessed from the enclosed records.";
      return `Subject: Formal Section 75 complaint concerning purchase from ${text(f.supplierName)}\n\nDear Complaints Team,\n\nI am asking ${text(f.cardProvider, "the card provider")} to investigate this matter as a formal complaint and to consider potential joint liability under section 75 of the Consumer Credit Act 1974. The purchase concerned ${text(f.goodsServices, "the goods or services recorded in the enclosed file")}, supplied by ${text(f.supplierName)}, with a recorded cash price of ${money(f.purchasePrice)} and ${money(f.cardAmount)} paid using the recorded credit-card arrangement.\n\nPurchase and problem\nThe complaint concerns ${issues}.\n\nWhat was promised\n${text(f.promised, "The relevant contractual promises are set out in the enclosed evidence.")}\n\nWhat actually happened\n${text(f.actual, "The relevant breach of contract or misrepresentation concerns are set out in the enclosed chronology.")}\n\nMaterial chronology\n${events}\n\nSupplier response\n${text(f.supplierResponse, "No substantive supplier response has been recorded in this file.")}\n\nCard provider response\n${text(f.cardProviderResponse, "No substantive card-provider response has been recorded in this file.")}\n\nEvidence and financial impact\nThe enclosed pack contains the payment record, transaction summary, chronology, evidence schedule and financial schedule. ${lossLine}\n\nRequested resolution\n${text(f.requestedOutcome, "Please investigate the complaint fairly, explain your Section 75 position in writing and provide any redress found due.")}\n\nPlease acknowledge receipt, confirm the complaint reference and provide a reasoned written response. If you conclude that Section 75 does not apply, please identify the basis relied upon and issue the appropriate complaint response.\n\nYours faithfully,\nCardholder`;
    }
    if (isHoliday) {
      const issues = d.issues.length ? d.issues.join(", ") : "the holiday problems described below";
      const events = d.timeline.length ? d.timeline.map((event) => `${date(event.date)} — ${text(event.category, "Event")}: ${text(event.description)}`).join("\n") : "A detailed chronology is enclosed in the complaint pack.";
      const lossLine = d.total ? `The current estimated financial exposure is ${money(d.total)}, subject to verification against the enclosed booking records, receipts and any refund already received.` : "I ask that the financial position and appropriate remedy are assessed from the enclosed records.";
      return `Subject: Formal holiday complaint — booking ${text(f.bookingRef)}\n\nDear Complaints Team,\n\nI am writing to ask ${text(f.holidayCompany, "the holiday company")} to investigate my complaint concerning ${text(f.holidayType, "the recorded holiday booking")} to ${text(f.destination, "the recorded destination")}, for travel from ${date(f.travelDate)} to ${date(f.returnDate)}. The complaint concerns ${issues}.\n\nWhat was promised\n${text(f.promised, "The relevant promises are set out in the enclosed booking evidence.")}\n\nWhat actually happened\n${text(f.actual, "The material problems are set out in the enclosed chronology and evidence schedule.")}\n\nMaterial chronology\n${events}\n\nSupplier response\n${text(f.supplierResponse, "No substantive supplier response has been recorded in this file.")}\n\nEvidence and financial impact\nThe enclosed pack contains the booking summary, chronology, evidence schedule and financial schedule. ${lossLine}\n\nRequested resolution\n${text(f.requestedOutcome, "Please investigate the complaint fairly, explain your position in writing and provide any refund, price reduction or other remedy found due.")}\n\nPlease acknowledge receipt, confirm the complaint reference, preserve the relevant booking records and provide a reasoned written response.\n\nYours faithfully,\nHoliday customer`;
    }
    const issues = d.issues.length ? d.issues.join(", ") : "the booking and refund issues described below";
    const events = d.timeline.length ? d.timeline.map((e) => `${date(e.date)} — ${text(e.category, "Event")}: ${text(e.description)}`).join("\n") : "A detailed chronology is enclosed in the complaint pack.";
    const lossLine = d.total ? `The current documented amount sought is ${money(d.total)}, subject to any correction supported by the enclosed records.` : "I ask that the appropriate refund and documented losses are assessed from the enclosed records.";
    return `Subject: Formal complaint concerning Airbnb booking ${text(f.bookingRef)}\n\nDear Complaints Team,\n\nI am writing to request a formal review of my Airbnb booking for ${text(f.propertyName, "the booked property")}, scheduled from ${date(f.checkIn)} to ${date(f.checkOut)}. The complaint concerns ${issues}.\n\nBackground\n${text(f.issueDetails, "The relevant circumstances are set out in the enclosed chronology and supporting evidence schedule.")}\n\nMaterial Chronology\n${events}\n\nResponse Received from the Host\n${text(f.hostResponse, "No substantive response from the Host has been recorded in this file.")}\n\nResponse Received from Airbnb\n${text(f.airbnbResponse, "No substantive response from Airbnb has been recorded in this file.")}\n\nFinancial Impact\n${lossLine}\n\nRequested Resolution\n${text(f.requestedOutcome, "I ask that the matter is reviewed fairly, that the decision is explained in writing and that any refund or documented loss found due is paid.")}\n\nPlease acknowledge receipt, preserve the relevant booking and message records, and provide a reasoned written response. The enclosed file presents the booking information, chronology, supporting evidence and financial schedule in one structured record.\n\nYours faithfully,\nAirbnb Guest`;
  }

  function coverEmailCore(d) {
    if (adapter && adapter.coverEmail) return adapter.coverEmail(d, adapterContext());
    if (isBaggage) return `Subject: Lost luggage complaint file — ${text(d.f.bookingReference)}\n\nDear Baggage Claims Team,\n\nPlease find attached my structured Lost Luggage Compensation Complaint Pack. It contains the journey and baggage facts, chronology, evidence schedule, financial schedule and formal complaint letter.\n\nPlease acknowledge receipt, confirm the complaint reference and provide the expected response date.\n\nKind regards,\nPassenger`;
    if (isFlight) return `Subject: Flight complaint file — ${text(d.f.flightNumber)} on ${date(d.f.flightDate)}\n\nDear Complaints Team,\n\nPlease find attached my structured Flight Claim Complaint Pack. It contains the journey facts, chronology, supporting-evidence schedule, financial schedule and formal complaint letter.\n\nPlease acknowledge receipt, confirm the complaint reference and provide the expected response date.\n\nKind regards,\nPassenger`;
    if (isSection75) return `Subject: Section 75 complaint file — ${text(d.f.supplierName)}\n\nDear Complaints Team,\n\nPlease find attached my structured Section 75 Complaint Pack concerning a purchase from ${text(d.f.supplierName)}. It contains the transaction facts, chronology, evidence schedule, financial schedule and formal complaint letter.\n\nPlease acknowledge receipt, confirm the complaint reference and tell me the expected response date.\n\nKind regards,\nCardholder`;
    if (isHoliday) return `Subject: Holiday complaint file — booking ${text(d.f.bookingRef)}\n\nDear Complaints Team,\n\nPlease find attached my structured Holiday Complaint Pack concerning booking ${text(d.f.bookingRef)} with ${text(d.f.holidayCompany)}. It contains the booking facts, chronology, evidence schedule, financial schedule and formal complaint letter.\n\nPlease acknowledge receipt, confirm the complaint reference and tell me the expected response date.\n\nKind regards,\nHoliday customer`;
    return `Subject: Complaint file — Airbnb booking ${text(d.f.bookingRef)}\n\nDear Complaints Team,\n\nPlease find attached my structured complaint file concerning booking ${text(d.f.bookingRef)} at ${text(d.f.propertyName, "the booked property")}. It contains the booking facts, chronology, evidence schedule, financial loss schedule and formal complaint letter.\n\nPlease acknowledge receipt and confirm the case reference and expected response date.\n\nKind regards,\nAirbnb guest`;
  }

  function complaintLetter(d) {
    return `${applicantNames(d.f)}\n${applicantAddress(d.f)}\nEmail: ${text(d.f.applicantEmail)}\nTelephone: ${text(d.f.applicantTelephone)}\n\nComplaint Pack Reference: ${text(d.f.complaintPackReference)}\n\n${complaintLetterCore(d).replace(/(Passenger|Cardholder|Holiday customer|Airbnb Guest)$/, applicantNames(d.f))}\n\nDeclaration\n${declaration}`;
  }

  function coverEmail(d) {
    return `${coverEmailCore(d).replace(/(Passenger|Cardholder|Holiday customer|Airbnb guest)$/, applicantNames(d.f))}\n\nComplaint Pack Reference: ${text(d.f.complaintPackReference)}`;
  }

  function rowTable(headers, rows) {
    return `<table><thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.length ? rows.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="${headers.length}">No entries added yet.</td></tr>`}</tbody></table>`;
  }

  function summaryGrid(items) {
    return `<div class="qcb-summary-grid">${items.map(([label, value]) => `<div class="qcb-summary-card"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join("")}</div>`;
  }

  function pagesCore(d) {
    const f = d.f;
    const evidenceRows = evidenceItems.map(([key, label, recommendation]) => [label, evidence[key] === "available" ? "Available" : evidence[key] === "na" ? "Not applicable" : "Missing", recommendation]);
    const missing = evidenceRows.filter((row) => row[1] === "Missing").map((row) => row[0]);
    if (adapter && adapter.pages) return adapter.pages(d, Object.freeze({ ...adapterContext(), evidenceRows, missing, qualityScore: qualityScore(d), qualityLabel: qualityLabel(qualityScore(d)), complaintLetter: complaintLetter(d), coverEmail: coverEmail(d) }));
    if (isBaggage) {
      const guidance = d.routes.length ? d.routes : ["Airline baggage complaint", "Airline ADR where applicable", "Travel insurer", "Civil Aviation Authority information"];
      const baggageSummary = summaryGrid([["Airline",text(f.airline)],["Flight number",text(f.flightNumber)],["Travel date",date(f.travelDate)],["Route",`${text(f.departureAirport)} to ${text(f.arrivalAirport)}`],["Booking reference",text(f.bookingReference)],["Baggage tag",text(f.baggageTag)],["PIR / tracing reference",text(f.pirReference || f.trackingReference)],["Bags affected",text(f.bagsAffected)],["Delayed days",text(f.delayedDays)],["Insurance payment",money(f.insurancePaid)],["Payments received",money(f.paymentsReceived)],["Estimated financial exposure",money(d.total)]]);
      return [
        {title:"Lost Luggage Complaint File",cover:true,body:`<span class="qcb-confidential">CONFIDENTIAL</span><p class="qcb-cover-title">FREE LOST LUGGAGE COMPENSATION COMPLAINT PACK&trade;</p><p class="qcb-cover-subtitle">Prepared for the Passenger</p><div class="qcb-cover-grid"><div><span>Airline</span><strong>${esc(text(f.airline))}</strong></div><div><span>Flight</span><strong>${esc(text(f.flightNumber))}</strong></div><div><span>Prepared date</span><strong>${esc(new Date().toLocaleDateString("en-GB"))}</strong></div><div><span>Evidence readiness</span><strong>${d.score}%</strong></div><div><span>Complaint status</span><strong>${qualityScore(d)>=85?"Ready for review":"In preparation"}</strong></div><div><span>Estimated financial exposure</span><strong>${esc(money(d.total))}</strong></div></div>`},
        {title:"Applicant and Case Details",body:`<div class="qcb-strength"><strong>${qualityScore(d)}%</strong><span>Complaint Pack Quality<br>${esc(qualityLabel(qualityScore(d)))}</span></div>${baggageSummary}`},
        {title:"Executive Summary",body:`<p>${esc(executiveSummary(d))}</p><p><strong>Requested outcome:</strong> ${esc(text(f.requestedOutcome))}</p>`},
        {title:"Detailed Timeline",body:rowTable(["Date","Category","Event","Evidence"],d.timeline.map(event=>[date(event.date),text(event.category),text(event.description),text(event.evidence,"Not cross-referenced")]))},
        {title:"Issue and Journey Analysis",body:`${baggageSummary}<p><strong>Issues:</strong> ${esc(d.issues.join(", ")||"Not yet selected")}</p><p><strong>Bag description:</strong> ${esc(text(f.bagDescription))}</p><p><strong>Problem details:</strong> ${esc(text(f.problemDetails))}</p><p><strong>Airline response:</strong> ${esc(text(f.airlineResponse))}</p>`},
        {title:"Evidence Log & Readiness",body:`<div class="qcb-strength"><strong>${d.score}%</strong><span>Evidence Readiness</span></div>${rowTable(["Supporting Evidence","Status","Recommended Record"],evidenceRows)}<p><strong>Evidence priorities:</strong> ${esc(missing.join(", ")||"No missing items identified")}</p>`},
        {title:"Financial Schedule",body:`${rowTable(["Description","Amount","Supporting Evidence","Status"],d.losses.map(loss=>[text(loss.description),money(loss.amount),text(loss.evidence),text(loss.status)]))}<p><strong>Claim amount less payments:</strong> ${money(d.bookingPosition)}</p><p><strong>Additional evidenced losses:</strong> ${money(d.extra)}</p><p><strong>Estimated financial exposure:</strong> ${money(d.total)}</p><p>Insurance and airline payments must be recorded to avoid double counting.</p>`},
        {title:"Professional Complaint Letter",body:`<div class="qcb-letter">${esc(complaintLetter(d))}</div>`},
        {title:"Cover Email",body:`<div class="qcb-letter">${esc(coverEmail(d))}</div>`},
        {title:"Submission Checklist",body:"<ul><li>Check passenger, airline, flight, route and baggage-tag details.</li><li>Attach the PIR, tracing record and each relevant item marked available.</li><li>Cross-reference receipts, photographs and correspondence to the chronology.</li><li>Check insurance and airline payments are not double counted.</li><li>Check the airline's current written baggage deadline and official submission route.</li><li>Keep the complete pack and proof of submission.</li></ul>"},
        {title:"Response Tracker",body:rowTable(["Date","Organisation/person","Action or response","Deadline","Status"],[["","Airline baggage team","","","Awaiting"],["","Travel insurer","","If applicable","Not started"],["","ADR / other official route","","If applicable",""]])},
        {title:"Help the Next Person",body:`<p><strong>Official guidance:</strong> This pack organises information and does not provide legal advice, determine entitlement or submit a complaint.</p><ul>${guidance.map(route=>`<li><strong>${esc(route)}:</strong> check current eligibility, evidence and deadline requirements before acting.</li>`).join("")}</ul><p>Check the airline's current baggage process, the Montreal Convention framework where applicable, Civil Aviation Authority information and your travel-insurance terms. Lost, delayed and damaged baggage routes can have short written-notification periods.</p><p><strong>Help the Next Person&trade;</strong> Anonymous optional feedback supports improvements without sharing the complaint answers in this browser-first pack.</p><div style="height:150px;border:1px solid #cbd5e1;background:repeating-linear-gradient(#fff,#fff 27px,#dbeafe 28px)"></div>`}
      ];
    }
    if (isFlight) {
      const guidance = d.routes.length ? d.routes : ["Airline formal complaint", "CAA-approved Alternative Dispute Resolution where applicable", "Civil Aviation Authority guidance", "Small claims guidance where appropriate"];
      const summary = summaryGrid([["Airline", text(f.airline)],["Operating airline", text(f.operatingAirline)],["Flight number", text(f.flightNumber)],["Booking reference", text(f.bookingReference)],["Flight date", date(f.flightDate)],["Departure", text(f.departureAirport)],["Arrival", text(f.arrivalAirport)],["Scheduled arrival", text(f.scheduledArrival)],["Actual arrival", text(f.actualArrival)],["Passengers", text(f.passengerCount,"1")],["Possible compensation guidance", money(d.bookingPosition)],["Additional expenses", money(d.extra)]]);
      return [
        { title:"Flight Claim Complaint File",cover:true,body:`<span class="qcb-confidential">CONFIDENTIAL</span><p class="qcb-cover-title">FREE FLIGHT CLAIM COMPLAINT PACK&trade;</p><p class="qcb-cover-subtitle">Prepared for ${esc(applicantNames(f))}</p><div class="qcb-cover-grid"><div><span>Flight</span><strong>${esc(text(f.flightNumber))}</strong></div><div><span>Airline</span><strong>${esc(text(f.airline))}</strong></div><div><span>Prepared date</span><strong>${esc(new Date().toLocaleDateString("en-GB"))}</strong></div><div><span>Evidence readiness</span><strong>${d.score}%</strong></div><div><span>Complaint status</span><strong>${qualityScore(d)>=85?"Ready for review":"In preparation"}</strong></div><div><span>Combined guidance</span><strong>${esc(money(d.total))}</strong></div></div>`},
        { title:"Executive Summary",body:`<div class="qcb-strength"><strong>${qualityScore(d)}%</strong><span>Complaint Pack Quality<br>${esc(qualityLabel(qualityScore(d)))}</span></div><p>${esc(executiveSummary(d))}</p>`},
        { title:"Flight and Journey Summary",body:summary},
        { title:"Chronology",body:rowTable(["Date","Category","Event","Evidence"],d.timeline.map(event=>[date(event.date),text(event.category),text(event.description),text(event.evidence,"Not cross-referenced")]))},
        { title:"Supporting Evidence",body:`<div class="qcb-strength"><strong>${d.score}%</strong><span>Evidence Readiness</span></div>${rowTable(["Supporting Evidence","Status","Recommended Record"],evidenceRows)}<p><strong>Evidence priorities:</strong> ${esc(missing.join(", ")||"No missing items identified")}</p>`},
        { title:"Financial Impact",body:`${rowTable(["Description","Amount","Supporting Evidence","Status"],d.losses.map(loss=>[text(loss.description),money(loss.amount),text(loss.evidence),text(loss.status)]))}<p><strong>Possible compensation guidance:</strong> ${money(d.bookingPosition)}</p><p><strong>Additional expenses:</strong> ${money(d.extra)}</p><p><strong>Combined guidance:</strong> ${money(d.total)}</p><p>Compensation guidance, reimbursement and consequential losses are distinct and no entitlement is guaranteed.</p>`},
        { title:"Formal Complaint Letter",body:`<div class="qcb-letter">${esc(complaintLetter(d))}</div>`},
        { title:"Cover Email",body:`<div class="qcb-letter">${esc(coverEmail(d))}</div>`},
        { title:"Submission Checklist",body:"<ul><li>Check the airline, flight number, route, dates and arrival times.</li><li>Attach only relevant evidence marked available.</li><li>Cross-reference key records to the chronology.</li><li>Keep compensation guidance separate from documented expenses.</li><li>Use the airline's official complaint route and retain proof of submission.</li></ul>"},
        { title:"Response Tracker",body:rowTable(["Date","Organisation/person","Action or response","Deadline","Status"],[["","Airline","","","Awaiting"],["","ADR body","","If applicable","Not started"],["","CAA / other official route","","If applicable",""]])},
        { title:"Official Guidance & Routes",body:`<p>This pack provides organisational information, not legal advice or a guarantee of entitlement.</p><ul>${guidance.map(route=>`<li><strong>${esc(route)}:</strong> check current eligibility, evidence and deadline requirements before acting.</li>`).join("")}</ul><p>Review current UK261, EC261, Civil Aviation Authority and applicable ADR guidance. Court action should be considered only after checking jurisdiction, limitation and procedural requirements.</p>`},
        { title:"Quaerens Notes",body:`<p><strong>Browser-first privacy:</strong> answers remain in this browser unless you download, copy, print or deliberately use a separate Guided Support route.</p><p><strong>Important:</strong> Verify every flight fact, calculation, rule and deadline. The lookup may be incomplete and manual corrections remain authoritative.</p><div style="height:220px;border:1px solid #cbd5e1;background:repeating-linear-gradient(#fff,#fff 27px,#dbeafe 28px)"></div>`}
      ];
    }
    if (isSection75) {
      const eligibility = eligibilityResult(d);
      const guidance = d.routes.length ? d.routes : ["Card provider formal complaint", "Financial Ombudsman Service after the provider's complaint process", "Supplier complaint or other official consumer route where appropriate"];
      return [
        { title: "Section 75 Complaint File", cover: true, body: `<span class="qcb-confidential">CONFIDENTIAL</span><p class="qcb-cover-title">FREE SECTION 75 COMPLAINT PACK&trade;</p><p class="qcb-cover-subtitle">Prepared for the Cardholder</p><div class="qcb-cover-grid"><div><span>Supplier</span><strong>${esc(text(f.supplierName))}</strong></div><div><span>Prepared date</span><strong>${esc(new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }))}</strong></div><div><span>Evidence readiness</span><strong>${d.score}%</strong></div><div><span>Complaint status</span><strong>${qualityScore(d) >= 85 ? "Ready for review" : "In preparation"}</strong></div><div><span>Card provider</span><strong>${esc(text(f.cardProvider))}</strong></div><div><span>Estimated financial exposure</span><strong>${esc(money(d.total))}</strong></div></div>` },
        { title: "Executive Summary", body: `<div class="qcb-strength"><strong>${qualityScore(d)}%</strong><span>Complaint Pack Quality<br>${esc(qualityLabel(qualityScore(d)))}</span></div><p>${esc(executiveSummary(d))}</p><p><strong>Eligibility guide:</strong> ${esc(eligibility.label)}. This is not a decision on legal entitlement or likely outcome.</p>` },
        { title: "Transaction Summary", body: summaryGrid([["Merchant", text(f.merchantName)], ["Supplier", text(f.supplierName)], ["Card provider", text(f.cardProvider)], ["Card type", text(f.cardType)], ["Purchase date", date(f.purchaseDate)], ["Purchase cash price", money(f.purchasePrice)], ["Paid by credit card", money(f.cardAmount)], ["Goods or services", text(f.goodsServices)], ["Supplier relationship", text(f.supplierRelationship)], ["Refund received", money(f.refundReceived)], ["Outstanding amount", money(f.outstandingAmount)], ["Final response", text(f.finalResponse)]]) },
        { title: "Chronology", body: rowTable(["Date", "Category", "Event", "Evidence"], d.timeline.map((event) => [date(event.date), text(event.category), text(event.description), text(event.evidence, "Not cross-referenced")])) },
        { title: "Supporting Evidence", body: `<div class="qcb-strength"><strong>${d.score}%</strong><span>${evidenceRows.filter((row) => row[1] === "Available").length} available of ${evidenceRows.filter((row) => row[1] !== "Not applicable").length} relevant items</span></div>${rowTable(["Supporting Evidence", "Status", "Recommended Record"], evidenceRows)}<p><strong>Evidence priorities:</strong> ${esc(missing.join(", ") || "No missing items identified")}</p>` },
        { title: "Financial Impact", body: `${rowTable(["Description", "Amount", "Supporting Evidence", "Status"], d.losses.map((loss) => [text(loss.description), money(loss.amount), text(loss.evidence), text(loss.status)]))}<p><strong>Purchase less refund position:</strong> ${money(d.bookingPosition)}</p><p><strong>Repair, replacement, consequential and additional expenditure:</strong> ${money(d.extra)}</p><p><strong>Estimated financial exposure:</strong> ${money(d.total)}</p>` },
        { title: "Formal Complaint Letter", body: `<div class="qcb-letter">${esc(complaintLetter(d))}</div>` },
        { title: "Cover Email", body: `<div class="qcb-letter">${esc(coverEmail(d))}</div>` },
        { title: "Submission Checklist", body: `<ul><li>Check the supplier, card provider, purchase date, cash price and card-payment amount.</li><li>Attach each item marked available in the evidence schedule.</li><li>Name every attachment clearly and cross-reference it to the chronology.</li><li>Check that the requested resolution and financial schedule do not double count any refund.</li><li>Submit through the card provider's official complaints channel.</li><li>Keep the complete pack, proof of submission and the complaint reference.</li></ul>` },
        { title: "Response Tracker", body: rowTable(["Date", "Organisation/person", "Action or response", "Deadline", "Status"], [["", "Supplier", "", "", "Awaiting"], ["", "Card provider", "", "", "Awaiting"], ["", "Financial Ombudsman Service", "", "If applicable", "Not started"], ["", "Other official route", "", "If applicable", ""]]) },
        { title: "Official Guidance & Routes", body: `<p>This pack organises information and does not determine Section 75 eligibility, provide legal advice or submit a complaint.</p><ul>${guidance.map((route) => `<li><strong>${esc(route)}:</strong> check the current official eligibility, evidence, complaint and deadline requirements before acting.</li>`).join("")}</ul><p>Review the current Consumer Credit Act 1974 section 75 text, the card provider's published complaint process, Financial Ombudsman Service guidance and other official consumer guidance relevant to the transaction.</p>` },
        { title: "Quaerens Notes", body: `<p><strong>Browser-first privacy:</strong> answers remain in this browser unless you download, print, copy or deliberately use a separate Guided Support route.</p><p><strong>Important:</strong> This self-help pack provides general organisational information. It is not legal advice, an eligibility decision or a prediction of outcome. Verify all facts, figures, rules and deadlines.</p><p><strong>Case preparation notes</strong></p><div style="height:220px;border:1px solid #cbd5e1;background:repeating-linear-gradient(#fff,#fff 27px,#dbeafe 28px)"></div><p>Optional Guided Support must pass through the Quaerens Intake Gateway and remains separate from this free builder.</p>` }
      ];
    }
    if (isHoliday) {
      const guidance = d.routes.length ? d.routes : ["Holiday company or tour operator complaint", "ABTA complaint route where applicable", "ATOL or Civil Aviation Authority information where relevant", "Payment-provider route where appropriate"];
      return [
        { title: "Holiday Complaint File", cover: true, body: `<span class="qcb-confidential">CONFIDENTIAL</span><p class="qcb-cover-title">FREE HOLIDAY COMPENSATION COMPLAINT PACK&trade;</p><p class="qcb-cover-subtitle">Prepared for the Holiday Customer</p><div class="qcb-cover-grid"><div><span>Holiday company</span><strong>${esc(text(f.holidayCompany))}</strong></div><div><span>Prepared date</span><strong>${esc(new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }))}</strong></div><div><span>Evidence readiness</span><strong>${d.score}%</strong></div><div><span>Complaint status</span><strong>${qualityScore(d) >= 85 ? "Ready for review" : "In preparation"}</strong></div><div><span>Booking reference</span><strong>${esc(text(f.bookingRef))}</strong></div><div><span>Estimated financial exposure</span><strong>${esc(money(d.total))}</strong></div></div>` },
        { title: "Executive Summary", body: `<div class="qcb-strength"><strong>${qualityScore(d)}%</strong><span>Complaint Pack Quality<br>${esc(qualityLabel(qualityScore(d)))}</span></div><p>${esc(executiveSummary(d))}</p><p><strong>Recommended focus.</strong> ${esc(d.score < 70 ? "Secure the missing holiday records identified later in this file and cross-reference them to the chronology." : "Undertake a final accuracy check, name each attachment clearly and retain proof of submission.")}</p>` },
        { title: "Holiday Booking Summary", body: summaryGrid([["Holiday company", text(f.holidayCompany)], ["Booking reference", text(f.bookingRef)], ["Holiday type", text(f.holidayType)], ["Destination", text(f.destination)], ["Booking date", date(f.bookingDate)], ["Travel date", date(f.travelDate)], ["Return date", date(f.returnDate)], ["Travellers", text(f.travellers)], ["Holiday price", money(f.holidayPrice)], ["Refund received", money(f.refundReceived)], ["Outstanding amount", money(f.outstandingAmount)], ["Complaint recipient", text(f.recipientType)]]) },
        { title: "Chronology", body: rowTable(["Date", "Category", "Event", "Evidence"], d.timeline.map((event) => [date(event.date), text(event.category), text(event.description), text(event.evidence, "Not cross-referenced")])) },
        { title: "Supporting Evidence", body: `<div class="qcb-strength"><strong>${d.score}%</strong><span>${evidenceRows.filter((row) => row[1] === "Available").length} available of ${evidenceRows.filter((row) => row[1] !== "Not applicable").length} relevant items</span></div>${rowTable(["Supporting Evidence", "Status", "Recommended Record"], evidenceRows)}<p><strong>Evidence priorities:</strong> ${esc(missing.join(", ") || "No missing items identified")}</p>` },
        { title: "Financial Impact", body: `${rowTable(["Description", "Amount", "Supporting Evidence", "Status"], d.losses.map((loss) => [text(loss.description), money(loss.amount), text(loss.evidence), text(loss.status)]))}<p><strong>Holiday cost less refund:</strong> ${money(d.bookingPosition)}</p><p><strong>Alternative accommodation, flights, transfers, food, medical, travel and other expenses:</strong> ${money(d.extra)}</p><p><strong>Estimated financial exposure:</strong> ${money(d.total)}</p>` },
        { title: "Formal Complaint Letter", body: `<div class="qcb-letter">${esc(complaintLetter(d))}</div>` },
        { title: "Cover Email", body: `<div class="qcb-letter">${esc(coverEmail(d))}</div>` },
        { title: "Submission Checklist", body: `<ul><li>Check the company, booking reference, holiday type, destination, dates and travellers.</li><li>Attach each item marked available in the evidence schedule.</li><li>Name photographs, videos, medical evidence, receipts and correspondence clearly.</li><li>Cross-reference every important attachment to the chronology.</li><li>Check that refund and expense figures are accurate and not double counted.</li><li>Submit through the recipient's current official complaint channel and keep proof.</li></ul>` },
        { title: "Response Tracker", body: rowTable(["Date", "Organisation/person", "Action or response", "Deadline", "Status"], [["", "Holiday company / tour operator", "", "", "Awaiting"], ["", "Travel agent / supplier", "", "", "If applicable"], ["", "ABTA / payment provider", "", "", "If applicable"], ["", "Other official route", "", "", "Not started"]]) },
        { title: "Official Guidance & Routes", body: `<p>This pack organises information. It does not provide legal advice, determine entitlement or submit a complaint.</p><ul>${guidance.map((route) => `<li><strong>${esc(route)}:</strong> check the current official eligibility, evidence, complaint and deadline requirements before acting.</li>`).join("")}</ul><p>Relevant sources may include the Package Travel and Linked Travel Arrangements Regulations 2018, Consumer Rights Act 2015, ABTA, ATOL and Civil Aviation Authority guidance, the Financial Ombudsman Service, chargeback rules and Section 75 where applicable.</p>` },
        { title: "Quaerens Notes", body: `<p><strong>Browser-first privacy:</strong> answers remain in this browser unless you download, print, copy or deliberately use a separate Guided Support route.</p><p><strong>Important:</strong> This self-help pack provides general organisational information. It is not legal advice or a prediction of outcome. Verify all facts, figures, rules and deadlines.</p><p><strong>Case preparation notes</strong></p><div style="height:220px;border:1px solid #cbd5e1;background:repeating-linear-gradient(#fff,#fff 27px,#dbeafe 28px)"></div><p>Optional Guided Support must pass through the Quaerens Intake Gateway and remains separate from this free builder.</p>` }
      ];
    }
    const guidance = d.routes.length ? d.routes : ["Airbnb complaint process", "Payment-provider options where appropriate", "Independent advice if deadlines or jurisdiction are unclear"];
    return [
      { title: "Airbnb Complaint File", cover: true, body: `<span class="qcb-confidential">CONFIDENTIAL</span><p class="qcb-cover-title">Airbnb Complaint Pack&trade;</p><p class="qcb-cover-subtitle">Prepared for Airbnb Guest</p><div class="qcb-cover-grid"><div><span>Booking reference</span><strong>${esc(text(f.bookingRef))}</strong></div><div><span>Prepared date</span><strong>${esc(new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }))}</strong></div><div><span>Evidence readiness</span><strong>${d.score}%</strong></div><div><span>Complaint status</span><strong>${qualityScore(d) >= 85 ? "Ready for review" : "In preparation"}</strong></div><div><span>Property</span><strong>${esc(text(f.propertyName))}</strong></div><div><span>Estimated financial exposure</span><strong>${esc(money(d.total))}</strong></div></div>` },
      { title: "Executive Summary", body: `<div class="qcb-strength"><strong>${qualityScore(d)}%</strong><span>Complaint Pack Quality<br>${esc(qualityLabel(qualityScore(d)))}</span></div><p>${esc(executiveSummary(d))}</p><p><strong>Recommended focus.</strong> ${esc(d.score < 70 ? "Secure the missing supporting records identified later in this file and cross-reference them to the chronology." : "Undertake a final accuracy check, name each attachment clearly and retain proof of submission.")}</p>` },
      { title: "Booking Summary", body: summaryGrid([["Booking reference", text(f.bookingRef)], ["Booking date", date(f.bookingDate)], ["Property", text(f.propertyName)], ["Host", text(f.hostName)], ["Check-in", date(f.checkIn)], ["Check-out", date(f.checkOut)], ["Country", text(f.country)], ["Guests", text(f.guests)], ["Booking price", money(f.bookingPrice)], ["Refund received", money(f.refundReceived)], ["Outstanding stated", money(f.refundOutstanding)], ["Payment method", text(f.paymentMethod)]]) },
      { title: "Chronology", body: rowTable(["Date", "Category", "Event", "Evidence"], d.timeline.map((e) => [date(e.date), text(e.category), text(e.description), text(e.evidence, "Not cross-referenced")])) },
      { title: "Supporting Evidence", body: `<div class="qcb-strength"><strong>${d.score}%</strong><span>${evidenceRows.filter((r) => r[1] === "Available").length} available of ${evidenceRows.filter((r) => r[1] !== "Not applicable").length} relevant items</span></div>${rowTable(["Supporting Evidence", "Status", "Recommended Record"], evidenceRows)}<p><strong>Evidence priorities:</strong> ${esc(missing.join(", ") || "No missing items identified")}</p>` },
      { title: "Financial Impact", body: `${rowTable(["Description", "Amount", "Supporting Evidence", "Status"], d.losses.map((l) => [text(l.description), money(l.amount), text(l.evidence), text(l.status)]))}<p><strong>Booking and refund position:</strong> ${money(d.bookingPosition)}</p><p><strong>Additional documented impact:</strong> ${money(d.extra)}</p><p><strong>Estimated financial exposure:</strong> ${money(d.total)}</p>` },
      { title: "Formal Complaint Letter", body: `<div class="qcb-letter">${esc(complaintLetter(d))}</div>` },
      { title: "Cover Email", body: `<div class="qcb-letter">${esc(coverEmail(d))}</div>` },
      { title: "Submission Checklist", body: `<ul><li>Check names, booking reference, dates and amounts.</li><li>Attach each item marked available in the evidence schedule.</li><li>Rename attachments clearly and cross-reference them to the chronology.</li><li>Keep a complete copy of the submitted pack.</li><li>Use the recipient's official complaints channel.</li><li>Record the submission date and case reference.</li></ul>` },
      { title: "Response Tracker", body: rowTable(["Date", "Organisation/person", "Action or response", "Deadline", "Status"], [["", "Host", "", "", "Awaiting"], ["", "Airbnb", "", "", "Awaiting"], ["", "Payment provider/insurer", "", "", "If applicable"], ["", "Other", "", "", ""]]) },
      { title: "Official Guidance & Routes", body: `<p>This pack organises information; it does not determine legal entitlement or submit a complaint.</p><ul>${guidance.map((route) => `<li><strong>${esc(route)}:</strong> check the current official rules, eligibility, evidence requirements and deadlines before acting.</li>`).join("")}</ul><p>Use official Airbnb help pages, your payment provider's published dispute process, your insurer's policy terms and the relevant court or consumer authority for your jurisdiction.</p>` },
      { title: "Quaerens Notes", body: `<p><strong>Browser-first privacy:</strong> answers remain in this browser unless you download, print, copy or separately submit them.</p><p><strong>Important:</strong> This self-help pack is general organisational support, not legal advice and not a prediction of outcome. Verify all facts, figures, rules and deadlines.</p><p><strong>Case preparation notes</strong></p><div style="height:220px;border:1px solid #cbd5e1;background:repeating-linear-gradient(#fff,#fff 27px,#dbeafe 28px)"></div><p>Quaerens optional guided support is separate from this free builder.</p>` }
    ];
  }

  function pages(d) {
    return pagesCore(d).map((page, index) => {
      const identity = `<div class="qcb-document-identity"><strong>Complaint Pack Reference:</strong> ${esc(text(d.f.complaintPackReference))}${index < 2 ? `<br><strong>Applicant:</strong> ${esc(applicantNames(d.f))}<br><strong>Contact:</strong> ${esc(text(d.f.applicantEmail))} · ${esc(text(d.f.applicantTelephone))}<br><strong>Address:</strong> ${esc(applicantAddress(d.f)).replace(/\n/g, ", ")}` : ""}</div>`;
      const declarationBlock = index === 1 ? `<p><strong>Applicant declaration:</strong> ${esc(declaration)}</p>` : "";
      const personalisedBody = page.cover ? page.body.replace(/Prepared for (?:Passenger|the Cardholder|the Holiday Customer|Airbnb Guest)/i, `Prepared for ${esc(applicantNames(d.f))}`) : page.body;
      return { ...page, body: `${identity}${personalisedBody}${declarationBlock}` };
    });
  }

  function renderPreview() {
    const d = caseData();
    const quality = qualityScore(d);
    const preview = $("[data-qcb-preview]");
    preview.innerHTML = pages(d).map((page, index) => `<article class="qcb-page-card${page.cover ? " cover" : ""}" data-footer="${esc(text(d.f.complaintPackReference))} • Page ${index + 1} of 12"><h4>${esc(page.title)}</h4>${page.body}</article>`).join("");
    $("[data-qcb-evidence-score]").textContent = `${d.score}%`;
    $("[data-qcb-preview-total]").textContent = money(d.total);
    $("[data-qcb-route-count]").textContent = d.routes.length;
    $("[data-qcb-final-evidence]").textContent = `${d.score}%`;
    $("[data-qcb-final-total]").textContent = money(d.total);
    $("[data-qcb-quality-score]").textContent = `${quality}%`;
    $("[data-qcb-quality-bar]").style.width = `${quality}%`;
    $("[data-qcb-quality-copy]").textContent = qualityLabel(quality);
    $(".qcb-quality-track").setAttribute("aria-valuenow", String(quality));
    $("[data-qcb-booking-total]").textContent = money(d.bookingPosition);
    $("[data-qcb-extra-total]").textContent = money(d.extra);
    $("[data-qcb-total-requested]").textContent = money(d.total);
    $("[data-qcb-gauge]").style.width = `${d.score}%`;
    $("[data-qcb-readiness-title]").textContent = `Evidence Readiness: ${d.score}%`;
    $("[data-qcb-readiness-copy]").textContent = d.score >= 70 ? "Your evidence file is well prepared. Check every attachment before submission." : d.score >= 40 ? "A useful foundation is present. Add the missing items where available." : "More supporting records are recommended before submission.";
    const adapterCompletion = adapter && adapter.completion ? adapter.completion(d, adapterContext()) : null;
    const complete = adapterCompletion ? Boolean(adapterCompletion.complete) : isBaggage ? Boolean(d.f.airline && d.f.flightNumber && d.f.travelDate && d.f.problemDetails && d.issues.length) : isFlight ? Boolean(d.f.airline && d.f.flightNumber && d.f.flightDate && d.f.actual && d.issues.length) : isSection75 ? Boolean(d.f.supplierName && d.f.cardProvider && d.f.promised && d.f.actual && d.issues.length) : isHoliday ? Boolean(d.f.holidayCompany && d.f.bookingRef && d.f.promised && d.f.actual && d.issues.length) : Boolean(d.f.bookingRef && d.f.issueDetails && d.issues.length);
    $("[data-qcb-status]").textContent = complete ? "Case file ready to review" : "Needs key information";
    $("[data-qcb-final-status]").textContent = complete ? "Your structured case file is ready for a final accuracy review" : "Complete the key facts to strengthen your pack";
    $("[data-qcb-final-next]").textContent = adapterCompletion && adapterCompletion.next ? adapterCompletion.next : isBaggage ? (!d.f.airline ? "Add the airline" : !d.f.flightNumber ? "Add the flight number" : !d.issues.length ? "Select the baggage problem" : d.score < 70 ? "Strengthen missing evidence" : "Review and submit through the airline's official baggage route") : isFlight ? (!d.f.airline ? "Add the airline" : !d.f.flightNumber ? "Add the flight number" : !d.issues.length ? "Select the disruption" : d.score < 70 ? "Strengthen missing evidence" : "Review and submit through the airline's official route") : isSection75 ? (!d.f.supplierName ? "Add the supplier" : !d.f.cardProvider ? "Add the card provider" : !d.issues.length ? "Select the main problem" : d.score < 70 ? "Strengthen missing evidence" : "Review and submit through the card provider's official route") : isHoliday ? (!d.f.holidayCompany ? "Add the holiday company" : !d.f.bookingRef ? "Add the booking reference" : !d.issues.length ? "Select the nature of complaint" : d.score < 70 ? "Strengthen missing evidence" : "Review and submit through the recipient's official route") : (!d.f.bookingRef ? "Add the booking reference" : !d.issues.length ? "Select the main issue" : d.score < 70 ? "Strengthen missing evidence" : "Review and submit through the chosen route");
    const eligibilityNode = $("[data-qcb-eligibility]");
    if (eligibilityNode) eligibilityNode.textContent = eligibilityResult(d).label;
    persist();
  }

  function schedulePreview() {
    window.clearTimeout(previewTimer);
    previewTimer = window.setTimeout(renderPreview, 220);
  }

  function renderTimeline() {
    const categories = category.timeline;
    $("[data-qcb-timeline]").innerHTML = timeline.map((row, index) => `<div class="qcb-timeline-row" data-index="${index}"><label>Date<input type="date" data-field="date" value="${esc(row.date)}"></label><label>Category<select data-field="category">${categories.map((category) => `<option>${esc(category)}</option>`).join("")}</select></label><label>Description<textarea rows="2" data-field="description" placeholder="What happened?">${esc(row.description)}</textarea></label><label>Evidence reference<input data-field="evidence" value="${esc(row.evidence)}" placeholder="e.g. statement 1, email A"></label><div class="qcb-row-actions"><button type="button" class="qcb-btn ghost" data-move="up" aria-label="Move event up">↑</button><button type="button" class="qcb-btn ghost" data-move="down" aria-label="Move event down">↓</button><button type="button" class="qcb-btn ghost" data-delete aria-label="Delete event">Delete</button></div></div>`).join("");
    $$('[data-qcb-timeline] [data-field="category"]').forEach((select, index) => { select.value = timeline[index].category || categories[0]; });
  }

  function renderLosses() {
    $("[data-qcb-losses]").innerHTML = losses.map((row, index) => `<div class="qcb-loss-row" data-index="${index}"><label>Description<input data-field="description" value="${esc(row.description)}" placeholder="${isSection75 ? "e.g. repair costs or replacement costs" : "e.g. replacement hotel"}"></label><label>Amount (£)<input type="number" min="0" step="0.01" data-field="amount" value="${esc(row.amount)}"></label><label>Supporting Evidence<input data-field="evidence" value="${esc(row.evidence)}" placeholder="Receipt, quotation or statement reference"></label><label>Status<select data-field="status"><option>Documented</option><option>Evidence needed</option><option>Estimated</option><option>Disputed</option></select></label><div class="qcb-row-actions"><button type="button" class="qcb-btn ghost" data-delete aria-label="Delete loss row">Delete</button></div></div>`).join("");
    $$('[data-qcb-losses] [data-field="status"]').forEach((select, index) => { select.value = losses[index].status || "Evidence needed"; });
  }

  function renderEvidence() {
    $("[data-qcb-evidence]").innerHTML = evidenceItems.map(([key, label, recommendation]) => `<fieldset class="qcb-evidence-row"><legend>${esc(label)}</legend><p>${esc(recommendation)}</p><div><label><input type="radio" name="evidence-${key}" value="available" ${evidence[key] === "available" ? "checked" : ""}> Available</label><label><input type="radio" name="evidence-${key}" value="missing" ${evidence[key] === "missing" ? "checked" : ""}> Missing</label><label><input type="radio" name="evidence-${key}" value="na" ${evidence[key] === "na" ? "checked" : ""}> Not applicable</label></div></fieldset>`).join("");
  }

  function showStep(next, shouldScroll = true) {
    const completing = next === MAX_STEP && step !== MAX_STEP;
    step = Math.max(1, Math.min(MAX_STEP, next));
    $$('[data-qcb-step]').forEach((panel) => panel.classList.toggle("active", Number(panel.dataset.qcbStep) === step));
    $$('[data-qcb-step-pill]').forEach((pill) => pill.classList.toggle("active", Number(pill.dataset.qcbStepPill) === step));
    $("[data-qcb-step-label]").textContent = `Step ${step} of ${MAX_STEP}`;
    $("[data-qcb-progress-label]").textContent = `${Math.round(step / MAX_STEP * 100)}% complete`;
    $("[data-qcb-progress]").style.width = `${step / MAX_STEP * 100}%`;
    $("[data-qcb-prev]").disabled = step === 1;
    $("[data-qcb-next]").textContent = step === MAX_STEP ? "Review Pack" : "Next";
    if (completing) root.dispatchEvent(new CustomEvent("qcb:pack-completed"));
    if (shouldScroll) root.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function serialize() {
    const values = {};
    new FormData(form).forEach((value, key) => { if (key !== "issue" && key !== "route" && !key.startsWith("evidence-")) values[key] = value; });
    return { values, issues: checked("issue"), routes: checked("route"), timeline, losses, evidence };
  }

  function persist() {
    if ($("[data-qcb-save]").checked) localStorage.setItem(STORAGE_KEY, JSON.stringify(serialize()));
  }

  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved) return;
      $("[data-qcb-save]").checked = true;
      Object.entries(saved.values || {}).forEach(([name, value]) => { const control = form.elements[name]; if (control) control.value = value; });
      [...(saved.issues || []), ...(saved.routes || [])].forEach((value) => { const input = $$('input[type="checkbox"]').find((item) => item.value === value); if (input) input.checked = true; });
      timeline = saved.timeline || [];
      losses = saved.losses || [];
      evidence = saved.evidence || {};
    } catch (_) { localStorage.removeItem(STORAGE_KEY); }
  }

  function plainText(d) {
    return pages(d).map((page, index) => `PAGE ${index + 1} OF 12 — ${page.title.toUpperCase()}\n\n${page.body.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>|<\/li>|<\/tr>|<\/div>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&pound;/g, "£").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\n\s+/g, "\n").replace(/[ \t]+/g, " ").trim()}`).join("\n\n============================================================\n\n");
  }

  function download(blob, filename) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob); link.download = filename; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function pdfSafe(value) {
    return String(value).normalize("NFKD").replace(/[^\x20-\x7E\n]/g, (char) => char === "£" ? "GBP " : "-").replace(/([\\()])/g, "\\$1");
  }

  function wrapPdf(value, width) {
    const result = [];
    String(value).split(/\n+/).forEach((paragraph) => {
      const words = paragraph.trim().split(/\s+/); let line = "";
      words.forEach((word) => { const candidate = line ? `${line} ${word}` : word; if (candidate.length > width && line) { result.push(line); line = word; } else line = candidate; });
      if (line) result.push(line); else result.push("");
    });
    return result;
  }

  function buildPdf(d) {
    const packPages = pages(d); const objects = [null]; const add = (content) => { objects.push(content); return objects.length - 1; };
    const fontRegular = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    const fontBold = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
    const pageIds = []; const contentIds = [];
    packPages.forEach((page, index) => {
      let commands = "";
      if (page.cover) {
        const adapterCover = adapter && adapter.coverMetadata ? adapter.coverMetadata(d, adapterContext()) : null;
        const pdfTitle = adapterCover ? adapterCover.title : isBaggage ? "FREE LOST LUGGAGE COMPLAINT PACK" : isFlight ? "FREE FLIGHT CLAIM COMPLAINT PACK" : isSection75 ? "FREE SECTION 75 COMPLAINT PACK" : isHoliday ? "FREE HOLIDAY COMPENSATION COMPLAINT PACK" : "AIRBNB COMPLAINT PACK";
        const pdfAudience = adapterCover ? adapterCover.audience : isBaggage ? "PREPARED FOR THE PASSENGER" : isFlight ? "PREPARED FOR THE PASSENGER" : isSection75 ? "PREPARED FOR THE CARDHOLDER" : isHoliday ? "PREPARED FOR THE HOLIDAY CUSTOMER" : "PREPARED FOR AIRBNB GUEST";
        commands += `0.020 0.149 0.349 rg 0 0 595 842 re f\n0.065 0.365 0.690 rg 0 0 18 842 re f\n1 1 1 rg\nBT /F2 11 Tf 58 780 Td (QUAERENS) Tj ET\n0.48 0.71 0.94 RG 1 w 58 765 m 537 765 l S\nBT /F1 9 Tf 58 730 Td (CONFIDENTIAL) Tj ET\nBT /F2 29 Tf 58 635 Td (${pdfTitle}) Tj ET\nBT /F1 11 Tf 58 608 Td (${pdfAudience}) Tj ET\n`;
        const coverLines = isSection75 ? [`Supplier: ${text(d.f.supplierName)}`, `Card provider: ${text(d.f.cardProvider)}`, `Prepared date: ${new Date().toLocaleDateString("en-GB")}`, `Evidence readiness: ${d.score}%`, `Complaint status: ${qualityScore(d) >= 85 ? "Ready for review" : "In preparation"}`, `Estimated financial exposure: ${money(d.total)}`] : isHoliday ? [`Holiday company: ${text(d.f.holidayCompany)}`, `Booking reference: ${text(d.f.bookingRef)}`, `Prepared date: ${new Date().toLocaleDateString("en-GB")}`, `Evidence readiness: ${d.score}%`, `Complaint status: ${qualityScore(d) >= 85 ? "Ready for review" : "In preparation"}`, `Estimated financial exposure: ${money(d.total)}`] : [`Booking reference: ${text(d.f.bookingRef)}`, `Prepared date: ${new Date().toLocaleDateString("en-GB")}`, `Evidence readiness: ${d.score}%`, `Complaint status: ${qualityScore(d) >= 85 ? "Ready for review" : "In preparation"}`, `Property: ${text(d.f.propertyName)}`, `Estimated financial exposure: ${money(d.total)}`];
        const selectedCoverLines = adapterCover ? adapterCover.lines : isBaggage ? [`Airline: ${text(d.f.airline)}`, `Flight: ${text(d.f.flightNumber)}`, `Baggage tag: ${text(d.f.baggageTag)}`, `Prepared date: ${new Date().toLocaleDateString("en-GB")}`, `Evidence readiness: ${d.score}%`, `Estimated financial exposure: ${money(d.total)}`] : isFlight ? [`Flight: ${text(d.f.flightNumber)}`, `Airline: ${text(d.f.airline)}`, `Prepared date: ${new Date().toLocaleDateString("en-GB")}`, `Evidence readiness: ${d.score}%`, `Complaint status: ${qualityScore(d) >= 85 ? "Ready for review" : "In preparation"}`, `Combined guidance: ${money(d.total)}`] : coverLines;
        commands += `0.10 0.31 0.58 rg 58 355 479 190 re f\n1 1 1 rg\nBT /F1 11 Tf 78 515 Td ${selectedCoverLines.map((line, i) => `${i ? "0 -27 Td " : ""}(${pdfSafe(line)}) Tj`).join(" ")} ET\nBT /F1 9 Tf 58 65 Td (Prepared with the Quaerens Complaint Pack Builder) Tj ET\n`;
      } else {
        const raw = page.body.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>|<\/li>|<\/tr>|<\/div>|<\/h\d>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&pound;/g, "GBP ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/[ \t]+/g, " ").replace(/\n\s+/g, "\n").trim();
        const lines = wrapPdf(raw, 94).slice(0, 52);
        commands += `0.043 0.231 0.525 rg BT /F2 9 Tf 58 796 Td (QUAERENS  /  CONSUMER COMPLAINT FILE) Tj ET\n0.114 0.373 0.749 RG 1.4 w 58 784 m 537 784 l S\nBT /F2 20 Tf 58 744 Td (${pdfSafe(page.title)}) Tj ET\n0.118 0.161 0.231 rg BT /F1 9 Tf 58 708 Td ${lines.map((line, i) => `${i ? "0 -12.5 Td " : ""}(${pdfSafe(line)}) Tj`).join(" ")} ET\n`;
      }
      commands += `BT /F1 8 Tf ${page.cover ? "1 1 1" : "0.39 0.45 0.55"} rg 150 25 Td (${pdfSafe(text(d.f.complaintPackReference))} - Page ${index + 1} of 12) Tj ET`;
      contentIds.push(add(`<< /Length ${commands.length} >>\nstream\n${commands}\nendstream`)); pageIds.push(add("PENDING"));
    });
    const pagesId = add("PENDING"); const catalogId = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
    pageIds.forEach((pageId, index) => { objects[pageId] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> >> /Contents ${contentIds[index]} 0 R >>`; });
    objects[pagesId] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
    let output = "%PDF-1.4\n%QPDF\n"; const offsets = [0];
    for (let i = 1; i < objects.length; i += 1) { offsets[i] = output.length; output += `${i} 0 obj\n${objects[i]}\nendobj\n`; }
    const xref = output.length; output += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
    for (let i = 1; i < objects.length; i += 1) output += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    output += `trailer\n<< /Size ${objects.length} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return new Blob([output], { type: "application/pdf" });
  }

  function downloadPdf() {
    download(buildPdf(caseData()), `Quaerens-${adapter && adapter.fileLabel ? adapter.fileLabel(caseData(), adapterContext()) : isBaggage ? "Lost-Luggage" : isFlight ? "Flight-Claim" : isSection75 ? "Section-75" : isHoliday ? "Holiday" : "Airbnb"}-Complaint-Pack-${slugDate()}.pdf`);
    status("Your 12-page PDF complaint pack has downloaded.");
  }

  function downloadWord() {
    const d = caseData(); const content = pages(d).map((page, index) => `<section class="page ${page.cover ? "cover" : ""}"><header>QUAERENS</header><h1>${page.title}</h1>${page.body}<footer>${esc(text(d.f.complaintPackReference))} • Page ${index + 1} of 12</footer></section>`).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4;margin:20mm}body{font-family:Arial;color:#1e293b;line-height:1.55}.page{page-break-after:always;min-height:242mm}header{color:#0b3b86;font-size:9pt;font-weight:bold;letter-spacing:2.5px;border-bottom:2px solid #1d5fbf;padding-bottom:10px;margin-bottom:28px}h1{font-family:Georgia;color:#0b3b86;font-size:25px;margin:0 0 22px}p,li{font-size:10pt;line-height:1.65}table{border-collapse:collapse;width:100%;font-size:9pt;margin:14px 0}th{background:#0b3b86;color:white;text-transform:uppercase;font-size:8pt;letter-spacing:.4px}td,th{border:1px solid #ccd8e8;padding:9px;vertical-align:top}.qcb-summary-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.qcb-summary-card{border-left:3px solid #1d5fbf;background:#f4f8fc;padding:10px}.qcb-summary-card span{font-size:8pt;color:#64748b;display:block;text-transform:uppercase}.qcb-strength{background:#edf4fc;padding:14px;margin:12px 0 20px}.qcb-strength strong{color:#0b3b86;font-size:20pt}.cover{background:#052659;color:white;padding:24mm;box-sizing:border-box}.cover h1,.cover header,.cover strong{color:white}.cover .qcb-cover-title{font-family:Georgia;font-size:30pt;margin-top:45mm}.cover .qcb-cover-subtitle{letter-spacing:2px;text-transform:uppercase}.cover .qcb-cover-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:25mm}.cover .qcb-cover-grid div{border-top:1px solid #7bb6f0;padding:10px 0}.cover .qcb-cover-grid span{display:block;color:#bfdbfe;text-transform:uppercase;font-size:7pt;letter-spacing:1px}.qcb-confidential{border:1px solid #fff;padding:5px 8px;font-size:7pt;letter-spacing:2px}.qcb-letter{white-space:pre-line;font-family:Georgia;line-height:1.65}footer{color:#64748b;border-top:1px solid #ccd8e8;margin-top:24px;padding-top:8px;font-size:8pt}</style></head><body>${content}</body></html>`;
    download(new Blob(["\ufeff", html], { type: "application/msword" }), `Quaerens-${adapter && adapter.fileLabel ? adapter.fileLabel(d, adapterContext()) : isBaggage ? "Lost-Luggage" : isFlight ? "Flight-Claim" : isSection75 ? "Section-75" : isHoliday ? "Holiday" : "Airbnb"}-Complaint-Pack-${slugDate()}.doc`); status("Your editable Word complaint pack has downloaded.");
  }

  function status(message) { const node = $("[data-qcb-copy-status]"); node.textContent = message; node.setAttribute("role", "status"); }
  async function copy(value, success) { try { await navigator.clipboard.writeText(value); status(success); } catch (_) { const area = document.createElement("textarea"); area.value = value; document.body.appendChild(area); area.select(); document.execCommand("copy"); area.remove(); status(success); } }

  function handleCollection(event, collection, render) {
    const row = event.target.closest("[data-index]"); if (!row) return false;
    const index = Number(row.dataset.index); const field = event.target.dataset.field;
    if (field) { collection[index][field] = event.target.value; schedulePreview(); return true; }
    if (event.target.closest("[data-delete]")) { collection.splice(index, 1); render(); renderPreview(); return true; }
    const move = event.target.closest("[data-move]")?.dataset.move;
    if (move) { const target = move === "up" ? index - 1 : index + 1; if (target >= 0 && target < collection.length) [collection[index], collection[target]] = [collection[target], collection[index]]; render(); renderPreview(); return true; }
    return false;
  }

  function currentStepIsValid() {
    const current = root.querySelector(`[data-qcb-step="${step}"]`);
    if (!current) return true;
    const controls = Array.from(current.querySelectorAll("input, select, textarea"));
    const invalid = controls.find((control) => !control.checkValidity());
    if (invalid) { invalid.reportValidity(); invalid.focus(); return false; }
    return true;
  }

  restore();
  $("[data-qcb-reference-display]").textContent = form.elements.complaintPackReference.value;
  if (!timeline.length) timeline.push({ date: "", category: category.timeline[0], description: "", evidence: "" });
  if (!losses.length) losses.push({ description: "", amount: "", evidence: "", status: "Evidence needed" });
  renderTimeline(); renderLosses(); renderEvidence(); showStep(1, false); renderPreview();

  form.addEventListener("input", (event) => { if (event.target.name?.startsWith("evidence-")) { evidence[event.target.name.replace("evidence-", "")] = event.target.value; } schedulePreview(); });
  form.addEventListener("change", renderPreview);
  $("[data-qcb-timeline]").addEventListener("input", (event) => handleCollection(event, timeline, renderTimeline));
  $("[data-qcb-timeline]").addEventListener("click", (event) => handleCollection(event, timeline, renderTimeline));
  $("[data-qcb-losses]").addEventListener("input", (event) => handleCollection(event, losses, renderLosses));
  $("[data-qcb-losses]").addEventListener("click", (event) => handleCollection(event, losses, renderLosses));
  $("[data-qcb-add-event]").addEventListener("click", () => { timeline.push({ date: "", category: category.timeline[0], description: "", evidence: "" }); renderTimeline(); renderPreview(); });
  $("[data-qcb-add-loss]").addEventListener("click", () => { losses.push({ description: "", amount: "", evidence: "", status: "Evidence needed" }); renderLosses(); renderPreview(); });
  $("[data-qcb-next]").addEventListener("click", () => { if (!currentStepIsValid()) return; if (step < MAX_STEP) showStep(step + 1); else $("[data-qcb-preview]").scrollIntoView({ behavior: "smooth", block: "start" }); });
  $("[data-qcb-prev]").addEventListener("click", () => showStep(step - 1));
  $$('[data-qcb-step-pill]').forEach((pill) => { pill.tabIndex = 0; pill.setAttribute("role", "button"); pill.addEventListener("click", () => showStep(Number(pill.dataset.qcbStepPill))); pill.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); showStep(Number(pill.dataset.qcbStepPill)); } }); });
  $("[data-qcb-save]").addEventListener("change", () => { if ($("[data-qcb-save]").checked) persist(); else localStorage.removeItem(STORAGE_KEY); });
  $("[data-qcb-clear]").addEventListener("click", () => { if (!window.confirm("Delete all locally saved Complaint Pack answers from this browser?")) return; localStorage.removeItem(STORAGE_KEY); form.reset(); window.QCBFrameworkAApplicant.regenerate(root); root.dispatchEvent(new CustomEvent("qcb:new-pack")); timeline = [{ date: "", category: category.timeline[0], description: "", evidence: "" }]; losses = [{ description: "", amount: "", evidence: "", status: "Evidence needed" }]; evidence = {}; renderTimeline(); renderLosses(); renderEvidence(); renderPreview(); showStep(1); status("Saved answers were deleted from this browser and a new pack reference was created."); });
  $("[data-qcb-download-pdf]").addEventListener("click", downloadPdf);
  $("[data-qcb-download-word]").addEventListener("click", downloadWord);
  $("[data-qcb-download-txt]").addEventListener("click", () => { const d = caseData(); download(new Blob([plainText(d)], { type: "text/plain;charset=utf-8" }), `Quaerens-${adapter && adapter.fileLabel ? adapter.fileLabel(d, adapterContext()) : isBaggage ? "Lost-Luggage" : isFlight ? "Flight-Claim" : isSection75 ? "Section-75" : isHoliday ? "Holiday" : "Airbnb"}-Complaint-Pack-${slugDate()}.txt`); status("Your text complaint pack has downloaded."); });
  $("[data-qcb-copy-letter]").addEventListener("click", () => copy(complaintLetter(caseData()), "Complaint letter copied to your clipboard."));
  $("[data-qcb-copy-email]").addEventListener("click", () => copy(coverEmail(caseData()), "Cover email copied to your clipboard."));
  $("[data-qcb-print]").addEventListener("click", () => window.print());
  root.getFrameworkAHandoffMetadata = () => window.QCBFrameworkAApplicant.metadata(root);
  }

  document.querySelectorAll('[data-qcb-version="4"]').forEach(initialiseComplaintPack);
})();

import("/complaint-builder/components/help-the-next-person.js?v=1.0.0")
  .catch((error) => console.error("Framework A completion component could not load.", error));
import("/complaint-builder/metrics/framework-a-metrics.js?v=1.3.1")
  .catch(() => {});
