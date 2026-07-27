(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.QCBFEnergyEvidence = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const core = [
    "Supplier bills",
    "Account statement",
    "Tariff confirmation",
    "Account-opening or account-closing confirmation",
    "Payment records",
    "Supplier correspondence",
    "Complaint reference"
  ];

  const packs = {
    switching: [
      "Switch confirmation",
      "Old supplier final bill",
      "New supplier opening bill",
      "Opening reading",
      "Closing reading",
      "Switch cancellation or objection notice",
      "Both suppliers' bills",
      "Switching compensation correspondence"
    ],
    billing: [
      "Disputed bill",
      "Previous bills",
      "Meter readings and photographs",
      "Tariff and unit-rate evidence",
      "Payment records",
      "Supplier calculation or explanation"
    ],
    metering: [
      "Meter photograph showing serial number and reading",
      "Reading history",
      "Smart-meter data used for billing",
      "In-home display photograph",
      "Installation appointment or engineer report",
      "Supplier messages about meter status"
    ],
    payments: [
      "Direct Debit schedule",
      "Bank statement or payment confirmation",
      "Supplier notice of payment changes",
      "Annual estimate",
      "Credit or debit balance record",
      "Refund request and refund response"
    ],
    moving: [
      "Tenancy agreement or completion statement",
      "Move-in or move-out evidence",
      "Check-in or check-out report",
      "Opening and final meter readings",
      "Previous and final bills"
    ],
    tariff: [
      "Tariff name and terms",
      "Promised tariff evidence",
      "Applied tariff evidence",
      "Exit-fee evidence",
      "Discount or credit evidence"
    ],
    support: [
      "Support request",
      "Priority Services confirmation",
      "Communication preference",
      "Supply interruption record",
      "Complaint correspondence"
    ],
    complaint: [
      "Initial complaint",
      "Supplier final response",
      "Deadlock letter",
      "Complaint timeline",
      "Evidence sent to the supplier"
    ],
    urgent: [
      "Court, enforcement or safety correspondence",
      "Supplier or network operator messages",
      "Account statement",
      "Factual chronology",
      "Urgent support notes"
    ]
  };

  function selectedGroups(data) {
    const text = (Array.isArray(data.whatHappened) ? data.whatHappened : []).join(" ").toLowerCase();
    return Object.keys(packs).filter((key) => {
      if (key === "switching") return /switch|supplier|transfer|object|both suppliers/.test(text);
      if (key === "billing") return /bill|reading|balance|back-bill|wrong property|estimated|standing charge/.test(text);
      if (key === "metering") return /meter|smart|display|serial|usage|prepayment/.test(text);
      if (key === "payments") return /direct debit|payment|refund|credit|fee|amount/.test(text);
      if (key === "moving") return /moved|move|occupier|account closed|final bill|responsible/.test(text);
      if (key === "tariff") return /tariff|unit rate|fixed|discount|exit fee|price/.test(text);
      if (key === "support") return /vulnerab|priority|prepayment|top up|supply interrupted|accessible/.test(text);
      if (key === "complaint") return /complaint|deadlock|ombudsman|final response|closed/.test(text);
      if (key === "urgent") return /court|letter before claim|enforcement|unsafe|disconnected|urgent/.test(text);
      return false;
    });
  }

  function recommendations(data) {
    const groups = selectedGroups(data);
    const items = new Set(core);
    groups.forEach((group) => packs[group].forEach((item) => items.add(item)));
    return Array.from(items);
  }

  function position(data) {
    const available = Array.isArray(data.evidenceAvailable) ? data.evidenceAvailable.length : 0;
    if (available >= 10) return "Well Supported";
    if (available >= 6) return "Supported";
    if (available >= 3) return "Developing";
    return "Limited";
  }

  return { core, packs, selectedGroups, recommendations, position };
});
