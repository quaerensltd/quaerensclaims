(function () {
  "use strict";

  const registry = window.QCBFrameworkACategoryAdapters;
  const train = window.QCBFTrain;
  if (!registry) throw new Error("Framework A adapter registry must load before Train.");
  if (!train || !train.analysis || !train.compensation || !train.documents || !train.resources) throw new Error("Train complaint engine must load before its Framework A adapter.");

  function legacyData(d) {
    const f = d.f;
    return Object.assign({}, f, {
      journeyIssues: d.issues.slice(),
      requestedOutcomes: d.routes.slice(),
      evidence: Object.keys(d.evidence).filter((key) => d.evidence[key] === "available"),
      timelineRows: d.timeline.map((row) => ({ date: row.date, event: row.description, evidence: row.evidence })),
      timelineNotes: d.timeline.map((row) => [row.date, row.description].filter(Boolean).join(": ")).filter(Boolean).join("\n"),
      expenses: d.losses.map((row) => ({ category: row.description, amount: row.amount, receipt: row.status, reason: row.evidence })),
      leadPassenger: f.leadPassenger || [f.applicantTitle, f.applicantFirstName, f.applicantLastName].filter(Boolean).join(" "),
      email: f.email || f.applicantEmail,
      telephone: f.telephone || f.applicantTelephone
    });
  }

  function docs(d) {
    return train.documents.buildAll(legacyData(d), { packReference: d.f.complaintPackReference });
  }

  function deriveFinancials(d) {
    const estimate = train.compensation.estimateDelayRepay(legacyData(d));
    return { derived: estimate, bookingPosition: estimate.netDelayRepay + estimate.possibleRefund, extra: estimate.expenses, total: estimate.estimatedTotalRequested };
  }

  function quality(d) { return train.analysis.completeness(legacyData(d)).percent; }

  function completion(d) {
    const result = train.analysis.analyse(legacyData(d));
    const f = d.f;
    const complete = result.completeness.status === "Ready to Submit";
    const next = !f.departureStation || !f.arrivalStation ? "Add the complete rail journey" : !f.trainOperator ? "Select the train operator" : !d.issues.length ? "Select what happened" : d.score < 70 ? "Strengthen missing evidence" : "Review and submit through the operator's official route";
    return { complete, next };
  }

  function analysis(d) {
    const result = train.analysis.analyse(legacyData(d));
    return `This prepared complaint concerns ${result.route}. The recorded final-destination delay is ${result.recordedDelay}. The current route is ${result.requestedOutcome}. Evidence readiness is ${d.score}%. Estimated Delay Repay, refund and expense figures remain separate and are subject to operator investigation, ticket terms, scheme rules and available evidence.`;
  }

  function complaintLetter(d) { return docs(d).complaint.replace(/^DRAFT RAIL COMPLAINT LETTER\s*/i, ""); }

  function coverEmail(d, c) {
    const route = train.submission.smartSubmission(legacyData(d));
    return `Subject: Rail journey complaint file — ${c.text(d.f.bookingReference)}\n\nDear Complaints Team,\n\nPlease find attached my structured Train Delay Complaint Pack concerning travel from ${c.text(d.f.departureStation)} to ${c.text(d.f.arrivalStation)} on ${c.date(d.f.journeyDate)}. It contains the journey and ticket facts, Delay Repay calculation, chronology, evidence schedule, financial summary and formal complaint letter.\n\nPreferred route: ${c.text(route.operatorRoute.preferredComplaintMethod)}\n\nPlease acknowledge receipt, provide a complaint reference and issue a reasoned written response.\n\nKind regards,\nRail passenger`;
  }

  function pre(value, c) { return `<div class="qcb-letter">${c.esc(value).replace(/\n/g, "<br>")}</div>`; }

  function pages(d, c) {
    const f = d.f;
    const estimate = d.derived || train.compensation.estimateDelayRepay(legacyData(d));
    const built = docs(d);
    const evidenceRows = c.evidenceRows;
    return [
      { title: "Train Delay Complaint File", cover: true, body: `<span class="qcb-confidential">CONFIDENTIAL</span><p class="qcb-cover-title">FREE TRAIN DELAY COMPLAINT PACK&trade;</p><p class="qcb-cover-subtitle">Prepared for the Rail Passenger</p><div class="qcb-cover-grid"><div><span>Journey</span><strong>${c.esc(c.text([f.departureStation,f.arrivalStation].filter(Boolean).join(" to ")))}</strong></div><div><span>Operator</span><strong>${c.esc(c.text(f.trainOperator))}</strong></div><div><span>Travel date</span><strong>${c.esc(c.date(f.journeyDate))}</strong></div><div><span>Evidence readiness</span><strong>${d.score}%</strong></div><div><span>Recorded delay</span><strong>${c.esc(estimate.delayMinutes == null ? "Not calculated" : `${estimate.delayMinutes} minutes`)}</strong></div><div><span>Estimated total</span><strong>${c.esc(c.money(d.total))}</strong></div></div>` },
      { title: "Executive Summary", body: `<div class="qcb-strength"><strong>${c.qualityScore}%</strong><span>Complaint Pack Quality<br>${c.esc(c.qualityLabel)}</span></div><p>${c.esc(analysis(d))}</p>` },
      { title: "Passenger, Journey & Ticket", body: pre(built.summary, c) },
      { title: "Delay Repay & Compensation", body: pre(built.compensation, c) },
      { title: "Journey Issues & Route Analysis", body: `<p><strong>Issues recorded:</strong> ${c.esc(d.issues.map((id) => train.questions.issueLabel(id)).join(", ") || "Not yet selected")}</p><p><strong>Requested outcomes:</strong> ${c.esc(d.routes.join(", ") || "Not yet selected")}</p><p>${c.esc(analysis(d))}</p>` },
      { title: "Detailed Chronology", body: c.rowTable(["Date","Category","Event","Evidence"], d.timeline.map((row) => [c.date(row.date),c.text(row.category),c.text(row.description),c.text(row.evidence,"Not cross-referenced")])) },
      { title: "Evidence Log & Readiness", body: `<div class="qcb-strength"><strong>${d.score}%</strong><span>Evidence Readiness</span></div><h5>Train-specific evidence priorities</h5>${pre(built.evidence, c)}${c.rowTable(["Supporting Evidence","Status","Recommended Record"], evidenceRows)}<p><strong>Priorities:</strong> ${c.esc(c.missing.join(", ") || "No missing items identified")}</p>` },
      { title: "Financial Schedule", body: `${c.rowTable(["Description","Amount","Supporting Evidence","Status"], d.losses.map((row) => [c.text(row.description),c.money(row.amount),c.text(row.evidence),c.text(row.status)]))}<p><strong>Estimated Delay Repay:</strong> ${c.money(estimate.netDelayRepay)}</p><p><strong>Possible refund route:</strong> ${c.money(estimate.possibleRefund)}</p><p><strong>Documented expenses:</strong> ${c.money(estimate.expenses)}</p><p><strong>Estimated total requested:</strong> ${c.money(estimate.estimatedTotalRequested)}</p><p>${c.esc(estimate.estimatedOnly)}</p>` },
      { title: "Professional Complaint Letter", body: pre(built.complaint, c) },
      { title: "Cover Email", body: pre(coverEmail(d, c), c) },
      { title: "Smart Submission & Response Tracker", body: `${pre(built.submission, c)}${c.rowTable(["Date","Organisation/person","Action or response","Deadline","Status"], [["",c.text(f.trainOperator,"Train operator"),"","","Awaiting"],["","Rail Ombudsman","","If applicable","Not started"]])}` },
      { title: "Official Guidance, Checklist & Notes", body: `${pre(built.resources, c)}<ul><li>Check all passenger, journey, ticket and operator details.</li><li>Attach each item marked available in the evidence schedule.</li><li>Keep Delay Repay, refund and expense requests clearly separated.</li><li>Use the operator's current official route and retain proof of submission.</li></ul><p><strong>Help the Next Person&trade;:</strong> Optional anonymous feedback improves the shared framework without transmitting complaint answers, identity, evidence or documents.</p><p>This browser-first builder creates no CRM record. Optional Guided Support remains separate and passes through the Quaerens Intake Gateway.</p>` }
    ];
  }

  function coverMetadata(d, c) { return { title: "FREE TRAIN DELAY COMPLAINT PACK", audience: "PREPARED FOR THE RAIL PASSENGER", lines: [`Journey: ${c.text([d.f.departureStation,d.f.arrivalStation].filter(Boolean).join(" to "))}`,`Operator: ${c.text(d.f.trainOperator)}`,`Travel date: ${c.date(d.f.journeyDate)}`,`Evidence readiness: ${d.score}%`,`Estimated total: ${c.money(d.total)}`] }; }

  registry.register("train", { deriveFinancials, quality, completion, analysis, complaintLetter, coverEmail, pages, coverMetadata, fileLabel: () => "Train-Delay" });

  function populateOperators() {
    const target = document.getElementById("operator-options");
    if (target) target.innerHTML = train.resources.operatorDirectory.map((item) => `<option value="${item.name.replace(/&/g,"&amp;").replace(/"/g,"&quot;")}"></option>`).join("");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", populateOperators); else populateOperators();
}());
