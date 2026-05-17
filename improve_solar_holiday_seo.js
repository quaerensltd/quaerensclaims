const fs = require('fs');
const path = 'C:/Users/CasaT/quaerensclaims/public';

function replaceOnce(s, from, to, label) {
  if (!s.includes(from)) {
    console.log('Missing marker:', label);
    return s;
  }
  return s.replace(from, to);
}

function beforeFaq(s, html, label) {
  const marker = '<section class="section-wrap py-2"><div class="info-box fade-up"><p class="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-3">Frequently asked questions</p>';
  if (!s.includes(marker)) {
    console.log('Missing FAQ marker:', label);
    return s;
  }
  if (s.includes(label)) return s;
  return s.replace(marker, html + '\n' + marker);
}

function updateFile(file, updater) {
  const full = `${path}/${file}`;
  let s = fs.readFileSync(full, 'utf8');
  const before = s;
  s = updater(s);
  fs.writeFileSync(full, s, 'utf8');
  console.log(`${file}: ${before.length} -> ${s.length}`);
}

updateFile('solar-support.html', (s) => {
  s = replaceOnce(s,
    '<title>Solar Panel Mis-Selling Review | Evidence & Escalation Support | Quaerens</title>',
    '<title>Solar Panel Problems &amp; Mis-Selling | Free Case Review UK | Quaerens</title>',
    'solar title');
  s = s.replace(/<meta name="description" content="[^"]*" \/>/,
    '<meta name="description" content="Solar panels underperforming, badly installed, mis-sold or tied to unsuitable finance? Get a free case review with clear evidence, routes and next steps." />');
  s = replaceOnce(s,
    '<h1>Mis-Sold Solar Panels?</h1>',
    '<h1>Solar Panel Problems or Mis-Selling?</h1>',
    'solar h1');
  s = replaceOnce(s,
    '<h2 class="text-3xl font-extrabold text-gray-900 mb-4">Why you may be entitled to solar compensation</h2>',
    '<h2 class="text-3xl font-extrabold text-gray-900 mb-4">Reasons why you might be entitled to compensation for solar panel problems</h2>',
    'solar compensation heading');
  s = replaceOnce(s,
    '<h2 class="text-3xl font-extrabold text-gray-900 mb-6">Where Could Solar Compensation Be Sought From?</h2>',
    '<h2 class="text-3xl font-extrabold text-gray-900 mb-6">Where could solar compensation realistically be sought from?</h2>',
    'solar recovery heading');
  s = replaceOnce(s,
    '<h2 class="text-3xl font-extrabold text-gray-900 mb-4">What documents can help?</h2><ul class="space-y-4 text-gray-700"><li><strong>Contracts, terms or policy documents</strong><br>These help identify what was promised, agreed or relied on.</li><li><strong>Payment records and statements</strong><br>Receipts, charges, invoices and statements help show the value affected.</li><li><strong>Emails, messages and complaint replies</strong><br>Correspondence helps show what was reported, when and how it was answered.</li><li><strong>Screenshots, photos or supporting evidence</strong><br>Visual or supporting evidence can help clarify the issue.</li></ul>',
    '<h2 class="text-3xl font-extrabold text-gray-900 mb-4">What documents can help?</h2><ul class="space-y-4 text-gray-700"><li><strong>Sales paperwork, adverts and quotations</strong><br>These help compare promised savings, generation levels, warranties, grants or finance terms with what was actually delivered.</li><li><strong>Finance agreement, credit card records or loan documents</strong><br>Payment evidence can show whether a finance provider, lender or card provider may need to be approached as part of the recovery route.</li><li><strong>Installation records, MCS certificates and photos</strong><br>Certificates, handover documents, roof photos, inverter screenshots and installer reports can help show whether the system was installed and commissioned properly.</li><li><strong>Generation data, bills and complaint replies</strong><br>Energy bills, monitoring app screenshots, export records, emails and warranty responses help show the practical and financial impact.</li></ul>',
    'solar evidence list');
  const solarTimeline = `<section class="section-wrap py-6" data-seo-upgrade="solar-timeline"><div class="info-box fade-up"><p class="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-3">Evidence and escalation route</p><h2 class="text-3xl font-extrabold text-gray-900 mb-4">How a strong solar review is usually built</h2><p class="text-gray-700 mb-6">Solar panel disputes often involve several possible routes at the same time: the installer, the sales company, the finance provider, the warranty provider, the manufacturer, or a card provider. The strongest route depends on what was promised, how the system was paid for, what went wrong, and what evidence shows the financial loss.</p><div class="card-grid"><div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">1. Match the promise to the outcome</h3><p class="text-gray-700">A review should compare savings projections, generation estimates, warranty promises, finance explanations and installer statements against bills, monitoring data and real performance.</p></div><div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">2. Check payment and finance routes</h3><p class="text-gray-700">Where credit, point-of-sale finance or card payments were used, lender complaint routes, Section 75 arguments or Financial Ombudsman escalation may be relevant depending on the facts.</p></div><div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">3. Set out the loss clearly</h3><p class="text-gray-700">The file should separate repair costs, underperformance, failed equipment, unsuitable finance, lost savings and warranty failures so the complaint is not vague or easy to dismiss.</p></div></div><div class="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5"><h3 class="font-bold text-blue-950 mb-2">Typical escalation timeline</h3><p class="text-gray-700">A formal complaint is normally sent first to the business or finance provider. Where a regulated finance complaint is rejected or not answered within the required complaint period, escalation to the Financial Ombudsman Service may be considered. Quaerens can help organise the evidence and wording so each route is approached in a structured way.</p></div></div></section>`;
  s = beforeFaq(s, solarTimeline, 'data-seo-upgrade="solar-timeline"');
  const solarExamples = `<section class="section-wrap py-6" data-seo-upgrade="solar-examples"><div class="info-box soft-blue fade-up"><p class="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-3">Example solar situations</p><h2 class="text-3xl font-extrabold text-gray-900 mb-4">Realistic situations a solar review can clarify</h2><div class="card-grid"><div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">Savings did not match the sales pitch</h3><p class="text-gray-700">A homeowner was shown high savings and export-income projections, but bills and monitoring data later showed the system was producing far less than expected.</p></div><div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">Installer disappeared or refused support</h3><p class="text-gray-700">The installer stopped responding after faults appeared, leaving the homeowner with inverter errors, battery problems or roof-related issues and no clear warranty route.</p></div><div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">Finance terms were not properly explained</h3><p class="text-gray-700">The monthly repayments, total cost, suitability or cancellation rights were not clearly explained before signing, so the payment route and lender complaint position needed review.</p></div></div></div></section>`;
  s = beforeFaq(s, solarExamples, 'data-seo-upgrade="solar-examples"');
  return s;
});

updateFile('holidaypark.html', (s) => {
  s = replaceOnce(s,
    '<title>Holiday Park & Caravan Mis-Selling Review | Site Fees & Ownership Disputes | Quaerens</title>',
    '<title>Holiday Park &amp; Static Caravan Disputes | Free Case Review UK | Quaerens</title>',
    'holiday title');
  s = s.replace(/<meta name="description" content="[^"]*" \/>/,
    '<meta name="description" content="Holiday park, static caravan or lodge problems? Get a free review for mis-selling, site fees, resale restrictions, finance issues and poor park support." />');
  s = replaceOnce(s,
    '<h1>Mis-Sold a Caravan or Holiday Home?</h1>',
    '<h1>Holiday Park, Static Caravan or Lodge Dispute?</h1>',
    'holiday h1');
  s = s.replace(/Canâ€™t/g, "Can't");
  s = replaceOnce(s,
    '<h2 class="text-3xl font-extrabold text-gray-900 mb-4">Why you may be entitled to holiday park compensation</h2>',
    '<h2 class="text-3xl font-extrabold text-gray-900 mb-4">Reasons why you might be entitled to compensation in a holiday park dispute</h2>',
    'holiday compensation heading');
  const recovery = `<section class="section-wrap py-6" data-seo-upgrade="holiday-recovery"><div class="info-box fade-up"><p class="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-3">Evidence and recovery routes</p><h2 class="text-3xl font-extrabold text-gray-900 mb-4">Where could holiday park compensation realistically be sought from?</h2><p class="text-gray-700 mb-6">Holiday park disputes are not always only about the park operator. The realistic route can depend on who sold the caravan or lodge, who financed it, what was promised about income or resale, what was written in the pitch licence, and whether the owner was left with unexpected costs or restrictions.</p><div class="card-grid"><div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">Park operator or selling dealer</h3><p class="text-gray-700">Sales promises, misleading adverts, pitch fee explanations, facility standards, resale commission and upgrade pressure may point back to the park operator or dealer.</p></div><div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">Finance provider or card route</h3><p class="text-gray-700">Where finance, credit or card payments were used, the payment route may need reviewing alongside the sales documents and complaint history.</p></div><div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">Warranty, repair or facilities route</h3><p class="text-gray-700">Defective lodges, poor facilities, unresolved repairs, damp, drainage, access or safety concerns may need a separate evidence trail from the sales complaint.</p></div></div><div class="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5"><h3 class="font-bold text-blue-950 mb-2">Typical escalation timeline</h3><p class="text-gray-700">A strong file normally starts with a clear complaint to the correct business, supported by sales material, pitch terms, invoices, messages and photos. If finance was used, a separate lender complaint route may also be relevant. Quaerens can help organise the sequence so the issue is presented clearly rather than as a scattered set of complaints.</p></div></div></section>`;
  s = beforeFaq(s, recovery, 'data-seo-upgrade="holiday-recovery"');
  const examples = `<section class="section-wrap py-6" data-seo-upgrade="holiday-examples"><div class="info-box soft-blue fade-up"><p class="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-3">Example holiday park situations</p><h2 class="text-3xl font-extrabold text-gray-900 mb-4">Realistic situations a holiday park review can clarify</h2><div class="card-grid"><div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">Rental income was overstated</h3><p class="text-gray-700">An owner was told the caravan or lodge could largely pay for itself, but occupancy, commission, cleaning costs and park restrictions made the figures unrealistic.</p></div><div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">Exit or resale became difficult</h3><p class="text-gray-700">Age limits, park commission, approved-buyer rules or pitch licence restrictions made it much harder to sell or leave than the owner understood at purchase.</p></div><div class="feature-card"><h3 class="font-bold text-lg mb-2 text-blue-900">Costs changed after purchase</h3><p class="text-gray-700">Pitch fees, service charges, upgrade pressure, repair costs or finance repayments increased the financial burden beyond what was explained during the sales process.</p></div></div></div></section>`;
  s = beforeFaq(s, examples, 'data-seo-upgrade="holiday-examples"');
  return s;
});
