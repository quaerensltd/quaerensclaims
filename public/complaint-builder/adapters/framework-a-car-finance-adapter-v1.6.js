(function () {
  "use strict";
  const registry = window.QCBFrameworkACategoryAdapters;
  if (!registry) throw new Error("Framework A v1.6 adapter registry must load before Car Finance.");
  const n = (value) => Number(String(value || "").replace(/[^0-9.-]/g, "")) || 0;
  const yes = (value) => /^(yes|confirmed)$/i.test(String(value || ""));

  function calculations(f) {
    const netPartExchange = n(f.partExchangeAllowance) - n(f.partExchangeSettlement);
    const netDeposit = n(f.cashDeposit) + netPartExchange + n(f.dealerContribution);
    const regularPayments = n(f.regularPayments) || n(f.termMonths);
    const scheduledInstalments = n(f.monthlyPayment) * regularPayments;
    const expectedTotal = netDeposit + scheduledInstalments + n(f.finalPayment) + n(f.optionFee) + n(f.arrangementFee) + n(f.otherCharges);
    const totalPayable = n(f.totalPayable) || expectedTotal;
    const financeCost = Math.max(0, totalPayable - n(f.cashPrice));
    const paymentsMade = n(f.monthlyPayment) * n(f.paymentsMadeCount) + netDeposit;
    const remaining = Math.max(0, totalPayable - paymentsMade - n(f.refundsReceived));
    const official = n(f.officialRedressFigure) + n(f.compensatoryInterest);
    return { netPartExchange, netDeposit, scheduledInstalments, expectedTotal, totalPayable, financeCost, paymentsMade, remaining, official };
  }

  function deriveFinancials(d) {
    const calc = calculations(d.f);
    const extra = d.losses.reduce((sum, row) => sum + n(row.amount), 0);
    return { derived: calc, bookingPosition: calc.official, extra, total: calc.official + extra };
  }

  function quality(d) {
    const f = d.f;
    const checks = [[f.lender,8],[f.dealer,5],[f.agreementType,7],[f.agreementStatus,5],[f.agreementDate,5],[f.agreementRef,5],[f.vehicleMake&&f.vehicleModel,6],[f.vehicleReg,4],[f.amountCredit&&f.monthlyPayment&&f.termMonths,8],[f.saleNarrative,9],[d.issues.length,9],[d.timeline.some(x=>x.date&&x.description),7],[d.score>=40,7],[d.score>=70,5],[f.requestedOutcome,5],[f.complaintStatus||f.responseSummary,5]];
    return checks.reduce((sum,[ok,weight])=>sum+(ok?weight:0),0);
  }

  function completion(d) {
    const f=d.f;
    const complete=Boolean(f.lender&&f.agreementType&&f.vehicleMake&&f.vehicleModel&&f.saleNarrative&&d.issues.length);
    const next=!f.lender?"Identify the finance provider":!f.agreementType?"Add the agreement type":!f.vehicleMake?"Add the vehicle details":!d.issues.length?"Select the finance concerns":!f.saleNarrative?"Add the factual sale narrative":d.score<70?"Strengthen missing evidence":"Review and submit through the lender's official complaint route";
    return {complete,next};
  }

  function analysis(d, c) {
    const f=d.f, calc=d.derived||calculations(f);
    const commission=yes(f.lenderConfirmedCommission)?"The lender is recorded as having confirmed commission.":"Commission is not treated as confirmed; the lender should identify any payment, recipient and calculation method.";
    return `This prepared file concerns a ${c.text(f.agreementType,"motor finance agreement")} arranged with ${c.text(f.lender,"the recorded finance provider")} through ${c.text(f.dealer,"the recorded dealer or broker")} for ${c.text([f.vehicleMake,f.vehicleModel].filter(Boolean).join(" "),"the recorded vehicle")}. The concerns recorded are ${d.issues.join(", ")||"not yet selected"}. ${commission} Derived agreement figures indicate total payable of ${c.money(calc.totalPayable)} and an approximate scheduled balance of ${c.money(calc.remaining)}. Any official redress shown is based only on a lender figure entered by the applicant; this builder does not invent commission or redress values.`;
  }

  function complaintLetter(d,c) {
    const f=d.f;
    const events=d.timeline.length?d.timeline.map(x=>`${c.date(x.date)} — ${c.text(x.category,"Event")}: ${c.text(x.description)}`).join("\n"):"A detailed chronology is enclosed.";
    return `Subject: Formal motor finance complaint — agreement ${c.text(f.agreementRef)}\n\nDear Complaints Team,\n\nPlease investigate my ${c.text(f.agreementType,"motor finance agreement")} concerning ${c.text([f.vehicleMake,f.vehicleModel,f.vehicleReg].filter(Boolean).join(" "),"the recorded vehicle")}, arranged through ${c.text(f.dealer,"the dealer or broker")}.\n\nMy concerns\n${d.issues.join(", ")||"The concerns are set out in the enclosed file."}\n\nFactual background\n${c.text(f.saleNarrative,"Please see the enclosed chronology and evidence schedule.")}\n\nCommission and explanation\nCommission disclosed: ${c.text(f.commissionExplained)}. Amount disclosed: ${c.text(f.commissionAmountDisclosed)}. Method disclosed: ${c.text(f.commissionMethodDisclosed)}. Possible rate influence: ${c.text(f.commissionAffectRate)}.\n\nMaterial chronology\n${events}\n\nLender response\n${c.text(f.responseSummary,"No substantive response has been recorded.")}\n\nRequested resolution\n${c.text(f.requestedOutcome,"Please provide the agreement, sales, affordability and commission records; investigate the complaint; explain any redress calculation; and issue a reasoned written response.")}\n\nPlease confirm whether commission was paid, its recipient, amount and calculation method, whether it affected the interest rate or recommendation, and whether any official redress is due.\n\nYours faithfully,\nMotor finance customer`;
  }

  function coverEmail(d,c) { return `Subject: Motor finance complaint file — ${c.text(d.f.agreementRef)}\n\nDear Complaints Team,\n\nPlease find attached my structured Car Finance Compensation Complaint Pack. It contains the agreement and vehicle details, specialist analysis, chronology, evidence log, financial schedule and formal complaint letter.\n\nPlease acknowledge receipt, provide a complaint reference and confirm the expected response date.\n\nKind regards,\nMotor finance customer`; }

  function pages(d,c) {
    const f=d.f, x=d.derived||calculations(f), evidence=c.evidenceRows, missing=c.missing;
    const grid=c.summaryGrid([["Finance provider",c.text(f.lender)],["Dealer or broker",c.text(f.dealer)],["Agreement type",c.text(f.agreementType)],["Agreement reference",c.text(f.agreementRef)],["Agreement status",c.text(f.agreementStatus)],["Agreement date",c.date(f.agreementDate)],["Vehicle",c.text([f.vehicleMake,f.vehicleModel].filter(Boolean).join(" "))],["Registration",c.text(f.vehicleReg)],["Amount of credit",c.money(f.amountCredit)],["APR",f.apr?`${f.apr}%`:"Not provided"],["Term",f.termMonths?`${f.termMonths} months`:"Not provided"],["Official lender redress",c.money(x.official)]]);
    const finance=c.rowTable(["Measure","Recorded or derived figure"],[["Cash price",c.money(f.cashPrice)],["Net deposit",c.money(x.netDeposit)],["Amount of credit",c.money(f.amountCredit)],["Scheduled instalments",c.money(x.scheduledInstalments)],["Final or balloon payment",c.money(f.finalPayment)],["Expected total from entries",c.money(x.expectedTotal)],["Total payable",c.money(x.totalPayable)],["Approximate payments made",c.money(x.paymentsMade)],["Approximate scheduled balance",c.money(x.remaining)],["Official lender figure plus entered interest",c.money(x.official)]]);
    return [
      {title:"Car Finance Complaint File",cover:true,body:`<span class="qcb-confidential">CONFIDENTIAL</span><p class="qcb-cover-title">FREE CAR FINANCE COMPENSATION COMPLAINT PACK&trade;</p><p class="qcb-cover-subtitle">Prepared for the Motor Finance Customer</p><div class="qcb-cover-grid"><div><span>Finance provider</span><strong>${c.esc(c.text(f.lender))}</strong></div><div><span>Agreement</span><strong>${c.esc(c.text(f.agreementRef))}</strong></div><div><span>Vehicle</span><strong>${c.esc(c.text([f.vehicleMake,f.vehicleModel].filter(Boolean).join(" ")))}</strong></div><div><span>Evidence readiness</span><strong>${d.score}%</strong></div><div><span>Complaint status</span><strong>${c.qualityScore>=85?"Ready for review":"In preparation"}</strong></div><div><span>Recorded redress</span><strong>${c.esc(c.money(x.official))}</strong></div></div>`},
      {title:"Applicant and Case Details",body:`<div class="qcb-strength"><strong>${c.qualityScore}%</strong><span>Complaint Pack Quality<br>${c.esc(c.qualityLabel)}</span></div>${grid}`},
      {title:"Executive Summary",body:`<p>${c.esc(analysis(d,c))}</p><p><strong>Requested outcome:</strong> ${c.esc(c.text(f.requestedOutcome))}</p>`},
      {title:"Detailed Timeline",body:c.rowTable(["Date","Category","Event","Evidence"],d.timeline.map(x=>[c.date(x.date),c.text(x.category),c.text(x.description),c.text(x.evidence,"Not cross-referenced")]))},
      {title:"Car Finance Agreement Analysis",body:`${grid}<p><strong>Sale and recommendation account:</strong> ${c.esc(c.text(f.saleNarrative))}</p><p><strong>Commission position:</strong> disclosed ${c.esc(c.text(f.commissionExplained))}; amount disclosed ${c.esc(c.text(f.commissionAmountDisclosed))}; method disclosed ${c.esc(c.text(f.commissionMethodDisclosed))}; lender confirmation ${c.esc(c.text(f.lenderConfirmedCommission))}.</p><p><strong>Important:</strong> Empty fields remain unknown. Only a lender or appropriate decision-maker can provide an official calculation.</p>`},
      {title:"Evidence Log & Readiness",body:`<div class="qcb-strength"><strong>${d.score}%</strong><span>Evidence Readiness</span></div>${c.rowTable(["Supporting Evidence","Status","Recommended Record"],evidence)}<p><strong>Priorities:</strong> ${c.esc(missing.join(", ")||"No missing items identified")}</p>`},
      {title:"Financial Schedule",body:`${finance}${c.rowTable(["Description","Amount","Supporting Evidence","Status"],d.losses.map(x=>[c.text(x.description),c.money(x.amount),c.text(x.evidence),c.text(x.status)]))}<p>Figures are simple arithmetic from applicant entries, not an official settlement or redress calculation.</p>`},
      {title:"Professional Complaint Letter",body:`<div class="qcb-letter">${c.esc(c.complaintLetter)}</div>`},
      {title:"Cover Email",body:`<div class="qcb-letter">${c.esc(c.coverEmail)}</div>`},
      {title:"Submission Checklist",body:"<ul><li>Check the finance provider, agreement reference, vehicle and customer details.</li><li>Attach the signed agreement, pre-contract information and statement where available.</li><li>Cross-reference sales, affordability and commission records to the chronology.</li><li>Do not present derived figures as official redress.</li><li>Submit through the lender's current official complaint route and retain proof.</li></ul>"},
      {title:"Response Tracker",body:c.rowTable(["Date","Organisation/person","Action or response","Deadline","Status"],[['','Finance provider','','','Awaiting'],['','Dealer or broker','','If applicable',''],['','Financial Ombudsman Service','','After the complaint process','Not started']])},
      {title:"Help the Next Person",body:"<p><strong>Official guidance:</strong> Check the finance provider's current complaints process, FCA motor-finance information and Financial Ombudsman Service guidance. Deadlines and any redress scheme must be verified when acting.</p><p><strong>Help the Next Person&trade;</strong> Optional anonymous feedback improves the shared framework without transmitting complaint answers, identity, agreement figures, evidence or documents.</p><p>Optional Guided Support is separate and passes through the Quaerens Intake Gateway. This browser-first builder creates no CRM record.</p>"}
    ];
  }

  function coverMetadata(d,c){return{title:"FREE CAR FINANCE COMPLAINT PACK",audience:"PREPARED FOR THE MOTOR FINANCE CUSTOMER",lines:[`Finance provider: ${c.text(d.f.lender)}`,`Agreement: ${c.text(d.f.agreementRef)}`,`Vehicle: ${c.text([d.f.vehicleMake,d.f.vehicleModel].filter(Boolean).join(" "))}`,`Prepared date: ${new Date().toLocaleDateString("en-GB")}`,`Evidence readiness: ${d.score}%`,`Recorded redress: ${c.money(d.derived.official)}`]};}
  registry.register("car-finance", {deriveFinancials,quality,completion,analysis,complaintLetter,coverEmail,pages,coverMetadata,fileLabel:()=>"Car-Finance"});
}());
