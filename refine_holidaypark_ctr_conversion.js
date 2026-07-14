const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'public', 'holidaypark.html');
let html = fs.readFileSync(file, 'utf8');

const title = 'Mis-Sold Static Caravan Review, Site Fees & Holiday Park Disputes | Quaerens';
const description = 'Bought a static caravan or holiday lodge after misleading promises about rental income, resale value, site fees or finance? Get a free, no-obligation Quaerens assessment of your documents, losses and possible complaint routes.';

const faqs = [
  {
    q: 'Can rental income promises be reviewed?',
    a: 'They may be relevant where the sales material, emails, figures or verbal explanations suggested that rental income would cover finance, site fees or running costs, but the documents and later figures show a different picture.'
  },
  {
    q: 'Can rising site fees be part of the assessment?',
    a: 'Yes. Pitch fees, service charges, maintenance costs, utilities, commission and annual increases can all be relevant if they were not clearly explained or if they changed the affordability of the purchase.'
  },
  {
    q: 'Do resale restrictions matter?',
    a: 'They can. Park approval rules, commission, age limits, private-sale restrictions, removal costs and low resale values can affect whether the original sales explanation was fair and complete.'
  },
  {
    q: 'Can finance complaints be considered?',
    a: 'Finance may be relevant where affordability, commission, sales promises, rental-income assumptions or the full cost of ownership were not properly explained before the agreement was signed.'
  },
  {
    q: 'Could Section 75 apply to a holiday park purchase?',
    a: 'Section 75 may be worth considering where a qualifying credit card payment was used, but it depends on the payment structure, contract value, parties involved and evidence. It is not automatic.'
  },
  {
    q: 'What if I was pressured to upgrade or replace the caravan?',
    a: 'Upgrade pressure can be relevant where age rules, park standards, resale restrictions or site terms were not made clear before purchase or were later used to create unexpected cost pressure.'
  },
  {
    q: 'Do verbal promises count?',
    a: 'Verbal promises are harder to prove on their own, but they may still matter if supported by brochures, emails, messages, witnesses, handwritten notes, finance assumptions or later conduct by the seller or park.'
  },
  {
    q: 'Are there time limits?',
    a: 'There can be time limits for complaints, finance routes, card routes and court action. Dates matter, so it is important to keep purchase documents, complaint dates and final responses together.'
  },
  {
    q: 'Does Quaerens guarantee a refund, exit or compensation?',
    a: 'No. Quaerens provides a preliminary assessment, document organisation and practical dispute support. Outcomes depend on the facts, evidence, contracts, finance position, dates and available routes.'
  }
];

function replaceOrInsert(pattern, replacement) {
  html = html.replace(pattern, replacement);
}

replaceOrInsert(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
replaceOrInsert(/<meta name="description" content="[^"]*"\s*\/?>/i, `<meta name="description" content="${description}" />`);
replaceOrInsert(/<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
replaceOrInsert(/<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${description}" />`);
replaceOrInsert(/<meta name="twitter:title" content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${title}" />`);
replaceOrInsert(/<meta name="twitter:description" content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${description}" />`);

replaceOrInsert(
  /<script type="application\/ld\+json">\s*\{[\s\S]*?"@type":"Service"[\s\S]*?<\/script>/i,
  `<script type="application/ld+json">
  {"@context":"https://schema.org","@type":"Service","name":"Mis-Sold Static Caravan and Holiday Park Document Assessment","provider":{"@type":"Organization","name":"Quaerens Ltd.","url":"https://www.quaerens.co.uk"},"areaServed":["United Kingdom"],"description":"Free initial document assessment and structured evidence support for static caravan, holiday lodge and holiday park disputes involving rental income promises, resale value, site fees, finance, upgrade pressure and possible complaint routes.","url":"https://www.quaerens.co.uk/holidaypark.html"}
  </script>`
);

const mainContent = `
  <section class="hero-section">
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <div class="hero-inner">
        <div class="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm font-medium mb-6"><span>Static caravan, lodge and holiday park assessment</span></div>
        <h1>Mis-Sold Static Caravan or Holiday Lodge?</h1>
        <p>If you bought after promises about rental income, resale value, site fees, finance, easy-exit options or affordable ownership that did not match reality, Quaerens can carry out a free initial assessment of your documents and possible complaint routes.</p>
        <div class="hero-checklist">
          <span>✓ <strong>Rental income promises</strong> that did not cover finance, fees, commission or running costs</span>
          <span>✓ <strong>Resale or easy-exit claims</strong> that later proved restricted, costly or unrealistic</span>
          <span>✓ <strong>Site fees and finance</strong> that made ownership more expensive than explained</span>
          <span>✓ <strong>Upgrade, age-limit or removal pressure</strong> that created unexpected costs</span>
        </div>
        <div class="flex flex-wrap items-center gap-4 mt-8">
          <a href="#request-assessment" class="cta-button cta-primary">Request My Free Assessment</a>
          <a href="#evidence" class="cta-button cta-secondary">See What Evidence Helps</a>
        </div>
        <div class="quick-panel" aria-label="Free initial assessment">
          <p class="font-extrabold text-lg" style="color:#0f172a !important;">Free initial assessment</p>
          <ul>
            <li>✓ No obligation to proceed after we review the initial information</li>
            <li>✓ We explain what evidence is strong, missing or unclear</li>
            <li>✓ We do not promise a refund, exit or compensation outcome</li>
            <li>✓ Quaerens is not a law firm and does not provide legal advice</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="section-wrap -mt-10 relative z-10">
    <div class="info-box soft-blue fade-up">
      <div class="trust-strip">
        <div class="trust-pill"><div class="text-2xl mb-2">&#128221;</div><p class="font-semibold text-blue-900 mb-1">Free assessment</p><p class="text-sm text-gray-600">A first look at documents, loss points and possible routes.</p></div>
        <div class="trust-pill"><div class="text-2xl mb-2">&#128274;</div><p class="font-semibold text-blue-900 mb-1">Secure handling</p><p class="text-sm text-gray-600">Your documents and callback details are handled securely.</p></div>
        <div class="trust-pill"><div class="text-2xl mb-2">&#128269;</div><p class="font-semibold text-blue-900 mb-1">Evidence gaps</p><p class="text-sm text-gray-600">We explain what is missing before you escalate.</p></div>
        <div class="trust-pill"><div class="text-2xl mb-2">&#9888;</div><p class="font-semibold text-blue-900 mb-1">Clear limits</p><p class="text-sm text-gray-600">We are not a law firm and do not provide legal advice.</p></div>
      </div>
    </div>
  </section>

  <section id="common-problems" class="section-wrap py-6">
    <div class="info-box fade-up">
      <p class="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-3">Common problems</p>
      <h2 class="text-3xl font-extrabold text-gray-900 mb-4">Where holiday park ownership often goes wrong</h2>
      <p class="text-gray-700 mb-6">Many disputes are not about one isolated issue. They often involve a combination of sales promises, licence terms, finance, site fees and later restrictions.</p>
      <div class="card-grid">
        <div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">Rental income did not match the sales pitch</h3><p class="text-gray-700">Projected income may not account for commission, cleaning, seasonality, park restrictions, finance payments or site fees.</p></div>
        <div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">Resale value or exit was overstated</h3><p class="text-gray-700">Some owners later discover age limits, park approval rules, commission, private-sale restrictions or removal costs.</p></div>
        <div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">Site fees became difficult to afford</h3><p class="text-gray-700">Pitch fees, service charges, utilities, insurance, maintenance and annual increases can change the affordability picture.</p></div>
        <div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">Finance or upgrade pressure created risk</h3><p class="text-gray-700">Finance agreements, upgrade offers, age rules and pressure to sign quickly can all be relevant to a preliminary assessment.</p></div>
      </div>
    </div>
  </section>

  <section class="authority-visual-section fade-up" aria-label="Holiday park ownership concerns visual">
    <figure class="authority-visual-card">
      <img src="/images/cred-car1.jpg" width="900" height="675" alt="Infographic comparing expected holiday park ownership with rising pitch fees, resale difficulty, finance pressure and unexpected charges" loading="lazy" decoding="async" style="max-width:100%; height:auto;" />
      <figcaption class="authority-visual-caption">Expected versus actual holiday park ownership concerns.</figcaption>
    </figure>
  </section>

  <section id="financial-loss" class="section-wrap py-6">
    <div class="info-box soft-blue fade-up">
      <p class="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-3">Possible financial loss</p>
      <h2 class="text-3xl font-extrabold text-gray-900 mb-4">What Financial Loss Could Be Relevant?</h2>
      <p class="text-gray-700 mb-6">A preliminary assessment should identify the losses being suggested and the documents that support them. Not all losses are recoverable, and some may be too remote, unsupported or outside a practical complaint route.</p>
      <div class="card-grid">
        <div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">Purchase and finance costs</h3><p class="text-gray-700">Purchase price, deposit, finance repayments, interest, settlement figures and broker or dealer paperwork.</p></div>
        <div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">Site fees and running costs</h3><p class="text-gray-700">Pitch fees, utilities, insurance, maintenance, service charges, commission, cleaning and winterisation costs.</p></div>
        <div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">Resale loss or reduced value</h3><p class="text-gray-700">Valuations, offers, park commission, age rules, approved-buyer rules and evidence of resale restrictions.</p></div>
        <div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">Promised rental income</h3><p class="text-gray-700">Rental projections, occupancy assumptions, actual rental statements, commission deductions and booking restrictions.</p></div>
        <div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">Upgrade, removal or exit costs</h3><p class="text-gray-700">Upgrade pressure, disconnection, transport, removal, repairs, pitch reinstatement and exit administration costs.</p></div>
        <div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">Other documented losses</h3><p class="text-gray-700">Complaint costs, professional reports, repair evidence or other losses that are clearly linked and documented.</p></div>
      </div>
      <div class="mt-6 rounded-2xl bg-white border border-blue-100 p-5">
        <p class="font-bold text-blue-900 mb-2">Important caution</p>
        <p class="text-gray-700">A loss being frustrating or real does not automatically mean it can be recovered. The route depends on the contract, evidence, dates, finance position, representations made and the response from the park, seller or lender.</p>
      </div>
    </div>
  </section>

  <section id="evidence" class="section-wrap py-6">
    <div class="info-box fade-up">
      <p class="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-3">Evidence to gather</p>
      <h2 class="text-3xl font-extrabold text-gray-900 mb-4">Documents that make the assessment clearer</h2>
      <div class="grid md:grid-cols-2 gap-8">
        <ul class="space-y-4 text-gray-700">
          <li><strong>Sales material:</strong> brochures, adverts, emails, messages, handwritten notes and rental-income illustrations.</li>
          <li><strong>Purchase and pitch documents:</strong> purchase agreement, pitch licence, site rules, age rules, commission terms and park handbook.</li>
          <li><strong>Finance and payment records:</strong> finance agreement, deposit records, card payments, settlement figures and affordability information.</li>
          <li><strong>Costs and losses:</strong> pitch fee invoices, utility bills, maintenance charges, rental statements, resale offers and upgrade/removal quotes.</li>
        </ul>
        <div class="feature-card">
          <h3 class="font-bold text-lg mb-2 text-blue-900">Build a simple timeline</h3>
          <p class="text-gray-700 mb-4">Put the documents in date order: sales meeting, reservation, finance, pitch agreement, first fee increase, complaint, park response and any resale or exit attempt.</p>
          <a href="/knowledge-how-to-write-complaint-timeline.html" class="text-blue-700 font-bold">Open the complaint timeline guide</a>
        </div>
      </div>
    </div>
  </section>

  <section class="authority-visual-section fade-up" aria-label="Holiday park cost visual">
    <figure class="authority-visual-card">
      <img src="/images/cred-car9.jpg" width="900" height="675" alt="Holiday park fee breakdown showing pitch fees, utilities, insurance, maintenance, admin fees and transfer fees" loading="lazy" decoding="async" style="max-width:100%; height:auto;" />
      <figcaption class="authority-visual-caption">Common holiday park fees and charges owners should understand.</figcaption>
    </figure>
  </section>

  <section id="review-process" class="section-wrap py-6">
    <div class="info-box soft-blue fade-up">
      <p class="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-3">How the review works</p>
      <h2 class="text-3xl font-extrabold text-gray-900 mb-6">A practical 3-step preliminary assessment</h2>
      <div class="card-grid">
        <div class="feature-card"><div class="step-badge">1</div><h3 class="text-xl font-bold mb-2">Send the key documents</h3><p class="text-gray-700">Start with the purchase documents, finance records, pitch terms, fee history and any sales or complaint correspondence.</p></div>
        <div class="feature-card"><div class="step-badge">2</div><h3 class="text-xl font-bold mb-2">We organise the evidence</h3><p class="text-gray-700">Quaerens helps identify the main issues, evidence gaps, timeline and possible complaint routes.</p></div>
        <div class="feature-card"><div class="step-badge">3</div><h3 class="text-xl font-bold mb-2">You receive a clearer next step</h3><p class="text-gray-700">The assessment explains whether structured support appears appropriate. It does not guarantee a refund, claim or outcome.</p></div>
      </div>
    </div>
  </section>

  <section id="examples" class="section-wrap py-6">
    <div class="info-box fade-up">
      <p class="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-3">Example situations</p>
      <h2 class="text-3xl font-extrabold text-gray-900 mb-4">Anonymised situations a review can clarify</h2>
      <div class="card-grid">
        <div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">Rental income assumptions</h3><p class="text-gray-700">An owner bought after being shown rental income figures. The assessment would compare those figures with actual rental statements, commission deductions, booking restrictions, pitch fees and finance repayments. No outcome is assumed.</p></div>
        <div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">Resale and exit restrictions</h3><p class="text-gray-700">An owner tried to sell but found park approval, commission, age limits and removal costs made exit difficult. The assessment would organise the pitch licence, park rules, resale offers and complaint replies. No result is promised.</p></div>
      </div>
    </div>
  </section>

  <section id="routes" class="section-wrap py-6">
    <div class="info-box soft-blue fade-up">
      <p class="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-3">Complaint and escalation routes</p>
      <h2 class="text-3xl font-extrabold text-gray-900 mb-4">Which route may need looking at?</h2>
      <p class="text-gray-700 mb-6">A holiday park issue may involve more than one route. The correct route depends on who made the promise, who took payment, who provided finance and what the written terms say.</p>
      <div class="card-grid">
        <div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">Park operator or selling dealer</h3><p class="text-gray-700">Sales promises, pitch terms, resale rules, facility standards, upgrade pressure and complaint replies.</p></div>
        <div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">Finance provider or lender</h3><p class="text-gray-700">Affordability, commission, finance explanations, rental-income assumptions and linked sales information.</p></div>
        <div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">Card or payment route</h3><p class="text-gray-700">Section 75 or chargeback may be worth checking where card payments were used, but eligibility depends on the facts.</p></div>
        <div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">Formal complaint escalation</h3><p class="text-gray-700">A clearer complaint pack can help if the park, seller or finance provider has ignored or only partly answered the issue.</p></div>
      </div>
    </div>
  </section>

  <section id="official-guidance" class="section-wrap py-6">
    <div class="info-box fade-up">
      <p class="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-3">Official guidance</p>
      <h2 class="text-3xl font-extrabold text-gray-900 mb-4">Useful official UK reference points</h2>
      <p class="text-gray-700 mb-6">These sources are not a substitute for advice, but they help frame consumer, finance and complaint issues in a reliable way.</p>
      <div class="card-grid">
        <a href="https://www.gov.uk/consumer-protection-rights" target="_blank" rel="noopener" class="feature-card block hover:border-blue-300 transition"><h3 class="font-bold text-lg text-blue-900 mb-2">GOV.UK consumer protection rights</h3><p class="text-gray-700">General UK consumer rights and protection information.</p></a>
        <a href="https://www.fca.org.uk/consumers" target="_blank" rel="noopener" class="feature-card block hover:border-blue-300 transition"><h3 class="font-bold text-lg text-blue-900 mb-2">Financial Conduct Authority consumer information</h3><p class="text-gray-700">Useful where finance, credit or affordability issues may be involved.</p></a>
        <a href="https://www.financial-ombudsman.org.uk/consumers/how-to-complain" target="_blank" rel="noopener" class="feature-card block hover:border-blue-300 transition"><h3 class="font-bold text-lg text-blue-900 mb-2">Financial Ombudsman complaint guidance</h3><p class="text-gray-700">Complaint route information where a regulated financial business is involved.</p></a>
      </div>
    </div>
  </section>

  <section id="faqs" class="section-wrap py-2">
    <div class="info-box fade-up">
      <p class="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-3">Frequently asked questions</p>
      <h2 class="text-3xl font-extrabold text-gray-900 mb-6">Common questions about static caravan and holiday lodge disputes</h2>
      <div class="space-y-4">
        ${faqs.map(({q, a}) => `<div class="faq-item"><button class="faq-button" type="button"><span>${q}</span><span class="faq-icon">+</span></button><div class="faq-content">${a}</div></div>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="section-wrap py-6">
    <div class="rounded-3xl bg-blue-800 text-white text-center py-12 px-6 shadow-xl fade-up">
      <p class="text-sm font-semibold uppercase tracking-wide text-blue-200 mb-3">Final assessment step</p>
      <h2 class="text-3xl md:text-4xl font-extrabold mb-4">Request My Free Assessment</h2>
      <p class="text-blue-100 max-w-2xl mx-auto mb-8 text-lg">Send a short summary and the key documents. We will explain whether structured review support appears appropriate, what evidence gaps remain and which complaint routes may need considering.</p>
      <a href="#request-assessment" class="inline-block px-8 py-4 bg-white text-blue-800 font-bold rounded-full shadow-md hover:bg-gray-100 transition">Request My Free Assessment</a>
      <p class="text-sm mt-5 text-blue-100">Quaerens provides preliminary assessment, evidence organisation and document support. We do not provide legal advice and do not guarantee outcomes.</p>
    </div>
  </section>
`;

const start = html.indexOf('  <section class="hero-section">');
const callback = html.indexOf('  <section class="section-wrap py-6 quaerens-site-callback"');
if (start === -1 || callback === -1 || callback <= start) {
  throw new Error('Could not find expected hero-to-callback region.');
}
html = html.slice(0, start) + mainContent + html.slice(callback);

const callbackStart = html.indexOf('  <section class="section-wrap py-6 quaerens-site-callback"');
const relatedStart = html.indexOf('  <section class="section-wrap py-6" data-internal-links="true"', callbackStart);
if (callbackStart === -1 || relatedStart === -1) {
  throw new Error('Could not find callback section bounds.');
}

const callbackSection = `
  <section id="request-assessment" class="section-wrap py-6 quaerens-site-callback" data-callback-page="holidaypark.html">
    <div class="info-box soft-blue fade-up">
      <div class="grid md:grid-cols-2 gap-8 items-start">
        <div>
          <img src="images/callback-office-team.jpg" width="900" height="506" alt="Quaerens assessment team ready to discuss holiday park documents" class="w-full h-40 md:h-44 object-cover object-top rounded-2xl shadow-sm border border-blue-100 mb-6" loading="lazy" decoding="async" />
          <p class="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-3">Free initial assessment</p>
          <h2 class="text-3xl font-extrabold text-gray-900 mb-4">Request a free holiday park document assessment</h2>
          <p class="text-gray-700 mb-4">If you are unsure which documents matter or whether the issue fits, leave your details and our intake team can call you back.</p>
          <div class="feature-card mb-4">
            <ul class="space-y-3 text-gray-700">
              <li><strong>Free initial assessment</strong></li>
              <li><strong>No obligation to proceed</strong></li>
              <li><strong>Clear explanation of evidence gaps</strong></li>
              <li><strong>Secure document handling</strong></li>
              <li><strong>Quaerens is not a law firm and does not provide legal advice</strong></li>
            </ul>
          </div>
          <p class="quaerens-save-number-note text-sm font-semibold text-blue-900 bg-white border border-blue-200 rounded-2xl p-4 mb-4">Please save our number as Quaerens before requesting a call back, so you will recognise our calls. In the UK, save it as <a href="tel:02080500725" class="text-blue-700 font-extrabold no-underline">020 8050 0725</a>. Outside the UK, save it as <a href="tel:+442080500725" class="text-blue-700 font-extrabold no-underline">+44 20 8050 0725</a>.</p>
          <p class="text-sm text-gray-600">This first discussion is for information gathering and route clarity. It is not legal advice.</p>
        </div>
        <form class="quaerens-callback-form bg-white rounded-2xl shadow-lg border border-blue-100 p-6 space-y-4" data-callback-issue="Holiday Park Free Assessment" data-callback-page="holidaypark.html">
          <input type="hidden" name="issue" value="Holiday Park Free Assessment">
          <div>
            <label class="block font-semibold text-gray-900 mb-2">Name</label>
            <input name="name" type="text" autocomplete="name" class="w-full border border-gray-300 p-3 rounded-xl" required>
          </div>
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-semibold text-gray-900 mb-2">Phone</label>
              <input name="phone" type="tel" autocomplete="tel" class="w-full border border-gray-300 p-3 rounded-xl" required>
            </div>
            <div>
              <label class="block font-semibold text-gray-900 mb-2">Email optional</label>
              <input name="email" type="email" autocomplete="email" class="w-full border border-gray-300 p-3 rounded-xl">
            </div>
          </div>
          <div>
            <label class="block font-semibold text-gray-900 mb-2">Preferred time</label>
            <select name="preferred_time" class="w-full border border-gray-300 p-3 rounded-xl">
              <option>Any time today</option>
              <option>Morning</option>
              <option>Afternoon</option>
              <option>Tomorrow</option>
              <option>This week</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-gray-900 mb-2">Short message optional</label>
            <textarea name="message" rows="3" class="w-full border border-gray-300 p-3 rounded-xl" placeholder="A few words about the caravan, lodge, site fees, finance or resale issue"></textarea>
          </div>
          <p class="quaerens-secure-note text-xs text-gray-600 mt-3">&#128274; Your details are encrypted in transit and handled securely.</p>
          <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-full transition">Request My Free Assessment</button>
          <p class="quaerens-callback-message hidden text-sm font-semibold mt-3"></p>
        </form>
      </div>
    </div>
  </section>

  <section class="section-wrap py-6" data-internal-links="true">
    <div class="info-box soft-blue fade-up">
      <p class="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-3">Related guidance</p>
      <h2 class="text-3xl font-extrabold text-gray-900 mb-4">Helpful evidence guides for this issue</h2>
      <div class="grid md:grid-cols-2 gap-4">
        <a href="guidance-mis-sold-static-caravan-evidence.html" class="feature-card block hover:border-blue-300 transition"><h3 class="font-bold text-lg text-blue-900 mb-2">Mis-sold static caravan evidence checklist</h3><p class="text-gray-700">Organise sales promises, pitch terms, finance records, rental income claims and park replies before choosing the next route.</p></a>
        <a href="guidance-holiday-park-pitch-fees.html" class="feature-card block hover:border-blue-300 transition"><h3 class="font-bold text-lg text-blue-900 mb-2">Holiday park pitch fee evidence guide</h3><p class="text-gray-700">See which fee notices, invoices, agreement terms and complaint replies can help before you submit or escalate a review.</p></a>
        <a href="knowledge-how-caravan-agreements-work.html" class="feature-card block hover:border-blue-300 transition"><h3 class="font-bold text-lg text-blue-900 mb-2">How caravan and holiday park agreements work</h3><p class="text-gray-700">A plain-English explanation of pitch licences, resale terms, site rules and costs.</p></a>
        <a href="knowledge-what-are-holiday-park-pitch-fees.html" class="feature-card block hover:border-blue-300 transition"><h3 class="font-bold text-lg text-blue-900 mb-2">What holiday park pitch fees usually cover</h3><p class="text-gray-700">Understand pitch fees, extra charges and evidence to keep when costs are disputed.</p></a>
      </div>
    </div>
  </section>
`;

html = html.slice(0, callbackStart) + callbackSection + html.slice(relatedStart);

// Remove duplicated old related section and invalid SEO block appended after the document.
html = html.replace(/<!-- seo-phase-one-related:start -->[\s\S]*?<!-- seo-phase-one-related:end -->/g, '');

// Keep only one visible phone-save note: the one in the callback copy.
let seenPhoneNote = false;
html = html.replace(/<p class="quaerens-save-number-note[\s\S]*?<\/p>/g, (match) => {
  if (seenPhoneNote) return '';
  seenPhoneNote = true;
  return match;
});

html = html.replace(/Start Review/g, 'Request My Free Assessment');
html = html.replace(/Submit Your Information/g, 'Request My Free Assessment');
html = html.replace(/Check Your Case/g, 'Free Assessment');
html = html.replace(/Check Your Review Potential/g, 'Check Assessment Potential');
html = html.replace(/Check Review Potential/g, 'Check Assessment Potential');

html = html.replace(
  /setCallbackMessage\(form, "Thank you\.[\s\S]*?", false\);/,
  'setCallbackMessage(form, "Thank you. Your free assessment request has been sent to our intake team.", false);'
);
html = html.replace(/button\.textContent = "Request Call Back";/g, 'button.textContent = "Request My Free Assessment";');

// Fix Greek label if any encoded variant appears.
html = html.replace(/<option value="el">[^<]*<\/option>/, '<option value="el">Greek</option>');

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({q, a}) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: {'@type': 'Answer', text: a}
  })),
  url: 'https://www.quaerens.co.uk/holidaypark.html'
};

const faqScript = `<script type="application/ld+json" data-seo-faq="true">${JSON.stringify(faqSchema)}</script>`;
if (/<script type="application\/ld\+json" data-seo-faq="true">[\s\S]*?<\/script>/.test(html)) {
  html = html.replace(/<script type="application\/ld\+json" data-seo-faq="true">[\s\S]*?<\/script>/, faqScript);
} else {
  html = html.replace('</body>', `${faqScript}\n</body>`);
}

// Add dimensions to key remaining images where they lack them.
html = html.replace(/<img src="images\/logo-caravan\.png" alt="Quaerens holiday park and caravan support logo" class="h-16 md:h-20 w-auto">/, '<img src="images/logo-caravan.png" width="340" height="132" alt="Quaerens holiday park and caravan support logo" class="h-16 md:h-20 w-auto">');
html = html.replace(/<img src="images\/homebutton\.png" alt="Return to Quaerens home" class="h-10 w-auto hover:opacity-80 transition" \/>/, '<img src="images/homebutton.png" width="92" height="40" alt="Return to Quaerens home" class="h-10 w-auto hover:opacity-80 transition" />');

// Ensure the invalid after-document SEO block is gone and trim extra blank lines.
html = html.replace(/<\/html>[\s\S]*$/i, '</html>\n');
html = html.replace(/[ \t]+(?=\r?\n)/g, '');

fs.writeFileSync(file, html, 'utf8');
console.log('Refined holidaypark.html for CTR, clarity and conversion.');
