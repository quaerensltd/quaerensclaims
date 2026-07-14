const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

function p(file) {
  return path.join(publicDir, file);
}

function exists(file) {
  return fs.existsSync(p(file));
}

function read(file) {
  return fs.readFileSync(p(file), 'utf8');
}

function write(file, html) {
  fs.writeFileSync(p(file), html.replace(/[ \t]+(?=\r?\n)/g, ''), 'utf8');
}

function updateMeta(file, title, description) {
  let html = read(file);
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  html = html.replace(/[\r\n ]*<meta\s+name=["']description["'][^>]*>\s*/gi, '\n');
  html = html.replace(/[\r\n ]*<meta\s+content=["'][^"']*["']\s+name=["']description["'][^>]*>\s*/gi, '\n');
  html = html.replace(/<\/title>/i, `</title>\n  <meta name="description" content="${description}" />`);
  html = html.replace(/<meta\s+property=["']og:title["']\s+content=["'][^"']*["']\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
  html = html.replace(/<meta\s+property=["']og:description["']\s+content=["'][^"']*["']\s*\/?>/i, `<meta property="og:description" content="${description}" />`);
  html = html.replace(/<meta\s+name=["']twitter:title["']\s+content=["'][^"']*["']\s*\/?>/i, `<meta name="twitter:title" content="${title}" />`);
  html = html.replace(/<meta\s+name=["']twitter:description["']\s+content=["'][^"']*["']\s*\/?>/i, `<meta name="twitter:description" content="${description}" />`);
  write(file, html);
}

function replaceFirst(file, search, replacement) {
  let html = read(file);
  if (!html.includes(search)) return false;
  html = html.replace(search, replacement);
  write(file, html);
  return true;
}

function stripBlock(html, marker) {
  const re = new RegExp(`\\n?\\s*<!-- ${marker}:start -->[\\s\\S]*?<!-- ${marker}:end -->\\s*\\n?`, 'g');
  return html.replace(re, '\n');
}

function insertBefore(file, needle, block, marker) {
  let html = read(file);
  html = stripBlock(html, marker);
  const index = html.indexOf(needle);
  html = index === -1 ? `${html}\n${block}` : `${html.slice(0, index)}${block}\n${html.slice(index)}`;
  write(file, html);
}

function featureBlock({marker, eyebrow, title, intro, cards}) {
  return `
<!-- ${marker}:start -->
<section class="section-wrap py-6" data-gsc-quick-win="true">
  <div class="info-box soft-blue fade-up">
    <p class="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-3">${eyebrow}</p>
    <h2 class="text-3xl font-extrabold text-gray-900 mb-4">${title}</h2>
    <p class="text-gray-700 mb-6">${intro}</p>
    <div class="card-grid">
${cards.map((card) => `      <div class="feature-card">
        <h3 class="font-bold text-lg mb-2 text-blue-900">${card[0]}</h3>
        <p class="text-gray-700">${card[1]}</p>
      </div>`).join('\n')}
    </div>
  </div>
</section>
<!-- ${marker}:end -->`;
}

function linkBlock({marker, eyebrow, title, intro, links}) {
  return `
<!-- ${marker}:start -->
<section class="section-wrap py-6" data-gsc-quick-win-links="true">
  <div class="info-box soft-blue fade-up">
    <p class="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-3">${eyebrow}</p>
    <h2 class="text-3xl font-extrabold text-gray-900 mb-4">${title}</h2>
    <p class="text-gray-700 mb-6">${intro}</p>
    <div class="card-grid">
${links.filter((link) => exists(link[0])).map((link) => `      <a href="/${link[0]}" class="feature-card block hover:border-blue-300 transition">
        <h3 class="font-bold text-lg text-blue-900 mb-2">${link[1]}</h3>
        <p class="text-gray-700">${link[2]}</p>
      </a>`).join('\n')}
    </div>
  </div>
</section>
<!-- ${marker}:end -->`;
}

const metaUpdates = [
  ['airbnb-refunds.html', 'Airbnb Refund Refused? Booking Problem Evidence Guide | Quaerens', 'Airbnb refund refused, cancelled stay or misleading listing? See what evidence to keep and how to organise a clearer booking dispute.'],
  ['guidance-section-75-evidence.html', 'Section 75 Evidence Checklist: Documents for a Claim | Quaerens', 'Section 75 claim evidence checklist: credit card statement, contract, supplier messages, refund request, timeline and card provider response.'],
  ['freeflightclaim.html', 'Flight Delay Compensation Letter Template | Free Tool | Quaerens', 'Free flight delay compensation letter tool. Prepare airline complaint wording with flight details, delay evidence and passenger information.'],
  ['lost-luggage.html', 'Lost Luggage Compensation Guide & Free Letter Tool | Quaerens', 'Lost luggage compensation guide and free letter tool. Organise baggage reference, receipts, flight details and airline replies.'],
  ['misssold-bankaccounts.html', 'Mis-Sold Packaged Bank Account Refund Guide | Quaerens', 'Mis-sold fee-paying bank account? Organise charges, benefits, statements and complaint evidence before requesting a refund review.'],
  ['holidaypark.html', 'Mis-Sold Static Caravan, Finance & Holiday Park Disputes | Quaerens', 'Mis-sold static caravan or holiday park finance dispute? Organise pitch fees, resale, income promises, finance evidence and park replies.'],
  ['foam-insulation.html', 'Spray Foam Removal Cost, Mortgage & Mis-Selling Help | Quaerens', 'Spray foam removal cost, mortgage refusal or survey concern? Organise installer paperwork, lender comments, photos and removal quotes.']
];

for (const [file, title, description] of metaUpdates) {
  if (exists(file)) updateMeta(file, title, description);
}

replaceFirst(
  'airbnb-refunds.html',
  '<h1>Airbnb Stay Gone Wrong?</h1>',
  '<h1>Airbnb Refund Refused or Booking Gone Wrong?</h1>'
);
replaceFirst(
  'guidance-section-75-evidence.html',
  '<h1>Section 75 Claim Evidence: What Should You Gather?</h1>',
  '<h1>Section 75 Evidence Checklist: Documents for a Claim</h1>'
);
replaceFirst(
  'freeflightclaim.html',
  '<h1 class="text-4xl sm:text-5xl font-extrabold leading-tight mb-5">Claim flight delay compensation without giving away a percentage</h1>',
  '<h1 class="text-4xl sm:text-5xl font-extrabold leading-tight mb-5">Free Flight Delay Compensation Letter Template</h1>'
);
replaceFirst(
  'lost-luggage.html',
  '<h1>Lost or Delayed Luggage? Claim Your Compensation</h1>',
  '<h1>Lost Luggage Compensation Guide and Free Letter Tool</h1>'
);
replaceFirst(
  'misssold-bankaccounts.html',
  '<h1>Were You Mis-Sold a Packaged Bank Account?</h1>',
  '<h1>Mis-Sold Packaged Bank Account Refund Guide</h1>'
);

if (exists('airbnb-refunds.html')) {
  insertBefore('airbnb-refunds.html', '<h2 class="text-3xl font-extrabold text-gray-900 mb-4">Request a call back about Airbnb Refund Dispute Review</h2>', featureBlock({
    marker: 'gsc-airbnb-refund-intent',
    eyebrow: 'Airbnb refund evidence',
    title: 'What to keep when an Airbnb refund is refused',
    intro: 'Google is already showing this page for Airbnb refund and booking problem searches. This section makes the answer clearer for visitors before they request help.',
    cards: [
      ['Booking and payment proof', 'Keep the reservation, cancellation policy, payment receipt, refund request and any Airbnb case or support reference.'],
      ['Listing and condition evidence', 'Save screenshots of the listing, photos or videos of the accommodation, host messages and anything showing the stay did not match what was promised.'],
      ['Platform response timeline', 'Put Airbnb replies, host replies and escalation messages in date order so the dispute shows what was reported, when, and what outcome was offered.']
    ]
  }), 'gsc-airbnb-refund-intent');
}

if (exists('guidance-section-75-evidence.html')) {
  insertBefore('guidance-section-75-evidence.html', '<h2>Confirm the payment route first</h2>', `
<!-- gsc-section75-answer:start -->
          <div class="note" data-gsc-quick-win="true"><strong>Short answer:</strong> for a Section 75 claim, start with the credit card statement, contract or invoice, proof of what the supplier promised, proof of what went wrong, your refund request, supplier replies and any card provider response. A clear timeline can be just as important as the documents themselves.</div>
<!-- gsc-section75-answer:end -->`, 'gsc-section75-answer');
  insertBefore('guidance-section-75-evidence.html', '<section class="faq">', featureBlock({
    marker: 'gsc-section75-snippet-match',
    eyebrow: 'Section 75 documents',
    title: 'The documents most Section 75 searches are really asking for',
    intro: 'This page already ranks well, so the aim is to make the answer instantly clear for people searching for Section 75 evidence and credit card claim documents.',
    cards: [
      ['Payment documents', 'Credit card statement, deposit receipt, full contract value and any finance or payment schedule.'],
      ['Supplier problem evidence', 'Contract, invoice, advert, screenshots, photos, reports and messages showing the breach or misrepresentation.'],
      ['Complaint trail', 'Supplier complaint, supplier reply, card provider complaint, final response and any unanswered follow-up.']
    ]
  }), 'gsc-section75-snippet-match');
}

if (exists('foam-insulation.html')) {
  insertBefore('foam-insulation.html', '<section id="request-callback"', featureBlock({
    marker: 'gsc-spray-foam-removal-cost',
    eyebrow: 'Spray foam removal cost',
    title: 'Spray foam removal cost: what evidence helps?',
    intro: 'Search Console shows impressions for spray foam removal cost queries. This section keeps that intent on the main spray foam page and links it to the wider evidence route.',
    cards: [
      ['Removal quotes', 'Keep every quote for removal, roof repair, ventilation work, access costs and reinstatement. Ask each contractor to explain what work is included.'],
      ['Why removal was recommended', 'A lender, buyer, surveyor or specialist comment explaining why removal is being requested can be more useful than a quote alone.'],
      ['Wider losses', 'Survey fees, failed sale costs, reduced offers, mortgage delays and repair costs may help show the impact beyond the original installation price.']
    ]
  }), 'gsc-spray-foam-removal-cost');
}

if (exists('holidaypark.html')) {
  insertBefore('holidaypark.html', '<h2 class="text-3xl font-extrabold text-gray-900 mb-4">Request a call back about Holiday Park &amp; Caravan Mis-Selling Review</h2>', featureBlock({
    marker: 'gsc-mis-sold-caravan-finance',
    eyebrow: 'Mis-sold caravan finance',
    title: 'Mis-sold caravan finance: what usually matters?',
    intro: 'The export shows Google is testing Quaerens for mis-sold caravan finance searches. This section strengthens that intent inside the already-performing Holiday Park page.',
    cards: [
      ['Finance agreement and affordability', 'Keep the finance agreement, deposit records, monthly payments, income assumptions, affordability checks and any lender or broker paperwork.'],
      ['Sales promises about income or resale', 'Save brochures, emails, WhatsApp messages, rental projections, resale claims and notes of what was said before you signed.'],
      ['Pitch fees and running costs', 'Finance complaints are stronger when they show the full cost picture: pitch fees, commission, utilities, insurance, maintenance and exit charges.']
    ]
  }), 'gsc-mis-sold-caravan-finance');
}

if (exists('freeflightclaim.html')) {
  insertBefore('freeflightclaim.html', '<footer', featureBlock({
    marker: 'gsc-flight-delay-letter',
    eyebrow: 'Flight delay compensation letter',
    title: 'What to include in a flight delay compensation letter',
    intro: 'This page is already getting impressions for flight delay compensation letter searches. The tool should make clear what the letter needs before visitors start.',
    cards: [
      ['Flight details', 'Include airline, flight number, booking reference, route, scheduled times, actual arrival time and passenger names.'],
      ['Delay evidence', 'Keep airline messages, airport updates, screenshots, boarding passes and any explanation given for the delay or cancellation.'],
      ['Requested outcome', 'State whether you are asking for compensation, reimbursement of expenses, a refund, or a written explanation.']
    ]
  }), 'gsc-flight-delay-letter');
}

if (exists('lost-luggage.html')) {
  insertBefore('lost-luggage.html', '<h2 class="text-3xl font-extrabold text-gray-900 mb-4">Request a call back about Lost Luggage Compensation Tool</h2>', featureBlock({
    marker: 'gsc-lost-luggage-compensation',
    eyebrow: 'Lost luggage compensation',
    title: 'How to prepare a lost luggage compensation claim',
    intro: 'Google is showing this site for lost luggage compensation queries. This section gives searchers the practical answer before they use the free letter route.',
    cards: [
      ['Baggage reference and flight details', 'Keep the PIR or baggage reference, flight number, route, booking reference and the date the bag was reported missing or delayed.'],
      ['Receipts and replacement costs', 'Save receipts for essential replacement items, photos of damaged bags and proof of any expenses you are asking the airline to consider.'],
      ['Airline correspondence', 'Keep claim forms, emails, app messages, settlement offers and any refusal so the timeline is clear.']
    ]
  }), 'gsc-lost-luggage-compensation');
}

if (exists('misssold-bankaccounts.html')) {
  insertBefore('misssold-bankaccounts.html', '<h2 class="text-3xl font-extrabold text-gray-900 mb-4">Request a call back about Mis-Sold Bank Account Fee Review</h2>', featureBlock({
    marker: 'gsc-fee-paying-bank-account',
    eyebrow: 'Fee-paying bank account evidence',
    title: 'Mis-sold fee-paying bank account: what to check',
    intro: 'The page has many impressions but low CTR. This section directly answers the query family around mis-sold bank accounts and packaged account fees.',
    cards: [
      ['Monthly charges', 'Gather statements showing the account fee, when it started, how much was paid and whether charges increased.'],
      ['Benefits and suitability', 'List the insurance, breakdown cover, travel benefits or extras included, and whether you could realistically use them.'],
      ['Sales and complaint history', 'Keep upgrade letters, branch notes, phone notes, complaint messages and the bank response explaining why any refund was refused.']
    ]
  }), 'gsc-fee-paying-bank-account');
}

const relatedLinkTargets = [
  ['airbnb-refunds.html', [
    ['travel-claims-hub.html', 'Travel Claims Hub', 'Related travel, holiday and booking dispute routes.'],
    ['knowledge-prepare-evidence-consumer-complaint.html', 'How to prepare complaint evidence', 'A plain-English guide to organising documents before complaining.'],
    ['holiday-compensation.html', 'Holiday compensation', 'Wider holiday and accommodation complaint support.']
  ]],
  ['freeflightclaim.html', [
    ['travel-claims-hub.html', 'Travel Claims Hub', 'More flight, holiday, luggage and travel complaint routes.'],
    ['flight-delay.html', 'Flight delay support', 'Dedicated flight delay compensation review support.'],
    ['lost-luggage.html', 'Lost luggage compensation', 'Baggage delay, loss and airline evidence route.']
  ]],
  ['lost-luggage.html', [
    ['travel-claims-hub.html', 'Travel Claims Hub', 'More flight, holiday, luggage and travel complaint routes.'],
    ['freeflightclaim.html', 'Free flight delay claim tool', 'Use the free flight compensation letter tool.'],
    ['holiday-compensation.html', 'Holiday compensation', 'Package holiday and travel provider dispute support.']
  ]],
  ['misssold-bankaccounts.html', [
    ['financial-disputes-hub.html', 'Financial Disputes Hub', 'Banking, payment and finance complaint routes.'],
    ['knowledge-prepare-evidence-consumer-complaint.html', 'Prepare complaint evidence', 'Organise statements, correspondence and timelines.'],
    ['app-fraud-bank-scam-refunds.html', 'Bank scam refund support', 'Related bank reimbursement and evidence support.']
  ]]
];

for (const [file, links] of relatedLinkTargets) {
  if (!exists(file)) continue;
  insertBefore(file, file === 'freeflightclaim.html' ? '<footer' : '<h2 class="text-3xl font-extrabold text-gray-900 mb-4">Request a call back', linkBlock({
    marker: `gsc-related-links-${file.replace(/[^a-z0-9]/gi, '-')}`,
    eyebrow: 'Related next steps',
    title: 'Useful related pages',
    intro: 'These internal links connect this search topic to the wider Quaerens hub structure.',
    links
  }), `gsc-related-links-${file.replace(/[^a-z0-9]/gi, '-')}`);
}

console.log('GSC quick-win optimisation complete.');
console.log(`Updated ${metaUpdates.length} priority pages.`);
