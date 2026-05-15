const fs = require('fs');
const src = 'C:/Users/CasaT/quaerensclaims/public/index.html';
const out = 'C:/Users/CasaT/quaerensclaims/public/indexnewtest.html';
let html = fs.readFileSync(src, 'utf8');

html = html.replace('<title>Quaerens | Free DIY Tools & Guided Claim Support</title>', '<title>Quaerens Test | Contact Bar & Callback Homepage</title>');
html = html.replace('<meta name="robots" content="index, follow">', '<meta name="robots" content="noindex, nofollow">');
html = html.replace('<link rel="canonical" href="https://www.quaerens.co.uk/">', '<link rel="canonical" href="https://www.quaerens.co.uk/indexnewtest.html">');

html = html.replace(`.topbar{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.94);backdrop-filter:blur(10px);border-bottom:1px solid #e5e7eb}
    .nav-link{font-size:.92rem;font-weight:700;color:#374151}.nav-link:hover{color:#2563eb}
    .hero{position:relative;overflow:hidden;background:#0f172a;color:white}`,
`.topbar{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.94);backdrop-filter:blur(10px);border-bottom:1px solid #e5e7eb}
    .contact-strip{background:#173a8a;color:white;border-bottom:1px solid rgba(255,255,255,.14)}
    .contact-strip-inner{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.65rem 1rem;font-size:.9rem}
    .contact-line{display:flex;align-items:center;gap:.8rem;flex-wrap:wrap;font-weight:800;letter-spacing:.02em}.contact-line a{color:white;text-decoration:none}.contact-line a:hover{text-decoration:underline}
    .social-links{display:flex;align-items:center;gap:.65rem;color:#dbeafe;font-weight:700}.social-icon{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:999px;background:rgba(255,255,255,.14);color:white;text-decoration:none;font-size:.78rem;font-weight:900;border:1px solid rgba(255,255,255,.18)}.social-icon:hover{background:white;color:#173a8a}
    .nav-link{font-size:.92rem;font-weight:700;color:#374151}.nav-link:hover{color:#2563eb}
    .hero{position:relative;overflow:hidden;background:#0f172a;color:white}`);

html = html.replace(`.hero-inner{position:relative;z-index:1;min-height:620px;display:grid;align-items:center;padding:5rem 1rem}`, `.hero-inner{position:relative;z-index:1;min-height:620px;display:grid;grid-template-columns:minmax(0,1fr) 390px;gap:2rem;align-items:center;padding:5rem 1rem}`);
html = html.replace(`.hero p{font-size:clamp(1.08rem,2vw,1.35rem);line-height:1.65;color:#e5e7eb;max-width:760px;margin-top:1.25rem}`,
`.hero p{font-size:clamp(1.08rem,2vw,1.35rem);line-height:1.65;color:#e5e7eb;max-width:760px;margin-top:1.25rem}
    .callback-card{background:rgba(255,255,255,.96);color:#0f172a;border:1px solid rgba(255,255,255,.55);border-radius:22px;padding:1.25rem;box-shadow:0 22px 50px rgba(0,0,0,.28)}
    .callback-card h2{font-size:1.55rem;line-height:1.15;font-weight:800;color:#0f172a;margin:0 0 .45rem}.callback-card p{font-size:.95rem;line-height:1.55;color:#475569;margin:.2rem 0 1rem}.callback-card label{display:block;font-size:.8rem;font-weight:800;color:#1e3a8a;margin:.8rem 0 .35rem}.callback-card input,.callback-card select{width:100%;border:1px solid #cbd5e1;border-radius:12px;padding:.82rem .9rem;color:#0f172a;background:white;outline:none}.callback-card input:focus,.callback-card select:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.14)}.callback-card button{width:100%;margin-top:1rem;border:0;border-radius:999px;background:#2563eb;color:white;font-weight:900;padding:.95rem 1rem;cursor:pointer}.callback-card button:hover{background:#1d4ed8}.callback-note{font-size:.78rem!important;color:#64748b!important;margin-top:.75rem!important}`);

html = html.replace(`@media(max-width:768px){html{scroll-padding-top:105px}.hero-inner{min-height:auto;padding:4rem 1rem}.hero::after{background:linear-gradient(180deg,rgba(7,19,39,.92),rgba(15,23,42,.82))}.hero h1{letter-spacing:0}.trust-row,.choice-grid,.process{grid-template-columns:1fr}.trust-row{margin-top:1rem}.service-card{min-height:auto}.category-copy{padding:1.35rem}.topbar nav{display:none}}`,
`@media(max-width:768px){html{scroll-padding-top:145px}.contact-strip-inner{align-items:flex-start;flex-direction:column}.social-links{width:100%;justify-content:flex-start}.hero-inner{min-height:auto;grid-template-columns:1fr;padding:3rem 1rem}.callback-card{margin-top:.5rem}.hero::after{background:linear-gradient(180deg,rgba(7,19,39,.92),rgba(15,23,42,.82))}.hero h1{letter-spacing:0}.trust-row,.choice-grid,.process{grid-template-columns:1fr}.trust-row{margin-top:1rem}.service-card{min-height:auto}.category-copy{padding:1.35rem}.topbar nav{display:none}}`);

html = html.replace(`<header class="topbar">
    <div class="wrap flex items-center justify-between py-4">`,
`<header class="topbar">
    <div class="contact-strip">
      <div class="wrap contact-strip-inner">
        <div class="contact-line">
          <span>Speak to one of our expert intake consultants</span>
          <a href="tel:+442080500725">Call us on +44 (0)20 8050 0725</a>
        </div>
        <div class="social-links">
          <span>Follow us:</span>
          <a class="social-icon" href="https://www.facebook.com/profile.php?id=61575842262559" target="_blank" rel="noopener" aria-label="Quaerens on Facebook">f</a>
          <a class="social-icon" href="https://www.instagram.com/quaerens.ltd" target="_blank" rel="noopener" aria-label="Quaerens on Instagram">IG</a>
        </div>
      </div>
    </div>
    <div class="wrap flex items-center justify-between py-4">`);

const callbackCard = `
          <aside class="callback-card" aria-label="Request a call back">
            <h2>Request a call back</h2>
            <p>Leave your details and an intake consultant can help you understand the best starting point.</p>
            <form onsubmit="event.preventDefault(); alert('Thank you. This test callback panel is ready to connect to the CRM when approved.');">
              <label for="testCallbackName">Name</label>
              <input id="testCallbackName" name="name" type="text" autocomplete="name" placeholder="Your full name">
              <label for="testCallbackPhone">Phone</label>
              <input id="testCallbackPhone" name="phone" type="tel" autocomplete="tel" placeholder="Best number to call">
              <label for="testCallbackEmail">Email</label>
              <input id="testCallbackEmail" name="email" type="email" autocomplete="email" placeholder="you@example.com">
              <label for="testCallbackIssue">What do you need help with?</label>
              <select id="testCallbackIssue" name="issue">
                <option value="">Choose a topic</option>
                <option>Travel, flight or luggage issue</option>
                <option>Finance, bank or pension dispute</option>
                <option>Property, solar or timeshare issue</option>
                <option>Digital, cyber or platform issue</option>
                <option>Complaint letter or escalation</option>
              </select>
              <label for="testCallbackTime">Preferred callback time</label>
              <select id="testCallbackTime" name="preferred_time">
                <option>Any time today</option>
                <option>Morning</option>
                <option>Afternoon</option>
                <option>Tomorrow</option>
              </select>
              <button type="submit">Request Call Back</button>
              <p class="callback-note">Test page only: submissions are not connected until this version is approved.</p>
            </form>
          </aside>`;
html = html.replace(`          <div class="flex flex-wrap gap-3 mt-8">
            <a href="#free-tools" class="btn btn-blue">Explore free DIY tools</a>
            <a href="#guided-help" class="btn btn-ghost">See guided support</a>
          </div>
        </div>
      </div>`,
`          <div class="flex flex-wrap gap-3 mt-8">
            <a href="#free-tools" class="btn btn-blue">Explore free DIY tools</a>
            <a href="#guided-help" class="btn btn-ghost">See guided support</a>
          </div>
        </div>${callbackCard}
      </div>`);

fs.writeFileSync(out, html, 'utf8');
console.log('Rebuilt indexnewtest.html cleanly');
