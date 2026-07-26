(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.QCBFGymEvidence = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const recommended = {
    cancellation: ["Membership agreement", "Cancellation request", "Cancellation acknowledgement", "Notice-period term", "Final balance calculation"],
    billing: ["Bank statements", "Direct Debit mandate", "Payment receipts", "Refund response", "Payment schedule"],
    coolingOff: ["Joining confirmation", "Terms supplied at joining", "Cancellation-right information", "Access start date", "Usage record"],
    illness: ["Relevant policy", "Voluntary medical or fitness-to-use evidence", "Freeze request", "Gym response"],
    relocation: ["Relocation policy", "Moving date evidence", "Nearest branch information", "Notice given"],
    hardship: ["Hardship policy if available", "Freeze or reduced-plan request", "Gym response", "Affordable payment proposal"],
    debt: ["Debt letters", "Balance calculation", "Earlier dispute correspondence", "Contract and payment history"]
  };

  function buildEvidenceChecklist(data) {
    const issues = Array.isArray(data.whatHappened) ? data.whatHappened.join(" ") : String(data.whatHappened || "");
    const set = new Set(["Membership agreement", "Membership confirmation", "Payment history", "Correspondence", "Timeline"]);
    if (/cooling|online|telephone|away/i.test(issues)) recommended.coolingOff.forEach((x) => set.add(x));
    if (/charged|refund|payment|direct debit|card/i.test(issues)) recommended.billing.forEach((x) => set.add(x));
    if (/illness|injury/i.test(issues)) recommended.illness.forEach((x) => set.add(x));
    if (/moved|relocation|home/i.test(issues)) recommended.relocation.forEach((x) => set.add(x));
    if (/job|financial|hardship/i.test(issues)) recommended.hardship.forEach((x) => set.add(x));
    if (/debt|letter before|court/i.test(issues)) recommended.debt.forEach((x) => set.add(x));
    recommended.cancellation.forEach((x) => set.add(x));
    return Array.from(set);
  }

  function evidencePosition(data) {
    const selected = Array.isArray(data.evidence) ? data.evidence : [];
    if (selected.length >= 7) return "Strong evidence position";
    if (selected.length >= 3) return "Useful evidence started";
    return "Needs key evidence";
  }

  return { buildEvidenceChecklist, evidencePosition };
});
