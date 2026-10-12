"use strict";

const { validateRequest } = require("./financialRangeContract");
const { RELEASE, RELEASE_HASH, assertManifestIntegrity } = require("./financialRangeManifest");
const { byId } = require("./financialRangeRules");
const { sha256 } = require("./stable");

const positive = (value) => Number.isSafeInteger(value) && value > 0 ? value : null;
const metric = (value) => typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
const sumMinor = (values) => values.reduce((total, value) => total + (positive(value) || 0), 0);
const major = (minor) => minor == null ? null : minor / 100;
const money = (minor, locale, currency) => positive(minor) == null ? null : new Intl.NumberFormat(locale, {
  style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 2,
}).format(major(minor));
const trace = (id, consequence) => Object.freeze({ id, version: byId(id).version, consequence });

function canonical(request, { lowerMinor, upperMinor, lowerBasis, upperBasis, missing, indicators, safeguards, appliedRules }) {
  const { locale, currency } = request;
  const dutch = locale === "nl-NL";
  let status;
  if (lowerMinor == null && upperMinor == null) {
    status = "PENDING";
    appliedRules.push(trace("QRE-ALL-FIN-STATUS-001", "No safe range boundary; status PENDING."));
  } else if (lowerMinor == null || upperMinor == null) {
    status = "PARTIAL";
    appliedRules.push(trace("QRE-ALL-FIN-STATUS-002", "One safe range boundary; status PARTIAL."));
  } else {
    status = "PROVISIONAL";
    appliedRules.push(trace("QRE-ALL-FIN-STATUS-003", "Two evidence-dependent boundaries; status PROVISIONAL."));
  }
  if (lowerMinor != null && upperMinor != null) {
    appliedRules.push(trace("QRE-ALL-FIN-SAFE-001", "Validated lower boundary does not exceed upper boundary."));
    if (lowerMinor > upperMinor) throw new Error("Core lower scenario exceeds upper scenario.");
  }
  appliedRules.push(trace("QRE-ALL-FIN-SAFE-002", "Missing and unknown values remained absent rather than zero."));
  appliedRules.push(trace("QRE-ALL-FIN-SAFE-003", "Scenario boundaries remain non-cumulative."));
  const display = lowerMinor != null && upperMinor != null ? `${money(lowerMinor, locale, currency)} - ${money(upperMinor, locale, currency)}`
    : lowerMinor != null ? (dutch ? `${money(lowerMinor, locale, currency)} - breder scenario in afwachting` : `${money(lowerMinor, locale, currency)} - broader scenario pending`)
      : upperMinor != null ? (dutch ? `Onderste scenario in afwachting - tot ${money(upperMinor, locale, currency)}` : `Lower scenario pending - up to ${money(upperMinor, locale, currency)}`)
        : (dutch ? "IN AFWACHTING VAN BELANGRIJKE FINANCIËLE INFORMATIE" : "PENDING KEY FINANCIAL INFORMATION");
  const caveat = dutch
    ? "Deze bandbreedte is een voorlopige, scenario-gebaseerde financiële beoordeling. Het is geen vastgestelde claimwaarde, gegarandeerde vergoeding of voorspelling van de uiteindelijke uitkomst. De bedragen vertegenwoordigen verschillende mogelijke oplossingsscenario's en mogen niet bij elkaar worden opgeteld."
    : "This is a preliminary, scenario-based financial assessment range. It is not an established claim value, a guarantee of recovery, a compensation award or a prediction of the final outcome. The lower and upper figures represent different potential resolution scenarios and must not be added together.";
  const body = {
    evaluationId: request.evaluationId, contractVersion: RELEASE.contractVersion, rulesetVersion: RELEASE.releaseId,
    methodologyVersion: RELEASE.methodologyVersion, locale, currency, status, displayRange: display,
    lower: { minorUnits: lowerMinor, display: lowerMinor == null ? (dutch ? "In afwachting" : "Pending") : money(lowerMinor, locale, currency), basis: lowerBasis || (dutch ? "Belangrijke financiële informatie ontbreekt." : "Key financial information is missing.") },
    upper: { minorUnits: upperMinor, display: upperMinor == null ? (dutch ? "In afwachting" : "Pending") : money(upperMinor, locale, currency), basis: upperBasis || (dutch ? "Belangrijke financiële informatie ontbreekt." : "Key financial information is missing.") },
    missingInformation: [...new Set(missing.filter(Boolean))], indicators: indicators.filter(Boolean), safeguards: safeguards.filter(Boolean),
    appliedRules, warnings: [caveat], manifestHash: RELEASE_HASH,
  };
  return Object.freeze({ ...body, resultHash: sha256(body) });
}

function evaluateSolar(request) {
  const i = request.inputs, dutch = request.locale === "nl-NL", appliedRules = [];
  const purchase = positive(i.purchasePriceMinor), outstanding = positive(i.settlementFigureMinor) || positive(i.outstandingBalanceMinor), direct = positive(i.directCostMinor);
  const lower = outstanding || direct;
  if (lower != null) appliedRules.push(trace(dutch ? "QRE-NL-SOLAR-RANGE-001" : "QRE-UK-SOLAR-RANGE-001", outstanding ? "Selected current finance/settlement balance as lower scenario." : "Selected direct cost as lower scenario."));
  if (purchase != null) appliedRules.push(trace(dutch ? "QRE-NL-SOLAR-RANGE-002" : "QRE-UK-SOLAR-RANGE-002", "Selected purchase value as broader upper scenario."));
  const lowerBasis = outstanding
    ? (dutch ? "Gebaseerd op het gemelde actuele openstaande financierings- of aflossingssaldo en een beperkter financieel oplossingsscenario." : "Based on the reported current outstanding finance or settlement balance and a narrower finance-resolution scenario.")
    : direct ? (dutch ? "Gebaseerd op de gemelde directe technische, inspectie- of herstelkosten; bewijs en causaliteit moeten worden gecontroleerd." : "Based on the reported direct technical, inspection or remedial cost; evidence and causation require review.") : null;
  const upperBasis = purchase ? (dutch ? "Gebaseerd op de gemelde bruto aankoopwaarde en een aanzienlijk breder terugbetalings- of ontbindingsscenario, mogelijk onderhevig aan verrekening, behouden waarde, gebruik/voordeel en financieringsafstemming." : "Based on the reported gross purchase value and a materially broader refund or unwind-type scenario, potentially subject to offsets, retained value, use or benefit and finance reconciliation.") : null;
  const expectedGen = metric(i.expectedGeneration), actualGen = metric(i.actualGeneration), expectedSave = positive(i.expectedSavingMinor), actualSave = i.actualSavingMinor == null ? null : i.actualSavingMinor;
  const generationGap = expectedGen != null && actualGen != null ? Math.max(0, expectedGen - actualGen) : null;
  const generationPct = generationGap != null && expectedGen > 0 ? Math.round(generationGap / expectedGen * 100) : null;
  const savingsGap = expectedSave != null && actualSave != null ? Math.max(0, expectedSave - actualSave) : null;
  if ([expectedGen, actualGen, expectedSave, actualSave].some((value) => value != null)) appliedRules.push(trace(dutch ? "QRE-NL-SOLAR-EVD-001" : "QRE-UK-SOLAR-EVD-001", "Calculated available performance indicators without creating a range anchor."));
  const indicators = [
    expectedGen != null && { label: dutch ? "Verwachte opbrengst" : "Expected generation", value: `${expectedGen.toLocaleString(request.locale)} kWh` },
    actualGen != null && { label: dutch ? "Werkelijke opbrengst" : "Actual generation", value: `${actualGen.toLocaleString(request.locale)} kWh` },
    generationGap != null && { label: dutch ? "Opbrengstverschil" : "Generation difference", value: `${generationGap.toLocaleString(request.locale)} kWh${generationPct == null ? "" : ` / ${dutch ? "ongeveer" : "approximately"} ${generationPct}%`}` },
    savingsGap != null && { label: dutch ? "Besparingsverschil" : "Savings difference", value: money(savingsGap, request.locale, request.currency) },
    outstanding != null && { label: dutch ? "Openstaande financiering" : "Outstanding finance", value: money(outstanding, request.locale, request.currency) },
  ];
  const relationship = dutch ? "Koopprijs, kredietbedrag, reeds betaald bedrag, contractuele betaling en openstaand saldo kunnen dezelfde transactie vertegenwoordigen en worden niet opgeteld." : "Purchase price, finance principal, amount paid, contractual payments and outstanding balance may represent the same transaction and are not added together.";
  return canonical(request, { lowerMinor: lower, upperMinor: purchase, lowerBasis, upperBasis,
    missing: [lower == null && (dutch ? "Actueel financieringssaldo of onderbouwde directe kosten" : "Current finance balance or supported direct cost"), purchase == null && (dutch ? "Aankoopwaarde" : "Purchase value")],
    indicators, safeguards: [relationship], appliedRules });
}

function evaluateSpray(request) {
  const i = request.inputs, appliedRules = [];
  const removal = positive(i.removalPaidMinor) || positive(i.removalQuoteMinor);
  if (removal != null) appliedRules.push(trace("QRE-UK-SPRAY-FIN-001", positive(i.removalPaidMinor) ? "Paid removal superseded quotation." : "Removal quotation used as the available estimate."));
  const direct = [i.inspectionPaidMinor, removal, i.furtherRemedialMinor, i.targetedRepairMinor, i.feesMinor, i.otherCostsMinor].map(positive).filter((value) => value != null);
  if (positive(i.roofReplacementMinor) != null) {
    if (i.roofIncludesRemoval && removal != null) {
      direct.splice(direct.indexOf(removal), 1);
      appliedRules.push(trace("QRE-UK-SPRAY-SAFE-001", "Removal excluded because roof scope includes it."));
    }
    direct.push(i.roofReplacementMinor);
  }
  let directMinor = Math.max(0, sumMinor(direct) - (positive(i.creditsMinor) || 0)) || null;
  if (directMinor != null || positive(i.creditsMinor) != null) appliedRules.push(trace("QRE-UK-SPRAY-FIN-002", "Summed non-overlapping direct costs and deducted credit once."));
  const installation = positive(i.installationPriceMinor);
  const upper = installation != null && directMinor != null ? installation + directMinor : installation || directMinor;
  const upperMinor = upper === directMinor ? null : upper;
  const quoteOnly = positive(i.removalPaidMinor) == null && positive(i.removalQuoteMinor) != null;
  if (directMinor != null) appliedRules.push(trace("QRE-UK-SPRAY-RANGE-001", "Selected direct cost as lower scenario."));
  if (upperMinor != null) appliedRules.push(trace("QRE-UK-SPRAY-RANGE-002", "Selected installation plus separate direct cost as broader scenario."));
  if (installation != null || removal != null) appliedRules.push(trace("QRE-UK-SPRAY-EVD-001", "Returned installation/removal reference indicators."));
  return canonical(request, {
    lowerMinor: directMinor, upperMinor,
    lowerBasis: directMinor == null ? null : `${quoteOnly ? "Based on quoted / estimated removal or remedial cost" : "Based on reported paid, evidenced or committed non-overlapping direct removal, inspection and remedial costs"}${positive(i.creditsMinor) ? ", after the related reported credit" : ""}. Evidence, scope and causation require review.`,
    upperBasis: installation == null ? null : "Based on a broader scenario combining the original installation expenditure with separate non-overlapping direct remedial expenditure. It is not an assumed entitlement and remains subject to evidence, causation, contractual route and offsets.",
    missing: [directMinor == null && "Documented or reported direct removal/remedial cost", installation == null && "Original installation expenditure for a broader scenario"],
    indicators: [installation != null && { label: "Installation value", value: money(installation, "en-GB", "GBP") }, removal != null && { label: quoteOnly ? "Removal quotation" : "Removal paid", value: money(removal, "en-GB", "GBP") }],
    safeguards: [quoteOnly ? "The removal figure is a quotation/estimate, not incurred loss." : "A removal quotation and the resulting payment are not both included.", i.roofIncludesRemoval ? "The roof/remedial project is treated as including removal; removal is not added again." : "Roof and removal figures are combined only where recorded as separate scopes."],
    appliedRules,
  });
}

function evaluateFinancialRange(request, options = {}) {
  const release = options.release || RELEASE;
  assertManifestIntegrity(release, options.expectedManifestHash || RELEASE_HASH);
  validateRequest(request, release);
  return request.category === "SPRAY_FOAM" ? evaluateSpray(request) : evaluateSolar(request);
}

module.exports = { evaluateFinancialRange };
