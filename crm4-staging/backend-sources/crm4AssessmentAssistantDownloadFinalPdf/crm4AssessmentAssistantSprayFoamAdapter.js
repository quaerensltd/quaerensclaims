"use strict";

const { sprayFoamReport } = require("./frameworkBSprayFoamReport");
const {
  selectFinancialRangeAuthority,
  applyFinancialRangeAuthority,
} = require("./quaerensCore/financialRangeAuthority");
const text = (v) => String(v == null ? "" : v).trim();
const PRESENCE = Object.freeze({
  REPORTED: "REPORTED",
  ABSENT: "ABSENT",
  NOT_SUPPLIED: "NOT_SUPPLIED",
});
const norm = (v) =>
  text(v)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const allFacts = (x) => [
  ...(x.confirmedFacts || []),
  ...(x.reportedFacts || []),
  ...(x.estimates || []),
  ...(x.clientStatements || []),
  ...(x.supplier || []),
  ...(x.product || []),
  ...(x.property || []),
  ...(x.finance || []),
];
const find = (items, patterns) =>
  items.find((item) =>
    patterns.some((pattern) => pattern.test(norm(item.label))),
  ) || null;
const amount = (x, patterns) => {
  const item = find(
    [
      ...(x.financialItems || []),
      ...(x.transactions || []),
      ...(x.calculatedValues || []),
    ],
    patterns,
  );
  return item?.amount == null ? null : Number(item.amount);
};
const isNotSupplied = (item) =>
  !item ||
  /^(?:NOT_SUPPLIED|TBC|REQUIRES_CLARIFICATION)$/.test(text(item.status)) ||
  /^(?:not supplied|unknown|not known|requires clarification|tbc)$/i.test(
    text(item.value),
  );
const isExplicitlyAbsent = (item) =>
  /^(?:no|none|not applicable|did not occur|has not occurred|not involved|not carried out)(?:\b|$)/i.test(
    text(item?.value),
  );
const factValue = (facts, patterns) => {
  const item = find(facts, patterns);
  return isNotSupplied(item) ? "" : text(item?.value);
};
const topicPresence = (facts, patterns) => {
  const matches = facts.filter((item) =>
    patterns.some((pattern) => pattern.test(norm(item.label))),
  );
  if (matches.some((item) => !isNotSupplied(item) && !isExplicitlyAbsent(item)))
    return PRESENCE.REPORTED;
  if (matches.some((item) => !isNotSupplied(item) && isExplicitlyAbsent(item)))
    return PRESENCE.ABSENT;
  return PRESENCE.NOT_SUPPLIED;
};
const yesNo = (presence) =>
  presence === PRESENCE.REPORTED
    ? "Yes"
    : presence === PRESENCE.ABSENT
      ? "No"
      : "Not sure";
function estimateRange(x) {
  const candidates = [
    ...(x.financialItems || []),
    ...(x.estimates || []),
  ].filter(
    (item) =>
      /removal/.test(norm(item.label)) &&
      /(estimate|range)/.test(norm(item.label)),
  );
  const values = [];
  for (const item of candidates) {
    if (item.amount != null) values.push(Number(item.amount));
    for (const value of text(item.value || item.basis)
      .replace(/,/g, "")
      .match(/\d+(?:\.\d+)?/g) || [])
      values.push(Number(value));
  }
  const finite = values.filter(Number.isFinite);
  return finite.length
    ? { lower: Math.min(...finite), upper: Math.max(...finite) }
    : null;
}
const evidenceState = (item) => {
  const value = norm(`${item.status} ${item.value}`);
  if (/not applicable/.test(value)) return "Not applicable";
  if (/not supplied/.test(value)) return "Not supplied";
  if (/confirmed from input|confirmed|available/.test(value))
    return "Available now";
  return "Not sure";
};

function adaptConfirmedSprayFoam(extraction) {
  const x = extraction || {},
    facts = allFacts(x),
    evidence = {},
    presence = {
      salesRepresentations: topicPresence(facts, [
        /sales representation/,
        /sales assurance/,
        /what.*told/,
      ]),
      installerComplaint: topicPresence(facts, [/installer complaint/]),
      installerResponse: topicPresence(facts, [/installer response/]),
      lenderInvolvement: topicPresence(facts, [
        /lender|broker|valuer/,
        /mortgage.*impact/,
      ]),
      propertyTransaction: topicPresence(facts, [
        /property.*(?:transaction|sale)/,
        /mortgage.*impact/,
        /transaction intention/,
      ]),
      professionalInspection: topicPresence(facts, [
        /professional (?:inspection|finding|report)/,
        /surveyor|survey report|inspection status/,
      ]),
      financeProviderComplaint: topicPresence(facts, [
        /finance provider complaint|finance complaint/,
      ]),
      financeProviderResponse: topicPresence(facts, [
        /finance provider response|finance response/,
      ]),
      removalRemedial: topicPresence(facts, [
        /removal status|spray foam.*removed|removal completed/,
        /remedial event/,
      ]),
    };
  for (const item of x.evidenceReadiness || [])
    if (text(item.label)) evidence[text(item.label)] = evidenceState(item);
  return {
    input: {
      client: {
        name: `${text(x.client?.firstName)} ${text(x.client?.lastName)}`.trim(),
        mobile: text(x.contact?.mobile),
        telephone: text(x.contact?.telephone),
        email: text(x.contact?.email),
      },
      property: {
        address: text(x.address),
        transactionIntent: factValue(facts, [
          /transaction intention/,
          /sale|remortgage/,
        ]),
      },
      installation: {
        date: factValue(facts, [/installation date/]),
        installer: factValue(facts, [/installer/]),
        cost: amount(x, [
          /installation.*(?:price|cost)/,
          /(?:price|cost).*installation/,
        ]),
        consumerPaid: amount(x, [/consumer.*(?:paid|contribution)/]),
        foamType: factValue(facts, [/foam type/]),
        areas: factValue(facts, [/area.*install/]),
        ventilation: factValue(facts, [/ventilation/]),
      },
      condition: {
        observations: facts
          .filter((item) =>
            /condition|damp|moisture|timber/.test(norm(item.label)),
          )
          .map((item) => text(item.value))
          .filter(Boolean),
        details: factValue(facts, [/condition detail/]),
      },
      professional: {
        inspected: yesNo(presence.professionalInspection),
        date: factValue(facts, [/(?:inspection|survey).*date/]),
        name: factValue(facts, [/surveyor|professional name/]),
        findings: factValue(facts, [/professional finding|surveyor finding/]),
        reportAvailable: factValue(facts, [
          /professional report|survey report/,
        ]),
        cost: amount(x, [/inspection.*(?:paid|cost)/]),
      },
      remedial: {
        completed: yesNo(presence.removalRemedial),
        removalEstimateRange: estimateRange(x),
        removalQuote: amount(x, [/removal quote/]),
        amountPaid: amount(x, [/removal.*(?:paid|actual)/]),
        details: factValue(facts, [/remedial detail|removal detail/]),
        completionDate: factValue(facts, [/(?:removal|remedial).*date/]),
      },
      lending: {
        affected: yesNo(
          presence.lenderInvolvement === PRESENCE.REPORTED ||
            presence.propertyTransaction === PRESENCE.REPORTED
            ? PRESENCE.REPORTED
            : presence.lenderInvolvement === PRESENCE.ABSENT &&
                presence.propertyTransaction === PRESENCE.ABSENT
              ? PRESENCE.ABSENT
              : PRESENCE.NOT_SUPPLIED,
        ),
        date: factValue(facts, [/(?:lender|mortgage|valuation).*date/]),
        lender: factValue(facts, [/lender/]),
        exactWording: factValue(facts, [/lender wording|written reason/]),
        outcome: factValue(facts, [/lender outcome|mortgage outcome/]),
      },
      sales: {
        ownWords: factValue(facts, [/sales representation|sales assurance/]),
        representations: [],
      },
      finance: {},
      grant: {},
      financial: {},
      history: {},
      evidence,
      presence,
    },
    provenance: facts.map((item) => ({
      label: text(item.label),
      status: text(item.status),
      source: text(item.source),
    })),
    unprioritisedEvidence: [...(x.evidenceRequired || [])],
    compensationSought: amount(x, [
      /compensation.*(?:sought|request)/,
      /(?:sought|request).*compensation/,
    ]),
  };
}

async function buildSprayFoamProjection({
  extraction,
  qar,
  db,
  admin,
  persistComparison = false,
}) {
  const adapted = adaptConfirmedSprayFoam(extraction),
    legacy = sprayFoamReport(adapted.input, qar);
  const selection = await selectFinancialRangeAuthority({
    category: "spray-foam",
    publicInput: adapted.input,
    legacyResult: legacy.financial_assessment_range,
    db: persistComparison ? db : null,
    admin: persistComparison ? admin : null,
  });
  const report = { ...applyFinancialRangeAuthority(legacy, selection) };
  const mapped = new Set(
    (report.evidence_required || []).map((item) =>
      norm(item.evidence_required),
    ),
  );
  const extras = adapted.unprioritisedEvidence.filter(
    (item) => !mapped.has(norm(item)),
  );
  if (extras.length)
    report.information_to_confirm = [
      ...new Set([...(report.information_to_confirm || []), ...extras]),
    ];
  return {
    report,
    governance: {
      provenance: adapted.provenance,
      compensationSought: adapted.compensationSought,
      financialAuthority: selection.authorityCode,
    },
  };
}

module.exports = {
  PRESENCE,
  adaptConfirmedSprayFoam,
  buildSprayFoamProjection,
};
