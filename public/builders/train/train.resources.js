"use strict";

const operators = [
  "LNER",
  "Avanti West Coast",
  "Great Western Railway",
  "Northern",
  "CrossCountry",
  "East Midlands Railway",
  "ScotRail",
  "Greater Anglia",
  "South Western Railway",
  "Transport for Wales",
  "Southeastern",
  "c2c",
  "Merseyrail",
  "Chiltern Railways",
  "TransPennine Express",
  "London Northwestern Railway",
  "West Midlands Railway",
  "Thameslink",
  "Southern",
  "Gatwick Express",
  "Great Northern",
  "Hull Trains",
  "Grand Central",
  "Caledonian Sleeper",
  "Elizabeth line",
  "London Overground"
];

function operatorRecord(name) {
  const matched = operators.find(item => item.toLowerCase() === String(name || "").trim().toLowerCase());
  return {
    name: matched || name || "",
    officialWebsite: "",
    delayRepayPage: "",
    refundPage: "",
    customerRelations: "",
    railOmbudsmanRoute: "Check eligibility and current Rail Ombudsman rules before escalation.",
    lastVerified: "",
    verified: false,
    note: "Operator contact details are intentionally not prefilled in Phase 1 unless verified."
  };
}

module.exports = { operators, operatorRecord };
