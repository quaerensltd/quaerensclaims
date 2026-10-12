"use strict";

const { solarReport } = require("./frameworkBSolarReport");
const {
  selectFinancialRangeAuthority,
  applyFinancialRangeAuthority,
} = require("./quaerensCore/financialRangeAuthority");

const text = (value) => String(value == null ? "" : value).trim();
const norm = (value) =>
  text(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const STATES = Object.freeze({ REPORTED: "REPORTED", ABSENT: "ABSENT", NOT_SUPPLIED: "NOT_SUPPLIED" });
const SEMANTIC_ALIASES = Object.freeze({
  ORIGINAL_PURCHASE_PRICE: ["original system price", "original solar system purchase", "original solar installation price", "original solar purchase price", "original residential solar purchase", "original purchase price", "purchase price", "purchase contract price", "contract price", "solar system purchase price", "installation price"],
  INSTALLER_IDENTITY: ["installer", "installer trading name", "installer identity", "installer name", "supplier installer", "reported supplier and installer"],
  SUPPLIER_IDENTITY: ["supplier", "solar supplier", "original solar supplier", "supplier identity", "supplier name", "supplier installer", "reported supplier and installer"],
  POSSIBLE_LEGAL_ENTITY: ["possible registered company", "possible company record", "possible legal entity"],
  TRADING_STATUS: ["current trading status", "installer status", "supplier status"],
  ENTITY_RELATIONSHIP: ["trading name and registered company link", "contracting entity relationship", "legal entity relationship"],
  INSTALLATION_YEAR: ["installation year", "year installed"],
  INSTALLATION_DATE: ["installation date"],
  PURCHASE_YEAR: ["original purchase year", "purchase year", "year purchased"],
  PURCHASE_INSTALLATION_EVENT: ["purchase and installation", "reported purchase and installation"],
  SYSTEM_CAPACITY: ["reported system capacity", "stated system capacity", "system capacity", "system size", "system specification"],
  PANEL_COUNT: ["number of panels", "panel count", "panel quantity"],
  ORIGINAL_INVERTER: ["original inverter"],
  BATTERY_SYSTEM_SPECIFICATION: ["battery specification", "installed battery", "battery system", "battery storage"],
  APR_VALUE: ["apr", "annual percentage rate"],
  APR_DISCLOSURE_CONCERN: ["interest rate disclosure", "apr disclosure concern"],
  AFFORDABILITY_CONCERN: ["affordability assessment", "affordability concern"],
  REPLACEMENT_INVERTER: ["replacement inverter", "replacement equipment"],
  INVERTER_EXPENDITURE_ESTIMATE: ["combined inverter expenditure", "inverter expenditure estimate", "reported inverter expenditure"],
  LATER_BATTERY_EXPENDITURE: ["later battery transaction", "later battery expenditure", "separate battery transaction", "battery expenditure"],
  LATER_BATTERY_SYSTEM: ["later battery system"],
  LATER_BATTERY_SUPPLIER: ["later battery supplier"],
  FIT_INCOME_BENEFIT: ["fit return", "fit income", "annual fit return", "approximate annual feed in tariff income", "annual feed in tariff income", "feed in tariff income"],
  FIT_LOSS: ["fit loss", "lost fit income", "reported fit loss", "feed in tariff loss", "lost feed in tariff income"],
  ORIGINAL_TRANSACTION_REFERENCE: ["unclassified original transaction figure", "original transaction figure", "original transaction finance reference", "original transaction reference"],
  POSSIBLE_CONTRACT_PRICE: ["possible contract price", "reported possible contract price"],
  ALTERNATIVE_TRANSACTION_REFERENCE: ["alternative contract finance figure", "alternative contract finance principal", "alternative transaction finance figure", "alternative contract price", "alternative finance principal"],
  REPORTED_ORIGINAL_SYSTEM_COST: ["reported original system cost", "client reported original system cost"],
  RELOCATION_COST: ["reported relocation cost", "relocation cost", "solar relocation cost", "system relocation cost", "relocation payment"],
  SYSTEM_CONDITION: ["system condition", "current system condition", "reported system condition"],
  INTEREST_POSITION: ["interest", "finance interest", "interest position"],
  REQUESTED_REDRESS_OUTCOME: ["requested redress", "requested outcome", "client requested outcome", "refunds compensation"],
  OUT_OF_SCOPE_OTHER_SYSTEM: ["separate commercial system", "other solar system", "commercial solar system"],
  OUT_OF_SCOPE_OTHER_MATTER: ["separate non solar matter", "separate spray foam matter", "spray foam matter"],
  PAYMENT_METHOD: ["payment methods", "payment method", "payment route", "purchase price and payment"],
  FINANCE_PRESENCE: ["credit finance disclosed", "funding arrangement", "finance used", "financed"],
  MCS_POSITION: ["mcs certification", "available certification"],
  SALES_REPRESENTATION: ["sales representation", "consumer recollection", "sales recollection"],
  PRIOR_COMPLAINT: ["prior complaint", "complaint history", "prior complaint or solicitor records"],
  SOLICITOR_INVOLVEMENT: ["solicitor", "legal representation", "prior complaint or solicitor records"],
  PRIOR_REDRESS: ["prior redress", "redress outcome", "settlement refund compensation"],
});
const aliasSet = (identity) => new Set(SEMANTIC_ALIASES[identity] || []);
const semanticMatch = (item, identity) => {
  const label = norm(item?.label);
  // A conjunction does not change this typed alternative-transaction meaning.
  const typedLabel = identity === "ALTERNATIVE_TRANSACTION_REFERENCE"
    ? label.replace(/\bcontract and finance\b/g, "contract finance") : label;
  return aliasSet(identity).has(typedLabel);
};
const sources = (x) => ({
  financialItems: x.financialItems || [], transactions: x.transactions || [], finance: x.finance || [],
  supplier: x.supplier || [], product: x.product || [], property: x.property || [], evidence: x.evidenceReadiness || [],
  confirmed: x.confirmedFacts || [], reported: x.reportedFacts || [], statements: x.clientStatements || [], estimates: x.estimates || [],
});
const semanticItem = (x, identity, order) => {
  const grouped = sources(x);
  for (const source of order) {
    const match = (grouped[source] || []).find((item) => usable(item) && semanticMatch(item, identity));
    if (match) return { ...match, semanticIdentity: identity, sourceCollection: source };
  }
  return null;
};
const semanticItemIncludingUnresolved = (x, identity, order) => {
  const grouped = sources(x);
  for (const source of order) {
    const match = (grouped[source] || []).find((item) => semanticMatch(item, identity));
    if (match) return { ...match, semanticIdentity: identity, sourceCollection: source };
  }
  return null;
};
const semanticItemsIncludingUnresolved = (x, identity, order) => {
  const grouped = sources(x), matches = [], seen = new Set();
  for (const source of order) {
    for (const item of grouped[source] || []) {
      if (!semanticMatch(item, identity)) continue;
      const amount = parseMoney(item);
      const key = `${amount == null ? "" : amount}|${norm(item.label)}|${norm(item.value)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      matches.push({ ...item, semanticIdentity: identity, sourceCollection: source });
    }
  }
  return matches;
};
const parseMoney = (candidate) => {
  if (!candidate) return null;
  for (const raw of [candidate.amount, candidate.value]) {
    const direct = Number(raw);
    if (Number.isFinite(direct) && direct >= 0) return direct;
    const matched = text(raw).replace(/,/g, "").match(/(?:£|GBP\s*)?([0-9]+(?:\.[0-9]{1,2})?)/i);
    const parsed = Number(matched?.[1]);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }
  return null;
};
const semanticAmount = (x, identity) => parseMoney(semanticItem(x, identity, ["financialItems", "transactions", "finance", "confirmed", "reported"]));
const semanticValue = (x, identity, order = ["supplier", "product", "property", "finance", "confirmed", "reported", "statements", "estimates"]) =>
  text(semanticItem(x, identity, order)?.value);
const semanticIdentityItem = (x, identity) => {
  const candidates = [];
  for (const source of ["supplier", "confirmed", "reported"]) {
    for (const item of sources(x)[source] || []) {
      if (usable(item) && semanticMatch(item, identity)) candidates.push({ ...item, sourceCollection: source });
    }
  }
  return candidates.sort((a, b) => {
    const generic = (item) => /^(?:solar firm|solar company|supplier|installer)$/i.test(reportedIdentity(item));
    return Number(generic(a)) - Number(generic(b)) || reportedIdentity(b).length - reportedIdentity(a).length;
  })[0] || null;
};
const reportedIdentity = (item) =>
  text(item?.value)
    .replace(
      /\s*;\s*(?:(?:the\s+)?exact\s+)?(?:legal\s+)?identity\b.*$/i,
      "",
    )
    .replace(/\s*;\s*(?:role|trading status|documentary verification)\b.*$/i, "")
    .trim();
const explicitPresence = (item) => {
  if (!item) return STATES.NOT_SUPPLIED;
  const status = text(item.status).toUpperCase(), value = norm(item.value);
  if (/\b(?:no|not) (?:finance )?(?:route |arrangement )?(?:has been |is )?established\b|\bpayment route (?:is )?(?:unknown|unresolved)\b/.test(value)) return STATES.NOT_SUPPLIED;
  if (status === "NOT_APPLICABLE" || /\bno (?:loan|credit|finance|complaint|solicitor|settlement|refund|compensation)\b|\bnone\b|\bnot applicable\b/.test(value)) return STATES.ABSENT;
  if (["NOT_SUPPLIED", "TBC", "REQUIRES_CLARIFICATION"].includes(status) || /\b(?:not supplied|unknown|requires confirmation)\b/.test(value)) return STATES.NOT_SUPPLIED;
  return STATES.REPORTED;
};
const usable = (item) =>
  item &&
  !/^(?:NOT_SUPPLIED|TBC|REQUIRES_CLARIFICATION)$/.test(text(item.status)) &&
  !/^(?:not supplied|unknown|not known|tbc|requires clarification)$/i.test(
    text(item.value),
  );
const facts = (extraction) => [
  ...(extraction.confirmedFacts || []),
  ...(extraction.reportedFacts || []),
  ...(extraction.clientStatements || []),
  ...(extraction.supplier || []),
  ...(extraction.product || []),
  ...(extraction.property || []),
  ...(extraction.finance || []),
  ...(extraction.estimates || []),
];
const moneyItems = (extraction) => [
  ...(extraction.financialItems || []),
  ...(extraction.transactions || []),
  ...(extraction.calculatedValues || []),
];
const find = (items, patterns) =>
  items.find(
    (item) =>
      usable(item) && patterns.some((pattern) => pattern.test(norm(item.label))),
  ) || null;
const value = (items, patterns) => text(find(items, patterns)?.value);
const amount = (items, patterns, statuses = null) => {
  const item = find(
    items.filter(
      (candidate) =>
        !statuses || statuses.includes(text(candidate.status).toUpperCase()),
    ),
    patterns,
  );
  const parsed = Number(item?.amount);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};
const unique = (values) => [...new Set(values.map(text).filter(Boolean))];
const strictPanelCount = (item) => {
  if (!usable(item)) return "";
  const label = norm(item.label), raw = text(item.value);
  const permittedLabel = semanticMatch(item, "PANEL_COUNT") || label === "product" || label === "system configuration";
  if (!permittedLabel) return "";
  const match = raw.match(/\b(\d{1,3})\s+(?:solar\s+)?panels?\b/i);
  if (!match) return "";
  const count = Number(match[1]);
  return count > 0 && count <= 500 ? String(count) : "";
};
const panelCountItem = (x) => {
  for (const source of ["product", "confirmed", "reported"]) {
    const item = (sources(x)[source] || []).find((candidate) => strictPanelCount(candidate));
    if (item) return { ...item, sourceCollection: source };
  }
  return null;
};
const replacementInverterItem = (x) => {
  for (const source of ["product", "reported", "confirmed"]) {
    const item = (sources(x)[source] || []).find((candidate) => usable(candidate) && (semanticMatch(candidate, "REPLACEMENT_INVERTER") || (norm(candidate.label) === "inverter" && /\breplac(?:ed|ement)\b/.test(norm(candidate.value)))));
    if (item) return item;
  }
  return null;
};
const replacementInverterItems = (x) => {
  const items = [];
  for (const source of ["product", "reported", "confirmed"]) {
    for (const candidate of sources(x)[source] || []) {
      if (usable(candidate) && (semanticMatch(candidate, "REPLACEMENT_INVERTER") || (norm(candidate.label) === "inverter" && /\breplac(?:ed|ement)|\bupgrad(?:ed|e)\b/.test(norm(candidate.value))))) items.push(text(candidate.value));
    }
  }
  return unique(items);
};
const strictApr = (item) => {
  if (!item || !semanticMatch(item, "APR_VALUE") || !usable(item)) return "";
  const raw = text(item.value);
  const match = raw.match(/(?:^|\b)(\d{1,2}(?:\.\d{1,3})?)\s*%?(?:\b|$)/);
  if (!match) return "";
  const value = Number(match[1]);
  return Number.isFinite(value) && value >= 0 && value <= 100 ? String(value) : "";
};
const dateParts = (value) =>
  unique(
    text(value).match(
      /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}|\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{4}\b/gi,
    ) || [],
  );
const boundedYear = (value) => text(value).match(/\b((?:19|20)\d{2})\b/)?.[1] || "";
const incurredDirectCosts = (items) => {
  const seen = new Set();
  return items.flatMap((item) => {
    const label = norm(item.label);
    const status = text(item.status).toUpperCase();
    const basis = norm(item.basis);
    const value = Number(item.amount);
    if (
      !Number.isFinite(value) ||
      value <= 0 ||
      /requested|sought|redress|refund|compensation|estimate|estimated|prospective|quotation|quote|unknown|not supplied/.test(
        `${label} ${basis} ${norm(status)}`,
      ) ||
      !["CONFIRMED_FROM_INPUT", "CLIENT_REPORTED"].includes(status) ||
      !/paid|incurred|committed/.test(`${label} ${basis}`)
    )
      return [];
    let type = "OTHER_DIRECT_INCURRED";
    if (/engineer|inspection|technical report/.test(label))
      type = "ENGINEER_INSPECTION";
    else if (/inverter/.test(label) && /remedial|repair|replacement|work/.test(label))
      type = "INVERTER_REMEDIAL";
    else if (!/technical|remedial|repair|replacement|inspection/.test(label))
      return [];
    const overlapIdentity = text(item.overlapIdentity || item.scopeIdentity) ||
      `${type}:${label}:${value}`;
    if (seen.has(overlapIdentity)) return [];
    seen.add(overlapIdentity);
    return [{
      type,
      category: text(item.label),
      amount: value,
      status: /committed/.test(`${label} ${basis}`) ? "COMMITTED" : "PAID_OR_INCURRED",
      basis: text(item.basis) || "Client-reported incurred direct cost",
      provenance: text(item.source) || "Lister-confirmed client report",
      evidenceStatus: status,
      overlapIdentity,
    }];
  });
};
const evidenceState = (item) => {
  const status = text(item?.status).toUpperCase(), value = norm(item?.value);
  if (status === "NOT_APPLICABLE" || /\bnot applicable\b|\bno prior (?:complaint|solicitor)\b|\bno (?:complaint|solicitor) involvement\b/.test(value)) return "Not applicable";
  if (/\bno paperwork\b|\bno documents?\b|\bnot currently available\b|\bunavailable\b|\bnever provided\b|\breported missing\b|\bmissing\b/.test(value)) return "Not identified";
  if (/reported to (?:exist|be on file)|registered and available on file|reportedly available/.test(value)) return "Exists - not available now";
  if (/available and will be provided|are available and will be provided|says .* available/.test(value)) return "Exists - not available now";
  if (/cannot locate|cannot find/.test(value)) return "Not identified";
  if (status === "TBC" || status === "REQUIRES_CLARIFICATION" || /(?:sar|request) (?:is )?proposed|to be requested|will check/.test(value)) return /will check/.test(value) ? "Will check" : "Not identified";
  if (status === "CONFIRMED_FROM_INPUT" && /available now|document identified/.test(value)) return "Available now";
  if (status === "CLIENT_REPORTED") return "Exists - not available now";
  return "Not identified";
};

const EVIDENCE_DEFINITIONS = Object.freeze([
  ["PURCHASE_PAPERWORK", "Original purchase paperwork", /original purchase paperwork/],
  ["SUPPLIER_CONTRACT", "Supplier contract", /supplier contract|signed contract|order form|terms and conditions|sales and contract documents/],
  ["PURCHASE_INVOICE", "Purchase invoice", /supplier invoice|purchase invoice|invoice and evidence of payment/],
  ["FINANCE_AGREEMENT", "Finance agreement", /finance agreement|credit agreement/],
  ["FINANCE_STATEMENTS", "Finance statements and payment records", /finance statements?|payment history|direct debit|settled balance/],
  ["SALES_MATERIAL", "Sales material and projections", /sales material|sales brochure|quotation|marketing material|sales projection|sales and contract documents/],
  ["MCS_CERTIFICATE", "MCS certificate", /\bmcs\b/],
  ["INSTALLATION_CERTIFICATE", "Installation certificate and system specification", /installation certificate|installation and certification|commissioning record|system specification/],
  ["WARRANTY", "Warranty documents", /warranty/],
  ["FIT_RECORDS", "FIT records", /\bfit\b|feed.?in tariff/],
  ["GENERATION_RECORDS", "Generation records", /\bgeneration\b|generation record|generation data|meter reading/],
  ["ELECTRICITY_BILLS", "Electricity bills", /electricity bill/],
  ["ENGINEER_REPORT", "Engineer report", /engineer report|technical evidence|independent engineer/],
  ["ENGINEER_INVOICE", "Engineer invoice", /engineer invoice|proof of the £?250|inspection payment/],
  ["REMEDIAL_INVOICE", "Remedial-work invoice", /remedial invoice|remedial-work|inverter invoice|inverter receipts?|replacement inverter paperwork|proof of the £?400/],
  ["PHOTOGRAPHS", "Photographs", /photograph/],
  ["SUPPLIER_COMPLAINT", "Supplier complaint correspondence", /supplier complaint|complaints? to .*supplier/],
  ["SUPPLIER_RESPONSE", "Supplier response", /supplier response/],
  ["LENDER_COMPLAINT", "Lender complaint correspondence", /finance complaint|lender complaint|complaint to .*finance/],
  ["LENDER_FINAL_RESPONSE", "Lender final response", /final response/],
]);
const evidenceIdentities = (value) => EVIDENCE_DEFINITIONS.filter(([, , pattern]) => pattern.test(norm(value)));
const evidenceKind = (item) => {
  const label = norm(item?.label), value = norm(item?.value);
  if (/document access request|subject access request|\bsar\b/.test(`${label} ${value}`)) return "ACTION";
  if (/current evidential position|evidence position|evidential summary/.test(label) || text(item?.status).toUpperCase() === "ANALYTICAL_INFERENCE") return "SUMMARY";
  if (/client paperwork/.test(label) && /no paperwork|no documents/.test(value)) return "SUMMARY";
  return "OBJECT";
};
const typedEvidence = (x) => {
  const records = new Map(), actions = [], summaries = [];
  const merge = (identity, label, state, provenance) => {
    const rank = { "Verified": 6, "Available now": 5, "Exists - not available now": 4, "Will check": 3, "Not identified": 2, "Not applicable": 1 };
    const existing = records.get(identity);
    if (!existing || (rank[state] || 0) > (rank[existing.state] || 0)) records.set(identity, { identity, label, state, provenance });
  };
  for (const item of x.evidenceReadiness || []) {
    const kind = evidenceKind(item);
    if (kind === "ACTION") { actions.push(text(item.value) || text(item.label)); continue; }
    if (kind === "SUMMARY") { summaries.push(text(item.value)); continue; }
    const matches = evidenceIdentities(`${text(item.label)} ${text(item.value)}`);
    for (const [identity, label] of matches) merge(identity, label, evidenceState(item), text(item.source));
  }
  for (const requirement of x.evidenceRequired || []) {
    for (const [identity, label] of evidenceIdentities(requirement)) merge(identity, label, "Not identified", "Evidence requirement");
    if (/subject access request|\bsar\b/i.test(requirement)) actions.push(text(requirement));
  }
  return { records: [...records.values()], actions: unique(actions), summaries: unique(summaries) };
};

const authoritativeAddress = (clientProjection) => {
  const direct = text(clientProjection?.postalAddress || clientProjection?.addressText);
  if (direct) return direct;
  const address = clientProjection?.address || {};
  return [address.addressLine1, address.addressLine2, address.town, address.county, address.postcode, address.country].map(text).filter(Boolean).join(", ");
};

function adaptConfirmedSolar(extraction, { clientProjection = null } = {}) {
  const x = extraction || {};
  const allFacts = facts(x);
  const nonRepresentationFacts = allFacts.filter(
    (item) => !/representation|assurance|promise|sales statement/.test(norm(item.label)),
  );
  const allMoney = moneyItems(x);
  const requested = allMoney.filter((item) =>
    /(?:requested|sought|redress|refund|compensation)/.test(norm(item.label)),
  );
  const directEngineerCost = amount(
    allMoney,
    [
      /engineer.*(?:inspection|attendance|report|cost|expenditure)/,
      /(?:inspection|attendance|report).*engineer.*(?:cost|paid|expenditure)/,
    ],
    ["CONFIRMED_FROM_INPUT", "CLIENT_REPORTED"],
  );
  const directCosts = incurredDirectCosts(allMoney);
  const evidenceProjection = typedEvidence(x);
  const evidence = Object.fromEntries(evidenceProjection.records.map((item) => [item.label, item.state]));
  const financePresenceItem = semanticItem(x, "FINANCE_PRESENCE", ["finance", "confirmed", "reported"]);
  const reportedFinanceProvider = value(allFacts, [/^finance provider$/, /^reported financier$/, /^credit provider$/, /^lender$/]);
  const reportedFinanceType = value(allFacts, [/^finance type$/, /^credit agreement$/, /^finance agreement$/]);
  const classifiedFinanceItems = allMoney.filter((item) =>
    !/(?:possible|alternative|unresolved|conflict)/.test(norm(item.label)),
  );
  const reportedFinanceAmount = amount(classifiedFinanceItems, [/amount.*financed/, /finance (?:amount|principal)/]);
  const explicitFinancePresence = explicitPresence(financePresenceItem);
  const financePresence = explicitFinancePresence === STATES.NOT_SUPPLIED && (reportedFinanceProvider || reportedFinanceType || reportedFinanceAmount != null)
    ? STATES.REPORTED
    : explicitFinancePresence;
  const installerIdentityItem = semanticIdentityItem(x, "INSTALLER_IDENTITY");
  const supplierIdentityItem = semanticIdentityItem(x, "SUPPLIER_IDENTITY");
  const installerIdentity = reportedIdentity(installerIdentityItem);
  const supplierIdentity = reportedIdentity(supplierIdentityItem) || installerIdentity;
  const possibleLegalEntity = semanticValue(x, "POSSIBLE_LEGAL_ENTITY", ["supplier", "confirmed", "reported"]);
  const tradingStatus = semanticValue(x, "TRADING_STATUS", ["supplier", "confirmed", "reported"]);
  const entityRelationship = text(semanticItemIncludingUnresolved(x, "ENTITY_RELATIONSHIP", ["supplier", "confirmed", "reported"])?.value);
  const purchaseInstallationEvent = semanticItem(x, "PURCHASE_INSTALLATION_EVENT", ["reported", "confirmed"]);
  const purchaseInstallationEventYear = boundedYear(purchaseInstallationEvent?.value);
  const installationYear = semanticValue(x, "INSTALLATION_YEAR", ["product", "confirmed", "reported"]) || purchaseInstallationEventYear;
  const installationDate = semanticValue(x, "INSTALLATION_DATE", ["product", "confirmed", "reported"]);
  const purchaseYear = semanticValue(x, "PURCHASE_YEAR", ["product", "confirmed", "reported"]) || purchaseInstallationEventYear;
  const paymentMethod = semanticValue(x, "PAYMENT_METHOD", ["finance", "confirmed", "reported"]);
  const complaintPresence = explicitPresence(semanticItem(x, "PRIOR_COMPLAINT", ["confirmed", "reported", "statements", "evidence"]));
  const solicitorPresence = explicitPresence(semanticItem(x, "SOLICITOR_INVOLVEMENT", ["confirmed", "reported", "statements", "evidence"]));
  const priorRedressPresence = explicitPresence(semanticItem(x, "PRIOR_REDRESS", ["confirmed", "reported", "statements"]));
  const representationFacts = allFacts
    .filter(
      (item) =>
        usable(item) &&
        /representation|assurance|promise|sales statement/.test(norm(item.label)),
    );
  const selectedRepresentations = unique(
    representationFacts.flatMap((item) => {
      const wording = norm(`${item.label} ${item.value}`);
      return [
        /specific.*(?:generation|saving)|(?:generation|saving).*(?:figure|3 200|3 500)/.test(wording) &&
          "Specific generation or savings figures",
        /pay for itself|self fund/.test(wording) && "System would pay for itself",
        /little maintenance|very little maintenance|maintenance free|trouble free/.test(wording) &&
          "Maintenance-free or trouble-free system",
      ].filter(Boolean);
    }),
  );
  const representationRecall = unique([
    ...representationFacts.map((item) => text(item.value)),
    value(allFacts, [/consumer recollection/, /sales recollection/]),
    value(allFacts, [/reliance on representations/, /representation reliance/]),
  ]).join(" ");
  const supplierComplaint = find(allFacts, [/supplier complaints?/, /installer complaints?/]);
  const supplierResponse = find(allFacts, [/supplier response/]);
  const lenderComplaint = find(allFacts, [/finance complaint/, /lender complaint/]);
  const lenderResponse = find(allFacts, [/finance.*final response/, /lender.*final response/, /lender response/]);
  const priorRedress = value(allFacts, [/prior redress/, /settlement.*refund.*compensation/, /redress outcome/]);
  const supplierDates = dateParts(supplierComplaint?.value);
  const lenderDates = dateParts(lenderComplaint?.value);
  const supplierResponseDates = dateParts(supplierResponse?.value);
  const lenderResponseDates = dateParts(lenderResponse?.value);
  const panelFact = panelCountItem(x);
  const panelNumber = strictPanelCount(panelFact);
  const aprItem = semanticItemIncludingUnresolved(x, "APR_VALUE", ["finance", "confirmed", "reported"]);
  const aprDisclosureConcern = semanticValue(x, "APR_DISCLOSURE_CONCERN", ["finance", "statements", "reported"]);
  const affordabilityConcern = semanticValue(x, "AFFORDABILITY_CONCERN", ["finance", "statements", "reported"]);
  const batterySpecification = semanticValue(x, "BATTERY_SYSTEM_SPECIFICATION", ["product", "confirmed", "reported"]);
  const batteryMarketingContact = value(allFacts, [/^battery marketing contacts?$/, /^battery sales contacts?$/]);
  const personalDataConcern = value(allFacts, [/personal information concern/, /personal data concern/]);
  const purchasePriceItem = semanticItem(x, "ORIGINAL_PURCHASE_PRICE", ["financialItems", "transactions", "finance", "confirmed", "reported"]);
  const referenceItem = (identity, classification, relevance) => {
    const item = semanticItemIncludingUnresolved(x, identity, ["financialItems", "transactions", "estimates", "confirmed", "reported"]), amount = parseMoney(item);
    const explicitTransactionDate = text(item?.transactionDate || item?.date || item?.year);
    const explicitProvider = text(item?.provider || item?.supplier || item?.counterparty);
    const batteryProductItem = identity === "LATER_BATTERY_EXPENDITURE"
      ? semanticItemIncludingUnresolved(x, "LATER_BATTERY_SYSTEM", ["product", "confirmed", "reported"])
      : null;
    const batteryReportedItem = identity === "LATER_BATTERY_EXPENDITURE"
      ? semanticItemIncludingUnresolved(x, "LATER_BATTERY_EXPENDITURE", ["reported", "confirmed"])
      : null;
    const batterySupplierItem = identity === "LATER_BATTERY_EXPENDITURE"
      ? semanticItemIncludingUnresolved(x, "LATER_BATTERY_SUPPLIER", ["supplier", "confirmed", "reported"])
      : null;
    const batteryTransactionItem = identity === "LATER_BATTERY_EXPENDITURE"
      ? (x.transactions || []).find((candidate) =>
          usable(candidate) &&
          parseMoney(candidate) === amount &&
          /^battery system purchase through [a-z0-9 .&'-]+$/.test(norm(candidate.label)))
      : null;
    const batteryYear = identity === "LATER_BATTERY_EXPENDITURE"
      ? [
          boundedYear(explicitTransactionDate),
          boundedYear(batteryProductItem?.value),
          boundedYear(batteryTransactionItem?.transactionDate || batteryTransactionItem?.date || batteryTransactionItem?.year || batteryTransactionItem?.basis),
          boundedYear(batteryReportedItem?.value),
        ].find(Boolean) || ""
      : explicitTransactionDate;
    const batteryProvider = identity === "LATER_BATTERY_EXPENDITURE"
      ? explicitProvider || text(batterySupplierItem?.value) || text(batteryTransactionItem?.provider || batteryTransactionItem?.supplier || batteryTransactionItem?.counterparty)
      : explicitProvider;
    return item && amount != null ? {
      semanticIdentity: identity,
      label: text(item.label),
      amount,
      status: text(item.status) || "NOT_SUPPLIED",
      classification,
      relevance,
      provenance: text(item.source) || "Lister-confirmed client report",
      transactionDate: batteryYear,
      transactionDatePrecision: batteryYear && /^(?:19|20)\d{2}$/.test(batteryYear) ? "YEAR_ONLY" : "NOT_SUPPLIED",
      provider: batteryProvider,
    } : null;
  };
  const originalTransactionReferences = semanticItemsIncludingUnresolved(
    x,
    "ORIGINAL_TRANSACTION_REFERENCE",
    ["financialItems", "transactions", "estimates", "confirmed", "reported"],
  ).map((item) => {
    const amount = parseMoney(item);
    return amount == null ? null : {
      semanticIdentity: "ORIGINAL_TRANSACTION_REFERENCE",
      semanticCategory: "UNRESOLVED_TRANSACTION_REFERENCE",
      label: text(item.label),
      reportedLabel: text(item.label),
      amount,
      currency: "GBP",
      status: text(item.status) || "NOT_SUPPLIED",
      classification: "ORIGINAL_TRANSACTION_CLASSIFICATION_UNRESOLVED",
      classificationStatus: "CLASSIFICATION_UNRESOLVED",
      relevance: "DOCUMENTARY_CLASSIFICATION_REQUIRED",
      provenance: text(item.source) || "Lister-confirmed client report",
      verificationStatus: "DOCUMENTARY_CONFIRMATION_REQUIRED",
      relationshipStatus: "OVERLAPPING",
      overlapGroup: "ORIGINAL_TRANSACTION",
      recoverabilityStatus: "NOT_ESTABLISHED",
      includeInCalculatedRange: false,
      displayEligibility: true,
      description: "Reported original transaction / finance reference",
      sourceIdentity: `${item.sourceCollection || "assessment"}:${norm(item.label)}`,
      transactionDate: text(item.transactionDate || item.date || item.year),
      transactionDatePrecision: "NOT_SUPPLIED",
      provider: text(item.provider || item.supplier || item.counterparty),
    };
  }).filter(Boolean);
  const governedFinancialReference = ({ item, semanticCategory, classificationStatus, relationshipStatus, overlapGroup, recoverabilityStatus, description }) => {
    const value = parseMoney(item);
    return item && value != null ? {
      semanticIdentity: semanticCategory,
      semanticCategory,
      label: text(item.label),
      reportedLabel: text(item.label),
      amount: value,
      currency: "GBP",
      status: text(item.status) || "CLIENT_REPORTED",
      classification: semanticCategory,
      classificationStatus,
      provenance: text(item.source) || "Lister-confirmed client report",
      verificationStatus: "DOCUMENTARY_CONFIRMATION_REQUIRED",
      relationshipStatus,
      overlapGroup,
      recoverabilityStatus,
      includeInCalculatedRange: false,
      displayEligibility: true,
      description,
      relevance: "DOCUMENTARY_CLASSIFICATION_REQUIRED",
      sourceIdentity: `${item.sourceCollection || "assessment"}:${norm(item.label)}`,
    } : null;
  };
  const unresolvedReferenceItems = [
    ...semanticItemsIncludingUnresolved(x, "POSSIBLE_CONTRACT_PRICE", ["financialItems", "transactions", "finance", "confirmed", "reported"]).map((item) => governedFinancialReference({ item, semanticCategory: "PURCHASE_PRICE", classificationStatus: "CLASSIFICATION_UNRESOLVED", relationshipStatus: "OVERLAPPING", overlapGroup: "ORIGINAL_TRANSACTION", recoverabilityStatus: "NOT_ESTABLISHED", description: "Possible contract price" })),
    ...semanticItemsIncludingUnresolved(x, "ALTERNATIVE_TRANSACTION_REFERENCE", ["financialItems", "transactions", "finance", "confirmed", "reported"]).map((item) => governedFinancialReference({ item, semanticCategory: "FINANCE_PRINCIPAL", classificationStatus: "CLASSIFICATION_UNRESOLVED", relationshipStatus: "OVERLAPPING", overlapGroup: "ORIGINAL_TRANSACTION", recoverabilityStatus: "NOT_ESTABLISHED", description: "Alternative contract / finance figure" })),
    ...semanticItemsIncludingUnresolved(x, "REPORTED_ORIGINAL_SYSTEM_COST", ["financialItems", "transactions", "finance", "confirmed", "reported"]).map((item) => governedFinancialReference({ item, semanticCategory: "ORIGINAL_SYSTEM_COST", classificationStatus: "CLIENT_REPORTED_CLASSIFICATION", relationshipStatus: "DISTINCT_CATEGORY", overlapGroup: "ORIGINAL_SYSTEM", recoverabilityStatus: "NOT_ESTABLISHED", description: "Reported original system cost" })),
    ...semanticItemsIncludingUnresolved(x, "RELOCATION_COST", ["financialItems", "transactions", "finance", "confirmed", "reported"]).map((item) => governedFinancialReference({ item, semanticCategory: "RELOCATION_COST", classificationStatus: "CLIENT_REPORTED_CLASSIFICATION", relationshipStatus: "DISTINCT_CATEGORY", overlapGroup: "RELOCATION", recoverabilityStatus: "NOT_ESTABLISHED", description: "Reported relocation cost" })),
  ].filter(Boolean);
  const referenceItems = [
    ...originalTransactionReferences,
    ...unresolvedReferenceItems,
    referenceItem("INVERTER_EXPENDITURE_ESTIMATE", "ESTIMATED_EXPENDITURE", "CAUSAL_OR_REMEDIAL_RELEVANCE_UNRESOLVED"),
    referenceItem("LATER_BATTERY_EXPENDITURE", "LATER_RELATED_EXPENDITURE_RELEVANCE_UNRESOLVED", "CAUSAL_CONTRACTUAL_OR_REMEDIAL_RELEVANCE_REQUIRES_CONFIRMATION"),
    referenceItem("FIT_INCOME_BENEFIT", "REPORTED_INCOME_OR_BENEFIT", "NOT_CALCULATED_LOSS"),
  ].filter(Boolean);
  const batteryReference = referenceItems.find((item) => item.semanticIdentity === "LATER_BATTERY_EXPENDITURE");
  const reportedTransactionYear = purchaseYear || installationYear;
  const purchaseYearEvent = /^(?:19|20)\d{2}$/.test(reportedTransactionYear) ? {
    date: reportedTransactionYear,
    precision: "YEAR_ONLY",
    description: purchaseInstallationEventYear
      ? `Reported purchase and installation of the Solar system${supplierIdentity ? ` by ${supplierIdentity}` : ""}.`
      : purchaseYear
      ? `Original residential Solar system purchased${supplierIdentity ? ` from ${supplierIdentity}` : ""}${parseMoney(purchasePriceItem) != null ? ` for a client-reported £${parseMoney(purchasePriceItem).toLocaleString("en-GB")}` : ""}.`
      : `Reported purchase and installation of the Solar system${supplierIdentity ? ` by ${supplierIdentity}` : ""}.`,
  } : null;
  const supplierTradingYear = dateParts(tradingStatus).find((part) => /^(?:19|20)\d{2}$/.test(part));
  const supplierTradingEvent = supplierTradingYear && /ceased|stopped trading|dissolved|closed/.test(norm(tradingStatus)) ? {
    date: supplierTradingYear,
    precision: "YEAR_ONLY",
    description: `${supplierIdentity || "The reported Solar supplier"} reportedly ceased trading.`,
  } : null;
  const batteryEventDate = text(batteryReference?.transactionDate);
  const batteryEvent = batteryReference && /^(?:19|20)\d{2}$/.test(batteryEventDate) ? {
    date: batteryEventDate,
    precision: "YEAR_ONLY",
    description: `Client reports later battery expenditure${batteryReference.provider ? ` through ${batteryReference.provider}` : ""} of £${batteryReference.amount.toLocaleString("en-GB")}; relationship to the original Solar complaint requires confirmation.`,
  } : null;
  const scopeExclusions = unique([
    semanticValue(x, "OUT_OF_SCOPE_OTHER_SYSTEM", ["confirmed", "reported", "statements", "product"]),
    semanticValue(x, "OUT_OF_SCOPE_OTHER_MATTER", ["confirmed", "reported", "statements", "product"]),
  ]);
  const input = {
    client: {
      name: `${text(x.client?.firstName)} ${text(x.client?.lastName)}`.trim(),
      email: text(x.contact?.email),
      mobile: text(x.contact?.mobile),
      telephone: text(x.contact?.telephone),
      address: authoritativeAddress(clientProjection),
    },
    installation: {
      supplier: supplierIdentity,
      supplierIdentityStatus: supplierIdentity ? "CLIENT_REPORTED" : "NOT_SUPPLIED",
      supplierIdentityVerification: supplierIdentity ? "DOCUMENTARY_CONFIRMATION_REQUIRED" : "NOT_SUPPLIED",
      installer: installerIdentity,
      possibleLegalEntity,
      entityRelationship,
      supplierPosition: tradingStatus,
      salesCompany: value(allFacts, [/sales company/, /intermediary/, /broker/]),
      salesperson: value(allFacts, [/salesperson/, /sales representative/]),
      salesDetails: value(allFacts, [/sales details/, /sales visit/]),
      contractDate: value(allFacts, [/contract date/, /purchase date/]),
      installationDate:
        installationDate || (purchaseInstallationEventYear ? "" : installationYear),
      installationYear,
      purchaseYear,
      purchaseYearPrecision: reportedTransactionYear ? "YEAR_ONLY" : "NOT_SUPPLIED",
      systemPrice: semanticAmount(x, "ORIGINAL_PURCHASE_PRICE"),
      systemPriceStatus: purchasePriceItem ? text(purchasePriceItem.status) || "CLIENT_REPORTED" : "NOT_SUPPLIED",
      systemPriceProvenance: purchasePriceItem ? text(purchasePriceItem.source) || "Lister-confirmed client report" : "",
      systemPriceVerification: purchasePriceItem ? "DOCUMENTARY_CONFIRMATION_REQUIRED" : "NOT_SUPPLIED",
      paymentMethod,
    },
    finance: {
      presence: financePresence,
      financeUsed: financePresence === STATES.ABSENT ? "No" : financePresence === STATES.REPORTED ? "Yes" : "",
      financeProvider: reportedFinanceProvider || value(allFacts, [
        /finance provider/,
        /credit provider/,
        /^lender$/,
      ]),
      financeAmount: amount(classifiedFinanceItems, [
        /amount.*financed/,
        /finance (?:amount|principal)/,
      ]),
      amountPaid: amount(allMoney, [/amount.*(?:actually )?paid/, /paid.*amount/]),
      outstandingBalance: amount(allMoney, [
        /outstanding.*(?:balance|finance)/,
        /current finance balance/,
      ]),
      settlementFigure: amount(allMoney, [/settlement.*(?:balance|figure|amount)/]),
      monthlyPayment: amount(allMoney, [/monthly.*(?:payment|instalment)/]),
      agreementType: reportedFinanceType,
      term: value(allFacts, [/finance term/, /credit term/]),
      apr: strictApr(aprItem),
      aprDisclosureConcern,
      affordabilityConcern,
      interestPosition: semanticValue(x, "INTEREST_POSITION", ["finance", "confirmed", "reported", "statements"]),
      paymentMethod,
    },
    system: {
      panelCount: panelNumber
        ? /recall|approximately|about/i.test(text(panelFact?.value))
          ? `approximately ${panelNumber} (client recollection)`
          : panelNumber
        : text(panelFact?.value),
      panelModel: value(allFacts, [/panel model/]),
      originalInverter: semanticValue(x, "ORIGINAL_INVERTER", ["product", "reported", "confirmed"]),
      inverter: replacementInverterItems(x).join("; "),
      inverterPresence: replacementInverterItems(x).length ? STATES.REPORTED : STATES.NOT_SUPPLIED,
      inverterCostPresence: semanticItem(x, "REPLACEMENT_INVERTER", ["financialItems", "transactions", "finance"])?.amount == null ? STATES.NOT_SUPPLIED : STATES.REPORTED,
      battery: batterySpecification,
      monitoring: value(allFacts, [/monitoring/]),
      mcs: semanticValue(x, "MCS_POSITION", ["product", "confirmed", "reported"]),
      dno: value(allFacts, [/\bdno\b/, /g98|g99/]),
      exportArrangement: value(allFacts, [/^export arrangement$/, /^seg arrangement$/, /^feed in tariff arrangement$/]),
      capacity: semanticValue(x, "SYSTEM_CAPACITY", ["product", "confirmed", "reported"]),
      condition: semanticValue(x, "SYSTEM_CONDITION", ["product", "confirmed", "reported", "statements"]),
    },
    representations: {
      selected: selectedRepresentations,
      recall: representationRecall,
    },
    performance: {
      projectedGeneration: value(nonRepresentationFacts, [
        /projected generation/,
        /expected generation/,
      ]),
      actualGeneration: value(nonRepresentationFacts, [/actual generation/]),
      projectedSavings: value(nonRepresentationFacts, [
        /projected savings/,
        /expected savings/,
      ]),
      actualSavings: value(nonRepresentationFacts, [/actual savings/]),
    },
    technical: {
      underperformance: value(allFacts, [/underperformance/, /performance concern/]),
      inverterFault: value(allFacts, [/inverter fault/, /inverter issue/, /technical concerns/]),
      batteryFault: value(allFacts, [/battery fault/, /battery issue/]),
    },
    engineer: {
      attended: value(allFacts, [/engineer attended/, /engineer inspection status/, /independent engineer involvement/]) ||
        (directEngineerCost != null ? "Client reports independent engineer involvement" : ""),
      date: value(allFacts, [/engineer.*date/, /inspection date/]),
      findings: value(allFacts, [/engineer.*findings/, /inspection findings/, /technical concerns/]),
    },
    financial: {
      // Preserve the legacy engineer anchor and the governed itemised direct-cost
      // contract. Only incurred/paid or committed non-overlapping components are
      // eligible; estimates, prospective costs and requested remedies stay out.
      engineerCost: directEngineerCost,
      directCosts,
      referenceItems,
      reportedFitLoss: semanticValue(x, "FIT_LOSS", ["confirmed", "reported", "statements", "financialItems"]),
    },
    history: {
      financePresence,
      complaintPresence,
      solicitorPresence,
      priorRedressPresence,
      supplierPosition: tradingStatus,
      possibleLegalEntity,
      entityRelationship,
      firstPerformanceContactDate: value(allFacts, [
        /first.*performance.*contact.*date/,
      ]),
      complained: supplierComplaint ? "Yes" : "",
      complaintDate: value(allFacts, [/supplier complaint date/, /^complaint date$/]) || supplierDates[0] || "",
      complaintSummary: value(allFacts, [/complaint summary/]) || text(supplierComplaint?.value),
      supplierResponseDate: value(allFacts, [/supplier response date/]) || supplierResponseDates[0] || "",
      response: text(supplierResponse?.value) || value(allFacts, [/supplier response/]) || text(supplierComplaint?.value),
      lenderContact: lenderComplaint ? "Yes" : "",
      lenderContactDate: value(allFacts, [/lender contact date/, /finance provider contact date/]) || lenderDates[0] || "",
      lenderContactSummary: value(allFacts, [/lender contact summary/, /finance provider complaint/]) || text(lenderComplaint?.value),
      lenderResponseDate: value(allFacts, [/lender response date/, /finance provider response date/]) || lenderResponseDates[0] || lenderDates[1] || "",
      lenderResponse: text(lenderResponse?.value) || value(allFacts, [/lender response/, /finance provider response/]) || text(lenderComplaint?.value),
      lenderPosition: /final response|rejection|rejected/.test(norm(`${lenderResponse?.value} ${lenderComplaint?.value}`))
        ? "Final response reported by client; document not yet reviewed."
        : "",
      priorRedress: priorRedressPresence === STATES.ABSENT ? "" : priorRedress,
      legalRepresentation: solicitorPresence === STATES.ABSENT ? "" : value(allFacts, [/solicitor/, /legal representation/]),
      chronology: [
        ...[purchaseYearEvent, supplierTradingEvent, batteryEvent].filter(Boolean),
        ...supplierDates.slice(1).map((date) => ({ date, description: "Further supplier complaint reported by the client." })),
      ],
      evidenceGatheringActions: evidenceProjection.actions,
      evidentialSummary: evidenceProjection.summaries,
      scopeExclusions,
    },
    evidence,
    consumerConcerns: {
      batteryMarketingContact,
      personalDataConcern,
      requestedRedress: semanticValue(x, "REQUESTED_REDRESS_OUTCOME", ["confirmed", "reported", "statements", "finance"]),
    },
    conflicts: Array.isArray(x.conflicts) ? [...x.conflicts] : text(x.conflicts) ? [text(x.conflicts)] : [],
  };
  return {
    input,
    provenance: allFacts.map((item) => ({
      label: text(item.label),
      status: text(item.status),
      source: text(item.source),
    })),
    excludedRequestedRemedies: requested.map((item) => ({
      label: text(item.label),
      amount: Number.isFinite(Number(item.amount)) ? Number(item.amount) : null,
      status: text(item.status),
    })),
    unprioritisedEvidence: [...(x.evidenceRequired || [])],
  };
}

async function buildSolarProjection({
  extraction,
  clientProjection,
  qar,
  db,
  admin,
  persistComparison = false,
}) {
  const adapted = adaptConfirmedSolar(extraction, { clientProjection });
  const canonical = solarReport(adapted.input, qar);
  const selection = await selectFinancialRangeAuthority({
    category: "solar",
    publicInput: adapted.input,
    legacyResult: canonical.financial_assessment_range,
    db: persistComparison ? db : null,
    admin: persistComparison ? admin : null,
  });
  const report = { ...applyFinancialRangeAuthority(canonical, selection) };
  if (adapted.input.financial.reportedFitLoss) {
    report.financial_exposure = [
      ...(report.financial_exposure || []),
      {
        field: "Reported FIT income loss",
        amount: "Not quantified",
        basis_or_comment: "The client reports a potential FIT income loss, but no amount or supporting calculation has been supplied. No value is inferred, netted or included in the calculated financial range.",
      },
    ];
    report.information_to_confirm = [
      ...new Set([
        ...(report.information_to_confirm || []),
        "Quantify and evidence any reported FIT income loss, including the relevant period, tariff records and the causal connection to the matters assessed.",
      ]),
    ];
  }
  const originalReferences = adapted.input.financial.referenceItems.filter(
    (item) =>
      (item.classification === "ORIGINAL_TRANSACTION_CLASSIFICATION_UNRESOLVED" ||
        ["PURCHASE_PRICE", "FINANCE_PRINCIPAL", "ORIGINAL_SYSTEM_COST", "RELOCATION_COST", "ADDITIONAL_DIRECT_COST", "UNRESOLVED_TRANSACTION_REFERENCE"].includes(item.semanticCategory)) &&
      item.displayEligibility !== false &&
      Number.isFinite(Number(item.amount)) &&
      Number(item.amount) > 0,
  );
  const distinctReferenceAmounts = [
    ...new Set(originalReferences.map((item) => Number(item.amount))),
  ];
  const money = (amount) => new Intl.NumberFormat("en-GB", {
    style: "currency", currency: "GBP", maximumFractionDigits: 0,
  }).format(amount);
  const originalGroups = new Set(originalReferences.map((item) => item.overlapGroup || "ORIGINAL_TRANSACTION"));
  const hasDistinctCategories = originalGroups.size > 1 || originalReferences.some((item) => item.relationshipStatus === "DISTINCT_CATEGORY");
  const panelEntries = originalReferences.map((item) => ({
    label: item.description || item.reportedLabel || item.label,
    amount: Number(item.amount),
    display: money(Number(item.amount)),
    provenance: item.status || "CLIENT_REPORTED",
    verificationStatus: item.verificationStatus || "DOCUMENTARY_CONFIRMATION_REQUIRED",
    recoverabilityStatus: item.recoverabilityStatus || "NOT_ESTABLISHED",
  }));
  if (report.financial_assessment_range?.status === "PENDING" && panelEntries.length) {
    let panel;
    if (distinctReferenceAmounts.length === 1) {
      const amount = distinctReferenceAmounts[0];
      panel = {
        mode: "SINGLE", label: "REPORTED FINANCIAL REFERENCE", headline: money(amount), entries: panelEntries.slice(0, 1),
        basis: "Client-reported original transaction / finance figure",
        rangeStatus: "PENDING DOCUMENTARY CONFIRMATION",
        explanation: "The exact classification of the reported figure must be confirmed before a reliable financial assessment range can be calculated. It is not an assessed claim value or expected recovery.",
      };
    } else if (hasDistinctCategories) {
      panel = {
        mode: "DISTINCT", label: "REPORTED FINANCIAL REFERENCES", headline: "",
        entries: panelEntries,
        basis: "Separate client-reported financial references",
        rangeStatus: "PENDING DOCUMENTARY CONFIRMATION",
        explanation: "These are separate client-reported financial references. They are not presented as a combined claim value or expected recovery. Their classification, evidential support and relevance to any remedy require review.",
      };
    } else {
      const lowAmount = Math.min(...distinctReferenceAmounts), highAmount = Math.max(...distinctReferenceAmounts);
      panel = {
        mode: "CONFLICTING", label: "REPORTED FINANCIAL FIGURES", headline: `${money(lowAmount)} – ${money(highAmount)}`,
        entries: panelEntries,
        basis: "Conflicting client-reported transaction / finance figures",
        rangeStatus: "PENDING DOCUMENTARY RECONCILIATION",
        explanation: "The source information contains different figures. Contract and finance documents must establish their correct classification. This reported-figure range is not an assessed claim range, expected recovery or settlement range.",
      };
    }
    report.financial_assessment_range = {
      ...report.financial_assessment_range,
      reported_reference_panel: panel,
      ...(panel.mode === "SINGLE" ? { reported_reference: {
        label: panel.label, amount: distinctReferenceAmounts[0], display: panel.headline,
        basis: panel.basis, range_status: panel.rangeStatus, explanation: panel.explanation,
      } } : {}),
    };
    const statusRow = report.current_preliminary_position?.rows?.find((row) => row.field === "Indicative financial assessment range");
    if (statusRow) statusRow.position = panel.rangeStatus;
    const reportedPriceRow = report.current_preliminary_position?.rows?.find((row) => row.field === "Reported purchase price");
    if (reportedPriceRow && /not provided/i.test(reportedPriceRow.position)) {
      reportedPriceRow.field = "Reported financial references";
      reportedPriceRow.position = panel.entries.map((entry) => `${entry.label}: ${entry.display}`).join("; ");
    }
    if (report.valuation_or_scenario_matrix) {
      report.valuation_or_scenario_matrix.intro = `${panel.rangeStatus}. ${panel.explanation}`;
    }
    const significance = report.preliminary_assessment?.table?.find((row) => row.assessment_factor === "Potential Financial Significance");
    if (significance) significance.preliminary_position = `${panel.entries.map((entry) => `${entry.label}: ${entry.display}`).join("; ")}. ${panel.explanation}`;
  }
  const canonicalEvidence = new Set(
    (report.evidence_required || []).map((item) =>
      norm(item.evidence_required || item.requirement),
    ),
  );
  const extras = adapted.unprioritisedEvidence.filter(
    (item) => !canonicalEvidence.has(norm(item)),
  );
  if (extras.length) {
    report.information_to_confirm = [
      ...new Set([...(report.information_to_confirm || []), ...extras]),
    ];
  }
  if (distinctReferenceAmounts.length > 1 && !hasDistinctCategories) {
    report.information_to_confirm = [
      ...new Set([
        ...(report.information_to_confirm || []),
        `Reconcile the conflicting reported original transaction / finance figures (${distinctReferenceAmounts
          .map((amount) =>
            new Intl.NumberFormat("en-GB", {
              style: "currency",
              currency: "GBP",
              maximumFractionDigits: 0,
            }).format(amount),
          )
          .join(" and ")}) before selecting any headline financial reference.`,
      ]),
    ];
  }
  if (distinctReferenceAmounts.length > 1 && hasDistinctCategories) {
    report.information_to_confirm = [
      ...new Set([
        ...(report.information_to_confirm || []),
        "Obtain and review the records supporting each separate reported financial reference, and establish its classification, evidential status and relevance to any remedy without automatically aggregating the amounts.",
      ]),
    ];
  }
  return {
    report,
    governance: {
      provenance: adapted.provenance,
      excludedRequestedRemedies: adapted.excludedRequestedRemedies,
      financialAuthority: selection.authorityCode,
    },
  };
}

module.exports = { adaptConfirmedSolar, buildSolarProjection };
