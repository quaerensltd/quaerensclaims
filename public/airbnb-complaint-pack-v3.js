(function () {
  "use strict";

  const root = document.querySelector('[data-qcb-builder="airbnb"][data-qcb-version="3"]');
  if (!root) return;

  const form = root.querySelector(".qcb-form");
  const $ = (selector) => root.querySelector(selector);
  const $$ = (selector) => Array.from(root.querySelectorAll(selector));
  const STORAGE_KEY = "quaerens-airbnb-complaint-pack-v3";
  const evidenceItems = [
    ["booking", "Booking confirmation", "Airbnb reservation details and payment confirmation"],
    ["listing", "Listing screenshots", "Photos, description, amenities, location and cancellation terms"],
    ["host", "Host messages", "The complete dated conversation with the host"],
    ["airbnb", "Airbnb support replies", "Case references, decisions and escalation replies"],
    ["photos", "Dated photos or videos", "Condition, safety, access or missing-facility evidence"],
    ["receipts", "Receipts for additional costs", "Alternative stay, travel or other evidenced losses"],
    ["payment", "Payment or refund records", "Card statement, refund receipt or transaction evidence"]
  ];
  let step = 1;
  let timeline = [];
  let losses = [];
  let evidence = {};

  const esc = (value) => String(value == null ? "" : value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  const text = (value, fallback = "Not provided") => String(value || "").trim() || fallback;
  const money = (value) => `£${(Number(value) || 0).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const date = (value) => {
    if (!value) return "Not provided";
    const parsed = new Date(`${value}T12:00:00`);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  };
  const slugDate = () => new Date().toISOString().slice(0, 10);
  const fields = () => Object.fromEntries(new FormData(form).entries());
  const checked = (name) => $$(`input[name="${name}"]:checked`).map((input) => input.value);

  function caseData() {
    const f = fields();
    const bookingPosition = Math.max(0, (Number(f.bookingPrice) || 0) - (Number(f.refundReceived) || 0));
    const statedOutstanding = Number(f.refundOutstanding) || 0;
    const extra = losses.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
    const available = evidenceItems.filter(([key]) => evidence[key] === "available").length;
    const relevant = evidenceItems.filter(([key]) => evidence[key] !== "na").length;
    const score = relevant ? Math.round((available / relevant) * 100) : 0;
    return {
      f,
      issues: checked("issue"),
      routes: checked("route"),
      timeline: [...timeline].sort((a, b) => String(a.date).localeCompare(String(b.date))),
      losses: [...losses], evidence: { ...evidence }, score,
      bookingPosition, extra, total: (statedOutstanding || bookingPosition) + extra
    };
  }

  function complaintLetter(d) {
    const f = d.f;
    const issues = d.issues.length ? d.issues.join(", ") : "the booking and refund issues described below";
    const events = d.timeline.length ? d.timeline.map((e) => `${date(e.date)} — ${text(e.category, "Event")}: ${text(e.description)}`).join("\n") : "A detailed chronology is enclosed in the complaint pack.";
    const lossLine = d.total ? `The current documented amount sought is ${money(d.total)}, subject to any correction supported by the enclosed records.` : "I ask that the appropriate refund and documented losses are assessed from the enclosed records.";
    return `Subject: Formal complaint concerning Airbnb booking ${text(f.bookingRef)}\n\nDear Complaints Team,\n\nI am writing to make a formal, fact-led complaint concerning my Airbnb booking for ${text(f.propertyName, "the booked property")}, scheduled from ${date(f.checkIn)} to ${date(f.checkOut)}. The principal issues are: ${issues}.\n\nWhat happened\n${text(f.issueDetails, "Please refer to the enclosed chronology and evidence schedule.")}\n\nKey chronology\n${events}\n\nHost response\n${text(f.hostResponse, "No substantive host response has been recorded in this pack.")}\n\nAirbnb response\n${text(f.airbnbResponse, "No substantive Airbnb response has been recorded in this pack.")}\n\nLoss and requested resolution\n${lossLine}\n${text(f.requestedOutcome, "I request a fair review, a written explanation of the decision and payment of any refund or documented loss found due.")}\n\nPlease acknowledge this complaint, preserve the relevant booking and message records, and provide a reasoned written response. The enclosed complaint file contains the booking summary, chronology, evidence position and loss schedule.\n\nYours faithfully,\nAirbnb guest`;
  }

  function coverEmail(d) {
    return `Subject: Complaint file — Airbnb booking ${text(d.f.bookingRef)}\n\nDear Complaints Team,\n\nPlease find attached my structured complaint file concerning booking ${text(d.f.bookingRef)} at ${text(d.f.propertyName, "the booked property")}. It contains the booking facts, chronology, evidence schedule, financial loss schedule and formal complaint letter.\n\nPlease acknowledge receipt and confirm the case reference and expected response date.\n\nKind regards,\nAirbnb guest`;
  }

  function rowTable(headers, rows) {
    return `<table><thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.length ? rows.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="${headers.length}">No entries added yet.</td></tr>`}</tbody></table>`;
  }

  function summaryGrid(items) {
    return `<div class="qcb-summary-grid">${items.map(([label, value]) => `<div class="qcb-summary-card"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join("")}</div>`;
  }

  function pages(d) {
    const f = d.f;
    const evidenceRows = evidenceItems.map(([key, label, recommendation]) => [label, evidence[key] === "available" ? "Available" : evidence[key] === "na" ? "Not applicable" : "Missing", recommendation]);
    const missing = evidenceRows.filter((row) => row[1] === "Missing").map((row) => row[0]);
    const guidance = d.routes.length ? d.routes : ["Airbnb complaint process", "Payment-provider options where appropriate", "Independent advice if deadlines or jurisdiction are unclear"];
    return [
      { title: "Airbnb Complaint File", cover: true, body: `<p class="qcb-cover-title">Airbnb Complaint<br>Case File</p><p>Prepared as a structured, fact-led record for complaint and escalation.</p><div class="qcb-cover-grid"><div><span>Booking reference</span><strong>${esc(text(f.bookingRef))}</strong></div><div><span>Property</span><strong>${esc(text(f.propertyName))}</strong></div><div><span>Stay dates</span><strong>${esc(`${date(f.checkIn)} – ${date(f.checkOut)}`)}</strong></div><div><span>Amount sought</span><strong>${esc(money(d.total))}</strong></div></div>` },
      { title: "Executive Summary", body: `<div class="qcb-strength"><strong>${d.score}%</strong><span>Evidence readiness<br>${d.score >= 70 ? "Strong preparation" : d.score >= 40 ? "Developing evidence file" : "More evidence recommended"}</span></div><p><strong>Issues:</strong> ${esc(d.issues.join(", ") || "Not yet selected")}</p><p>${esc(text(f.issueDetails, "Add a concise account of what happened."))}</p><p><strong>Requested outcome:</strong> ${esc(text(f.requestedOutcome))}</p><p><strong>Possible routes:</strong> ${esc(d.routes.join(", ") || "Not yet selected")}</p>` },
      { title: "Booking Summary", body: summaryGrid([["Booking reference", text(f.bookingRef)], ["Booking date", date(f.bookingDate)], ["Property", text(f.propertyName)], ["Host", text(f.hostName)], ["Check-in", date(f.checkIn)], ["Check-out", date(f.checkOut)], ["Country", text(f.country)], ["Guests", text(f.guests)], ["Booking price", money(f.bookingPrice)], ["Refund received", money(f.refundReceived)], ["Outstanding stated", money(f.refundOutstanding)], ["Payment method", text(f.paymentMethod)]]) },
      { title: "Chronology", body: rowTable(["Date", "Category", "Event", "Evidence"], d.timeline.map((e) => [date(e.date), text(e.category), text(e.description), text(e.evidence, "Not cross-referenced")])) },
      { title: "Evidence Readiness", body: `<div class="qcb-strength"><strong>${d.score}%</strong><span>${evidenceRows.filter((r) => r[1] === "Available").length} available of ${evidenceRows.filter((r) => r[1] !== "Not applicable").length} relevant items</span></div>${rowTable(["Evidence", "Status", "Recommended record"], evidenceRows)}<p><strong>Missing:</strong> ${esc(missing.join(", ") || "No missing items identified")}</p>` },
      { title: "Financial Loss Schedule", body: `${rowTable(["Description", "Amount", "Evidence", "Status"], d.losses.map((l) => [text(l.description), money(l.amount), text(l.evidence), text(l.status)]))}<p><strong>Booking/refund position:</strong> ${money(d.bookingPosition)}</p><p><strong>Additional losses:</strong> ${money(d.extra)}</p><p><strong>Estimated total requested:</strong> ${money(d.total)}</p>` },
      { title: "Formal Complaint Letter", body: `<div class="qcb-letter">${esc(complaintLetter(d))}</div>` },
      { title: "Cover Email", body: `<div class="qcb-letter">${esc(coverEmail(d))}</div>` },
      { title: "Submission Checklist", body: `<ul><li>Check names, booking reference, dates and amounts.</li><li>Attach each item marked available in the evidence schedule.</li><li>Rename attachments clearly and cross-reference them to the chronology.</li><li>Keep a complete copy of the submitted pack.</li><li>Use the recipient's official complaints channel.</li><li>Record the submission date and case reference.</li></ul>` },
      { title: "Response Tracker", body: rowTable(["Date", "Organisation/person", "Action or response", "Deadline", "Status"], [["", "Host", "", "", "Awaiting"], ["", "Airbnb", "", "", "Awaiting"], ["", "Payment provider/insurer", "", "", "If applicable"], ["", "Other", "", "", ""]]) },
      { title: "Official Guidance & Routes", body: `<p>This pack organises information; it does not determine legal entitlement or submit a complaint.</p><ul>${guidance.map((route) => `<li><strong>${esc(route)}:</strong> check the current official rules, eligibility, evidence requirements and deadlines before acting.</li>`).join("")}</ul><p>Use official Airbnb help pages, your payment provider's published dispute process, your insurer's policy terms and the relevant court or consumer authority for your jurisdiction.</p>` },
      { title: "Quaerens Notes", body: `<p><strong>Browser-first privacy:</strong> answers remain in this browser unless you download, print, copy or separately submit them.</p><p><strong>Important:</strong> This self-help pack is general organisational support, not legal advice and not a prediction of outcome. Verify all facts, figures, rules and deadlines.</p><p><strong>Case preparation notes</strong></p><div style="height:220px;border:1px solid #cbd5e1;background:repeating-linear-gradient(#fff,#fff 27px,#dbeafe 28px)"></div><p>Quaerens optional guided support is separate from this free builder.</p>` }
    ];
  }

  function renderPreview() {
    const d = caseData();
    const preview = $("[data-qcb-preview]");
    preview.innerHTML = pages(d).map((page, index) => `<article class="qcb-page-card${page.cover ? " cover" : ""}" data-footer="Quaerens Complaint File • Page ${index + 1} of 12"><h4>${esc(page.title)}</h4>${page.body}</article>`).join("");
    $("[data-qcb-evidence-score]").textContent = `${d.score}%`;
    $("[data-qcb-preview-total]").textContent = money(d.total);
    $("[data-qcb-route-count]").textContent = d.routes.length;
    $("[data-qcb-final-evidence]").textContent = `${d.score}%`;
    $("[data-qcb-final-total]").textContent = money(d.total);
    $("[data-qcb-booking-total]").textContent = money(d.bookingPosition);
    $("[data-qcb-extra-total]").textContent = money(d.extra);
    $("[data-qcb-total-requested]").textContent = money(d.total);
    $("[data-qcb-gauge]").style.width = `${d.score}%`;
    $("[data-qcb-readiness-title]").textContent = `Evidence Readiness: ${d.score}%`;
    $("[data-qcb-readiness-copy]").textContent = d.score >= 70 ? "Your evidence file is well prepared. Check every attachment before submission." : d.score >= 40 ? "A useful foundation is present. Add the missing items where available." : "More supporting records are recommended before submission.";
    const complete = Boolean(d.f.bookingRef && d.f.issueDetails && d.issues.length);
    $("[data-qcb-status]").textContent = complete ? "Case file ready to review" : "Needs key information";
    $("[data-qcb-final-status]").textContent = complete ? "Review every fact before downloading" : "Complete the key facts to strengthen your pack";
    $("[data-qcb-final-next]").textContent = !d.f.bookingRef ? "Add the booking reference" : !d.issues.length ? "Select the main issue" : d.score < 70 ? "Strengthen missing evidence" : "Review and submit through the chosen route";
    persist();
  }

  function renderTimeline() {
    $("[data-qcb-timeline]").innerHTML = timeline.map((row, index) => `<div class="qcb-timeline-row" data-index="${index}"><label>Date<input type="date" data-field="date" value="${esc(row.date)}"></label><label>Category<select data-field="category"><option>Booking</option><option>Host communication</option><option>Airbnb communication</option><option>Property issue</option><option>Payment</option><option>Refund</option><option>Other</option></select></label><label>Description<textarea rows="2" data-field="description" placeholder="What happened?">${esc(row.description)}</textarea></label><label>Evidence reference<input data-field="evidence" value="${esc(row.evidence)}" placeholder="e.g. Photo 3, message A"></label><div class="qcb-row-actions"><button type="button" class="qcb-btn ghost" data-move="up" aria-label="Move event up">↑</button><button type="button" class="qcb-btn ghost" data-move="down" aria-label="Move event down">↓</button><button type="button" class="qcb-btn ghost" data-delete aria-label="Delete event">Delete</button></div></div>`).join("");
    $$('[data-qcb-timeline] [data-field="category"]').forEach((select, index) => { select.value = timeline[index].category || "Booking"; });
  }

  function renderLosses() {
    $("[data-qcb-losses]").innerHTML = losses.map((row, index) => `<div class="qcb-loss-row" data-index="${index}"><label>Description<input data-field="description" value="${esc(row.description)}" placeholder="e.g. replacement hotel"></label><label>Amount (£)<input type="number" min="0" step="0.01" data-field="amount" value="${esc(row.amount)}"></label><label>Evidence<input data-field="evidence" value="${esc(row.evidence)}" placeholder="Receipt or statement reference"></label><label>Status<select data-field="status"><option>Documented</option><option>Evidence needed</option><option>Estimated</option><option>Disputed</option></select></label><div class="qcb-row-actions"><button type="button" class="qcb-btn ghost" data-delete aria-label="Delete loss row">Delete</button></div></div>`).join("");
    $$('[data-qcb-losses] [data-field="status"]').forEach((select, index) => { select.value = losses[index].status || "Evidence needed"; });
  }

  function renderEvidence() {
    $("[data-qcb-evidence]").innerHTML = evidenceItems.map(([key, label, recommendation]) => `<fieldset class="qcb-evidence-row"><legend>${esc(label)}</legend><p>${esc(recommendation)}</p><div><label><input type="radio" name="evidence-${key}" value="available" ${evidence[key] === "available" ? "checked" : ""}> Available</label><label><input type="radio" name="evidence-${key}" value="missing" ${evidence[key] === "missing" ? "checked" : ""}> Missing</label><label><input type="radio" name="evidence-${key}" value="na" ${evidence[key] === "na" ? "checked" : ""}> Not applicable</label></div></fieldset>`).join("");
  }

  function showStep(next) {
    step = Math.max(1, Math.min(7, next));
    $$('[data-qcb-step]').forEach((panel) => panel.classList.toggle("active", Number(panel.dataset.qcbStep) === step));
    $$('[data-qcb-step-pill]').forEach((pill) => pill.classList.toggle("active", Number(pill.dataset.qcbStepPill) === step));
    $("[data-qcb-step-label]").textContent = `Step ${step} of 7`;
    $("[data-qcb-progress-label]").textContent = `${Math.round(step / 7 * 100)}% complete`;
    $("[data-qcb-progress]").style.width = `${step / 7 * 100}%`;
    $("[data-qcb-prev]").disabled = step === 1;
    $("[data-qcb-next]").textContent = step === 7 ? "Review Pack" : "Next";
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function serialize() {
    const values = {};
    new FormData(form).forEach((value, key) => { if (key !== "issue" && key !== "route" && !key.startsWith("evidence-")) values[key] = value; });
    return { values, issues: checked("issue"), routes: checked("route"), timeline, losses, evidence };
  }

  function persist() {
    if ($("[data-qcb-save]").checked) localStorage.setItem(STORAGE_KEY, JSON.stringify(serialize()));
  }

  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved) return;
      $("[data-qcb-save]").checked = true;
      Object.entries(saved.values || {}).forEach(([name, value]) => { const control = form.elements[name]; if (control) control.value = value; });
      [...(saved.issues || []), ...(saved.routes || [])].forEach((value) => { const input = $$('input[type="checkbox"]').find((item) => item.value === value); if (input) input.checked = true; });
      timeline = saved.timeline || [];
      losses = saved.losses || [];
      evidence = saved.evidence || {};
    } catch (_) { localStorage.removeItem(STORAGE_KEY); }
  }

  function plainText(d) {
    return pages(d).map((page, index) => `PAGE ${index + 1} OF 12 — ${page.title.toUpperCase()}\n\n${page.body.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>|<\/li>|<\/tr>|<\/div>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&pound;/g, "£").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\n\s+/g, "\n").replace(/[ \t]+/g, " ").trim()}`).join("\n\n============================================================\n\n");
  }

  function download(blob, filename) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob); link.download = filename; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function pdfSafe(value) {
    return String(value).normalize("NFKD").replace(/[^\x20-\x7E\n]/g, (char) => char === "£" ? "GBP " : "-").replace(/([\\()])/g, "\\$1");
  }

  function wrapPdf(value, width) {
    const result = [];
    String(value).split(/\n+/).forEach((paragraph) => {
      const words = paragraph.trim().split(/\s+/); let line = "";
      words.forEach((word) => { const candidate = line ? `${line} ${word}` : word; if (candidate.length > width && line) { result.push(line); line = word; } else line = candidate; });
      if (line) result.push(line); else result.push("");
    });
    return result;
  }

  function buildPdf(d) {
    const packPages = pages(d); const objects = [null]; const add = (content) => { objects.push(content); return objects.length - 1; };
    const fontRegular = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    const fontBold = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
    const pageIds = []; const contentIds = [];
    packPages.forEach((page, index) => {
      let commands = "";
      if (page.cover) {
        commands += "0.035 0.184 0.420 rg 0 0 595 842 re f\n1 1 1 rg\nBT /F2 28 Tf 58 665 Td (AIRBNB COMPLAINT) Tj 0 -36 Td (CASE FILE) Tj ET\n";
        const coverLines = [`Booking reference: ${text(d.f.bookingRef)}`, `Property: ${text(d.f.propertyName)}`, `Stay: ${date(d.f.checkIn)} - ${date(d.f.checkOut)}`, `Estimated amount sought: ${money(d.total)}`];
        commands += `BT /F1 12 Tf 58 585 Td ${coverLines.map((line, i) => `${i ? "0 -22 Td " : ""}(${pdfSafe(line)}) Tj`).join(" ")} ET\nBT /F1 9 Tf 58 65 Td (Prepared with the Quaerens Complaint Pack Builder) Tj ET\n`;
      } else {
        const raw = page.body.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>|<\/li>|<\/tr>|<\/div>|<\/h\d>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&pound;/g, "GBP ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/[ \t]+/g, " ").replace(/\n\s+/g, "\n").trim();
        const lines = wrapPdf(raw, 94).slice(0, 52);
        commands += `0.043 0.231 0.525 rg BT /F2 10 Tf 52 802 Td (QUAERENS) Tj ET\n0.114 0.373 0.749 RG 1.5 w 52 790 m 543 790 l S\nBT /F2 19 Tf 52 755 Td (${pdfSafe(page.title)}) Tj ET\n0.118 0.161 0.231 rg BT /F1 9 Tf 52 728 Td ${lines.map((line, i) => `${i ? "0 -12 Td " : ""}(${pdfSafe(line)}) Tj`).join(" ")} ET\n`;
      }
      commands += `BT /F1 8 Tf ${page.cover ? "1 1 1" : "0.39 0.45 0.55"} rg 220 25 Td (Quaerens Complaint File - Page ${index + 1} of 12) Tj ET`;
      contentIds.push(add(`<< /Length ${commands.length} >>\nstream\n${commands}\nendstream`)); pageIds.push(add("PENDING"));
    });
    const pagesId = add("PENDING"); const catalogId = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
    pageIds.forEach((pageId, index) => { objects[pageId] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> >> /Contents ${contentIds[index]} 0 R >>`; });
    objects[pagesId] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
    let output = "%PDF-1.4\n%QPDF\n"; const offsets = [0];
    for (let i = 1; i < objects.length; i += 1) { offsets[i] = output.length; output += `${i} 0 obj\n${objects[i]}\nendobj\n`; }
    const xref = output.length; output += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
    for (let i = 1; i < objects.length; i += 1) output += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    output += `trailer\n<< /Size ${objects.length} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return new Blob([output], { type: "application/pdf" });
  }

  function downloadPdf() {
    download(buildPdf(caseData()), `Quaerens-Airbnb-Complaint-Pack-${slugDate()}.pdf`);
    status("Your 12-page PDF complaint pack has downloaded.");
  }

  function downloadWord() {
    const d = caseData(); const content = pages(d).map((page, index) => `<section class="page ${page.cover ? "cover" : ""}"><header>QUAERENS</header><h1>${page.title}</h1>${page.body}<footer>Quaerens Complaint File • Page ${index + 1} of 12</footer></section>`).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4;margin:18mm}body{font-family:Arial;color:#1e293b}.page{page-break-after:always;min-height:245mm}header{color:#0b3b86;font-weight:bold;letter-spacing:3px;border-bottom:2px solid #1d5fbf;padding-bottom:8px}h1{color:#0b3b86;font-size:24px}table{border-collapse:collapse;width:100%;font-size:10pt}th{background:#0b4aa1;color:white}td,th{border:1px solid #ccd8e8;padding:7px}.qcb-summary-grid{display:grid;grid-template-columns:1fr 1fr}.qcb-summary-card{border:1px solid #ccd8e8;padding:8px}.qcb-summary-card span{font-size:8pt;color:#64748b;display:block}.cover{background:#082f6b;color:white;padding:25mm;box-sizing:border-box}.cover h1,.cover header{color:white}.qcb-letter{white-space:pre-line;font-family:Georgia}footer{color:#64748b;border-top:1px solid #ccd8e8;margin-top:20px;padding-top:6px;font-size:8pt}</style></head><body>${content}</body></html>`;
    download(new Blob(["\ufeff", html], { type: "application/msword" }), `Quaerens-Airbnb-Complaint-Pack-${slugDate()}.doc`); status("Your editable Word complaint pack has downloaded.");
  }

  function status(message) { const node = $("[data-qcb-copy-status]"); node.textContent = message; node.setAttribute("role", "status"); }
  async function copy(value, success) { try { await navigator.clipboard.writeText(value); status(success); } catch (_) { const area = document.createElement("textarea"); area.value = value; document.body.appendChild(area); area.select(); document.execCommand("copy"); area.remove(); status(success); } }

  function handleCollection(event, collection, render) {
    const row = event.target.closest("[data-index]"); if (!row) return false;
    const index = Number(row.dataset.index); const field = event.target.dataset.field;
    if (field) { collection[index][field] = event.target.value; renderPreview(); return true; }
    if (event.target.closest("[data-delete]")) { collection.splice(index, 1); render(); renderPreview(); return true; }
    const move = event.target.closest("[data-move]")?.dataset.move;
    if (move) { const target = move === "up" ? index - 1 : index + 1; if (target >= 0 && target < collection.length) [collection[index], collection[target]] = [collection[target], collection[index]]; render(); renderPreview(); return true; }
    return false;
  }

  restore();
  if (!timeline.length) timeline.push({ date: "", category: "Booking", description: "", evidence: "" });
  if (!losses.length) losses.push({ description: "", amount: "", evidence: "", status: "Evidence needed" });
  renderTimeline(); renderLosses(); renderEvidence(); showStep(1); renderPreview();

  form.addEventListener("input", (event) => { if (event.target.name?.startsWith("evidence-")) { evidence[event.target.name.replace("evidence-", "")] = event.target.value; } renderPreview(); });
  $("[data-qcb-timeline]").addEventListener("input", (event) => handleCollection(event, timeline, renderTimeline));
  $("[data-qcb-timeline]").addEventListener("click", (event) => handleCollection(event, timeline, renderTimeline));
  $("[data-qcb-losses]").addEventListener("input", (event) => handleCollection(event, losses, renderLosses));
  $("[data-qcb-losses]").addEventListener("click", (event) => handleCollection(event, losses, renderLosses));
  $("[data-qcb-add-event]").addEventListener("click", () => { timeline.push({ date: "", category: "Booking", description: "", evidence: "" }); renderTimeline(); renderPreview(); });
  $("[data-qcb-add-loss]").addEventListener("click", () => { losses.push({ description: "", amount: "", evidence: "", status: "Evidence needed" }); renderLosses(); renderPreview(); });
  $("[data-qcb-next]").addEventListener("click", () => { if (step < 7) showStep(step + 1); else $("[data-qcb-preview]").scrollIntoView({ behavior: "smooth", block: "start" }); });
  $("[data-qcb-prev]").addEventListener("click", () => showStep(step - 1));
  $$('[data-qcb-step-pill]').forEach((pill) => { pill.tabIndex = 0; pill.setAttribute("role", "button"); pill.addEventListener("click", () => showStep(Number(pill.dataset.qcbStepPill))); pill.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); showStep(Number(pill.dataset.qcbStepPill)); } }); });
  $("[data-qcb-save]").addEventListener("change", () => { if ($("[data-qcb-save]").checked) persist(); else localStorage.removeItem(STORAGE_KEY); });
  $("[data-qcb-clear]").addEventListener("click", () => { if (!window.confirm("Delete all locally saved Complaint Pack answers from this browser?")) return; localStorage.removeItem(STORAGE_KEY); form.reset(); timeline = [{ date: "", category: "Booking", description: "", evidence: "" }]; losses = [{ description: "", amount: "", evidence: "", status: "Evidence needed" }]; evidence = {}; renderTimeline(); renderLosses(); renderEvidence(); renderPreview(); showStep(1); status("Saved answers were deleted from this browser."); });
  $("[data-qcb-download-pdf]").addEventListener("click", downloadPdf);
  $("[data-qcb-download-word]").addEventListener("click", downloadWord);
  $("[data-qcb-download-txt]").addEventListener("click", () => { download(new Blob([plainText(caseData())], { type: "text/plain;charset=utf-8" }), `Quaerens-Airbnb-Complaint-Pack-${slugDate()}.txt`); status("Your text complaint pack has downloaded."); });
  $("[data-qcb-copy-letter]").addEventListener("click", () => copy(complaintLetter(caseData()), "Complaint letter copied to your clipboard."));
  $("[data-qcb-copy-email]").addEventListener("click", () => copy(coverEmail(caseData()), "Cover email copied to your clipboard."));
  $("[data-qcb-print]").addEventListener("click", () => window.print());
})();
