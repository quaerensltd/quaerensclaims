"use strict";

const { TEMPLATE } = require("./frameworkBRenderer");
const {
  sprayFoamFinancialRange,
  scenarioRows,
} = require("./frameworkBFinancialRange");

const text = (value) => String(value == null ? "" : value).trim();
const lower = (value) => text(value).toLowerCase();
const value = (object, path) =>
  path.split(".").reduce((current, key) => current && current[key], object);
const list = (value) =>
  Array.isArray(value)
    ? value.filter(Boolean)
    : text(value)
      ? [text(value)]
      : [];
const number = (value) => {
  const cleaned = text(value).replace(/[^0-9.-]/g, "");
  if (!cleaned || cleaned === "-" || cleaned === ".") return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};
const pounds = (value) =>
  number(value) == null
    ? "Not provided"
    : new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(number(value));
const sentence = (value) =>
  text(value)
    .replace(/\s*\.{2,}\s*/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
const label = (value) =>
  text(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (x) => x.toUpperCase());
const reported = (value, fallback = "Requires confirmation") =>
  text(value) || fallback;
const PRESENCE = Object.freeze({
  REPORTED: "REPORTED",
  ABSENT: "ABSENT",
  NOT_SUPPLIED: "NOT_SUPPLIED",
});
const choicePresence = (choice) => {
  const current = lower(choice);
  if (current === "yes") return PRESENCE.REPORTED;
  if (current === "no" || current === "no current transaction")
    return PRESENCE.ABSENT;
  return PRESENCE.NOT_SUPPLIED;
};
const eventPresence = (data, key, { control, signals = [] } = {}) => {
  const explicit = text(value(data, `presence.${key}`)).toUpperCase();
  if (Object.values(PRESENCE).includes(explicit)) return explicit;
  if (
    signals.some((path) => {
      const current = value(data, path);
      return Array.isArray(current) ? current.filter(Boolean).length : text(current);
    })
  )
    return PRESENCE.REPORTED;
  return control ? choicePresence(value(data, control)) : PRESENCE.NOT_SUPPLIED;
};
const presenceText = (presence, reportedText, absentText, missingText) =>
  presence === PRESENCE.REPORTED
    ? reportedText
    : presence === PRESENCE.ABSENT
      ? absentText
      : missingText;
const cleanOutput = (value) =>
  Array.isArray(value)
    ? value.map(cleanOutput)
    : value && typeof value === "object"
      ? Object.fromEntries(
          Object.entries(value).map(([key, item]) => [key, cleanOutput(item)]),
        )
      : typeof value === "string"
        ? value
            .replace(/\s*\.{2,}\s*/g, ". ")
            .replace(/\s+([,;:.])/g, "$1")
            .trim()
        : value;

const months = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};
function dateKey(raw, sequence) {
  const source = lower(raw).replace(/,/g, " ").replace(/\s+/g, " ");
  const exact = source.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (exact)
    return [Number(exact[1]), Number(exact[2]) - 1, Number(exact[3]), sequence];
  const dayMonth = source.match(
    /(?:around |approximately |approx\.? )?(\d{1,2})\s+([a-z]+)\s+(\d{4})/,
  );
  if (dayMonth && months[dayMonth[2]] != null)
    return [
      Number(dayMonth[3]),
      months[dayMonth[2]],
      Number(dayMonth[1]),
      sequence,
    ];
  const monthYear = source.match(
    /(?:around |approximately |approx\.? )?([a-z]+)\s+(\d{4})/,
  );
  if (monthYear && months[monthYear[1]] != null)
    return [Number(monthYear[2]), months[monthYear[1]], 15, sequence];
  const year = source.match(/\b(19|20)\d{2}\b/);
  if (year) {
    const season = source.includes("spring")
      ? 2
      : source.includes("summer")
        ? 5
        : source.includes("autumn") || source.includes("fall")
          ? 8
          : source.includes("winter")
            ? 11
            : 6;
    return [Number(year[0]), season, 15, sequence];
  }
  return [9999, 11, 31, sequence];
}
function chronology(data) {
  const rows = [];
  const add = (date, event) => {
    if (!text(date) && !text(event)) return;
    const sequence = rows.length;
    rows.push({
      date_or_stage: text(date) || "Date requires confirmation",
      event_or_relevance: sentence(event),
      _key: dateKey(date, sequence),
    });
  };
  add(
    value(data, "installation.date"),
    `Spray foam installation reported; installer: ${reported(value(data, "installation.installer"))}.`,
  );
  const events = [
    [
      "installerComplaint",
      { signals: ["history.installerComplaintDate", "history.installerComplaint"] },
      "history.installerComplaintDate",
      `Installer complaint: ${reported(value(data, "history.installerComplaint"), "Complaint details require confirmation")}.`,
    ],
    [
      "installerResponse",
      { signals: ["history.installerResponseDate", "history.installerResponse"] },
      "history.installerResponseDate",
      `Installer response: ${reported(value(data, "history.installerResponse"), "Response details require confirmation")}.`,
    ],
    [
      "propertyTransaction",
      {
        control: "lending.affected",
        signals: [
          "lending.date",
          "lending.lender",
          "lending.broker",
          "lending.valuer",
          "lending.exactWording",
          "lending.outcome",
          "lending.impactTypes",
        ],
      },
      "lending.date",
      `Mortgage, valuation or property transaction event: ${reported(value(data, "lending.exactWording"), "Written reason requires confirmation")}.`,
    ],
    [
      "professionalInspection",
      {
        control: "professional.inspected",
        signals: [
          "professional.date",
          "professional.name",
          "professional.findings",
          "professional.reportAvailable",
        ],
      },
      "professional.date",
      `Independent inspection: ${reported(value(data, "professional.findings"), "Findings require confirmation")}.`,
    ],
    [
      "financeProviderComplaint",
      { signals: ["history.lenderComplaintDate", "history.lenderComplaint"] },
      "history.lenderComplaintDate",
      `Finance-provider complaint: ${reported(value(data, "history.lenderComplaint"), "Complaint details require confirmation")}.`,
    ],
    [
      "financeProviderResponse",
      { signals: ["history.lenderResponseDate", "history.lenderResponse"] },
      "history.lenderResponseDate",
      `Finance-provider response: ${reported(value(data, "history.lenderResponse"), "Response details require confirmation")}.`,
    ],
    [
      "removalRemedial",
      {
        control: "remedial.completed",
        signals: [
          "remedial.completionDate",
          "remedial.details",
          "remedial.amountPaid",
          "remedial.extent",
        ],
      },
      "remedial.completionDate",
      `Removal or remedial event: ${reported(value(data, "remedial.details"), "The client reports that spray foam removal was carried out; the contractor, scope and actual cost require confirmation")}.`,
    ],
  ];
  for (const [key, options, datePath, event] of events)
    if (eventPresence(data, key, options) === PRESENCE.REPORTED)
      add(value(data, datePath), event);
  return rows
    .sort((a, b) =>
      a._key.findIndex((part, index) => part !== b._key[index]) < 0
        ? 0
        : (() => {
            for (let index = 0; index < a._key.length; index += 1)
              if (a._key[index] !== b._key[index])
                return a._key[index] - b._key[index];
            return 0;
          })(),
    )
    .map(({ _key, ...row }) => row);
}

const evidenceStatus = (status) => {
  const current = lower(status).replace(/[â€”â€“]/g, "-");
  if (current.includes("exists") && current.includes("not available"))
    return "Reported to exist - not currently available";
  if (current.includes("available now")) return "Available for review";
  if (current.includes("will check")) return "Client will check";
  if (current.includes("cannot currently locate"))
    return "Reported to exist - not currently located";
  if (current.includes("not sure")) return "Existence requires confirmation";
  if (current.includes("not supplied")) return "Not supplied";
  if (current.includes("not applicable")) return "Not applicable";
  return "Not identified";
};
const evidenceAction = (status) =>
  status === "Available for review"
    ? "Review the identified record and compare it with the relevant account, technical and complaint facts."
    : status === "Not applicable"
      ? "No action is presently indicated for this evidence category."
      : "Confirm whether this record exists and obtain or locate it where relevant before a concluded position is reached.";

function sprayFoamReport(data, qar) {
  const observations = list(value(data, "condition.observations"));
  const substantiveObservations = observations.filter(
    (item) => item !== "No visible problem",
  );
  const safeObservations = substantiveObservations.length
    ? substantiveObservations
    : observations;
  const financePrincipal = number(value(data, "finance.principal"));
  const monthly = number(value(data, "finance.monthlyPayment"));
  const term = number(value(data, "finance.term"));
  const contractual =
    monthly != null && term != null
      ? Number((monthly * term).toFixed(2))
      : null;
  const financeCost =
    contractual != null && financePrincipal != null
      ? Number(Math.max(0, contractual - financePrincipal).toFixed(2))
      : null;
  const installation = number(value(data, "installation.cost"));
  const consumerPaid = number(value(data, "installation.consumerPaid"));
  const grant = number(value(data, "grant.amount"));
  const inspectionPaid = number(value(data, "professional.cost"));
  const furtherSurvey = number(value(data, "professional.furtherCost"));
  const removalQuote = number(value(data, "remedial.removalQuote"));
  const removalEstimateRange = value(data, "remedial.removalEstimateRange");
  const removalPaid = number(value(data, "remedial.amountPaid"));
  const furtherRemedial = number(value(data, "remedial.secondRemoval"));
  const targetedRepair = number(value(data, "remedial.repairCost"));
  const roofReplacement = number(value(data, "remedial.roofReplacementCost"));
  const monthlyMortgage = number(value(data, "lending.higherMonthlyCost"));
  const fees = number(value(data, "lending.additionalFees"));
  const other = number(value(data, "financial.otherCosts"));
  const credits = number(value(data, "financial.credits")) || 0;
  const incurredRows = [
    [
      "Consumer contribution",
      consumerPaid,
      "Reported paid contribution; verify against invoice and payment evidence.",
    ],
    [
      "Professional inspection paid",
      inspectionPaid,
      "Reported paid professional cost; verify receipt and report.",
    ],
    [
      "Removal cost actually paid",
      removalPaid,
      "Reported paid first-removal cost; the original quotation is not added again.",
    ],
    [
      "Second removal / further remedial cost",
      furtherRemedial,
      "Reported evidenced or committed cost; confirm invoice, payment or binding commitment.",
    ],
    [
      "Targeted timber, felt or roof repair cost",
      targetedRepair,
      "Reported evidenced or committed cost; confirm whether paid, invoiced or quoted.",
    ],
    [
      "Valuation / application fees",
      fees,
      "Reported transaction fees; verify statements or receipts.",
    ],
    [
      "Other direct evidenced costs",
      other,
      "Reported direct cost; verify basis and payment evidence.",
    ],
  ].filter(([, amount]) => amount != null && amount > 0);
  const incurredTotal = Math.max(
    0,
    Number(
      (
        incurredRows.reduce((sum, [, amount]) => sum + amount, 0) - credits
      ).toFixed(2),
    ),
  );
  const prospectiveTotal =
    furtherSurvey != null && furtherSurvey > 0 ? furtherSurvey : 0;
  const roofIncludesRemoval =
    /includes?\s+(?:the\s+)?(?:spray\s+foam\s+)?removal|removal\s+included/i.test(
      text(value(data, "remedial.details")),
    );
  const financialRange = sprayFoamFinancialRange({
    installationPrice: installation,
    removalQuote,
    removalEstimateRange,
    removalPaid,
    inspectionPaid,
    furtherRemedial,
    targetedRepair,
    roofReplacement,
    roofIncludesRemoval,
    fees,
    otherCosts: other,
    credits,
  });
  const financial = [
    ...incurredRows.map(([field, amount, basis]) => ({
      field,
      amount: pounds(amount),
      basis_or_comment: `INCURRED / REPORTED PAID OR COMMITTED. ${basis}`,
    })),
    credits > 0 && {
      field: "Credits or refunds already received",
      amount: `-${pounds(credits)}`,
      basis_or_comment:
        "Deduction from direct incurred exposure; verify payment evidence.",
    },
    furtherSurvey != null &&
      furtherSurvey > 0 && {
        field: "Further survey quotation",
        amount: pounds(furtherSurvey),
        basis_or_comment:
          "QUOTED / PROSPECTIVE. Not included as an incurred cost unless instructed or paid.",
      },
    monthlyMortgage != null &&
      monthlyMortgage > 0 && {
        field: "Additional mortgage cost",
        amount: `${pounds(monthlyMortgage)} per month`,
        basis_or_comment:
          "ONGOING. Duration not yet confirmed; no indefinite multiplier has been applied.",
      },
    removalQuote != null &&
      removalQuote > 0 && {
        field: "Original removal quotation",
        amount: pounds(removalQuote),
        basis_or_comment:
          removalPaid != null && removalPaid > 0
            ? `REFERENCE ONLY. Superseded for exposure calculations by the ${pounds(removalPaid)} actually paid.`
            : "QUOTED / PROSPECTIVE. Not treated as incurred.",
      },
    removalEstimateRange && {
      field: "Removal estimate range",
      amount: `${pounds(removalEstimateRange.lower)} - ${pounds(removalEstimateRange.upper)}`,
      basis_or_comment:
        "ESTIMATED / PROSPECTIVE. The range is retained as one estimate and is not treated as incurred loss.",
    },
  ].filter(Boolean);

  const evidenceItems = Object.entries(data.evidence || {}).map(
    ([category, status]) => ({ category, status: evidenceStatus(status) }),
  );
  const evidenceRequired = evidenceItems
    .filter(
      (item) =>
        !["Available for review", "Not applicable"].includes(item.status),
    )
    .map((item, index) => ({
      priority: index < 8 ? "HIGH" : "FOLLOW UP",
      evidence_required: item.category,
      why_it_matters: evidenceAction(item.status),
    }));
  const evidenceBy = (pattern) =>
    evidenceItems.find((item) => pattern.test(item.category));
  const information = evidenceItems
    .filter(
      (item) =>
        !["Available for review", "Not applicable"].includes(item.status),
    )
    .map((item) => `${item.category}: ${item.status.toLowerCase()}`);
  const addInformation = (condition, item) => {
    if (condition) information.push(item);
  };
  addInformation(
    !evidenceBy(/BBA certificate/i) ||
      evidenceBy(/BBA certificate/i).status !== "Available for review",
    "Confirm whether a BBA certificate or product reference exists.",
  );
  addInformation(
    !evidenceBy(/Insurance-backed guarantee/i) ||
      evidenceBy(/Insurance-backed guarantee/i).status !==
        "Available for review",
    "Confirm whether an insurance-backed guarantee exists.",
  );
  addInformation(
    !evidenceBy(/Completion certificate/i) ||
      evidenceBy(/Completion certificate/i).status !== "Available for review",
    "Confirm whether a completion certificate was supplied.",
  );
  addInformation(
    !evidenceBy(/Ventilation assessment/i) ||
      evidenceBy(/Ventilation assessment/i).status !== "Available for review",
    "Obtain or confirm any ventilation assessment.",
  );
  addInformation(
    grant != null &&
      (!evidenceBy(/Grant\/funding paperwork/i) ||
        evidenceBy(/Grant\/funding paperwork/i).status !==
          "Available for review"),
    "Obtain the grant or funding paperwork and reconcile it with the installation price and consumer contribution.",
  );
  addInformation(
    furtherRemedial != null && furtherRemedial > 0,
    `Confirm whether the ${pounds(furtherRemedial)} second-removal or remedial figure was paid, invoiced or quoted.`,
  );
  addInformation(
    targetedRepair != null && targetedRepair > 0,
    `Confirm whether the ${pounds(targetedRepair)} targeted repair figure was paid, invoiced or quoted.`,
  );
  addInformation(
    furtherSurvey != null && furtherSurvey > 0,
    `Confirm whether the ${pounds(furtherSurvey)} further survey has been instructed or paid.`,
  );
  addInformation(
    monthlyMortgage != null && monthlyMortgage > 0,
    `Confirm the evidenced duration of the additional ${pounds(monthlyMortgage)} monthly mortgage cost.`,
  );
  addInformation(
    monthly != null,
    `Verify the ${pounds(monthly)} monthly finance payment against the executed agreement or statement.`,
  );
  addInformation(
    value(data, "history.lenderComplaint") &&
      !/final response|resolved|closed|upheld|rejected/i.test(
        text(value(data, "history.lenderResponse")),
      ),
    "Confirm whether the finance provider has issued a final response and record the applicable complaint timing.",
  );
  addInformation(
    value(data, "remedial.completed") === "Yes",
    "Obtain final post-removal photographs or professional roof/timber condition evidence where available.",
  );
  const informationToConfirm = [...new Set(information)];

  const salesPresence = eventPresence(data, "salesRepresentations", {
    signals: ["sales.ownWords", "sales.representations", "sales.reliance"],
  });
  const professionalPresence = eventPresence(data, "professionalInspection", {
    control: "professional.inspected",
    signals: [
      "professional.date",
      "professional.name",
      "professional.findings",
      "professional.reportAvailable",
    ],
  });
  const lenderPresence = eventPresence(data, "lenderInvolvement", {
    control: "lending.affected",
    signals: [
      "lending.lender",
      "lending.broker",
      "lending.valuer",
      "lending.date",
      "lending.exactWording",
      "lending.outcome",
      "lending.impactTypes",
    ],
  });
  const lenderComplaintPresence = eventPresence(
    data,
    "financeProviderComplaint",
    { signals: ["history.lenderComplaintDate", "history.lenderComplaint"] },
  );
  const removalPresence = eventPresence(data, "removalRemedial", {
    control: "remedial.completed",
    signals: [
      "remedial.completionDate",
      "remedial.details",
      "remedial.amountPaid",
      "remedial.extent",
    ],
  });
  const lenderFinal = /final response|resolved|closed|upheld|rejected/i.test(
    text(value(data, "history.lenderResponse")),
  );
  const lenderComplaintStatus = lenderComplaintPresence === PRESENCE.REPORTED
    ? lenderFinal
      ? "Response recorded - verify final-response status"
      : "OPEN / AWAITING FINAL RESPONSE"
    : lenderComplaintPresence === PRESENCE.ABSENT
      ? "No finance-provider complaint was reported"
      : "No finance-provider complaint information has been supplied";
  const clientCondition = safeObservations.length
    ? safeObservations.join(", ")
    : "No client observation recorded";
  const professionalFindings = reported(
    value(data, "professional.findings"),
    "No professional findings recorded",
  );
  const professionalPosition = `${presenceText(
    professionalPresence,
    `The consumer reports ${clientCondition.toLowerCase()}. The professional record reports ${sentence(professionalFindings)}${text(value(data, "professional.moisture")) ? ` Moisture reading: ${sentence(value(data, "professional.moisture"))}.` : ""}${text(value(data, "professional.humidity")) ? ` Humidity reading: ${sentence(value(data, "professional.humidity"))}.` : ""}`,
    `The consumer reports ${clientCondition.toLowerCase()}. No professional inspection was reported.`,
    `The consumer reports ${clientCondition.toLowerCase()}. No information has been supplied regarding a professional inspection.`,
  )} These matters do not, without further evidence, establish the full extent or cause of concealed deterioration or liability.`;
  const salesCategories = list(value(data, "sales.representations"));
  const salesRows = [
    salesPresence === PRESENCE.REPORTED && {
      sales_issue: "Consumer recollection",
      current_position: sentence(reported(value(data, "sales.ownWords"))),
      evidence_needed:
        "Compare with contemporaneous sales material, notes and correspondence.",
    },
    salesCategories.length && {
      sales_issue: "Representation categories",
      current_position: salesCategories.join(", "),
      evidence_needed:
        "The selected categories organise the account but do not prove that a representation was made.",
    },
    text(value(data, "sales.reliance")) && {
      sales_issue: "Reliance",
      current_position: sentence(value(data, "sales.reliance")),
      evidence_needed:
        "Compare the stated reliance with the decision timeline and contemporaneous documents.",
    },
    salesPresence !== PRESENCE.REPORTED && {
      sales_issue: "Sales representations status",
      current_position:
        salesPresence === PRESENCE.ABSENT
          ? "No sales representations or assurances were reported."
          : "No information has yet been supplied regarding sales representations or assurances.",
      evidence_needed:
        "Confirm the sales account and obtain any relevant sales material or correspondence where available.",
    },
  ].filter(Boolean);
  const scenarios = scenarioRows(financialRange);

  const executiveSummary = [
    `This preliminary assessment concerns spray foam installed by ${reported(value(data, "installation.installer"))} at the client's property. The reported installation price is ${pounds(installation)}, with a consumer contribution of ${pounds(consumerPaid)} and grant funding of ${pounds(grant)}; those overlapping price and funding figures are not added together as losses.`,
    `${presenceText(salesPresence, `The consumer recalls sales assurances concerning ${salesCategories.length ? salesCategories.join(", ") : "matters requiring confirmation"}.`, "No sales representations or assurances were reported.", "No information has yet been supplied regarding sales representations or assurances.")} Client-reported condition includes ${clientCondition}. ${presenceText(professionalPresence, `A professional inspection by ${reported(value(data, "professional.name"))} is reported, with a written report position of ${reported(value(data, "professional.reportAvailable")).toLowerCase()}.`, "No professional inspection was reported.", "No information has been supplied regarding a professional inspection.")}`,
    presenceText(lenderPresence, `${reported(value(data, "lending.lender"), "A lender")} is reported to have been involved in ${list(value(data, "lending.impactTypes")).join(", ").toLowerCase() || "a property transaction"}. The reported outcome is: ${sentence(reported(value(data, "lending.outcome")))}. Additional transaction cost is ${pounds(fees)} and ongoing mortgage impact is ${monthlyMortgage == null ? "not quantified" : `${pounds(monthlyMortgage)} per month, with duration to confirm`}.`, "No lender, valuation or property-transaction involvement was reported.", "No lender, valuation or property-transaction information has been supplied."),
    `${presenceText(removalPresence, `Removal/remedial information records a ${pounds(removalQuote)} quotation and ${pounds(removalPaid)} reportedly paid for the first removal; they are not added together.`, "No removal or remedial event was reported.", "No information has been supplied regarding a removal or remedial event.")} Finance-provider complaint status: ${lenderComplaintStatus}. Priority gaps are listed under Information to Confirm.`,
  ];
  const preliminaryPosition = `${professionalPosition} The present material supports a structured review of installation, sales, professional, lender, removal, finance and complaint evidence. It does not establish universal lender rejection, technical causation, concealed decay, complete roof replacement, liability, redress entitlement or a guaranteed outcome. Potential complaint or escalation routes depend on the relevant parties, documents, final responses, eligibility and applicable timing.`;

  const report = {
    template_version: TEMPLATE.version,
    reportMode: "PRELIMINARY",
    report_title: "Quaerens Client Assessment Report",
    assessment_type: "PRELIMINARY ASSESSMENT",
    matter_type:
      "Spray Foam Installation, Property, Lending and Finance Preliminary Assessment",
    qar_reference: qar,
    version: 1,
    prepared_date: new Date().toLocaleDateString("en-GB"),
    client: {
      names: text(value(data, "client.name")),
      joint_applicant: text(value(data, "client.jointOwnerName")),
      address: text(value(data, "property.address")),
      mobile: text(value(data, "client.mobile")),
      telephone: text(value(data, "client.telephone")),
      email: text(value(data, "client.email")),
    },
    prepared_for: text(value(data, "client.name")) || "Consumer",
    matter_summary: "Preliminary spray foam insulation assessment",
    important_status_note:
      "Preliminary and evidence-led. Client observations, professional observations and causation are treated separately. No finding of liability, lender acceptance or recoverable loss is made.",
    client_information_matrix: [
      { field: "Client", information: reported(value(data, "client.name")) },
      ...(text(value(data, "client.mobile"))
        ? [
            {
              field: "Mobile Number",
              information: text(value(data, "client.mobile")),
            },
          ]
        : []),
      ...(text(value(data, "client.telephone"))
        ? [
            {
              field: "Home Telephone",
              information: text(value(data, "client.telephone")),
            },
          ]
        : []),
      {
        field: "Property",
        information: reported(value(data, "property.address")),
      },
      {
        field: "Installer",
        information: reported(value(data, "installation.installer")),
      },
      {
        field: "Installation Date",
        information: reported(value(data, "installation.date")),
      },
      { field: "Installation Price", information: pounds(installation) },
      { field: "Consumer Contribution", information: pounds(consumerPaid) },
      { field: "Grant / Funding", information: pounds(grant) },
      {
        field: "Foam Type",
        information: reported(value(data, "installation.foamType")),
      },
      {
        field: "Transaction Intention",
        information: reported(value(data, "property.transactionIntent")),
      },
      {
        field: "Finance Provider",
        information: reported(value(data, "finance.lender")),
      },
    ],
    executive_summary: executiveSummary,
    preliminary_position: preliminaryPosition,
    chronology: chronology(data),
    technical_findings: {
      include: true,
      heading: "Installation, Condition, Professional and Remedial Analysis",
      intro:
        "The table distinguishes client observations, professional evidence, limitations and remedial status. Elevated readings are not treated as proof of causation.",
      table: [
        {
          issue: "Installation details",
          current_position: `Installer: ${reported(value(data, "installation.installer"))}; foam type: ${reported(value(data, "installation.foamType"))}; areas: ${reported(value(data, "installation.areas"))}; ventilation information: ${reported(value(data, "installation.ventilation"))}.`,
          evidence_or_clarification_needed:
            "Review the contract, product specification, BBA reference, installation photographs, survey and ventilation records.",
        },
        {
          issue: "Client-reported condition",
          current_position: `${clientCondition}. ${sentence(reported(value(data, "condition.details"), "No further detail recorded"))}.`,
          evidence_or_clarification_needed:
            "Compare location, timing and photographs with professional findings; client observation is not a diagnosis.",
        },
        {
          issue: "Professional / surveyor findings",
          current_position: presenceText(
            professionalPresence,
            `Surveyor/company: ${reported(value(data, "professional.name"))}; inspection: ${reported(value(data, "professional.date"))}; type: ${reported(value(data, "professional.type"))}; written report: ${reported(value(data, "professional.reportAvailable"))}; findings: ${sentence(professionalFindings)}; moisture: ${reported(value(data, "professional.moisture"))}; humidity: ${reported(value(data, "professional.humidity"))}; recommendation: ${sentence(reported(value(data, "professional.recommendation")))}.`,
            "No professional inspection was reported.",
            "No information has been supplied regarding a professional inspection.",
          ),
          evidence_or_clarification_needed:
            "Review the signed report and measurement source. No definitive conclusion regarding concealed timber decay is made, and complete roof replacement is not established.",
        },
        {
          issue: "Removal quotation and first removal",
          current_position: presenceText(
            removalPresence,
            `Original quotation: ${pounds(removalQuote)}. Reported paid first removal: ${pounds(removalPaid)}. Extent: ${reported(value(data, "remedial.extent"))}. Certificate: ${reported(value(data, "remedial.certificate"))}.`,
            "No removal or remedial event was reported.",
            "No information has been supplied regarding a removal or remedial event.",
          ),
          evidence_or_clarification_needed:
            "Review quotation, invoice, payment evidence, scope, photographs and any completion/certificate record. The quotation and paid cost are not added together.",
        },
        {
          issue: "Further remedial and roof position",
          current_position: `Second/further remedial figure: ${pounds(furtherRemedial)}. Targeted timber/felt/roof repair figure: ${pounds(targetedRepair)}. Full roof replacement: ${roofReplacement != null && roofReplacement > 0 ? pounds(roofReplacement) : "Not currently evidenced"}.`,
          evidence_or_clarification_needed:
            "Confirm whether each figure was paid, invoiced or quoted and whether scopes overlap. Full roof replacement was not established from a zero or absent figure.",
        },
      ],
    },
    sales_conduct_analysis: {
      include: salesRows.length > 0,
      intro:
        "Consumer recollection, representation categories, reliance and evidence are shown separately. Recollection is not treated as proof.",
      table: salesRows,
    },
    finance_credit_lender_review: {
      include: true,
      intro:
        "Finance, grant, lender/valuer evidence, transaction outcome and complaints are kept separate from direct incurred loss.",
      table: [
        {
          finance_issue: "Lender / broker / valuer",
          current_position: presenceText(
            lenderPresence,
            `Lender: ${reported(value(data, "lending.lender"))}; broker: ${reported(value(data, "lending.broker"))}; valuer: ${reported(value(data, "lending.valuer"))}; event: ${reported(value(data, "lending.date"))}.`,
            "No lender, broker or valuer involvement was reported.",
            "No information has been supplied regarding lender, broker or valuer involvement.",
          ),
          evidence_needed:
            "Review the lender, broker and valuation correspondence and identify each party's role.",
        },
        {
          finance_issue: "Written concern and request",
          current_position:
            lenderPresence === PRESENCE.REPORTED
              ? `Written evidence reported available: ${reported(value(data, "lending.writtenEvidence"))}. Recorded wording: ${sentence(reported(value(data, "lending.exactWording")))}. Requested: ${reported(value(data, "lending.requirements"))}.`
              : "No affirmative lender or valuation event is established from the information supplied.",
          evidence_needed:
            "Verify the exact written reason and requested removal, survey, certification or timber exposure. Do not generalise it to all lenders.",
        },
        {
          finance_issue: "Transaction outcome and impact",
          current_position:
            lenderPresence === PRESENCE.REPORTED
              ? `Outcome: ${sentence(reported(value(data, "lending.outcome")))}. Other stated reasons: ${sentence(reported(value(data, "lending.multipleReasons"), "None currently recorded"))}. Additional fees: ${pounds(fees)}. Additional mortgage cost: ${monthlyMortgage == null ? "Not quantified" : `${pounds(monthlyMortgage)} per month - duration to confirm`}.`
              : presenceText(
                  lenderPresence,
                  "",
                  "No affected transaction was reported.",
                  "No affected transaction information has been supplied.",
                ),
          evidence_needed:
            "Confirm the alternative mortgage, fee records, monthly differential and evidenced duration.",
        },
        {
          finance_issue: "Finance terms",
          current_position: `Principal ${pounds(financePrincipal)}; monthly payment ${pounds(monthly)}; term ${term == null ? "not provided" : `${term} months`}; APR ${number(value(data, "finance.apr")) == null ? "not provided" : `${number(value(data, "finance.apr"))}%`}; outstanding balance ${pounds(value(data, "finance.outstandingBalance"))}; total contractual payments ${pounds(contractual)}; finance cost above principal ${pounds(financeCost)}.`,
          evidence_needed:
            "Verify against the executed agreement and current statement. These overlapping contractual figures are not automatically recoverable losses.",
        },
        {
          finance_issue: "Grant and price reconciliation",
          current_position: `Installation price ${pounds(installation)}; consumer contribution ${pounds(consumerPaid)}; grant ${pounds(grant)}; finance principal ${pounds(financePrincipal)}.`,
          evidence_needed:
            "Reconcile the invoice, grant paperwork and finance agreement. Do not add grant and financed contribution to the installation price as separate losses.",
        },
        {
          finance_issue: "Complaint status",
          current_position: `Installer complaint: ${presenceText(eventPresence(data, "installerComplaint", { signals: ["history.installerComplaintDate", "history.installerComplaint"] }), reported(value(data, "history.installerComplaintDate")), "none reported", "no information supplied")}; installer response: ${presenceText(eventPresence(data, "installerResponse", { signals: ["history.installerResponseDate", "history.installerResponse"] }), reported(value(data, "history.installerResponseDate")), "none reported", "no information supplied")}; finance complaint: ${presenceText(lenderComplaintPresence, reported(value(data, "history.lenderComplaintDate")), "none reported", "no information supplied")}; finance response: ${presenceText(eventPresence(data, "financeProviderResponse", { signals: ["history.lenderResponseDate", "history.lenderResponse"] }), reported(value(data, "history.lenderResponseDate")), "none reported", "no information supplied")}; current finance complaint status: ${lenderComplaintStatus}.`,
          evidence_needed:
            "Review complaint and response documents. Any Financial Ombudsman Service route depends on the relevant final response, timing, eligibility and jurisdiction.",
        },
      ],
    },
    performance_analysis: { include: false, table: [] },
    certification_registration_analysis: {
      include: true,
      intro:
        "Missing documentation is a verification gap, not proof of non-compliance.",
      table: [
        {
          item: "BBA certificate / product reference",
          current_position:
            evidenceBy(/BBA certificate/i)?.status || "Requires confirmation",
          evidence_needed: evidenceAction(
            evidenceBy(/BBA certificate/i)?.status,
          ),
        },
        {
          item: "Installer accreditation",
          current_position:
            evidenceBy(/Installer accreditation/i)?.status ||
            "Requires confirmation",
          evidence_needed: evidenceAction(
            evidenceBy(/Installer accreditation/i)?.status,
          ),
        },
        {
          item: "Insurance-backed guarantee",
          current_position:
            evidenceBy(/Insurance-backed guarantee/i)?.status ||
            "Requires confirmation",
          evidence_needed: evidenceAction(
            evidenceBy(/Insurance-backed guarantee/i)?.status,
          ),
        },
        {
          item: "Completion and ventilation records",
          current_position: `${evidenceBy(/Completion certificate/i)?.status || "Requires confirmation"}; ${evidenceBy(/Ventilation assessment/i)?.status || "requires confirmation"}`,
          evidence_needed:
            "Review completion, ventilation, pre-installation survey and maintenance records together.",
        },
      ],
    },
    financial_assessment_range: financialRange,
    financial_exposure: financial,
    financial_chart: { include: false, labels: [], values: [] },
    valuation_or_scenario_matrix: {
      include: true,
      type: "FINANCIAL_SCENARIO",
      title: "Indicative Financial Assessment Range - Scenario Basis",
      intro: `${financialRange.caveat} ${financialRange.relationship_notes.join(" ")}`,
      rows: scenarios,
    },
    current_preliminary_position: {
      intro:
        "Reference figures are separated by status to prevent quotation, funding and contractual double-counting.",
      rows: [
        {
          field: "Direct incurred / reported paid or committed exposure",
          position: pounds(incurredTotal),
        },
        {
          field: "Quoted / prospective professional cost",
          position: pounds(prospectiveTotal),
        },
        {
          field: "Ongoing mortgage exposure",
          position:
            monthlyMortgage == null
              ? "Not quantified"
              : `${pounds(monthlyMortgage)}/month - duration to confirm`,
        },
        { field: "Total contractual payments", position: pounds(contractual) },
        {
          field: "Finance cost above principal",
          position: pounds(financeCost),
        },
        {
          field: "Full roof replacement",
          position:
            roofReplacement != null && roofReplacement > 0
              ? pounds(roofReplacement)
              : "Not currently evidenced",
        },
        {
          field: "Indicative financial assessment range",
          position: financialRange.display_range,
        },
        { field: "Range status", position: financialRange.status },
      ],
    },
    evidence_readiness: {
      include: true,
      intro:
        "Evidence states reflect the consumer's current record position. Available material has not necessarily been reviewed or verified.",
      items: evidenceItems,
    },
    evidence_required: evidenceRequired,
    preliminary_assessment: {
      table: [
        {
          assessment_factor: "Condition position",
          preliminary_position: professionalPosition,
        },
        {
          assessment_factor: "Mortgage / transaction position",
          preliminary_position: presenceText(
            lenderPresence,
            `A specific ${reported(value(data, "lending.impactTypes"), "transaction").toLowerCase()} concern is reported. The report does not state that the property is universally unmortgageable or that all lenders reject spray foam.`,
            "No lender, valuation or property-transaction concern was reported.",
            "No information has been supplied regarding a lender, valuation or property-transaction concern.",
          ),
        },
        {
          assessment_factor: "Removal / remedial position",
          preliminary_position: presenceText(
            removalPresence,
            `Quotation ${pounds(removalQuote)} and actual paid removal ${pounds(removalPaid)} are separated. Further remedial and repair figures require status and scope confirmation. Full roof replacement is ${roofReplacement != null && roofReplacement > 0 ? "reported at " + pounds(roofReplacement) : "not currently evidenced"}.`,
            "No removal or remedial event was reported.",
            "No information has been supplied regarding a removal or remedial event.",
          ),
        },
        {
          assessment_factor: "Finance position",
          preliminary_position: `Principal, balance, contractual total, finance cost, grant and installation price overlap and are not automatically recoverable or added together.`,
        },
        {
          assessment_factor: "Complaint readiness",
          preliminary_position: `Finance-provider complaint status: ${lenderComplaintStatus}. Escalation depends on the applicable final response, timing, eligibility and supporting evidence.`,
        },
      ],
      narrative: [preliminaryPosition],
    },
    recommendations_next_steps: [
      "Review the signed contract, quotation, invoice, proof of payment, grant paperwork and finance agreement together and reconcile the funding without double-counting.",
      "Review the professional report, readings, inspection limitations and recommendation; obtain proportionate follow-up evidence where concealed condition remains unassessed.",
      "Obtain and organise the lender, valuer and broker correspondence in date order, including the specific request and transaction outcome.",
      "Confirm whether remedial and repair figures were paid, invoiced or quoted and compare their scopes before combining any amounts.",
      "Review installer and finance-provider complaint correspondence and confirm whether a final response has been issued before assessing any escalation route.",
    ],
    information_to_confirm: informationToConfirm,
    recommended_case_direction:
      "Proceed with a coordinated documentary review that keeps installation, sales, technical, lender, remedial, grant, finance and complaint issues distinct. Obtain proportionate professional evidence before attributing causation or specifying a roof remedy, and assess complaint routes only after the relevant parties, responses, timing and eligibility are established.",
    missing_information: [],
    inconsistencies_to_flag:
      substantiveObservations.length &&
      observations.includes("No visible problem")
        ? [
            "Contradictory condition selection was normalised for report safety; the intake must be corrected before reliance.",
          ]
        : [],
    reviewStatement:
      "PRELIMINARY - based on information currently available. Consumer-reported statements and documents require review; no liability, lender acceptance, redress or outcome is guaranteed.",
    frameworkVersion: "1.2",
    category: "Spray Foam Insulation",
    qarReference: qar,
    preparedDate: new Date().toISOString().slice(0, 10),
    limitations:
      "This Preliminary Assessment is based on information supplied by the consumer. Quaerens has not independently inspected the property, verified documents, determined technical causation, legal liability, lender policy or compensation entitlement.",
  };
  return cleanOutput(report);
}

module.exports = { sprayFoamReport, dateKey };
