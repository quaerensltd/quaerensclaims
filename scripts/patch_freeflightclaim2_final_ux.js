const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "public", "freeflightclaim2.html");
let html = fs.readFileSync(file, "utf8");

function replaceOnce(search, replacement, label) {
  if (!html.includes(search)) throw new Error(`Missing block: ${label}`);
  html = html.replace(search, replacement);
}

replaceOnce(
  '<a class="pill" href="#flight-tool">Start Free Complaint Pack Builder</a>',
  '<a class="pill" href="#flight-tool">Build My Complaint Pack</a>',
  "nav CTA"
);

replaceOnce(
  `<p>If your flight was delayed, cancelled, rerouted or caused you to miss a connection, this free self-service builder helps you organise the journey details, gather relevant evidence and prepare a complaint, refund request, reimbursement request or information request to send to the airline yourself.</p>
        <p><strong>Answer a few questions, build your complaint pack, review the documents and send them directly to the airline.</strong></p>
        <div class="hero-list" aria-label="Free-use points">
          <span><b>&#10003;</b> No fee</span><span><b>&#10003;</b> No commission</span><span><b>&#10003;</b> No success fee</span><span><b>&#10003;</b> No registration required</span><span><b>&#10003;</b> You keep control</span><span><b>&#10003;</b> You send it yourself</span>
        </div>
        <div style="display:flex;gap:.8rem;flex-wrap:wrap"><a class="btn btn-blue" href="#flight-tool">Start Free Builder</a><a class="btn btn-ghost" href="#evidence">Check What Evidence I Need</a></div>`,
  `<p>Organise your journey, prepare professional complaint documents and gather the evidence you need before contacting the airline.</p>
        <p><strong>Answer a few questions, review the generated documents and send the complaint to the airline yourself.</strong></p>
        <p class="hero-value">Everything you need to prepare and send your initial airline complaint is completely free.</p>
        <div class="hero-list compact" aria-label="Free-use points">
          <span><b>&#10003;</b> No fee</span><span><b>&#10003;</b> No success fee</span><span><b>&#10003;</b> No registration required</span><span><b>&#10003;</b> No automatic submission</span><span><b>&#10003;</b> Your answers stay in your browser</span><span><b>&#10003;</b> You send the complaint yourself</span>
        </div>
        <div style="display:flex;gap:.8rem;flex-wrap:wrap"><a class="btn btn-blue" href="#flight-tool">Build My Complaint Pack</a><a class="btn btn-ghost" href="#pack-includes">See What Is Included</a></div>`,
  "hero copy"
);

replaceOnce(
  `<aside class="panel hero-card" aria-label="Self-service complaint pack reassurance">
        <h2>Self-Service Complaint Pack</h2>
        <p class="small">Organise the flight details, evidence, timeline and wording before sending the complaint yourself through the airline's official route.</p>
        <div class="free-grid" style="margin-top:1rem">
          <div class="free-point">No automatic submission</div><div class="free-point">Evidence checklist</div><div class="free-point">Journey timeline</div><div class="free-point">Expense schedule</div><div class="free-point">Review before sending</div><div class="free-point">Copy, print or download</div>
        </div>
      </aside>`,
  `<aside class="panel hero-card" aria-label="Self-service complaint pack reassurance">
        <h2>Free to Use</h2>
        <p class="small">A browser-first complaint pack builder for organising your flight disruption evidence before contacting the airline.</p>
        <div class="free-grid" style="margin-top:1rem">
          <div class="free-point">No fee</div><div class="free-point">No commission</div><div class="free-point">No success fee</div><div class="free-point">No account needed</div><div class="free-point">Review before sending</div><div class="free-point">Local saving available</div>
        </div>
      </aside>`,
  "hero side card"
);

replaceOnce(
  `  <main>
    <section class="section" id="flight-tool">`,
  `  <main>
    <section class="section" id="pack-includes">
      <div class="wrap">
        <div class="info-box">
          <p class="eyebrow">Free Pack Contents</p>
          <h2>Your Free Complaint Pack Includes</h2>
          <p class="small">The builder creates a structured set of documents you can review, edit, download and send yourself.</p>
          <div class="pack-includes-grid">
            <div class="pack-card"><span>01</span><strong>Initial Airline Complaint and Information Request</strong><p>Clear wording for the airline to review the disruption and provide key records.</p></div>
            <div class="pack-card"><span>02</span><strong>Cover Email</strong><p>A short email you can paste into the airline's official complaint route.</p></div>
            <div class="pack-card"><span>03</span><strong>Flight Evidence Checklist</strong><p>A practical checklist of booking, boarding, airline and expense evidence.</p></div>
            <div class="pack-card"><span>04</span><strong>Journey Timeline</strong><p>A chronological record of what happened before, during and after the disruption.</p></div>
            <div class="pack-card"><span>05</span><strong>Expense Schedule Where Relevant</strong><p>A table for meals, hotel, transport and other documented disruption costs.</p></div>
            <div class="pack-card"><span>06</span><strong>Submission Checklist</strong><p>Before-send checks to help you avoid missing information or inaccurate wording.</p></div>
            <div class="pack-card"><span>07</span><strong>Airline Contact Record</strong><p>Space to record complaint references, submission dates and responses.</p></div>
            <div class="pack-card"><span>08</span><strong>Follow-Up Tracker</strong><p>Prompts for tracking replies, deadlines and escalation decisions.</p></div>
            <div class="pack-card"><span>09</span><strong>Next Steps</strong><p>Neutral guidance on what to consider after sending the complaint.</p></div>
            <div class="pack-card"><span>10</span><strong>Official Resources</strong><p>Links to official passenger-rights and complaint-route resources.</p></div>
            <div class="pack-card"><span>11</span><strong>PDF, Word, RTF and TXT Downloads</strong><p>Download a complete PDF or editable text formats for your own use.</p></div>
            <div class="pack-card"><span>12</span><strong>Copy and Print Options</strong><p>Copy a document, print the pack or edit your answers before sending.</p></div>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="how-it-works">
      <div class="wrap">
        <div class="info-box soft-blue">
          <p class="eyebrow">Four Simple Steps</p>
          <h2>How It Works</h2>
          <div class="how-grid">
            <div class="step-card"><span>1</span><h3>Enter Your Journey Details</h3><p>Passenger, airline, booking, route, airports and travel date.</p></div>
            <div class="step-card"><span>2</span><h3>Record What Happened</h3><p>Delay, cancellation, rerouting, denied boarding, expenses or previous complaint response.</p></div>
            <div class="step-card"><span>3</span><h3>Review Your Complaint Pack</h3><p>Check the live preview and correct anything that does not match your journey.</p></div>
            <div class="step-card"><span>4</span><h3>Download and Send It Yourself</h3><p>Use the airline's official complaint route and keep proof of submission.</p></div>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="flight-tool">`,
  "insert pack sections"
);

replaceOnce(
  '<div id="expenseRows"></div>\n                  <div id="expenseTotals" class="notice expense-totals">No expenses recorded yet. Totals are shown by currency and no currency conversion is applied.</div>\n                  <button type="button" class="btn btn-outline" id="addExpenseBtn">Add expense</button>',
  '<div class="expense-toolbar"><label for="expenseSort">Sort expense schedule</label><select id="expenseSort"><option value="date">Date</option><option value="location">Airport</option><option value="currency">Currency</option><option value="amount">Amount</option></select></div>\n                  <div id="expenseRows"></div>\n                  <div id="expenseTotals" class="notice expense-totals">No expenses recorded yet. Totals are shown by currency and no currency conversion is applied.</div>\n                  <button type="button" class="btn btn-outline" id="addExpenseBtn">Add Another Expense</button>',
  "expense toolbar"
);

replaceOnce(
  '<button type="button" class="btn btn-blue" id="generatePackBtn">Generate My Flight Complaint Pack</button>',
  '<button type="button" class="btn btn-blue" id="generatePackBtn">Generate My Complaint Pack</button>',
  "generate button"
);

replaceOnce(
  '<button type="button" class="btn btn-blue" id="nextBtn">Continue</button>',
  '<button type="button" class="btn btn-blue" id="nextBtn">Continue to Flight Details</button>',
  "next button"
);

replaceOnce(
  `<p class="eyebrow">Complaint Pack Ready</p>
          <h2>Your Flight Disruption Complaint Pack Is Ready</h2>
          <p>Review the documents carefully, edit anything that is inaccurate, then download or copy the pack before sending it yourself through the airline's official complaint route.</p>
          <div class="document-checklist" id="documentChecklist"></div>
          <div class="notice before-send-list">
            <strong>Before You Send</strong>
            <ul>
              <li>Check passenger names, dates, flight numbers and booking reference.</li>
              <li>Attach only relevant documents and remove unnecessary personal information.</li>
              <li>Save a copy of what you send and record the complaint reference.</li>
              <li>Check current official guidance before escalating a rejected complaint.</li>
            </ul>
          </div>`,
  `<p class="eyebrow">Complaint Pack Ready</p>
          <h2>Your Flight Disruption Complaint Pack Is Ready</h2>
          <p>Review each document carefully and change anything that does not accurately reflect your journey.</p>
          <div id="completionSummary" class="completion-summary"></div>
          <h3>Your Pack Includes</h3>
          <div class="document-checklist" id="documentChecklist"></div>
          <div class="notice before-send-list">
            <strong>Before You Send</strong>
            <ul>
              <li>Read the entire complaint pack before sending it.</li>
              <li>Remove or amend anything inaccurate or not relevant to your journey.</li>
              <li>Check passenger names, dates, flight numbers, airports and booking reference.</li>
              <li>Confirm the final-destination arrival time and whether any times are approximate.</li>
              <li>Attach only relevant documents and remove unnecessary personal or payment information.</li>
              <li>Attach expense receipts where reimbursement is requested.</li>
              <li>Use the airline's official complaint or customer relations route.</li>
              <li>Save proof of submission, the airline reference and every response received.</li>
              <li>Check current official guidance before escalating a rejected or unclear response.</li>
            </ul>
          </div>`,
  "completion screen"
);

replaceOnce(
  `<button type="button" class="btn btn-outline" id="downloadRtfBtn">Download Word/RTF</button>
            <button type="button" class="btn btn-outline" id="downloadTxtBtn">Download TXT</button>
            <button type="button" class="btn btn-outline" id="copyDocBtn">Copy Current Document</button>
            <button type="button" class="btn btn-outline" id="printBtn">Print Pack</button>
            <button type="button" class="btn btn-outline" id="editAnswersBtn">Edit My Answers</button>
            <button type="button" class="btn btn-outline" id="newComplaintBtn">Start Another Complaint</button>`,
  `<button type="button" class="btn btn-outline" id="downloadRtfBtn">Download Editable Word or RTF</button>
            <button type="button" class="btn btn-outline" id="downloadTxtBtn">Download Plain Text</button>
            <button type="button" class="btn btn-outline" id="copyDocBtn">Copy This Document</button>
            <button type="button" class="btn btn-outline" id="printBtn">Print My Complaint Pack</button>
            <button type="button" class="btn btn-outline" id="editAnswersBtn">Edit My Answers</button>
            <button type="button" class="btn btn-outline" id="newComplaintBtn">Start Another Complaint Pack</button>
            <a class="btn btn-outline" href="/flight-delay-premium-pack.html">Compare Free and Premium</a>`,
  "completion buttons"
);

const cssInsert = `
    .hero-value{display:inline-block;background:rgba(22,163,74,.18);border:1px solid rgba(134,239,172,.65);border-radius:999px;padding:.6rem .85rem;font-weight:900}
    .hero-list.compact{font-size:.96rem;gap:.55rem 1rem}
    .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
    .pack-includes-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:.85rem;margin-top:1.15rem}
    .pack-card{background:#fff;border:1px solid #dbeafe;border-radius:16px;padding:1rem;box-shadow:0 10px 26px rgba(15,23,42,.055)}
    .pack-card span,.how-grid .step-card span{display:inline-flex;align-items:center;justify-content:center;width:2.1rem;height:2.1rem;border-radius:999px;background:#2563eb;color:#fff;font-weight:900;margin-bottom:.6rem}
    .pack-card strong{display:block;color:#0f2e75;font-weight:900;line-height:1.25}
    .pack-card p,.how-grid p{color:#475569;line-height:1.5;margin:.45rem 0 0}
    .how-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin-top:1.1rem}
    .how-grid .step-card h3{margin:.25rem 0 .35rem}
    .completion-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.65rem;margin:1rem 0}
    .completion-summary div{background:#fff;border:1px solid #dbeafe;border-radius:12px;padding:.75rem}
    .completion-summary strong{display:block;color:#0f2e75;font-size:.78rem;text-transform:uppercase;letter-spacing:.04em;margin-bottom:.2rem}
    .expense-toolbar{display:flex;gap:.7rem;align-items:center;flex-wrap:wrap;margin:.75rem 0}
    .expense-toolbar label{font-weight:900;color:#172554}
    .expense-toolbar select{border:1px solid #cbd5e1;border-radius:999px;padding:.65rem .85rem;font:inherit;background:#fff}
    .combo-status{font-size:.78rem;color:#475569;margin-top:.2rem}
    .combo-option.active,.combo-option:focus{background:#eff6ff;outline:2px solid #bfdbfe}
    .combo-option mark{background:#dbeafe;color:#0f2e75;border-radius:4px;padding:0 .12rem}
`;

replaceOnce(
  '    @media(max-width:900px){.hero{background-position:center}.issue-card{min-height:auto}}\n',
  cssInsert + '    @media(max-width:900px){.hero{background-position:center}.issue-card{min-height:auto}}\n',
  "extra css"
);

fs.writeFileSync(file, html, "utf8");
console.log("Patched freeflightclaim2 UX shell");
