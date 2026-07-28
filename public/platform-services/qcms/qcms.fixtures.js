const { EVIDENCE_STATUSES } = require("./qcms.config");
const { normaliseCaseSummary } = require("./qcms.case-summary");

const R = EVIDENCE_STATUSES.REQUIREMENT;
const A = EVIDENCE_STATUSES.AVAILABILITY;

function evidence(name, category, requirementStatus, availabilityStatus) {
  return { name, category, requirementStatus, availabilityStatus };
}

const energyFixture = normaliseCaseSummary({
  caseId: "QCMS-FIXTURE-ENERGY",
  sourceBuilder: "energy",
  sourceBuilderVersion: "1.0.0",
  complaintCategory: "Energy",
  complaintType: "Energy supplier complaint and switching",
  complaintTitle: "Incorrect estimated bills and smart meter not communicating",
  respondent: "Fictional Energy Supplier Ltd",
  complaintIssues: ["Estimated bills", "Smart meter not communicating", "Direct debit increased"],
  complaintSummary: "A fictional Platform User received estimated bills, a direct debit increase and unclear meter readings.",
  chronology: [
    { date: "01/02/2026", event: "Smart meter readings stopped appearing on bills." },
    { date: "15/03/2026", event: "Estimated bill received." },
    { date: "01/04/2026", event: "Direct debit increased." },
    { date: "20/04/2026", event: "Complaint raised." },
    { date: "10/05/2026", event: "Supplier replied with incomplete explanation." }
  ],
  financialPosition: {
    currency: "GBP",
    disputedValuePence: 42000,
    documentedLossPence: 16000,
    refundRequestedPence: null,
    hasFinancialReconstructionNeed: false,
    notes: "Bills and payments need moderate review."
  },
  requestedOutcomes: ["Correct bill", "Explain direct debit", "Review meter issue"],
  evidenceItems: [
    evidence("Recent bill", "invoices/bills", R.REQUIRED, A.AVAILABLE),
    evidence("Direct debit notice", "payment proof", R.REQUIRED, A.AVAILABLE),
    evidence("Meter readings", "technical reports", R.RECOMMENDED, A.UNCLEAR),
    evidence("Complaint correspondence", "correspondence", R.REQUIRED, A.AVAILABLE),
    evidence("Supplier final response", "final response/deadlock letter", R.RECOMMENDED, A.MISSING)
  ],
  generatedDocuments: ["Complaint letter", "Financial summary", "Evidence checklist"],
  officialRoute: {
    routeName: "Energy supplier complaint route",
    routeType: "supplier",
    requiresPortal: true,
    verificationStatus: "verified"
  }
});

const flightFixture = normaliseCaseSummary({
  caseId: "QCMS-FIXTURE-FLIGHT",
  sourceBuilder: "flight",
  sourceBuilderVersion: "1.0.0",
  complaintCategory: "Travel",
  complaintType: "Flight disruption",
  complaintTitle: "One delayed flight complaint pack",
  respondent: "Fictional Airways",
  complaintIssues: ["Arrival delay"],
  complaintSummary: "A fictional one-passenger delayed flight with complete journey information.",
  chronology: [
    { date: "15/06/2026", event: "Flight departed late." },
    { date: "15/06/2026", event: "Passenger arrived more than three hours late." }
  ],
  financialPosition: {
    currency: "GBP",
    disputedValuePence: 35000,
    documentedLossPence: 0,
    refundRequestedPence: null,
    hasFinancialReconstructionNeed: false
  },
  requestedOutcomes: ["Statutory compensation where supported"],
  evidenceItems: [
    evidence("Booking confirmation", "contract/booking documents", R.REQUIRED, A.AVAILABLE),
    evidence("Boarding pass", "identity/contact", R.REQUIRED, A.AVAILABLE),
    evidence("Delay evidence", "correspondence", R.REQUIRED, A.AVAILABLE),
    evidence("Expenses", "financial loss evidence", R.NOT_APPLICABLE, A.UNCLEAR)
  ],
  generatedDocuments: ["Complaint pack", "Timeline", "Evidence checklist"],
  officialRoute: {
    routeName: "Airline official complaint form",
    routeType: "airline portal",
    requiresPortal: true,
    verificationStatus: "verified"
  }
});

const carFinanceFixture = normaliseCaseSummary({
  caseId: "QCMS-FIXTURE-CARFINANCE",
  sourceBuilder: "car-finance",
  sourceBuilderVersion: "1.0.0",
  complaintCategory: "Finance",
  complaintType: "Car finance complaint",
  complaintTitle: "Commission concern with partly missing agreement",
  respondent: ["Fictional Motor Finance", "Fictional Dealer Ltd"],
  complaintIssues: ["Commission concern", "Agreement missing", "Affordability concern"],
  complaintSummary: "A fictional Platform User has partial documents and needs chronology and financial reconstruction.",
  chronology: [
    { date: "03/01/2022", event: "Vehicle agreement signed." },
    { date: "10/02/2026", event: "Potential commission issue identified." },
    { date: "18/02/2026", event: "Information request drafted." }
  ],
  financialPosition: {
    currency: "GBP",
    disputedValuePence: 250000,
    documentedLossPence: null,
    refundRequestedPence: null,
    hasFinancialReconstructionNeed: true
  },
  requestedOutcomes: ["Information request", "Review agreement paperwork"],
  evidenceItems: [
    evidence("Finance agreement", "contract/booking documents", R.REQUIRED, A.MISSING),
    evidence("Payment history", "payment proof", R.REQUIRED, A.UNCLEAR),
    evidence("Dealer correspondence", "correspondence", R.RECOMMENDED, A.AVAILABLE),
    evidence("Commission disclosure", "contract/booking documents", R.REQUIRED, A.MISSING),
    evidence("Timeline notes", "chronology", R.RECOMMENDED, A.UNCLEAR)
  ],
  generatedDocuments: ["Information request", "Evidence checklist"],
  officialRoute: {
    routeName: "Lender complaint route",
    routeType: "finance complaint",
    requiresPortal: false,
    verificationStatus: "verified"
  }
});

const manualReviewFixture = normaliseCaseSummary({
  caseId: "QCMS-FIXTURE-MANUAL",
  sourceBuilder: "mixed",
  sourceBuilderVersion: "1.0.0",
  complaintCategory: "Multiple",
  complaintType: "Mixed unrelated disputes",
  complaintTitle: "Several unrelated disputes with jurisdiction concerns",
  respondent: ["Organisation A", "Organisation B", "Organisation C", "Organisation D"],
  complaintIssues: ["Court proceedings", "Jurisdiction unclear", "Technical evidence", "Debt collection", "Specialist legal support requested"],
  complaintSummary: "A fictional mixed scenario requiring manual scope review.",
  chronology: new Array(10).fill(null).map((_, index) => ({ date: `0${(index % 9) + 1}/01/2026`, event: `Event ${index + 1}` })),
  financialPosition: {
    currency: "GBP",
    disputedValuePence: 900000,
    documentedLossPence: 125000,
    refundRequestedPence: null,
    hasFinancialReconstructionNeed: true
  },
  evidenceItems: [
    evidence("Expert report", "technical reports", R.REQUIRED, A.UNCLEAR),
    evidence("Court document", "correspondence", R.REQUIRED, A.AVAILABLE),
    evidence("Debt collector letter", "correspondence", R.REQUIRED, A.AVAILABLE)
  ],
  generatedDocuments: ["Draft summary"],
  riskFlags: ["court proceedings", "unclear jurisdiction", "specialist legal requested", "debt collection present"],
  officialRoute: {
    routeName: null,
    routeType: "unknown",
    requiresPortal: false,
    verificationStatus: "requires verification"
  }
});

const holidayFixture = normaliseCaseSummary({
  caseId: "QCMS-FIXTURE-HOLIDAY",
  sourceBuilder: "holiday",
  sourceBuilderVersion: "1.0.0",
  complaintCategory: "Travel",
  complaintType: "Holiday and package travel complaint",
  complaintTitle: "Accommodation not as described and refund refused",
  respondent: "Fictional Travel Company Ltd",
  complaintIssues: ["Accommodation not as described", "Missing facilities", "Refund refused"],
  complaintSummary: "A fictional Platform User has booking documents, photos and complaint correspondence about a package holiday where the accommodation did not match the booking description.",
  chronology: [
    { date: "04/07/2026", event: "Holiday booking confirmed." },
    { date: "18/07/2026", event: "Platform User arrived and recorded missing facilities." },
    { date: "20/07/2026", event: "Complaint raised with the travel company." },
    { date: "05/08/2026", event: "Refund request refused without a full explanation." }
  ],
  financialPosition: {
    currency: "GBP",
    disputedValuePence: 120000,
    documentedLossPence: 45000,
    refundRequestedPence: null,
    hasFinancialReconstructionNeed: false
  },
  requestedOutcomes: ["Review refund refusal", "Organise evidence", "Prepare complaint route"],
  evidenceItems: [
    evidence("Holiday booking confirmation", "contract/booking documents", R.REQUIRED, A.AVAILABLE),
    evidence("Listing screenshots", "contract/booking documents", R.RECOMMENDED, A.AVAILABLE),
    evidence("Accommodation photographs", "photos/screenshots", R.REQUIRED, A.AVAILABLE),
    evidence("Complaint correspondence", "correspondence", R.REQUIRED, A.AVAILABLE),
    evidence("Final response", "final response/deadlock letter", R.RECOMMENDED, A.MISSING),
    evidence("Extra accommodation receipts", "financial loss evidence", R.RECOMMENDED, A.UNCLEAR)
  ],
  generatedDocuments: ["Complaint pack", "Evidence checklist", "Timeline"],
  officialRoute: {
    routeName: "Travel company complaint route",
    routeType: "travel complaint",
    requiresPortal: false,
    verificationStatus: "verified"
  }
});

const incompleteFixture = normaliseCaseSummary({
  caseId: "QCMS-FIXTURE-INCOMPLETE",
  sourceBuilder: "unknown",
  sourceBuilderVersion: "1.0.0",
  complaintCategory: "",
  complaintType: "",
  complaintTitle: "",
  respondent: "",
  complaintIssues: [],
  complaintSummary: "",
  chronology: [],
  financialPosition: {
    currency: "GBP",
    disputedValuePence: null,
    documentedLossPence: null,
    refundRequestedPence: null,
    hasFinancialReconstructionNeed: false
  },
  evidenceItems: [
    evidence("Core complaint evidence", "correspondence", R.REQUIRED, A.MISSING)
  ],
  generatedDocuments: [],
  officialRoute: {
    routeName: null,
    routeType: "unknown",
    requiresPortal: false,
    verificationStatus: "requires verification"
  }
});

module.exports = {
  energyFixture,
  flightFixture,
  carFinanceFixture,
  manualReviewFixture,
  holidayFixture,
  incompleteFixture
};
