const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const source = path.join(publicDir, 'index.html');
const out = path.join(publicDir, 'indexnewtest2.html');
let html = fs.readFileSync(source, 'utf8');

html = html.replace(/<title>[^<]*<\/title>/, '<title>Quaerens | Free DIY Tools & Guided Dispute Support</title>');
html = html.replace(/<meta name="robots" content="[^"]*">/, '<meta name="robots" content="noindex, nofollow">');
html = html.replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="https://www.quaerens.co.uk/indexnewtest2.html">');

const css = `
    .soft-contact-strip{margin:1.25rem 0 0;background:white;border:1px solid #dbeafe;border-radius:22px;padding:1rem 1.15rem;box-shadow:0 10px 28px rgba(15,23,42,.06);display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap}
    .soft-contact-strip strong{color:#0f172a;font-size:1rem}.soft-contact-strip span{color:#64748b;font-size:.94rem}.soft-contact-actions{display:flex;align-items:center;gap:.7rem;flex-wrap:wrap}.soft-contact-call{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;font-weight:800;text-decoration:none;padding:.75rem 1rem}.soft-contact-social{width:42px;height:42px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:#f8fafc;border:1px solid #dbeafe;color:#1d4ed8;font-weight:900;text-decoration:none}.soft-contact-social:hover,.soft-contact-call:hover{background:#dbeafe}
    .callback-section{margin:3.5rem 0 1rem}.callback-panel{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,430px);gap:1.5rem;align-items:stretch;background:linear-gradient(135deg,#eff6ff 0%,#ffffff 58%,#ecfdf5 100%);border:1px solid #bfdbfe;border-radius:28px;padding:1.5rem;box-shadow:0 14px 34px rgba(15,23,42,.07)}
    .callback-copy{padding:1rem}.callback-copy p:first-child{font-weight:800;color:#2563eb;text-transform:uppercase;font-size:.82rem;letter-spacing:.08em}.callback-copy h2{font-size:clamp(1.9rem,3vw,2.85rem);line-height:1.08;font-weight:800;color:#0f172a;margin-top:.45rem}.callback-copy .lead{color:#4b5563;line-height:1.7;font-size:1.05rem;margin-top:.85rem;max-width:680px}.callback-points{display:grid;gap:.65rem;margin-top:1.1rem;color:#334155}.callback-points span{display:flex;gap:.55rem;align-items:flex-start}.callback-points b{color:#047857}
    .callback-card-soft{background:white;border:1px solid #dbeafe;border-radius:22px;padding:1.2rem;box-shadow:0 12px 28px rgba(37,99,235,.08)}.callback-card-soft h3{font-size:1.35rem;font-weight:800;color:#0f172a;margin-bottom:.35rem}.callback-card-soft p{color:#64748b;line-height:1.55;margin-bottom:1rem}.callback-card-soft label{display:block;font-size:.82rem;font-weight:800;color:#1e3a8a;margin:.75rem 0 .35rem}.callback-card-soft input,.callback-card-soft select{width:100%;border:1px solid #cbd5e1;border-radius:12px;padding:.8rem .9rem;color:#0f172a;background:white;outline:none}.callback-card-soft input:focus,.callback-card-soft select:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.12)}.callback-card-soft button{width:100%;border:0;border-radius:999px;background:#2563eb;color:white;font-weight:800;padding:.95rem 1.1rem;margin-top:1rem;cursor:pointer}.callback-card-soft button:hover{background:#1d4ed8}.callback-small{font-size:.82rem;color:#64748b;margin-top:.75rem;line-height:1.45}
    @media(max-width:768px){.soft-contact-strip{align-items:flex-start}.soft-contact-actions{width:100%}.soft-contact-call{width:100%}.callback-panel{grid-template-columns:1fr;padding:1rem}.callback-copy{padding:.25rem}.callback-card-soft{padding:1rem}}
`;
html = html.replace('    @media(max-width:768px){html{scroll-padding-top:105px}.hero-inner{min-height:auto;padding:4rem 1rem}.hero::after{background:linear-gradient(180deg,rgba(7,19,39,.92),rgba(15,23,42,.82))}.hero h1{letter-spacing:0}.trust-row,.choice-grid,.process{grid-template-columns:1fr}.trust-row{margin-top:1rem}.service-card{min-height:auto}.category-copy{padding:1.35rem}.topbar nav{display:none}}', '    @media(max-width:768px){html{scroll-padding-top:105px}.hero-inner{min-height:auto;padding:4rem 1rem}.hero::after{background:linear-gradient(180deg,rgba(7,19,39,.92),rgba(15,23,42,.82))}.hero h1{letter-spacing:0}.trust-row,.choice-grid,.process{grid-template-columns:1fr}.trust-row{margin-top:1rem}.service-card{min-height:auto}.category-copy{padding:1.35rem}.topbar nav{display:none}}' + css);

const contactStrip = `
      <div class="soft-contact-strip" aria-label="Contact Quaerens">
        <div>
          <strong>Prefer to speak to someone?</strong><br>
          <span>Speak to one of our intake consultants before choosing the right route.</span>
        </div>
        <div class="soft-contact-actions">
          <a class="soft-contact-call" href="tel:+442080500725">Call +44 (0)20 8050 0725</a>
          <a class="soft-contact-social" href="https://www.facebook.com/profile.php?id=61575842262559" target="_blank" rel="noopener" aria-label="Follow Quaerens on Facebook">f</a>
          <a class="soft-contact-social" href="https://www.instagram.com/quaerens.ltd" target="_blank" rel="noopener" aria-label="Follow Quaerens on Instagram">ig</a>
        </div>
      </div>
`;
html = html.replace(`        <div class="trust-card"><strong>Human support</strong><span>Real people, clear wording and practical next steps.</span></div>
      </div>

      <section id="free-tools">`, `        <div class="trust-card"><strong>Human support</strong><span>Real people, clear wording and practical next steps.</span></div>
      </div>
${contactStrip}
      <section id="free-tools">`);

const callbackSection = `

      <section class="callback-section" id="request-callback">
        <div class="callback-panel">
          <div class="callback-copy">
            <p>Speak to Quaerens</p>
            <h2>Not sure which route fits your problem?</h2>
            <div class="lead">If you would rather speak to someone first, request a callback and we can help you understand whether a free DIY tool, a guided review, or a formal escalation route is the better starting point.</div>
            <div class="callback-points">
              <span><b>✓</b> No pressure to start a paid service</span>
              <span><b>✓</b> Useful if your issue crosses more than one category</span>
              <span><b>✓</b> Helps you choose the right page, tool or next step</span>
            </div>
          </div>
          <form class="callback-card-soft" onsubmit="event.preventDefault(); alert('Preview only: this callback form can be connected to the CRM if approved.');">
            <h3>Request a call back</h3>
            <p>Leave a few details and we will use this as the callback layout if approved.</p>
            <label for="hybridCallbackName">Name</label>
            <input id="hybridCallbackName" name="name" type="text" autocomplete="name" placeholder="Your name" required>
            <label for="hybridCallbackPhone">Phone</label>
            <input id="hybridCallbackPhone" name="phone" type="tel" autocomplete="tel" placeholder="Best contact number" required>
            <label for="hybridCallbackEmail">Email</label>
            <input id="hybridCallbackEmail" name="email" type="email" autocomplete="email" placeholder="you@example.com">
            <label for="hybridCallbackIssue">Issue type</label>
            <select id="hybridCallbackIssue" name="issue">
              <option value="">Select an issue</option>
              <option>Travel, holiday or luggage</option>
              <option>Finance, bank or pension</option>
              <option>Property, solar or housing</option>
              <option>Digital, fraud or platform problem</option>
              <option>Letters, complaints or escalation</option>
              <option>Something else</option>
            </select>
            <label for="hybridCallbackTime">Preferred time</label>
            <select id="hybridCallbackTime" name="preferred_time">
              <option>Any time today</option>
              <option>Morning</option>
              <option>Afternoon</option>
              <option>Tomorrow</option>
            </select>
            <button type="submit">Request Call Back</button>
            <div class="callback-small">This is a comparison page. Once approved, this form can be connected to the CRM callback queue.</div>
          </form>
        </div>
      </section>
`;
html = html.replace(`
      <section id="guided-help">`, callbackSection + `
      <section id="guided-help">`);

fs.writeFileSync(out, html, 'utf8');
console.log('Created ' + out);
