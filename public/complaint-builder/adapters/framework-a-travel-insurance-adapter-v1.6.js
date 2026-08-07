(function () {
  "use strict";
  const registry = window.QCBFrameworkACategoryAdapters;
  if (!registry) throw new Error("Framework A adapter registry must load before Travel Insurance.");

  const issueLabels = Object.freeze({
    cancelledTrip:"Cancelled trip or holiday", medicalRejected:"Medical expenses rejected", emergencyTreatment:"Emergency treatment dispute", curtailment:"Curtailment claim rejected", baggageLoss:"Baggage loss", baggageDamage:"Baggage damage", baggageDelay:"Baggage delay", travelDelay:"Travel delay", missedDeparture:"Missed departure", exclusion:"Claim rejected due to an exclusion", nonDisclosure:"Alleged non-disclosure", preExisting:"Pre-existing medical condition dispute", notCovered:"Insurer says the event was not covered", underpaid:"Claim underpaid", valuation:"Valuation dispute", evidenceRequests:"Unreasonable evidence requests", claimDelay:"Excessive claim delay", poorHandling:"Poor complaint handling", unexplained:"Insurer failed to explain rejection", wording:"Policy wording or interpretation dispute"
  });
  const text = (value, fallback="Not provided") => String(value || "").trim() || fallback;
  const number = (value) => Math.max(0, Number(value) || 0);
  const issues = (d) => d.issues.map((id) => issueLabels[id] || id);

  function deriveFinancials(d) {
    const claimed = number(d.f.amountClaimed), paid = number(d.f.amountPaid), rejected = number(d.f.amountRejected);
    const disputed = rejected || Math.max(0, claimed - paid);
    const extra = d.losses.reduce((sum, row) => sum + number(row.amount), 0);
    return { derived:{claimed,paid,rejected:disputed,excess:number(d.f.policyExcess)}, bookingPosition:disputed, extra, total:disputed + extra };
  }
  function quality(d) {
    const core = [d.f.insurer,d.f.policyNumber,d.f.policyType,d.f.claimDate,d.f.incidentDate,d.f.claimReference].filter(Boolean).length;
    return Math.min(100, Math.round((core / 6) * 45 + Math.min(d.issues.length,3) * 8 + d.score * .31));
  }
  function completion(d) {
    const complete = Boolean(d.f.insurer && d.f.policyNumber && d.f.claimDate && d.issues.length && d.score >= 50);
    const next = !d.f.insurer ? "Add the insurer" : !d.f.policyNumber ? "Add the policy details" : !d.issues.length ? "Select the disputed issues" : d.score < 70 ? "Strengthen the evidence schedule" : "Review the pack and use the insurer's official complaint route";
    return {complete,next};
  }
  function analysis(d) {
    return `This complaint concerns ${issues(d).join(", ") || "a travel insurance claim dispute"}. The policyholder records an amount claimed of ${number(d.f.amountClaimed).toFixed(2)}, an amount paid of ${number(d.f.amountPaid).toFixed(2)} and an amount rejected or outstanding of ${number(d.f.amountRejected).toFixed(2)}. The evidence position is ${d.score}% complete. Cover and payment remain subject to the policy wording, limits, excess, exclusions, disclosed facts and the insurer's reasoned investigation.`;
  }
  function complaintLetter(d, c) {
    return `Dear Complaints Team,\n\nFormal complaint: ${text(d.f.claimReference)} / policy ${text(d.f.policyNumber)}\n\nI ask you to review the handling and outcome of my travel insurance claim concerning ${issues(d).join(", ") || "the insured incident"}. The incident or travel date was ${c.date(d.f.incidentDate)} and the claim was submitted on ${c.date(d.f.claimDate)}.\n\nInsurer decision or reason given:\n${text(d.f.decisionReason)}\n\nWhy I dispute the position:\n${text(d.f.disputeSummary)}\n\nPlease assess the complete policy wording and evidence, explain the contractual basis for your decision, provide the calculation applied, and issue a reasoned final response. I request: ${d.routes.join(", ") || "a fair review and appropriate remedy under the policy"}.\n\nYours faithfully,\n${text(d.f.leadPassenger || [d.f.applicantFirstName,d.f.applicantLastName].filter(Boolean).join(" "),"Policyholder")}`;
  }
  function coverEmail(d) { return `Subject: Travel insurance complaint — ${text(d.f.claimReference)}\n\nDear Complaints Team,\n\nPlease find attached my structured Travel Insurance Complaint Pack. It contains the policy and claim facts, chronology, evidence schedule, financial schedule and formal complaint letter.\n\nPlease acknowledge receipt, provide a complaint reference and confirm when I should expect a reasoned written response.\n\nKind regards,\n${text(d.f.leadPassenger || [d.f.applicantFirstName,d.f.applicantLastName].filter(Boolean).join(" "),"Policyholder")}`; }
  const letter = (value,c) => `<div class="qcb-letter">${c.esc(value).replace(/\n/g,"<br>")}</div>`;
  function pages(d,c) {
    const f=d.f, money=d.derived || deriveFinancials(d).derived;
    return [
      {title:"Travel Insurance Complaint File",cover:true,body:`<span class="qcb-confidential">CONFIDENTIAL</span><p class="qcb-cover-title">FREE TRAVEL INSURANCE COMPLAINT PACK&trade;</p><p class="qcb-cover-subtitle">Prepared for the Policyholder</p><div class="qcb-cover-grid"><div><span>Insurer</span><strong>${c.esc(text(f.insurer))}</strong></div><div><span>Policy</span><strong>${c.esc(text(f.policyNumber))}</strong></div><div><span>Claim</span><strong>${c.esc(text(f.claimReference))}</strong></div><div><span>Evidence readiness</span><strong>${d.score}%</strong></div><div><span>Claimed</span><strong>${c.money(money.claimed)}</strong></div><div><span>Disputed amount</span><strong>${c.money(money.rejected)}</strong></div></div>`},
      {title:"Executive Summary",body:`<div class="qcb-strength"><strong>${c.qualityScore}%</strong><span>Complaint Pack Quality<br>${c.esc(c.qualityLabel)}</span></div><p>${c.esc(analysis(d))}</p>`},
      {title:"Policyholder, Policy & Trip",body:c.rowTable(["Field","Recorded information"],[["Insurer",text(f.insurer)],["Policy number",text(f.policyNumber)],["Policy type",text(f.policyType)],["Cover dates",`${c.date(f.coverStart)} to ${c.date(f.coverEnd)}`],["Destination",text(f.destination)],["Trip booking",text(f.bookingReference)]])},
      {title:"Incident & Claim History",body:c.rowTable(["Field","Recorded information"],[["Incident/travel date",c.date(f.incidentDate)],["Claim date",c.date(f.claimDate)],["Claim reference",text(f.claimReference)],["Decision date",c.date(f.decisionDate)],["Reason given",text(f.decisionReason)]])},
      {title:"Issues & Policy Dispute Analysis",body:`<p><strong>Issues recorded:</strong> ${c.esc(issues(d).join(", ") || "Not yet selected")}</p><p><strong>Policyholder position:</strong> ${c.esc(text(f.disputeSummary))}</p><p>${c.esc(analysis(d))}</p>`},
      {title:"Detailed Chronology",body:c.rowTable(["Date","Category","Event","Evidence"],d.timeline.map(row=>[c.date(row.date),text(row.category),text(row.description),text(row.evidence,"Not cross-referenced")]))},
      {title:"Evidence Log & Readiness",body:`<div class="qcb-strength"><strong>${d.score}%</strong><span>Evidence Readiness</span></div>${c.rowTable(["Supporting Evidence","Status","Recommended Record"],c.evidenceRows)}<p><strong>Missing priorities:</strong> ${c.esc(c.missing.join(", ") || "No missing items identified")}</p>`},
      {title:"Financial Schedule",body:`${c.rowTable(["Description","Amount","Supporting Evidence","Status"],d.losses.map(row=>[text(row.description),c.money(row.amount),text(row.evidence),text(row.status)]))}<p><strong>Amount claimed:</strong> ${c.money(money.claimed)}</p><p><strong>Amount paid:</strong> ${c.money(money.paid)}</p><p><strong>Amount rejected/outstanding:</strong> ${c.money(money.rejected)}</p><p><strong>Policy excess:</strong> ${c.money(money.excess)}</p><p>These figures organise the stated contractual loss; they are not a guarantee or speculative compensation calculation.</p>`},
      {title:"Professional Complaint Letter",body:letter(complaintLetter(d,c),c)},
      {title:"Cover Email",body:letter(coverEmail(d,c),c)},
      {title:"Submission & Response Tracker",body:`<p>Submit through the insurer's current official complaints channel. Keep proof of submission and the complete attachments. If unresolved after the insurer's final response, check the current eligibility and time limits for the Financial Ombudsman Service or another applicable route.</p>${c.rowTable(["Date","Organisation/person","Action or response","Deadline","Status"],[['',text(f.insurer,"Insurer"),'','','Awaiting'],['','Financial Ombudsman Service','','If eligible','Not started']])}`},
      {title:"Official Guidance, Checklist & Notes",body:"<ul><li>Check the policy schedule, certificate, complete wording, limits, excess and exclusions.</li><li>Attach each item marked available and cross-reference it to the chronology.</li><li>Keep the amount claimed, paid, rejected and any additional documented loss separate.</li><li>Use the insurer's current official complaint route and retain proof of submission.</li></ul><p><strong>Help the Next Person&trade;:</strong> Optional anonymous feedback improves Framework A without transmitting identity, answers, policy information, evidence or documents.</p><p>This browser-first builder creates no CRM record. Optional Guided Support remains separate and passes through the Quaerens Intake Gateway.</p>"}
    ];
  }
  function coverMetadata(d,c){return {title:"FREE TRAVEL INSURANCE COMPLAINT PACK",audience:"PREPARED FOR THE POLICYHOLDER",lines:[`Insurer: ${text(d.f.insurer)}`,`Policy: ${text(d.f.policyNumber)}`,`Claim: ${text(d.f.claimReference)}`,`Evidence readiness: ${d.score}%`,`Disputed amount: ${c.money((d.derived||{}).rejected)}`]};}
  registry.register("travel-insurance",{deriveFinancials,quality,completion,analysis,complaintLetter,coverEmail,pages,coverMetadata,fileLabel:()=>"Travel-Insurance"});
}());
