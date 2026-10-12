"use strict";

const METHODOLOGY_VERSION = "FRAMEWORK-B-FINANCIAL-RANGE-v1";

const finite = (value) => {
  if (value == null || value === "") return null;
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};
const positive = (value) => {
  const parsed = finite(value);
  return parsed != null && parsed > 0 ? parsed : null;
};
const sum = (values) =>
  Number(
    values
      .filter((value) => positive(value) != null)
      .reduce((total, value) => total + positive(value), 0)
      .toFixed(2),
  );
const money = (value, locale, currency) =>
  positive(value) == null
    ? null
    : new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(positive(value));

function canonicalRange({
  locale = "en-GB",
  currency = "GBP",
  lower,
  upper,
  lowerBasis,
  upperBasis,
  status = "PROVISIONAL",
  missing = [],
  supportingIndicators = [],
  relationshipNotes = [],
  lowerIdentity = "LOWER SCENARIO",
  upperIdentity = "UPPER SCENARIO",
  directCostComponents = [],
}) {
  const low = positive(lower),
    high = positive(upper);
  const dutch = locale === "nl-NL";
  const pending = [...new Set(missing.filter(Boolean))];
  let state = status;
  if (low == null && high == null) state = "PENDING";
  else if (low == null || high == null) state = "PARTIAL";
  else if (low > high)
    throw new Error(
      "Financial range lower scenario exceeds upper scenario; scenario classification must be reviewed.",
    );
  const display =
    low != null && high != null
      ? `${money(low, locale, currency)} - ${money(high, locale, currency)}`
      : low != null
        ? dutch
          ? `${money(low, locale, currency)} - breder scenario in afwachting`
          : `${money(low, locale, currency)} - broader scenario pending`
        : high != null
          ? dutch
            ? `Onderste scenario in afwachting - tot ${money(high, locale, currency)}`
            : `Lower scenario pending - up to ${money(high, locale, currency)}`
          : dutch
            ? "IN AFWACHTING VAN BELANGRIJKE FINANCIËLE INFORMATIE"
            : "PENDING KEY FINANCIAL INFORMATION";
  const caveat = dutch
    ? "Deze bandbreedte is een voorlopige, scenario-gebaseerde financiële beoordeling. Het is geen vastgestelde claimwaarde, gegarandeerde vergoeding of voorspelling van de uiteindelijke uitkomst. De bedragen vertegenwoordigen verschillende mogelijke oplossingsscenario's en mogen niet bij elkaar worden opgeteld."
    : "This is a preliminary, scenario-based financial assessment range. It is not an established claim value, a guarantee of recovery, a compensation award or a prediction of the final outcome. The lower and upper figures represent different potential resolution scenarios and must not be added together.";
  return Object.freeze({
    methodology_version: METHODOLOGY_VERSION,
    locale,
    currency,
    status: state,
    display_range: display,
    lower: Object.freeze({
      amount: low,
      display:
        low == null
          ? dutch
            ? "In afwachting"
            : "Pending"
          : money(low, locale, currency),
      basis:
        lowerBasis ||
        (dutch
          ? "Belangrijke financiële informatie ontbreekt."
          : "Key financial information is missing."),
      scenario_identity: lowerIdentity,
    }),
    upper: Object.freeze({
      amount: high,
      display:
        high == null
          ? dutch
            ? "In afwachting"
            : "Pending"
          : money(high, locale, currency),
      basis:
        upperBasis ||
        (dutch
          ? "Belangrijke financiële informatie ontbreekt."
          : "Key financial information is missing."),
      scenario_identity: upperIdentity,
    }),
    missing_information: pending,
    supporting_indicators: supportingIndicators.filter(Boolean),
    relationship_notes: relationshipNotes.filter(Boolean),
    direct_cost_components: directCostComponents,
    caveat,
    agent_summary: dutch
      ? `Op basis van de verstrekte informatie identificeert de voorlopige beoordeling een indicatieve financiële beoordelingsrange van ${display}. De bedragen vertegenwoordigen verschillende mogelijke oplossingsscenario's en vormen geen gegarandeerde claimwaarde.`
      : `Based on the information supplied, the preliminary assessment identifies an indicative financial assessment range of ${display}. The figures represent different potential resolution scenarios rather than a guaranteed claim value.`,
  });
}

function solarFinancialRange({
  locale = "en-GB",
  currency = "GBP",
  purchasePrice,
  outstandingBalance,
  settlementFigure,
  directCost,
  directCosts = [],
  expectedGeneration,
  actualGeneration,
  expectedSaving,
  actualSaving,
  anchorStatus = "PROVISIONAL",
}) {
  const acceptedDirectCosts = [];
  const acceptedScopes = new Set();
  for (const item of Array.isArray(directCosts) ? directCosts : []) {
    const amount = positive(item?.amount);
    const status = String(item?.status || "").toUpperCase();
    const scope = String(item?.overlapIdentity || item?.scopeIdentity || "").trim();
    if (
      amount == null ||
      !["ENGINEER_INSPECTION", "INVERTER_REMEDIAL", "OTHER_DIRECT_INCURRED"].includes(String(item?.type || "")) ||
      !/PAID|INCURRED|COMMITTED/.test(status) ||
      !scope ||
      acceptedScopes.has(scope)
    ) continue;
    acceptedScopes.add(scope);
    acceptedDirectCosts.push(Object.freeze({ ...item, amount }));
  }
  const structuredDirect = acceptedDirectCosts.length ? sum(acceptedDirectCosts.map((item) => item.amount)) : null;
  const purchase = positive(purchasePrice),
    outstanding = positive(settlementFigure) || positive(outstandingBalance),
    direct = structuredDirect || positive(directCost);
  // Solar uses two independently meaningful scenarios, not fixed field labels:
  // (1) the original transaction-value scenario and (2) the current resolution
  // exposure (finance settlement, or evidenced direct remedial cost). Accrued
  // finance can legitimately exceed the original purchase price, while major
  // remedial cost can do the same. Classify the lower/broader scenarios by the
  // supported economic exposure and retain a basis that identifies its source;
  // never pass an inverted range to the shared canonical invariant.
  const resolution = outstanding || direct;
  const resolutionKind = outstanding ? "finance" : direct ? "direct" : "";
  const directIdentity = locale === "nl-NL" ? "SCENARIO DIRECT GEMAAKTE KOSTEN" : "DIRECT INCURRED-COST SCENARIO";
  const financeIdentity = locale === "nl-NL" ? "ACTUEEL FINANCIERINGS-/AFLOSSINGSSCENARIO" : "CURRENT FINANCE / SETTLEMENT SCENARIO";
  const purchaseIdentity = locale === "nl-NL" ? "SCENARIO BRUTO AANKOOPWAARDE" : "GROSS PURCHASE-VALUE SCENARIO";
  const purchaseBasis =
    locale === "nl-NL"
      ? "Gebaseerd op de gemelde bruto aankoopwaarde; verrekening, behouden waarde, gebruik/voordeel en financieringsafstemming moeten nog worden beoordeeld."
      : "Based on the reported gross purchase value; offsets, retained value, use or benefit and finance reconciliation still require review.";
  const resolutionBasis =
    resolutionKind === "finance"
      ? locale === "nl-NL"
        ? "Gebaseerd op het gemelde actuele openstaande financierings- of aflossingssaldo; dit kan door financieringskosten hoger zijn dan de oorspronkelijke aankoopwaarde."
        : "Based on the reported current outstanding finance or settlement balance; finance costs can make this exceed the original purchase value."
      : resolutionKind === "direct"
        ? locale === "nl-NL"
          ? "Gebaseerd op de gemelde directe technische, inspectie- of herstelkosten; bewijs en causaliteit moeten worden gecontroleerd."
          : "Based on the reported direct technical, inspection or remedial cost; evidence and causation require review."
        : null;
  let lower = resolution,
    upper = purchase,
    lowerBasis = resolutionBasis,
    upperBasis = purchaseBasis,
    lowerIdentity = resolutionKind === "direct" ? directIdentity : financeIdentity,
    upperIdentity = purchaseIdentity;
  let scenarioRelationship = "";
  if (purchase != null && resolution != null && resolution > purchase) {
    lower = purchase;
    upper = resolution;
    lowerBasis = purchaseBasis;
    upperBasis = resolutionBasis;
    lowerIdentity = purchaseIdentity;
    upperIdentity = resolutionKind === "direct" ? directIdentity : financeIdentity;
    scenarioRelationship =
      locale === "nl-NL"
        ? `De actuele ${resolutionKind === "finance" ? "financierings-/aflossingsblootstelling" : "directe herstelblootstelling"} is hoger dan de oorspronkelijke aankoopwaarde en vormt daarom het bredere financiële scenario.`
        : `The current ${resolutionKind === "finance" ? "finance/settlement exposure" : "direct remedial exposure"} exceeds the original purchase value and therefore forms the broader financial scenario.`;
  }
  const expectedGen = positive(expectedGeneration),
    actualGen = finite(actualGeneration),
    expectedSave = positive(expectedSaving),
    actualSave = finite(actualSaving);
  const generationGap =
    expectedGen != null && actualGen != null
      ? Math.max(0, expectedGen - actualGen)
      : null;
  const generationPct =
    generationGap != null && expectedGen > 0
      ? Math.round((generationGap / expectedGen) * 100)
      : null;
  const savingsGap =
    expectedSave != null && actualSave != null
      ? Math.max(0, expectedSave - actualSave)
      : null;
  const indicators = [
    expectedGen != null && {
      label: locale === "nl-NL" ? "Verwachte opbrengst" : "Expected generation",
      value: `${expectedGen.toLocaleString(locale)} kWh`,
    },
    actualGen != null && {
      label: locale === "nl-NL" ? "Werkelijke opbrengst" : "Actual generation",
      value: `${actualGen.toLocaleString(locale)} kWh`,
    },
    generationGap != null && {
      label: locale === "nl-NL" ? "Opbrengstverschil" : "Generation difference",
      value: `${generationGap.toLocaleString(locale)} kWh${generationPct == null ? "" : ` / ${locale === "nl-NL" ? "ongeveer" : "approximately"} ${generationPct}%`}`,
    },
    savingsGap != null && {
      label: locale === "nl-NL" ? "Besparingsverschil" : "Savings difference",
      value: money(savingsGap, locale, currency),
    },
    outstanding != null && {
      label:
        locale === "nl-NL" ? "Openstaande financiering" : "Outstanding finance",
      value: money(outstanding, locale, currency),
    },
    acceptedDirectCosts.length > 0 && {
      label: locale === "nl-NL" ? "Niet-overlappende directe kosten" : "Non-overlapping incurred direct costs",
      value: money(direct, locale, currency),
    },
  ];
  return canonicalRange({
    locale,
    currency,
    lower,
    upper,
    lowerBasis,
    upperBasis,
    status: anchorStatus,
    missing: [
      lower == null &&
        (locale === "nl-NL"
          ? "Actueel financieringssaldo of onderbouwde directe kosten"
          : "Current finance balance or supported direct cost"),
      purchase == null &&
        (locale === "nl-NL" ? "Aankoopwaarde" : "Purchase value"),
    ],
    supportingIndicators: indicators,
    relationshipNotes: [
      locale === "nl-NL"
        ? "Koopprijs, kredietbedrag, reeds betaald bedrag, contractuele betaling en openstaand saldo kunnen dezelfde transactie vertegenwoordigen en worden niet opgeteld."
        : "Purchase price, finance principal, amount paid, contractual payments and outstanding balance may represent the same transaction and are not added together.",
      scenarioRelationship,
      direct != null && purchase != null &&
        "The displayed endpoints are alternative preliminary scenario anchors, not a continuous valuation of the case or an established recoverable-loss range.",
    ],
    lowerIdentity,
    upperIdentity,
    directCostComponents: acceptedDirectCosts,
  });
}

function sprayFoamFinancialRange({
  installationPrice,
  removalQuote,
  removalEstimateRange,
  removalPaid,
  inspectionPaid,
  furtherRemedial,
  targetedRepair,
  roofReplacement,
  roofIncludesRemoval = false,
  fees,
  otherCosts,
  credits = 0,
}) {
  const estimateLower = positive(removalEstimateRange?.lower),
    estimateUpper = positive(removalEstimateRange?.upper);
  if (
    estimateLower != null &&
    estimateUpper != null &&
    estimateLower > estimateUpper
  )
    throw new Error("Removal estimate range lower value exceeds upper value.");
  const atomicEstimate = estimateLower != null || estimateUpper != null;
  const removal = positive(removalPaid) || positive(removalQuote);
  const directComponents = [
    inspectionPaid,
    removal,
    furtherRemedial,
    targetedRepair,
    fees,
    otherCosts,
  ];
  if (positive(roofReplacement) != null) {
    if (roofIncludesRemoval && removal != null)
      directComponents.splice(directComponents.indexOf(removal), 1);
    directComponents.push(roofReplacement);
  }
  const direct =
    Math.max(
      0,
      Number((sum(directComponents) - (positive(credits) || 0)).toFixed(2)),
    ) || null;
  const installation = positive(installationPrice);
  if (atomicEstimate && positive(removalPaid) == null) {
    const low = estimateLower,
      high = estimateUpper;
    const broader =
      installation != null && high != null
        ? Number((installation + high).toFixed(2))
        : high;
    return canonicalRange({
      lower: low,
      upper: broader === low ? null : broader,
      lowerBasis:
        low == null
          ? null
          : "Based on the lower bound of the client-reported removal estimate range. This is an estimate, not incurred loss, and evidence, scope and causation require review.",
      upperBasis:
        broader == null
          ? null
          : installation != null
            ? "Based on a broader scenario combining the original installation expenditure with the upper bound of the separate client-reported removal estimate range. It is not an assumed entitlement."
            : "Based on the upper bound of the client-reported removal estimate range. This is an estimate, not incurred loss.",
      status: low != null && high != null ? "PROVISIONAL" : "PARTIAL",
      missing: [
        low == null && "Lower bound of removal estimate",
        high == null && "Upper bound of removal estimate",
      ],
      supportingIndicators: [
        installation != null && {
          label: "Installation value",
          value: money(installation, "en-GB", "GBP"),
        },
        low != null &&
          high != null && {
            label: "Removal estimate range",
            value: `${money(low, "en-GB", "GBP")} - ${money(high, "en-GB", "GBP")}`,
          },
      ],
      relationshipNotes: [
        "The removal estimate is retained as one atomic range; its endpoints are not separate costs and are not added together.",
        installation != null
          ? "Installation expenditure and estimated removal are combined only in the broader scenario and are not presented as established recoverable loss."
          : "The estimate remains prospective and is not treated as paid loss.",
      ],
    });
  }
  const upper =
    installation != null && direct != null
      ? Number((installation + direct).toFixed(2))
      : installation || direct;
  const quoteOnly =
    positive(removalPaid) == null && positive(removalQuote) != null;
  return canonicalRange({
    lower: direct,
    upper: upper === direct ? null : upper,
    lowerBasis:
      direct == null
        ? null
        : `${quoteOnly ? "Based on quoted / estimated removal or remedial cost" : "Based on reported paid, evidenced or committed non-overlapping direct removal, inspection and remedial costs"}${positive(credits) ? ", after the related reported credit" : ""}. Evidence, scope and causation require review.`,
    upperBasis:
      installation == null
        ? null
        : `Based on a broader scenario combining the original installation expenditure with separate non-overlapping direct remedial expenditure. It is not an assumed entitlement and remains subject to evidence, causation, contractual route and offsets.`,
    status: quoteOnly ? "PROVISIONAL" : "PROVISIONAL",
    missing: [
      direct == null && "Documented or reported direct removal/remedial cost",
      installation == null &&
        "Original installation expenditure for a broader scenario",
    ],
    supportingIndicators: [
      installation != null && {
        label: "Installation value",
        value: money(installation, "en-GB", "GBP"),
      },
      removal != null && {
        label: quoteOnly ? "Removal quotation" : "Removal paid",
        value: money(removal, "en-GB", "GBP"),
      },
    ],
    relationshipNotes: [
      quoteOnly
        ? "The removal figure is a quotation/estimate, not incurred loss."
        : "A removal quotation and the resulting payment are not both included.",
      roofIncludesRemoval
        ? "The roof/remedial project is treated as including removal; removal is not added again."
        : "Roof and removal figures are combined only where recorded as separate scopes.",
    ],
  });
}

function scenarioRows(range) {
  const dutch = range.locale === "nl-NL";
  return [
    {
      scenario: range.lower.scenario_identity || (dutch ? "ONDERSTE SCENARIO" : "LOWER SCENARIO"),
      indicative_value: range.lower.display,
      rationale: range.lower.basis,
    },
    {
      scenario: range.upper.scenario_identity || (dutch ? "BOVENSTE SCENARIO" : "UPPER SCENARIO"),
      indicative_value:
        range.upper.amount == null
          ? range.upper.display
          : `${dutch ? "tot" : "up to"} ${range.upper.display}`,
      rationale: range.upper.basis,
    },
    {
      scenario: dutch ? "RANGESTATUS" : "RANGE STATUS",
      indicative_value: range.status,
      rationale: range.missing_information.length
        ? range.missing_information.join("; ")
        : dutch
          ? "Belangrijke financiële ankers zijn opgenomen; bronstukken en relaties moeten worden gecontroleerd."
          : "Key financial anchors are included; source documents and relationships require verification.",
    },
    {
      scenario: dutch ? "ANTI-DUBBELTELLING" : "ANTI-DOUBLE-COUNTING",
      indicative_value: dutch ? "NIET CUMULATIEF" : "NON-CUMULATIVE",
      rationale: range.relationship_notes.join(" ") || range.caveat,
    },
  ];
}

module.exports = {
  METHODOLOGY_VERSION,
  canonicalRange,
  solarFinancialRange,
  sprayFoamFinancialRange,
  scenarioRows,
};
