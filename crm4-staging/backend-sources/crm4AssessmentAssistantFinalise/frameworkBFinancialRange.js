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
  finite(value) == null
    ? null
    : new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(finite(value));

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
  quantification,
}) {
  const authority = require("./quaerensCore/financialQuantification");
  const decision = quantification ? authority.assertIssued(quantification) : authority.evaluate({category:"unspecified",missing:["A governed scenario basis with source provenance is required"]});
  const low = decision.scenarios[0]?.amount ?? null,
    high = decision.scenarios[1]?.amount ?? null;
  lowerBasis = decision.scenarios[0]?.basis || "Currently unquantified; supporting evidence and governed basis required.";
  upperBasis = decision.scenarios[1]?.basis || "Broader redress under assessment; not quantified.";
  missing = [...missing,...decision.missing];
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
          ? `${money(low, locale, currency)}`
          : `${money(low, locale, currency)}`
        : high != null
          ? dutch
            ? `${money(high, locale, currency)}`
            : `${money(high, locale, currency)}`
          : dutch
            ? "IN AFWACHTING VAN BELANGRIJKE FINANCIËLE INFORMATIE"
            : "Unquantified / under assessment";
  const caveat = dutch
    ? "Deze bandbreedte is een voorlopige, scenario-gebaseerde financiële beoordeling. Het is geen vastgestelde claimwaarde, gegarandeerde vergoeding of voorspelling van de uiteindelijke uitkomst. De bedragen vertegenwoordigen verschillende mogelijke oplossingsscenario's en mogen niet bij elkaar worden opgeteld."
    : "This is a preliminary, scenario-based financial assessment range. It is not an established claim value, a guarantee of recovery, a compensation award or a prediction of the final outcome. The lower and upper figures represent different potential resolution scenarios and must not be added together.";
  return Object.freeze({
    methodology_version: METHODOLOGY_VERSION,
    quantification: decision,
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
    agent_summary: low == null || high == null
      ? `${dutch ? "Indicatieve financiële positie" : "Indicative financial position"}: ${display}. ${dutch ? "Breder verhaal blijft in beoordeling." : "Broader redress remains under assessment. Evidence, causation, non-overlap and applicable credits require review; references are not automatic recoverable loss."}`
      : dutch
      ? `Op basis van de verstrekte informatie identificeert de voorlopige beoordeling een indicatieve financiële beoordelingsrange van ${display}. De bedragen vertegenwoordigen verschillende mogelijke oplossingsscenario's en vormen geen gegarandeerde claimwaarde.`
      : `Based on the information supplied, the preliminary assessment identifies an indicative financial assessment range of ${display}. The figures represent different potential resolution scenarios rather than a guaranteed claim value.`,
  });
}

function solarFinancialRange({ locale="en-GB",currency="GBP",quantification } = {}) {
  if(quantification && quantification.category!==(locale==="nl-NL"?"nl-solar":"solar"))throw Error("FINANCIAL_QUANTIFICATION: Category mismatch");
  // Purchase/finance/quotation references are never implicit remedy scenarios.
  return canonicalRange({locale,currency,quantification:quantification || require("./quaerensCore/financialQuantification").evaluate({category:locale==="nl-NL"?"nl-solar":"solar",missing:["Independently justified remedy basis, source evidence, causal scope and offsets"]})});
}

function sprayFoamFinancialRange({ reportedExpenditure,quantification,removalEstimateRange } = {}) {
  if(quantification && quantification.category!=="spray-foam")throw Error("FINANCIAL_QUANTIFICATION: Category mismatch");
  const supportingIndicators=[];
  if(removalEstimateRange){
    const low=finite(removalEstimateRange.lower),high=finite(removalEstimateRange.upper);
    if(low!==null&&high!==null&&low>high)throw Error("Removal estimate lower value exceeds upper value");
    supportingIndicators.push({label:"Removal estimate range",value:`${money(low,"en-GB","GBP")||"Unknown"} - ${money(high,"en-GB","GBP")||"Unknown"}; quotation/reference only, not a recovery scenario`});
  }
  return canonicalRange({supportingIndicators,quantification:quantification || require("./quaerensCore/financialQuantification").sprayFromModel(reportedExpenditure)});
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
