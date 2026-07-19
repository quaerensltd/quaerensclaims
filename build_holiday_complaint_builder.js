const fs = require("fs");
const path = require("path");

const out = path.join(__dirname, "public", "freeholidaycompensation.html");

const html = String.raw`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Free Holiday & Package Travel Complaint Pack Builder | Quaerens</title>
  <meta name="description" content="Build a free holiday complaint pack for cancelled holidays, poor accommodation, package travel disputes, hotel problems and holiday company complaints." />
  <meta name="robots" content="index, follow" />
  <meta name="author" content="Quaerens Ltd." />
  <meta name="theme-color" content="#2563eb" />
  <link rel="canonical" href="https://www.quaerens.co.uk/freeholidaycompensation.html" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Build Your Holiday Complaint Pack | Quaerens" />
  <meta property="og:description" content="Create a professional holiday complaint pack for cancellations, changes, poor accommodation and package travel disputes." />
  <meta property="og:image" content="https://www.quaerens.co.uk/images/hero-holidaycompensation1.jpg" />
  <meta property="og:url" content="https://www.quaerens.co.uk/freeholidaycompensation.html" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Build Your Holiday Complaint Pack | Quaerens" />
  <meta name="twitter:description" content="Free self-service holiday complaint pack builder for cancelled holidays, poor accommodation and package travel disputes." />
  <meta name="twitter:image" content="https://www.quaerens.co.uk/images/hero-holidaycompensation1.jpg" />
  <link rel="icon" href="/images/favicon.png" type="image/png" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18202267837"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','AW-18202267837');</script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" defer></script>
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebApplication","name":"Free Holiday & Package Travel Complaint Pack Builder","url":"https://www.quaerens.co.uk/freeholidaycompensation.html","applicationCategory":"BusinessApplication","operatingSystem":"Web browser","offers":{"@type":"Offer","price":"0","priceCurrency":"GBP"},"provider":{"@type":"Organization","name":"Quaerens Ltd.","url":"https://www.quaerens.co.uk"}}</script>
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Can I use this for a package holiday complaint?","acceptedAnswer":{"@type":"Answer","text":"Yes. The builder supports package holiday complaints, including cancellations, significant changes, poor accommodation, missed services and resort problems."}},{"@type":"Question","name":"Does this calculate guaranteed compensation?","acceptedAnswer":{"@type":"Answer","text":"No. It helps you describe the problem, organise evidence and identify potential outcomes. It does not guarantee a refund, compensation or price reduction."}},{"@type":"Question","name":"Can I use it if the hotel was not as described?","acceptedAnswer":{"@type":"Answer","text":"Yes. Add details about the listing, room, facilities, photos, videos and any complaint raised during the holiday."}},{"@type":"Question","name":"What if I complained while I was away?","acceptedAnswer":{"@type":"Answer","text":"Include the date, who you spoke to, any reference number and the response you received. Keep screenshots and written confirmation where possible."}},{"@type":"Question","name":"Does Quaerens send the complaint for me?","acceptedAnswer":{"@type":"Answer","text":"No. This free page is a browser-first self-service builder. You review, download and send the complaint pack yourself."}}]}</script>
  <style>
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{font-family:Inter,Arial,sans-serif;margin:0;background:#f8fafc;color:#0f172a;top:0!important}.wrap{max-width:1180px;margin:0 auto;padding:0 1rem}.site-header{background:#fff;border-bottom:1px solid #e5e7eb;position:sticky;top:0;z-index:60}.header-inner{min-height:92px;display:flex;align-items:center;justify-content:space-between;gap:1rem}.logo{height:70px;width:auto}.nav{display:flex;align-items:center;gap:.7rem;flex-wrap:wrap;justify-content:flex-end}.nav a{font-weight:900;text-decoration:none;color:#1f2937}.nav .pill{border-radius:999px;padding:.8rem 1.18rem;background:#2563eb;color:#fff;box-shadow:0 12px 28px rgba(37,99,235,.22)}.hero{position:relative;min-height:700px;background:linear-gradient(90deg,rgba(7,19,39,.72),rgba(15,23,42,.48),rgba(15,23,42,.16)),url('/images/hero-holidaycompensation1.jpg') center/cover no-repeat;color:#fff;overflow:hidden}.hero-grid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(350px,.78fr);gap:2rem;align-items:center;min-height:700px;padding:3rem 1rem}.eyebrow{font-size:.86rem;letter-spacing:.08em;text-transform:uppercase;color:#1d4ed8;font-weight:900}.hero .eyebrow{color:#bfdbfe}.hero h1{font-size:clamp(2.45rem,5vw,4.65rem);line-height:1.02;margin:.75rem 0 1rem;font-weight:900;letter-spacing:-.035em;text-shadow:0 3px 20px rgba(7,19,39,.55)}.hero p{font-size:clamp(1.05rem,2vw,1.25rem);line-height:1.6;color:#f8fafc;max-width:760px;text-shadow:0 2px 12px rgba(7,19,39,.45)}.hero-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem 1.1rem;margin:1.35rem 0;color:#fff;font-weight:800}.hero-list span,.tick{display:flex;gap:.5rem;align-items:flex-start}.hero-list b,.tick b{color:#86efac}.btn{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:.95rem 1.35rem;font-weight:900;text-decoration:none;border:0;cursor:pointer;font:inherit}.btn-blue{background:#2563eb;color:#fff;box-shadow:0 14px 30px rgba(37,99,235,.26)}.btn-outline{background:#fff;border:2px solid #2563eb;color:#1d4ed8}.btn-ghost{background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.42);color:#fff}.panel{background:#fff;border:1px solid #dbeafe;border-radius:18px;padding:1.35rem;box-shadow:0 16px 40px rgba(15,23,42,.12);color:#0f172a}.hero-card{position:sticky;top:112px}.hero-card h2{font-size:1.45rem;line-height:1.15;margin:0 0 .45rem;font-weight:900}.trust-grid,.card-grid,.step-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:1rem}.trust-card,.feature-card,.step-card{background:#fff;border:1px solid #dbeafe;border-radius:16px;padding:1rem;box-shadow:0 10px 26px rgba(15,23,42,.06)}.trust-card{font-weight:900;color:#0f2e75}.section{padding:3rem 0}.info-box{background:#fff;border:1px solid #dbeafe;border-radius:18px;padding:clamp(1.2rem,3vw,2rem);box-shadow:0 12px 32px rgba(15,23,42,.07)}.soft-blue{background:linear-gradient(180deg,#eff6ff 0%,#f8fbff 100%)}.tool-workspace{display:grid;grid-template-columns:minmax(0,1fr) minmax(330px,.72fr);gap:1.25rem;align-items:start}.progress{height:.62rem;background:#dbeafe;border-radius:999px;overflow:hidden}.progress span{display:block;height:100%;width:12.5%;background:#2563eb;transition:width .25s ease}.wizard-step{display:none}.wizard-step.active{display:block}.field-grid{display:grid;grid-template-columns:1fr 1fr;gap:.9rem}.field{display:grid;gap:.35rem}.field.full{grid-column:1/-1}.field label,.check-label{font-weight:800;font-size:.9rem;color:#172554}.field input,.field select,.field textarea{width:100%;border:1px solid #cbd5e1;border-radius:12px;padding:.82rem .9rem;font:inherit;background:#fff}.field textarea{min-height:96px;resize:vertical}.choice-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.75rem}.choice{border:1px solid #cbd5e1;border-radius:14px;padding:.85rem;background:#fff;display:flex;gap:.55rem;align-items:flex-start;cursor:pointer}.choice input{margin-top:.25rem}.small{font-size:.88rem;color:#475569;line-height:1.55}.notice{border-radius:14px;padding:1rem;background:#eff6ff;border:1px solid #bfdbfe;color:#1e3a8a}.success{background:#ecfdf5;border-color:#bbf7d0;color:#065f46}.warning{background:#fff7ed;border-color:#fed7aa;color:#7c2d12}.live-preview{position:sticky;top:112px}.live-letter-preview{margin-top:1rem;max-height:640px;overflow:auto;white-space:pre-wrap;background:#f8fbff;border:1px solid #dbeafe;border-radius:14px;padding:1rem;color:#0f172a;font:14px/1.55 Consolas,monospace}.doc-tabs{display:flex;gap:.5rem;flex-wrap:wrap;margin:1rem 0}.doc-tab{border:1px solid #bfdbfe;background:#fff;color:#1d4ed8;border-radius:999px;padding:.65rem .9rem;font-weight:900;cursor:pointer}.doc-tab.active{background:#2563eb;color:#fff}.doc-editor{width:100%;min-height:420px;border:1px solid #cbd5e1;border-radius:14px;padding:1rem;font:15px/1.55 Consolas,monospace;background:#fff;white-space:pre-wrap}.download-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:.75rem}.document-checklist{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:.65rem}.document-checklist span{background:#fff;border:1px solid #dbeafe;border-radius:12px;padding:.75rem;font-weight:800;color:#172554}.summary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:.75rem}.summary-card{background:#fff;border:1px solid #dbeafe;border-radius:14px;padding:.9rem}.summary-card strong{display:block;color:#0f2e75;margin-bottom:.25rem}.faq-item{background:#fff;border:1px solid #dbeafe;border-radius:14px;margin:.75rem 0;overflow:hidden}.faq-btn{width:100%;border:0;background:#fff;text-align:left;padding:1rem;font-weight:900;display:flex;justify-content:space-between;gap:1rem;cursor:pointer}.faq-content{display:none;padding:0 1rem 1rem;color:#334155;line-height:1.65}.faq-item.active .faq-content{display:block}.source-list a{color:#1d4ed8;font-weight:800}.quaerens-language-switcher{position:fixed;right:1rem;top:6.2rem;z-index:80;display:inline-flex;align-items:center;gap:.45rem;background:rgba(255,255,255,.96);border:1px solid #dbeafe;border-radius:999px;box-shadow:0 8px 24px rgba(15,23,42,.12);padding:.45rem .55rem .45rem .8rem}.quaerens-language-switcher label{font-size:.78rem;font-weight:900;color:#1e3a8a}.quaerens-language-switcher select{border:0;background:transparent;font-weight:800;outline:none}.hidden{display:none!important}.print-area{display:none}.footer{background:#06153a;color:#dbeafe;padding:2rem 0;margin-top:2rem}.footer a{color:#fff;font-weight:800;text-decoration:none}.travel-directory{display:grid;gap:.8rem}.directory-card{border:1px solid #dbeafe;border-radius:14px;background:#fff;padding:1rem}.directory-card strong{display:block;color:#0f2e75}@media(max-width:900px){.nav a:not(.pill){display:none}.hero-grid,.tool-workspace{grid-template-columns:1fr;min-height:auto}.hero{min-height:auto}.hero-card,.live-preview{position:relative;top:auto}.hero-list,.field-grid{grid-template-columns:1fr}.logo{height:60px}.quaerens-language-switcher{top:5.1rem}.section{padding:2.2rem 0}}@media(max-width:420px){.hero h1{font-size:2.25rem}.btn{width:100%}.download-grid{grid-template-columns:1fr}}@media print{header,.hero,.quaerens-language-switcher,.no-print,.doc-tabs,.download-grid,.faq-btn{display:none!important}.print-area{display:block!important}.info-box,.panel{box-shadow:none;border:0}.wrap{max-width:none}.doc-editor{border:0;min-height:auto;white-space:pre-wrap}}
  </style>
</head>
<body>
  <header class="site-header no-print">
    <div class="wrap header-inner">
      <a href="/"><img class="logo" src="/images/logo-holidaycompensation.png" alt="Quaerens Holiday Compensation" /></a>
      <nav class="nav" aria-label="Main navigation">
        <a href="/category-free-tools.html">Free tools</a>
        <a href="/travel-claims-hub.html">Travel hub</a>
        <a href="/holiday-compensation.html">Holiday claims</a>
        <a class="pill" href="/">Home</a>
        <a class="pill" href="#holiday-tool">Build My Complaint Pack</a>
      </nav>
    </div>
  </header>
  <div class="quaerens-language-switcher no-print" aria-label="Language selector"><label for="languageSelect">Language</label><select id="languageSelect"><option>English</option></select></div>

  <section class="hero">
    <div class="wrap hero-grid">
      <div>
        <p class="eyebrow">Free Complaint Pack Builder</p>
        <h1>Build Your Holiday Complaint Pack</h1>
        <p>Create a professional complaint pack for cancelled holidays, poor accommodation, package travel disputes and holiday companies.</p>
        <div class="hero-list">
          <span><b>&check;</b> Package holiday complaints</span>
          <span><b>&check;</b> Holiday cancellation</span>
          <span><b>&check;</b> Hotel not as described</span>
          <span><b>&check;</b> Resort or supplier problems</span>
        </div>
        <div style="display:flex;gap:.8rem;flex-wrap:wrap"><a class="btn btn-blue" href="#holiday-tool">Build My Complaint Pack</a><a class="btn btn-ghost" href="#how-it-works">How It Works</a></div>
      </div>
      <aside class="panel hero-card">
        <h2>Free Holiday Complaint Pack Builder</h2>
        <p class="small">Answer structured questions, organise your evidence and build a complaint pack to review before sending to the travel company yourself.</p>
        <div class="document-checklist" style="margin-top:1rem">
          <span>&check; Complaint letter</span>
          <span>&check; Evidence checklist</span>
          <span>&check; Timeline</span>
          <span>&check; Potential outcome summary</span>
          <span>&check; Ready to submit guidance</span>
          <span>&check; PDF, Word/RTF, TXT and print</span>
        </div>
        <p class="small notice" style="margin-top:1rem">Your answers are processed in your browser and are not submitted to Quaerens by this free self-service builder.</p>
      </aside>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="trust-grid">
        <div class="trust-card">&check; Completely free to use</div>
        <div class="trust-card">&check; No account required</div>
        <div class="trust-card">&check; You stay in control</div>
        <div class="trust-card">&check; Cautious, evidence-led wording</div>
        <div class="trust-card">&check; You send the complaint yourself</div>
      </div>
    </div>
  </section>

  <section class="section" id="how-it-works">
    <div class="wrap">
      <div class="info-box">
        <p class="eyebrow">How It Works</p>
        <h2>Four simple stages before you submit</h2>
        <div class="step-grid">
          <div class="step-card"><span class="eyebrow">1</span><h3>Choose Your Holiday Issue</h3><p>Select the closest type of holiday problem so the pack uses relevant wording.</p></div>
          <div class="step-card"><span class="eyebrow">2</span><h3>Answer Simple Questions</h3><p>Add the booking, timeline, evidence and current complaint status.</p></div>
          <div class="step-card"><span class="eyebrow">3</span><h3>Build Your Complaint Pack</h3><p>Review a summary, complaint letter, evidence checklist and timeline.</p></div>
          <div class="step-card"><span class="eyebrow">4</span><h3>Submit To Your Travel Company</h3><p>Use the official complaint route and keep proof of sending.</p></div>
        </div>
      </div>
    </div>
  </section>

  <main class="section" id="holiday-tool">
    <div class="wrap">
      <div class="info-box soft-blue">
        <p class="eyebrow">Smart Holiday Builder&trade;</p>
        <h2>Start the Holiday Complaint Pack Builder</h2>
        <p class="small"><strong>Start at Step 1 below.</strong> Your answers stay in this browser unless you copy, print, download or email the generated documents yourself.</p>
        <div class="progress" aria-label="Progress"><span id="progressBar"></span></div>
        <p id="progressText" class="small"><strong>Step 1 of 8 - Holiday</strong></p>
        <div class="tool-workspace">
          <form id="holidayForm" class="panel" autocomplete="on">
            <section class="wizard-step active" data-step="0">
              <h3>Holiday type</h3>
              <div class="choice-grid" data-radio-group="holidayType">
                <label class="choice"><input type="radio" name="holidayType" value="Package Holiday"> Package Holiday</label>
                <label class="choice"><input type="radio" name="holidayType" value="Hotel Only"> Hotel Only</label>
                <label class="choice"><input type="radio" name="holidayType" value="Villa"> Villa</label>
                <label class="choice"><input type="radio" name="holidayType" value="Resort"> Resort</label>
                <label class="choice"><input type="radio" name="holidayType" value="Coach Holiday"> Coach Holiday</label>
                <label class="choice"><input type="radio" name="holidayType" value="Other"> Other</label>
              </div>
            </section>
            <section class="wizard-step" data-step="1">
              <h3>Travel company</h3>
              <div class="field-grid">
                <div class="field full"><label for="travelCompany">Travel company or supplier</label><input id="travelCompany" name="travelCompany" list="travelCompanies" placeholder="Start typing e.g. TUI, Jet2 Holidays, Expedia" /></div>
                <div class="field full"><label for="companyOther">If other, add any details you know</label><input id="companyOther" name="companyOther" placeholder="Website, agent, branch or contact details" /></div>
              </div>
              <datalist id="travelCompanies">
                <option value="TUI"></option><option value="Jet2 Holidays"></option><option value="easyJet Holidays"></option><option value="British Airways Holidays"></option><option value="Love Holidays"></option><option value="On The Beach"></option><option value="Booking.com"></option><option value="Expedia"></option><option value="Lastminute.com"></option><option value="Hays Travel"></option><option value="Travel Republic"></option><option value="Thomas Cook"></option><option value="Other"></option>
              </datalist>
            </section>
            <section class="wizard-step" data-step="2">
              <h3>Booking details</h3>
              <div class="field-grid">
                <div class="field"><label for="bookingReference">Booking reference</label><input id="bookingReference" name="bookingReference" placeholder="If known" /></div>
                <div class="field"><label for="leadPassenger">Lead passenger</label><input id="leadPassenger" name="leadPassenger" placeholder="Full name" /></div>
                <div class="field"><label for="travelStart">Travel start date</label><input id="travelStart" name="travelStart" type="date" /></div>
                <div class="field"><label for="travelEnd">Travel end date</label><input id="travelEnd" name="travelEnd" type="date" /></div>
                <div class="field"><label for="destination">Destination</label><input id="destination" name="destination" placeholder="Resort, city or hotel area" /></div>
                <div class="field"><label for="country">Country</label><input id="country" name="country" list="countries" placeholder="Start typing a country" /></div>
                <div class="field"><label for="travellers">Number of travellers</label><input id="travellers" name="travellers" type="number" min="1" max="30" value="1" /></div>
              </div>
              <datalist id="countries"><option>Spain</option><option>Greece</option><option>Turkey</option><option>Portugal</option><option>France</option><option>Italy</option><option>Cyprus</option><option>Malta</option><option>United Kingdom</option><option>United States</option><option>Mexico</option><option>Egypt</option><option>Morocco</option><option>Other</option></datalist>
            </section>
            <section class="wizard-step" data-step="3">
              <h3>Complaint type</h3>
              <p class="small">Select every issue that applies.</p>
              <div class="choice-grid">
                <label class="choice"><input type="checkbox" name="complaintTypes" value="Holiday Cancelled"> Holiday Cancelled</label>
                <label class="choice"><input type="checkbox" name="complaintTypes" value="Holiday Changed"> Holiday Changed</label>
                <label class="choice"><input type="checkbox" name="complaintTypes" value="Poor Accommodation"> Poor Accommodation</label>
                <label class="choice"><input type="checkbox" name="complaintTypes" value="Dirty Hotel"> Dirty Hotel</label>
                <label class="choice"><input type="checkbox" name="complaintTypes" value="Unsafe Accommodation"> Unsafe Accommodation</label>
                <label class="choice"><input type="checkbox" name="complaintTypes" value="Facilities Closed"> Facilities Closed</label>
                <label class="choice"><input type="checkbox" name="complaintTypes" value="Construction Noise"> Construction Noise</label>
                <label class="choice"><input type="checkbox" name="complaintTypes" value="Different Room"> Different Room</label>
                <label class="choice"><input type="checkbox" name="complaintTypes" value="Overbooking"> Overbooking</label>
                <label class="choice"><input type="checkbox" name="complaintTypes" value="Food Issues"> Food Issues</label>
                <label class="choice"><input type="checkbox" name="complaintTypes" value="Pool Closed"> Pool Closed</label>
                <label class="choice"><input type="checkbox" name="complaintTypes" value="Air Conditioning"> Air Conditioning</label>
                <label class="choice"><input type="checkbox" name="complaintTypes" value="Transfer Problems"> Transfer Problems</label>
                <label class="choice"><input type="checkbox" name="complaintTypes" value="Missed Excursion"> Missed Excursion</label>
                <label class="choice"><input type="checkbox" name="complaintTypes" value="Other"> Other</label>
              </div>
            </section>
            <section class="wizard-step" data-step="4">
              <h3>Timeline</h3>
              <div class="field-grid">
                <div class="field"><label for="bookedDate">Holiday booked</label><input id="bookedDate" name="bookedDate" type="date" /></div>
                <div class="field"><label for="problemDate">Problem discovered</label><input id="problemDate" name="problemDate" type="date" /></div>
                <div class="field"><label for="complaintDate">Complaint made</label><input id="complaintDate" name="complaintDate" type="date" /></div>
                <div class="field"><label for="currentStatus">Current status</label><select id="currentStatus" name="currentStatus"><option value="">Select</option><option>No complaint sent yet</option><option>Complaint sent, no reply yet</option><option>Complaint refused</option><option>Partial offer made</option><option>Travel company says it is investigating</option><option>Resolved</option></select></div>
                <div class="field full"><label for="timelineNotes">What happened?</label><textarea id="timelineNotes" name="timelineNotes" placeholder="Briefly explain the main events in date order."></textarea></div>
              </div>
            </section>
            <section class="wizard-step" data-step="5">
              <h3>Evidence</h3>
              <p class="small">Tick what you have. You do not need every document before building the pack.</p>
              <div class="choice-grid">
                <label class="choice"><input type="checkbox" name="evidence" value="Booking confirmation"> Booking confirmation</label>
                <label class="choice"><input type="checkbox" name="evidence" value="Invoices"> Invoices</label>
                <label class="choice"><input type="checkbox" name="evidence" value="Receipts"> Receipts</label>
                <label class="choice"><input type="checkbox" name="evidence" value="Photos"> Photos</label>
                <label class="choice"><input type="checkbox" name="evidence" value="Videos"> Videos</label>
                <label class="choice"><input type="checkbox" name="evidence" value="Emails"> Emails</label>
                <label class="choice"><input type="checkbox" name="evidence" value="Chat messages"> Chat messages</label>
                <label class="choice"><input type="checkbox" name="evidence" value="Travel documents"> Travel documents</label>
                <label class="choice"><input type="checkbox" name="evidence" value="Complaint correspondence"> Complaint correspondence</label>
                <label class="choice"><input type="checkbox" name="evidence" value="Medical evidence"> Medical evidence, if applicable</label>
                <label class="choice"><input type="checkbox" name="evidence" value="Witnesses"> Witnesses</label>
              </div>
            </section>
            <section class="wizard-step" data-step="6">
              <h3>Potential outcome</h3>
              <p class="small">Select outcomes you may want the travel company to consider. This tool does not guarantee any refund, compensation or result.</p>
              <div class="choice-grid">
                <label class="choice"><input type="checkbox" name="outcomes" value="Refund"> Refund</label>
                <label class="choice"><input type="checkbox" name="outcomes" value="Partial Refund"> Partial Refund</label>
                <label class="choice"><input type="checkbox" name="outcomes" value="Compensation"> Compensation</label>
                <label class="choice"><input type="checkbox" name="outcomes" value="Price Reduction"> Price Reduction</label>
                <label class="choice"><input type="checkbox" name="outcomes" value="Goodwill Payment"> Goodwill Payment</label>
                <label class="choice"><input type="checkbox" name="outcomes" value="Alternative Holiday"> Alternative Holiday</label>
                <label class="choice"><input type="checkbox" name="outcomes" value="Travel Credit"> Travel Credit</label>
              </div>
              <div class="field full" style="margin-top:1rem"><label for="losses">Costs or impact to mention</label><textarea id="losses" name="losses" placeholder="Add extra accommodation, transport, replacement booking, lost services, distress/inconvenience or other documented impact."></textarea></div>
            </section>
            <section class="wizard-step" data-step="7">
              <h3>Review and build</h3>
              <p>Generate the holiday complaint pack, then review every section before sending anything to a travel company.</p>
              <div class="notice warning"><strong>Important:</strong> This is a self-service document builder. It does not provide legal advice and does not decide entitlement. Check all wording before use.</div>
              <button type="button" class="btn btn-blue" id="generatePackBtn" style="margin-top:1rem">Generate My Holiday Complaint Pack</button>
            </section>
            <div class="no-print" style="display:flex;gap:.75rem;flex-wrap:wrap;margin-top:1.2rem">
              <button type="button" class="btn btn-outline" id="prevBtn">Back</button>
              <button type="button" class="btn btn-blue" id="nextBtn">Next Step</button>
              <button type="button" class="btn btn-outline" id="clearBtn">Clear Answers</button>
            </div>
          </form>

          <aside class="panel live-preview no-print" aria-label="Live complaint pack preview">
            <p class="eyebrow">Complaint Pack Preview</p>
            <h3>Holiday complaint pack preview</h3>
            <button type="button" class="btn btn-outline" id="togglePreview">Hide Preview</button>
            <div class="doc-tabs" id="previewTabs">
              <button type="button" class="doc-tab active" data-preview="summary">Summary</button>
              <button type="button" class="doc-tab" data-preview="letter">Complaint</button>
              <button type="button" class="doc-tab" data-preview="evidence">Evidence</button>
              <button type="button" class="doc-tab" data-preview="timeline">Timeline</button>
              <button type="button" class="doc-tab" data-preview="submit">Submit</button>
            </div>
            <pre id="livePreview" class="live-letter-preview">Your preview will update as you answer the questions.</pre>
          </aside>
        </div>
      </div>
    </div>
  </main>

  <section class="section" id="downloads">
    <div class="wrap">
      <div class="info-box">
        <p class="eyebrow">Downloads</p>
        <h2>Quaerens Consumer Complaint File</h2>
        <p>Includes your Holiday Analysis, Complaint Letter, Evidence Checklist, Timeline, Potential Outcome Summary and Smart Submission guidance.</p>
        <textarea id="docEditor" class="doc-editor" aria-label="Generated complaint pack">Generate the pack above to unlock the full document.</textarea>
        <div class="download-grid no-print" style="margin-top:1rem">
          <button type="button" class="btn btn-blue" id="downloadPdfBtn">Download Complete PDF</button>
          <button type="button" class="btn btn-outline" id="downloadRtfBtn">Download Editable Word or RTF</button>
          <button type="button" class="btn btn-outline" id="downloadTxtBtn">Download Plain Text Version</button>
          <button type="button" class="btn btn-outline" id="copyDocBtn">Copy This Document</button>
          <button type="button" class="btn btn-outline" id="printBtn">Print My Complaint Pack</button>
          <a class="btn btn-outline" id="emailBtn" href="mailto:?subject=Holiday%20Complaint%20Pack">Email to Yourself</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="smart-submission">
    <div class="wrap">
      <div class="info-box soft-blue">
        <p class="eyebrow">Quaerens Smart Submission&trade;</p>
        <h2>Your Holiday Complaint Pack Is Ready to Submit</h2>
        <div class="summary-grid">
          <div class="summary-card"><strong>Complaint Letter</strong><span>Review and amend before sending.</span></div>
          <div class="summary-card"><strong>Evidence</strong><span>Attach only relevant documents and redact unnecessary details.</span></div>
          <div class="summary-card"><strong>Timeline</strong><span>Use dates and facts in the order they happened.</span></div>
          <div class="summary-card"><strong>Travel Company</strong><span>Use the official complaint route where available.</span></div>
          <div class="summary-card"><strong>Ready To Submit</strong><span>Save proof of sending and the complaint reference.</span></div>
        </div>
        <div class="travel-directory" style="margin-top:1rem">
          <div class="directory-card"><strong>Travel Company Directory Framework</strong><p class="small">Version 1.0 includes the structure for official complaint page, customer relations, postal address and website. Check the current official company website before sending.</p></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="info-box">
        <p class="eyebrow">Evidence Guidance</p>
        <h2>Documents That May Help</h2>
        <p>You do not need every item before using the builder, but clearer evidence usually makes the complaint easier to understand.</p>
        <div class="document-checklist">
          <span>Booking confirmation</span><span>Invoices</span><span>Receipts</span><span>Photos</span><span>Videos</span><span>Emails</span><span>Chat messages</span><span>Travel documents</span><span>Complaint correspondence</span><span>Medical evidence, if applicable</span><span>Witness details</span>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="info-box soft-blue">
        <p class="eyebrow">Frequently Asked Questions</p>
        <h2>Holiday Complaint Pack Builder FAQs</h2>
        <div class="faq-item"><button class="faq-btn" type="button"><span>Can I use this for a package holiday complaint?</span><span>+</span></button><div class="faq-content">Yes. The builder supports package holiday complaints, including cancellations, significant changes, poor accommodation, missed services and resort problems.</div></div>
        <div class="faq-item"><button class="faq-btn" type="button"><span>Does this calculate guaranteed compensation?</span><span>+</span></button><div class="faq-content">No. It helps you describe the problem, organise evidence and identify potential outcomes. It does not guarantee a refund, compensation or price reduction.</div></div>
        <div class="faq-item"><button class="faq-btn" type="button"><span>Can I use it if the hotel was not as described?</span><span>+</span></button><div class="faq-content">Yes. Add details about the listing, room, facilities, photos, videos and any complaint raised during the holiday.</div></div>
        <div class="faq-item"><button class="faq-btn" type="button"><span>What if I complained while I was away?</span><span>+</span></button><div class="faq-content">Include the date, who you spoke to, any reference number and the response you received. Keep screenshots and written confirmation where possible.</div></div>
        <div class="faq-item"><button class="faq-btn" type="button"><span>Does Quaerens send the complaint for me?</span><span>+</span></button><div class="faq-content">No. This free page is a browser-first self-service builder. You review, download and send the complaint pack yourself.</div></div>
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="wrap">
      <p><strong>Quaerens Ltd.</strong> Free Holiday & Package Travel Complaint Pack Builder.</p>
      <p class="small">This is a self-service document builder. It does not provide legal advice, does not guarantee a particular outcome and does not submit complaints on your behalf.</p>
      <p><a href="/travel-claims-hub.html">Travel Claims Hub</a> &nbsp; <a href="/holiday-compensation.html">Holiday Compensation</a> &nbsp; <a href="/category-free-tools.html">Free Tools</a> &nbsp; <a href="/contact.html">Contact</a></p>
    </div>
  </footer>

  <div class="print-area" id="printArea"></div>

  <script>
    (function(){
      const qs = id => document.getElementById(id);
      const qsa = sel => Array.from(document.querySelectorAll(sel));
      const storageKey = 'quaerensHolidayComplaintPackV1';
      const steps = ['Holiday','Booking','Problem','Timeline','Evidence','Complaint Pack','Review','Submit'];
      let step = 0;
      let activePreview = 'summary';
      let docs = {};
      function today(){ return new Date().toLocaleDateString('en-GB'); }
      function value(name){ const el = document.querySelector('[name="'+name+'"]'); return el ? el.value.trim() : ''; }
      function checked(name){ return qsa('[name="'+name+'"]:checked').map(el => el.value); }
      function radio(name){ const el = document.querySelector('[name="'+name+'"]:checked'); return el ? el.value : ''; }
      function fallback(v){ return v && String(v).trim() ? String(v).trim() : '[Not provided]'; }
      function lines(items){ return items.length ? items.map(x => '- ' + x).join('\n') : '- [Not selected]'; }
      function data(){
        return {
          holidayType: radio('holidayType'), travelCompany: value('travelCompany'), companyOther: value('companyOther'),
          bookingReference: value('bookingReference'), leadPassenger: value('leadPassenger'), travelStart: value('travelStart'), travelEnd: value('travelEnd'),
          destination: value('destination'), country: value('country'), travellers: value('travellers') || '1',
          complaintTypes: checked('complaintTypes'), bookedDate: value('bookedDate'), problemDate: value('problemDate'), complaintDate: value('complaintDate'),
          currentStatus: value('currentStatus'), timelineNotes: value('timelineNotes'), evidence: checked('evidence'), outcomes: checked('outcomes'), losses: value('losses')
        };
      }
      function buildSummary(a){
        return 'QUAERENS CONSUMER COMPLAINT FILE\n\nHoliday & Package Travel Complaint Pack\n\nGenerated: ' + today() + '\n\nHOLIDAY SUMMARY\nHoliday type: ' + fallback(a.holidayType) + '\nTravel company: ' + fallback(a.travelCompany || a.companyOther) + '\nBooking reference: ' + fallback(a.bookingReference) + '\nLead passenger: ' + fallback(a.leadPassenger) + '\nTravel dates: ' + fallback(a.travelStart) + ' to ' + fallback(a.travelEnd) + '\nDestination: ' + fallback(a.destination) + ', ' + fallback(a.country) + '\nNumber of travellers: ' + fallback(a.travellers) + '\n\nKEY ISSUES\n' + lines(a.complaintTypes) + '\n\nPOTENTIAL OUTCOMES TO CONSIDER\n' + lines(a.outcomes) + '\n\nIMPORTANT NOTE\nThis pack is a self-service starting point. Check every answer, remove anything inaccurate and only send documents that reflect your own circumstances. It does not provide legal advice or guarantee a refund, compensation, price reduction or goodwill payment.';
      }
      function buildTimeline(a){
        return 'HOLIDAY TIMELINE\n\nHoliday booked: ' + fallback(a.bookedDate) + '\nTravel start: ' + fallback(a.travelStart) + '\nTravel end: ' + fallback(a.travelEnd) + '\nProblem discovered: ' + fallback(a.problemDate) + '\nComplaint made: ' + fallback(a.complaintDate) + '\nCurrent status: ' + fallback(a.currentStatus) + '\n\nEVENT NOTES\n' + fallback(a.timelineNotes);
      }
      function buildEvidence(a){
        return 'HOLIDAY EVIDENCE CHECKLIST\n\nEvidence already identified:\n' + lines(a.evidence) + '\n\nOther evidence that may help:\n- Booking confirmation\n- Invoice and payment records\n- Screenshots of the hotel, villa, resort or package description\n- Photos and videos showing the problem\n- Emails, chat messages and complaint correspondence\n- Receipts for replacement accommodation, transport or extra costs\n- Notes of who you spoke to and when\n- Medical or witness evidence where relevant\n\nDo not send original documents unless specifically required. Redact unnecessary sensitive information before attaching documents.';
      }
      function buildLetter(a){
        const issues = a.complaintTypes.length ? a.complaintTypes.join(', ') : 'holiday complaint issues';
        const outcomes = a.outcomes.length ? a.outcomes.join(', ') : 'an appropriate response based on the evidence';
        return 'INITIAL HOLIDAY COMPLAINT AND INFORMATION REQUEST\n\nTo: ' + fallback(a.travelCompany || a.companyOther) + '\n\nBooking reference: ' + fallback(a.bookingReference) + '\nLead passenger: ' + fallback(a.leadPassenger) + '\nDestination: ' + fallback(a.destination) + ', ' + fallback(a.country) + '\nTravel dates: ' + fallback(a.travelStart) + ' to ' + fallback(a.travelEnd) + '\n\nDear Customer Relations Team,\n\nI am writing about the holiday booking above. I would like you to review the circumstances and provide a clear written response.\n\nThe main issues I would like reviewed are: ' + issues + '.\n\nTimeline and background:\n' + fallback(a.timelineNotes) + '\n\nEvidence available:\n' + lines(a.evidence) + '\n\nPotential outcome requested:\nI ask that you review the evidence and explain what outcome may be appropriate. The outcome I would like considered includes: ' + outcomes + '.\n\nCosts or impact to consider:\n' + fallback(a.losses) + '\n\nPlease provide a written response explaining your position, the evidence you have considered and any further information you require from me.\n\nYours faithfully,\n\n' + fallback(a.leadPassenger);
      }
      function buildSubmit(a){
        return 'QUAERENS SMART SUBMISSION\n\nYour Holiday Complaint Pack Is Ready to Submit\n\nBefore sending:\n- Read every section carefully\n- Remove or amend anything that is inaccurate\n- Attach only relevant evidence\n- Check the travel company official complaint page\n- Keep proof of sending\n- Record any complaint reference\n- Save copies of all documents and responses\n\nTRAVEL COMPANY DIRECTORY FRAMEWORK\nTravel company: ' + fallback(a.travelCompany || a.companyOther) + '\nOfficial complaint page: Check the current official website before sending\nCustomer relations: Check the current official website before sending\nPostal address: Check the current official website before sending\nWebsite: Check the current official website before sending\n\nQuaerens does not send this complaint for you through this free builder.';
      }
      function buildAll(){
        const a = data();
        docs = { summary: buildSummary(a), letter: buildLetter(a), evidence: buildEvidence(a), timeline: buildTimeline(a), submit: buildSubmit(a) };
        docs.full = 'QUAERENS CONSUMER COMPLAINT FILE\nHoliday & Package Travel Complaint Pack\n\nIncludes your Holiday Analysis, Complaint Letter, Evidence Checklist, Timeline, Potential Outcome Summary and Smart Submission guidance.\n\n---\n\n' + [docs.summary, docs.letter, docs.evidence, docs.timeline, docs.submit].join('\n\n---\n\n');
        return docs;
      }
      function render(){
        qsa('.wizard-step').forEach((el,i)=>el.classList.toggle('active', i === step));
        qs('progressBar').style.width = (((step + 1) / steps.length) * 100) + '%';
        qs('progressText').innerHTML = '<strong>Step ' + (step + 1) + ' of ' + steps.length + ' - ' + steps[step] + '</strong>';
        qs('prevBtn').disabled = step === 0;
        qs('nextBtn').textContent = step === steps.length - 1 ? 'Review Pack' : 'Next Step';
        buildAll();
        const preview = qs('livePreview');
        preview.textContent = docs[activePreview] || docs.summary;
        qs('docEditor').value = docs.full || '';
        qs('printArea').textContent = docs.full || '';
        try { sessionStorage.setItem(storageKey, JSON.stringify(data())); } catch(e){}
      }
      function restore(){
        try {
          const raw = sessionStorage.getItem(storageKey);
          if (!raw) return;
          const a = JSON.parse(raw);
          Object.entries(a).forEach(([k,v]) => {
            if (Array.isArray(v)) v.forEach(item => { const el = document.querySelector('[name="'+k+'"][value="'+CSS.escape(item)+'"]'); if (el) el.checked = true; });
            else {
              const radioEl = document.querySelector('[name="'+k+'"][value="'+CSS.escape(v || '')+'"]');
              if (radioEl && radioEl.type === 'radio') radioEl.checked = true;
              const input = document.querySelector('[name="'+k+'"]:not([type="radio"]):not([type="checkbox"])');
              if (input) input.value = v || '';
            }
          });
        } catch(e){}
      }
      function download(name, mime, content){
        const blob = new Blob([content], {type:mime});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(()=>URL.revokeObjectURL(url), 500);
      }
      function downloadPdf(){
        if (!window.jspdf || !window.jspdf.jsPDF) { window.print(); return; }
        const doc = new window.jspdf.jsPDF({unit:'pt',format:'a4'});
        const margin = 42; let y = 48;
        doc.setFont('helvetica','bold'); doc.setFontSize(16); doc.text('Quaerens Consumer Complaint File', margin, y); y += 24;
        doc.setFont('helvetica','normal'); doc.setFontSize(10);
        const text = docs.full || buildAll().full;
        doc.splitTextToSize(text, 510).forEach(line => {
          if (y > 780) { doc.addPage(); y = 48; }
          doc.text(line, margin, y); y += 13;
        });
        doc.save('quaerens-holiday-complaint-pack.pdf');
      }
      restore(); render();
      qs('nextBtn').addEventListener('click', () => { if (step < steps.length - 1) step++; render(); if (step === steps.length - 1) qs('holiday-tool').scrollIntoView({behavior:'smooth'}); });
      qs('prevBtn').addEventListener('click', () => { if (step > 0) step--; render(); });
      qs('clearBtn').addEventListener('click', () => { if (confirm('Clear all answers on this page?')) { qs('holidayForm').reset(); sessionStorage.removeItem(storageKey); step = 0; render(); } });
      qs('generatePackBtn').addEventListener('click', () => { buildAll(); render(); qs('downloads').scrollIntoView({behavior:'smooth'}); });
      qs('holidayForm').addEventListener('input', render);
      qs('holidayForm').addEventListener('change', render);
      qsa('.doc-tab').forEach(btn => btn.addEventListener('click', () => { qsa('.doc-tab').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); activePreview = btn.dataset.preview; render(); }));
      qs('togglePreview').addEventListener('click', () => { const pre = qs('livePreview'); pre.classList.toggle('hidden'); qs('togglePreview').textContent = pre.classList.contains('hidden') ? 'Show Preview' : 'Hide Preview'; });
      qs('downloadPdfBtn').addEventListener('click', downloadPdf);
      qs('downloadRtfBtn').addEventListener('click', () => download('quaerens-holiday-complaint-pack.rtf', 'application/rtf', '{\\rtf1\\ansi\\deff0 ' + (docs.full || buildAll().full).replace(/[\\{}]/g,'').replace(/\n/g,'\\par ') + '}'));
      qs('downloadTxtBtn').addEventListener('click', () => download('quaerens-holiday-complaint-pack.txt', 'text/plain;charset=utf-8', docs.full || buildAll().full));
      qs('copyDocBtn').addEventListener('click', async () => { await navigator.clipboard.writeText(qs('docEditor').value); qs('copyDocBtn').textContent = 'Copied'; setTimeout(()=>qs('copyDocBtn').textContent='Copy This Document', 1200); });
      qs('printBtn').addEventListener('click', () => window.print());
      qs('emailBtn').addEventListener('click', () => { qs('emailBtn').href = 'mailto:?subject=Holiday%20Complaint%20Pack&body=' + encodeURIComponent(qs('docEditor').value.slice(0,1600)); });
      qsa('.faq-btn').forEach(btn => btn.addEventListener('click', () => btn.closest('.faq-item').classList.toggle('active')));
    })();
  </script>
  <script src="quaerens-conversion-tracking.js" defer></script>
  <script src="quaerens-trust-shields.js" defer></script>
  <script type="module" src="/quaerens-live-chat.js"></script>
</body>
</html>`;

fs.writeFileSync(out, html, "utf8");
console.log(`Wrote ${out}`);
