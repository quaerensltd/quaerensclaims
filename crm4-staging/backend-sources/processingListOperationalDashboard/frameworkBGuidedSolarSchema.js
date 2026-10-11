"use strict";

const VERSION = "1.0";
const STATUSES = [
  "ANSWER PROVIDED",
  "CLIENT DOES NOT KNOW",
  "CLIENT UNSURE",
  "DOCUMENT EXISTS — NOT AVAILABLE NOW",
  "CLIENT WILL CHECK",
  "DOCUMENT NOT CURRENTLY LOCATED",
  "APPROXIMATE ANSWER",
  "NOT APPLICABLE",
  "NOT ASKED",
  "DECLINED TO ANSWER",
];
const SOURCES = [
  "CLIENT RECALL",
  "CLIENT READ FROM DOCUMENT DURING CALL",
  "CLIENT ENTERED FROM DOCUMENT",
  "DOCUMENT REPORTED AVAILABLE",
  "DOCUMENT UPLOADED NOT REVIEWED",
  "DOCUMENT REVIEWED",
  "INDEPENDENT EVIDENCE",
  "SYSTEM CALCULATION",
];
const q = (id, ref, step, question, type = "text", extra = {}) => ({
  id,
  ref,
  step,
  question,
  type,
  help:
    extra.help ||
    "Answer from what you currently know. An exact answer is not required unless stated.",
  where:
    extra.where ||
    "Your paperwork, emails, account records or personal recollection.",
  options: extra.options || [],
  required: Boolean(extra.required),
  showWhen: extra.showWhen || null,
  agent: {
    say: extra.say || question,
    meaning:
      extra.meaning ||
      extra.help ||
      "This helps organise the assessment accurately.",
    ifAsked:
      extra.ifAsked ||
      "Explain that uncertainty can be recorded and the answer can be confirmed later.",
    acceptable:
      extra.acceptable ||
      "An exact answer, an approximate answer, or an appropriate uncertainty status.",
    followups: extra.followups || [],
    unknown:
      extra.unknown ||
      "Record the appropriate uncertainty status. Do not guess or convert uncertainty into a negative answer.",
    record:
      extra.record ||
      "Record the client’s words accurately and select the correct source and certainty.",
    caution:
      extra.caution ||
      "Do not lead the client, infer fault or treat recollection as documentary proof.",
    impact:
      extra.impact ||
      "May affect the report narrative, evidence gaps and recommended confirmation steps.",
  },
});

const steps = [
  {
    id: "client",
    title: "About you",
    intro: "Tell us who the assessment is for and how we may send the report.",
  },
  {
    id: "paperwork",
    title: "Paperwork",
    intro:
      "It is fine if documents are not beside you. Tell us what may exist and what you can check later.",
  },
  {
    id: "installation",
    title: "Installation and parties",
    intro: "Identify the businesses and people involved as far as you can.",
  },
  {
    id: "representations",
    title: "What you were told",
    intro:
      "Record what you remember without treating recollection as verified fact.",
  },
  {
    id: "finance",
    title: "Finance and payments",
    intro: "Complete this section only if finance or credit was used.",
  },
  {
    id: "system",
    title: "System and performance",
    intro:
      "Use labels, monitoring screens or paperwork where available. Unknown technical details are acceptable.",
  },
  {
    id: "problems",
    title: "Problems and engineer visits",
    intro: "Describe the issues and any professional attendance or costs.",
  },
  {
    id: "evidence",
    title: "Evidence",
    intro:
      "Record whether each item is available, missing, to be checked or not applicable.",
  },
  {
    id: "history",
    title: "Complaints and chronology",
    intro:
      "Separate supplier, installer and lender contact. Approximate dates are acceptable.",
  },
  {
    id: "review",
    title: "Review and confirm",
    intro:
      "Review what was provided, what remains uncertain and what documents may follow.",
  },
];

const fields = [
  q("client.firstName", "S1-Q01", "client", "What is your first name?", "text", {
    required: true,
    where: "Your preferred name for the assessment report.",
    impact: "Identifies the client on the report.",
  }),
  q("client.lastName", "S1-Q01", "client", "What is your family name / surname?", "text", { required: true }),
  q(
    "client.email",
    "S1-Q02",
    "client",
    "What email address should receive the assessment?",
    "email",
    {
      required: true,
      where: "An email account you can access.",
      impact: "Controls the client report-delivery address.",
    },
  ),
  q(
    "client.mobile",
    "S1-Q03",
    "client",
    "What is your mobile number?",
    "tel",
    { required: true },
  ),
  q("client.telephone", "S1-Q03", "client", "What is your home telephone number? (optional)", "tel"),
  q("client.address", "S1-Q04", "client", "What is your address?", "textarea"),
  q(
    "client.jointApplicant",
    "S1-Q05",
    "client",
    "Is there a joint applicant or joint owner?",
    "text",
  ),
  q(
    "paperwork.availability",
    "S2-Q01",
    "paperwork",
    "Which best describes the paperwork you have available today?",
    "single",
    {
      options: [
        "Most paperwork is available",
        "Some paperwork is available",
        "Paperwork exists but is not available now",
        "I am unsure what paperwork exists",
        "I cannot currently locate the paperwork",
      ],
      impact: "Sets the evidence-readiness context and confirmation tasks.",
    },
  ),
  q(
    "installation.supplier",
    "S3-Q01",
    "installation",
    "Which company sold or supplied the solar system?",
  ),
  q(
    "installation.installerRelationship",
    "S3-Q02",
    "installation",
    "Was the installer the same company as the supplier?",
    "single",
    {
      options: ["Yes", "No", "Not sure"],
      followups: ["If no, ask for the installer name."],
    },
  ),
  q(
    "installation.installer",
    "S3-Q03",
    "installation",
    "Which company installed the system?",
    "text",
    { showWhen: { field: "installation.installerRelationship", not: "Yes" } },
  ),
  q(
    "installation.intermediaryInvolved",
    "S3-Q04",
    "installation",
    "Was a salesperson, broker or other intermediary involved?",
    "single",
    { options: ["Yes", "No", "Not sure"] },
  ),
  q(
    "installation.salesCompany",
    "S3-Q05",
    "installation",
    "What was the name of the sales company, broker or intermediary?",
    "text",
    {
      showWhen: { field: "installation.intermediaryInvolved", not: "No" },
      acceptable: "A company or trading name, or an uncertainty status.",
    },
  ),
  q("installation.salesperson", "S3-Q05A", "installation", "What was the salesperson or representative called?", "text", { showWhen: { field: "installation.intermediaryInvolved", not: "No" } }),
  q("installation.salesDetails", "S3-Q05B", "installation", "Is there anything else useful to record about how the sale was presented?", "textarea", { showWhen: { field: "installation.intermediaryInvolved", not: "No" } }),
  q(
    "installation.contractDate",
    "S3-Q06",
    "installation",
    "When did you agree to buy the system?",
    "date",
    {
      acceptable:
        "An exact date, month/year, season/year or approximate answer.",
    },
  ),
  q(
    "installation.installationDate",
    "S3-Q07",
    "installation",
    "When was the system installed?",
    "text",
    {
      acceptable:
        "An exact date, month/year, season/year or approximate answer.",
    },
  ),
  q(
    "installation.systemPrice",
    "S3-Q08",
    "installation",
    "What was the approximate total system price?",
    "money",
  ),
  q(
    "installation.paymentMethod",
    "S3-Q09",
    "installation",
    "How was the system paid for?",
    "single",
    {
      options: [
        "Cash or bank transfer",
        "Card",
        "Finance or loan",
        "Mixed payment methods",
        "Not sure",
      ],
    },
  ),
  q(
    "representations.recall",
    "S4-Q01",
    "representations",
    "In your own words, what do you remember being told before you agreed?",
    "textarea",
    {
      impact:
        "Provides the consumer-reported sales account and highlights documents to compare.",
    },
  ),
  q(
    "representations.selected",
    "S4-Q02",
    "representations",
    "Which statements do you remember hearing?",
    "multi",
    {
      options: [
        "Savings would cover finance",
        "System would pay for itself",
        "Specific generation or savings figures",
        "Little or no electricity bill",
        "Guaranteed income or export payments",
        "System would increase property value",
        "Finance was low risk or easily affordable",
        "Maintenance-free or trouble-free system",
        "Battery included or recommended",
        "Certification or scheme membership promised",
        "No statement clearly remembered",
      ],
    },
  ),
  q(
    "finance.used",
    "S5-Q01",
    "finance",
    "Was finance, credit or a loan used?",
    "single",
    { options: ["Yes", "No", "Not sure"] },
  ),
  q(
    "finance.lender",
    "S5-Q02",
    "finance",
    "Who is the lender or finance provider?",
    "text",
    { showWhen: { field: "finance.used", is: "Yes" } },
  ),
  q("finance.amount", "S5-Q03", "finance", "How much was financed?", "money", {
    showWhen: { field: "finance.used", is: "Yes" },
  }),
  q(
    "finance.monthlyPayment",
    "S5-Q04",
    "finance",
    "What is the monthly payment?",
    "money",
    { showWhen: { field: "finance.used", is: "Yes" } },
  ),
  q(
    "finance.outstandingBalance",
    "S5-Q05",
    "finance",
    "What is the approximate outstanding balance?",
    "money",
    { showWhen: { field: "finance.used", is: "Yes" } },
  ),
  q("finance.term", "S5-Q06", "finance", "What is the finance term?", "text", {
    showWhen: { field: "finance.used", is: "Yes" },
    acceptable: "Months or years, exact or approximate.",
  }),
  q(
    "finance.apr",
    "S5-Q07",
    "finance",
    "What APR is shown on the finance agreement?",
    "number",
    {
      showWhen: { field: "finance.used", is: "Yes" },
      where:
        "The finance agreement or lender statement. Do not calculate or guess it.",
      source: "CLIENT READ FROM DOCUMENT DURING CALL",
    },
  ),
  q(
    "system.panelCount",
    "S6-Q01",
    "system",
    "How many solar panels are installed?",
    "number",
  ),
  q(
    "system.panelModel",
    "S6-Q02",
    "system",
    "Do you know the panel make or model?",
  ),
  q(
    "system.inverter",
    "S6-Q03",
    "system",
    "What do you know about the inverter?",
    "text",
    {
      where:
        "A label on the inverter, an app, commissioning paperwork or invoice.",
    },
  ),
  q(
    "system.batteryPresent",
    "S6-Q04",
    "system",
    "Is a battery installed?",
    "single",
    { options: ["Yes", "No", "Not sure"] },
  ),
  q(
    "system.battery",
    "S6-Q05",
    "system",
    "What do you know about the battery and capacity?",
    "text",
    { showWhen: { field: "system.batteryPresent", not: "No" } },
  ),
  q(
    "system.monitoring",
    "S6-Q06",
    "system",
    "Can you see system performance in an app, display or portal?",
    "single",
    {
      options: [
        "Yes and I understand it",
        "Yes but I do not understand the figures",
        "No",
        "Not sure",
      ],
    },
  ),
  q(
    "system.mcs",
    "S6-Q07",
    "system",
    "Do you have an MCS certificate?",
    "single",
    {
      options: [
        "Yes and available now",
        "I think it exists but cannot find it",
        "No",
        "Not sure what this is",
      ],
    },
  ),
  q(
    "system.dno",
    "S6-Q08",
    "system",
    "Do you have DNO, G98 or G99 connection paperwork?",
    "single",
    { options: ["Yes", "No", "Not sure", "I have not heard of this"] },
  ),
  q(
    "system.exportArrangement",
    "S6-Q09",
    "system",
    "Do you have a FIT, SEG or other export-payment arrangement?",
    "single",
    { options: ["Yes", "No", "Not sure"] },
  ),
  q(
    "performance.projectedGeneration",
    "S6-Q10",
    "system",
    "What annual generation was projected?",
    "text",
    {
      where:
        "Sales proposal, quotation, design document or performance estimate.",
    },
  ),
  q(
    "performance.actualGeneration",
    "S6-Q11",
    "system",
    "What actual generation can you currently identify?",
    "text",
    {
      where:
        "Monitoring app, inverter display, generation meter or export statement.",
    },
  ),
  q(
    "performance.projectedSavings",
    "S6-Q12",
    "system",
    "What savings or income were projected?",
    "text",
  ),
  q(
    "performance.actualSavings",
    "S6-Q13",
    "system",
    "What savings or income have you actually identified?",
    "text",
  ),
  q(
    "problems.selected",
    "S7-Q01",
    "problems",
    "Which problems have you experienced?",
    "multi",
    {
      options: [
        "Underperformance",
        "Inverter problem",
        "Battery problem",
        "Roof leak or roof damage",
        "Electrical or safety concern",
        "System shutdown or downtime",
        "Monitoring problem",
        "Missing certification",
        "Export or payment problem",
        "Unexpected bills or finance pressure",
        "Warranty or repair problem",
        "Other",
      ],
    },
  ),
  q(
    "problems.detail",
    "S7-Q02",
    "problems",
    "Please describe the main problem in your own words.",
    "textarea",
  ),
  q(
    "engineer.attended",
    "S7-Q03",
    "problems",
    "Has an engineer or other professional attended?",
    "single",
    { options: ["Yes", "No", "Not sure"] },
  ),
  q(
    "engineer.findings",
    "S7-Q04",
    "problems",
    "What did the engineer or professional say or find?",
    "textarea",
    { showWhen: { field: "engineer.attended", is: "Yes" } },
  ),
  q(
    "engineer.cost",
    "S7-Q05",
    "problems",
    "What did the visit or proposed work cost?",
    "money",
    {
      showWhen: { field: "engineer.attended", is: "Yes" },
      acceptable: "Exact, approximate, verbal quote, or unknown.",
    },
  ),
  q(
    "engineer.invoice",
    "S7-Q06",
    "problems",
    "Is there an invoice, report or written quotation?",
    "single",
    {
      options: [
        "Yes and available",
        "I think so but cannot find it",
        "Verbal only",
        "No",
        "Not sure",
      ],
      showWhen: { field: "engineer.attended", is: "Yes" },
    },
  ),
  q(
    "history.complained",
    "S9-Q01",
    "history",
    "Have you complained to the supplier or installer?",
    "single",
    { options: ["Yes", "No", "Not sure"] },
  ),
  q(
    "history.complaintDate",
    "S9-Q02",
    "history",
    "When did you first complain?",
    "text",
    {
      showWhen: { field: "history.complained", is: "Yes" },
      acceptable: "Exact or approximate date.",
    },
  ),
  q(
    "history.response",
    "S9-Q03",
    "history",
    "What response did the supplier or installer give?",
    "textarea",
    { showWhen: { field: "history.complained", is: "Yes" } },
  ),
  q("history.supplierResponseDate", "S9-Q03A", "history", "When did the supplier or installer respond?", "date", { showWhen: { field: "history.complained", is: "Yes" }, acceptable: "Exact or approximate date." }),
  q(
    "history.lenderContact",
    "S9-Q04",
    "history",
    "Have you contacted the lender about the dispute?",
    "single",
    {
      options: ["Yes", "No", "Not applicable", "Not sure"],
      showWhen: { field: "finance.used", is: "Yes" },
    },
  ),
  q(
    "history.lenderResponse",
    "S9-Q05",
    "history",
    "What response did the lender give?",
    "textarea",
    { showWhen: { field: "history.lenderContact", is: "Yes" } },
  ),
  q("history.lenderContactDate", "S9-Q05A", "history", "When did you contact the lender?", "date", { showWhen: { field: "history.lenderContact", is: "Yes" }, acceptable: "Exact or approximate date." }),
  q("history.lenderContactSummary", "S9-Q05B", "history", "What did you tell the lender?", "textarea", { showWhen: { field: "history.lenderContact", is: "Yes" } }),
  q("history.lenderResponseDate", "S9-Q05C", "history", "When did the lender respond?", "date", { showWhen: { field: "history.lenderContact", is: "Yes" }, acceptable: "Exact or approximate date." }),
  q("engineer.date", "S7-Q06A", "problems", "When did the engineer or professional attend?", "date", { showWhen: { field: "engineer.attended", is: "Yes" }, acceptable: "Exact or approximate date." }),
  q(
    "review.confirmation",
    "S10-Q01",
    "review",
    "Have you reviewed the information and identified anything you still need to check?",
    "single",
    { required: true, options: ["Yes", "I need to review it again"] },
  ),
  q(
    "review.documentsLater",
    "S10-Q02",
    "review",
    "Are there documents you may provide or check later?",
    "textarea",
  ),
  q(
    "review.disclosureAccepted",
    "S10-Q03",
    "review",
    "Do you agree to the assessment and delivery statement shown below?",
    "consent",
    {
      required: true,
      impact:
        "Records explicit consent to create and deliver the preliminary assessment.",
    },
  ),
];

const evidence = [
  "Contract or order form",
  "Quotation or sales proposal",
  "Invoice or proof of payment",
  "Finance agreement",
  "Lender statements",
  "Projected generation or savings document",
  "MCS certificate",
  "DNO / G98 / G99 paperwork",
  "Panel and inverter specifications",
  "Monitoring screenshots or exports",
  "Electricity bills",
  "Export / FIT / SEG statements",
  "Photographs or videos",
  "Engineer report",
  "Repair invoice or quotation",
  "Warranty records",
  "Supplier or installer complaint correspondence",
  "Lender complaint correspondence",
  "Advertising or sales messages",
].map((title, i) => ({
  id: `evidence.${i + 1}`,
  ref: `S8-Q${String(i + 1).padStart(2, "0")}`,
  step: "evidence",
  title,
  question: `What is the current position for: ${title}?`,
  options: [
    "Available now",
    "Exists — not available now",
    "Will check",
    "Cannot currently locate",
    "Not sure whether it exists",
    "Not applicable",
  ],
  agent: {
    say: `Do you have ${title.toLowerCase()}, or do you think it exists?`,
    meaning:
      "This records evidence readiness without describing an unreviewed document as verified.",
    ifAsked:
      "Explain that the document does not need to be available during the call.",
    acceptable: "Any listed evidence state.",
    unknown: "Use the stated unknown or check-later position.",
    record:
      "Record the evidence state and source; never mark it reviewed unless it has actually been reviewed.",
    caution: "Do not infer document contents or authenticity.",
    impact:
      "Affects Evidence Readiness and the report’s documents-to-confirm list.",
  },
}));

const publicSchema = () => ({
  version: VERSION,
  category: "solar",
  title: "Solar Preliminary Assessment",
  statuses: STATUSES,
  sources: SOURCES,
  steps,
  fields: fields.map(({ agent, ...x }) => x),
  evidence: evidence.map(({ agent, ...x }) => x),
});
const agentSchema = () => ({
  version: VERSION,
  category: "solar",
  title: "Solar Guided Assessment Intake",
  statuses: STATUSES,
  sources: SOURCES,
  steps,
  fields,
  evidence,
});
module.exports = {
  VERSION,
  STATUSES,
  SOURCES,
  steps,
  fields,
  evidence,
  publicSchema,
  agentSchema,
};
