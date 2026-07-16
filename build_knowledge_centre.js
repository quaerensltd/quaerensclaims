const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'public');
const knowledgeRoot = path.join(root, 'knowledge');
fs.mkdirSync(knowledgeRoot, { recursive: true });

const site = 'https://www.quaerens.co.uk';
const today = '2026-07-16';

const categories = [
  {
    slug: 'holiday-parks',
    title: 'Holiday Parks',
    intro: 'Guidance for static caravan, holiday lodge, pitch fee, resale, exit, finance and holiday park agreement concerns.',
    commercial: '/holidaypark.html',
    commercialLabel: 'Holiday Park Review',
    guides: [
      ['Holiday Park Knowledge Hub', '/holiday-park-knowledge-hub.html', 'Start with the full holiday park and static caravan guide collection.'],
      ['Holiday Park Misrepresentation', '/holiday-park-misrepresentation.html', 'Sales promises, income claims, resale value and occupation representations.'],
      ['Static Caravan Not As Described', '/static-caravan-not-as-described.html', 'Condition, specification, fixture and handover concerns.'],
      ['Holiday Park Site Fee Disputes', '/holiday-park-site-fee-disputes.html', 'Pitch fees, service charges, utilities and unexpected increases.'],
      ['Holiday Park Finance Problems', '/holiday-park-finance-problems.html', 'Finance agreements, affordability, deposits and linked purchase issues.'],
      ['Holiday Park Exit Problems', '/holiday-park-exit-problems.html', 'Leaving a park, resale restrictions, buyback and removal charges.'],
      ['Holiday Park Resale Problems', '/holiday-park-resale-problems.html', 'Low buyback offers, age limits, depreciation and resale restrictions.'],
      ['Holiday Lodge Purchase Disputes', '/holiday-lodge-purchase-disputes.html', 'Lodge purchase, occupancy, defects, finance, resale and exit concerns.'],
      ['What Are Holiday Park Pitch Fees?', '/knowledge-what-are-holiday-park-pitch-fees.html', 'Plain-English guide to pitch fee evidence and running costs.'],
      ['How Caravan Agreements Work', '/knowledge-how-caravan-agreements-work.html', 'Understand common holiday park agreement terms before choosing a route.']
    ],
    takeaways: ['Keep the purchase agreement, park rules and site licence documents.', 'Save brochures, emails and messages from the sales process.', 'Separate purchase issues from later site fee, repair or resale concerns.', 'Keep invoices, annual fee notices and any park correspondence.', 'A review depends on documents, dates, representations and available routes.']
  },
  {
    slug: 'spray-foam',
    title: 'Spray Foam',
    intro: 'Evidence-led guidance on spray foam insulation, mortgage refusals, surveyor concerns, removal costs and complaint routes.',
    commercial: '/foam-insulation.html',
    commercialLabel: 'Spray Foam Review',
    guides: [
      ['Spray Foam Review', '/foam-insulation.html', 'The main review route for spray foam mortgage, sale, survey and removal concerns.'],
      ['Spray Foam Mortgage Problems', '/guidance-spray-foam-mortgage-problems.html', 'Mortgage refusal evidence and lender concern guidance.'],
      ['Spray Foam Surveyor Concerns', '/guidance-spray-foam-surveyor-concerns.html', 'Survey, timber visibility, ventilation and roof inspection evidence.'],
      ['Spray Foam Removal Costs', '/guidance-spray-foam-removal-costs.html', 'Removal quotes, roof repair costs and scope of works evidence.'],
      ['Why Lenders Worry About Spray Foam', '/knowledge-why-lenders-worry-about-spray-foam.html', 'Plain-English explanation of lender and surveyor concerns.'],
      ['Spray Foam Unsuitable for Some Mortgages', '/knowledge-spray-foam-unsuitable-mortgages.html', 'How installation, certification and inspection access can affect lending.'],
      ['Spray Foam Mortgage Refused', '/spray-foam-mortgage-refused.html', 'Dedicated route for refused mortgage or remortgage scenarios.'],
      ['Spray Foam Removal Costs Support', '/spray-foam-removal-costs.html', 'Commercial support page for removal-cost evidence.']
    ],
    takeaways: ['Keep installation contracts, invoices and product documents.', 'Save lender, broker, valuer and surveyor comments.', 'Photograph the loft and roof space where possible.', 'Removal quotes should include scope of works and assumptions.', 'Outcomes depend on evidence, installation details and timing.']
  },
  {
    slug: 'travel',
    title: 'Travel',
    intro: 'Guidance on holiday refunds, Airbnb disputes, flight delay, lost luggage, cruise, insurance and timeshare evidence.',
    commercial: '/travel-claims-hub.html',
    commercialLabel: 'Travel Claims Hub',
    guides: [
      ['Airbnb Refunds', '/airbnb-refunds.html', 'Refund refused, host cancellation, property not as described and platform dispute support.'],
      ['Travel Claims Hub', '/travel-claims-hub.html', 'Start here for travel and leisure complaint routes.'],
      ['Holiday Cancellation Refund Evidence', '/guidance-holiday-cancellation-refund-evidence.html', 'Evidence for cancellation, refund and holiday-provider complaints.'],
      ['Lost Luggage Claim Evidence', '/guidance-lost-luggage-claim-evidence.html', 'Documents and timelines for baggage delay and loss complaints.'],
      ['Flight Delay Rejected Claim', '/guidance-flight-delay-claim-rejected-next-steps.html', 'Next steps after a rejected delay compensation claim.'],
      ['Timeshare Exit Evidence Checklist', '/guidance-timeshare-exit-evidence-checklist.html', 'Evidence for timeshare exit and complaint preparation.'],
      ['Timeshare Contract in Perpetuity Evidence', '/guidance-timeshare-contract-in-perpetuity-evidence.html', 'Documents for long-term timeshare contract concerns.'],
      ['Caravan Parks', '/holidaypark.html', 'Holiday park and caravan purchase review route.']
    ],
    takeaways: ['Keep booking confirmations and cancellation notices.', 'Save platform messages and complaint reference numbers.', 'Photograph accommodation problems where relevant.', 'Keep receipts for replacement accommodation or travel expenses.', 'Match each cost to the event and supporting evidence.']
  },
  {
    slug: 'finance',
    title: 'Finance',
    intro: 'Guidance on car finance, pensions, loans, investments, equity release, Section 75 and finance-linked consumer disputes.',
    commercial: '/financial-disputes-hub.html',
    commercialLabel: 'Financial Disputes Hub',
    guides: [
      ['Financial Disputes Hub', '/financial-disputes-hub.html', 'Main hub for financial complaint and evidence routes.'],
      ['Car Finance', '/car-finance.html', 'PCP, HP, commission, affordability and vehicle finance concerns.'],
      ['PCP Car Finance Documents', '/guidance-pcp-car-finance-commission-documents.html', 'Documents that help with commission and car finance complaints.'],
      ['Pension Transfer Documents', '/guidance-pension-transfer-complaint-documents.html', 'Evidence for pension transfer and advice complaints.'],
      ['Equity Release Complaint Evidence', '/guidance-equity-release-complaint-evidence.html', 'Documents for equity release and later-life lending concerns.'],
      ['Equity Release Inheritance Loss', '/guidance-equity-release-inheritance-loss.html', 'Inheritance impact and equity release evidence guidance.'],
      ['Section 75 Support', '/section75support.html', 'Credit-card purchase protection route.'],
      ['What Documents Matter in Car Finance Complaints?', '/knowledge-car-finance-documents.html', 'Plain-English car finance evidence guide.']
    ],
    takeaways: ['Keep finance agreements, statements and key facts documents.', 'Save sales explanations, affordability discussions and complaint replies.', 'Separate product problems from finance-provider issues.', 'Keep final response letters and dates.', 'Finance reviews depend on route, evidence, timing and provider responsibility.']
  },
  {
    slug: 'property',
    title: 'Property',
    intro: 'Guidance on spray foam, solar, new build, housing disrepair, survey, mortgage, equity release and sale-and-rent-back issues.',
    commercial: '/property-disputes-hub.html',
    commercialLabel: 'Property Disputes Hub',
    guides: [
      ['Property Disputes Hub', '/property-disputes-hub.html', 'Main property support hub.'],
      ['Spray Foam Review', '/foam-insulation.html', 'Spray foam mortgage, survey, sale and removal concerns.'],
      ['Solar Support', '/solar-support.html', 'Solar panel finance, installation and system performance issues.'],
      ['New Build Issues', '/newbuild-issues.html', 'Snagging, defects, workmanship and developer delay concerns.'],
      ['Housing Disrepair', '/housing-disrepair.html', 'Damp, mould, leaks and unresolved landlord repairs.'],
      ['New Build Snagging Evidence', '/guidance-new-build-snagging-dispute-evidence.html', 'Evidence checklist for new build defects.'],
      ['Housing Disrepair Evidence Checklist', '/guidance-housing-disrepair-evidence-checklist.html', 'Evidence for disrepair and repair delay complaints.'],
      ['Sale and Rent Back Evidence', '/guidance-sale-and-rent-back-evidence.html', 'Evidence for sale and rent back concerns.']
    ],
    takeaways: ['Keep contracts, surveys, photographs and repair correspondence.', 'Create a dated schedule of defects or concerns.', 'Separate condition evidence from finance or sales-promise evidence.', 'Save all inspection notes and professional comments.', 'Property complaint routes depend on documents, chronology and responsibility.']
  },
  {
    slug: 'banking',
    title: 'Banking',
    intro: 'Guidance on APP fraud, frozen accounts, packaged accounts, refused refunds and banking complaint evidence.',
    commercial: '/app-fraud-bank-scam-refunds.html',
    commercialLabel: 'Bank Scam Refund Review',
    guides: [
      ['APP Fraud Bank Scam Refunds', '/app-fraud-bank-scam-refunds.html', 'Refused reimbursement and bank transfer scam support.'],
      ['APP Fraud Refused Refund Evidence', '/guidance-app-fraud-bank-refused-refund.html', 'Evidence for refused APP fraud reimbursement complaints.'],
      ['APP Fraud Evidence', '/guidance-app-fraud-bank-evidence.html', 'Documents and screenshots that may help APP fraud reviews.'],
      ['Frozen Bank Account Documents', '/guidance-frozen-bank-account-complaint-documents.html', 'Evidence for frozen, blocked or restricted bank accounts.'],
      ['Mis-sold Packaged Bank Account Evidence', '/guidance-mis-sold-packaged-bank-account-evidence.html', 'Documents for packaged bank account complaints.'],
      ['Missold Bank Accounts', '/misssold-bankaccounts.html', 'Commercial support for packaged or unsuitable bank account concerns.'],
      ['What Evidence Helps With APP Fraud Refund Complaints?', '/knowledge-app-fraud-refund-evidence.html', 'Plain-English APP fraud evidence guide.'],
      ['Financial Disputes Hub', '/financial-disputes-hub.html', 'Wider finance and banking routes.']
    ],
    takeaways: ['Keep bank messages, warnings and scam communications.', 'Save transaction records and complaint reference numbers.', 'Keep screenshots of adverts, chats, platforms or payment requests.', 'Record the timeline from first contact to bank report.', 'Banking outcomes depend on evidence, timing and provider response.']
  },
  {
    slug: 'digital',
    title: 'Digital',
    intro: 'Guidance on crypto recovery, digital platforms, blocked accounts, cyber incidents, data rights and online consumer disputes.',
    commercial: '/digital-platform-disputes-hub.html',
    commercialLabel: 'Digital Platform Disputes Hub',
    guides: [
      ['Digital Platform Disputes Hub', '/digital-platform-disputes-hub.html', 'Main hub for digital and platform complaint routes.'],
      ['Blocked Online Account', '/guidance-blocked-online-account.html', 'Evidence for blocked, suspended or inaccessible online accounts.'],
      ['Crypto Blocked Withdrawal Evidence', '/guidance-crypto-blocked-withdrawal-evidence.html', 'Documents for crypto withdrawal and platform disputes.'],
      ['Digital Platform Failure Claims', '/digital-platform-failure-claims.html', 'Commercial support for platform failure and data-related concerns.'],
      ['GDPR and Data Rights', '/gdpr-claims.html', 'Data protection and information-rights support route.'],
      ['Cyber Claims', '/cyber-claims.html', 'Support for cyber incidents and data breach concerns.']
    ],
    takeaways: ['Keep screenshots before account access disappears.', 'Save platform emails, tickets and chat logs.', 'Keep wallet, transaction and reference details where relevant.', 'Record dates of suspension, complaint and response.', 'Digital disputes often turn on records that can disappear quickly.']
  },
  {
    slug: 'consumer-law',
    title: 'Consumer Law',
    intro: 'Plain-English guidance on Section 75, chargeback, complaint letters, timelines, escalation and consumer evidence preparation.',
    commercial: '/consumer-rights-hub.html',
    commercialLabel: 'Consumer Rights Hub',
    guides: [
      ['Consumer Rights Hub', '/consumer-rights-hub.html', 'Main hub for consumer complaint and evidence routes.'],
      ['Section 75 Support', '/section75support.html', 'Credit-card purchase protection support.'],
      ['What Is Section 75?', '/knowledge-what-is-section-75.html', 'Plain-English Section 75 guide.'],
      ['Section 75 vs Chargeback', '/knowledge-section-75-vs-chargeback.html', 'Understand the difference between two common card routes.'],
      ['Section 75 Evidence', '/guidance-section-75-evidence.html', 'Documents that help Section 75 complaints.'],
      ['Rejected Section 75 Claim', '/guidance-section-75-rejected-claim.html', 'Next steps after a card provider rejects a claim.'],
      ['Consumer Complaint Letters', '/consumer-complaint-letters.html', 'Structured complaint letter support.'],
      ['Prepare Evidence for a Consumer Complaint', '/knowledge-prepare-evidence-consumer-complaint.html', 'How to organise documents before complaining.']
    ],
    takeaways: ['Keep proof of purchase and payment method evidence.', 'Save complaint letters, replies and final responses.', 'Use a clear chronology rather than scattered points.', 'Do not rely only on verbal promises if written evidence exists.', 'Consumer routes depend on the facts, contract, payment method and dates.']
  }
];

const eeatPages = [
  ['editorial-standards', 'Editorial Standards', 'How Quaerens keeps consumer guidance neutral, evidence-led and clearly separated from guaranteed outcomes.'],
  ['research-methodology', 'Research Methodology', 'How Quaerens organises consumer dispute topics, common evidence patterns and practical guidance.'],
  ['how-quaerens-reviews-evidence', 'How Quaerens Reviews Evidence', 'How documents, chronology, correspondence and costs are reviewed before a route is suggested.'],
  ['sources-we-use', 'Sources We Use', 'The types of official guidance, consumer documents and case materials that inform Quaerens resources.'],
  ['how-we-prepare-complaint-packs', 'How We Prepare Complaint Packs', 'How evidence, timelines and complaint wording can be structured for clearer escalation.'],
  ['document-review-process', 'Document Review Process', 'A plain-English explanation of how consumer documents are sorted and assessed.'],
  ['complaint-timeline-methodology', 'Complaint Timeline Methodology', 'How dates, events, correspondence and evidence are arranged into a useful complaint timeline.']
];

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function layout({ title, description, canonical, body, schema }) {
  const schemaBlocks = schema.map(obj => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`).join('\n  ');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${site}/images/quaerens-logo.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/images/favicon.png" type="image/png">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box}body{margin:0;font-family:Inter,Arial,sans-serif;background:#f8fafc;color:#0f172a}.wrap{max-width:1140px;margin:0 auto;padding:0 1rem}.site-header{background:#fff;border-bottom:1px solid #e5e7eb;position:sticky;top:0;z-index:20}.header-inner{min-height:88px;display:flex;align-items:center;justify-content:space-between;gap:1rem}.logo{height:64px;width:auto}.nav{display:flex;gap:.45rem;align-items:center;flex-wrap:wrap;justify-content:flex-end}.nav a{color:#334155;text-decoration:none;font-weight:800;font-size:.93rem;padding:.62rem .76rem;border-radius:999px}.nav a:hover,.nav .active{background:#eff6ff;color:#1d4ed8}.btn{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:.86rem 1.18rem;font-weight:900;text-decoration:none}.btn-blue{background:#2563eb;color:#fff;box-shadow:0 14px 32px rgba(37,99,235,.22)}.btn-white{background:#fff;color:#1d4ed8;border:1px solid #bfdbfe}.hero{background:linear-gradient(90deg,rgba(15,23,42,.94),rgba(15,23,42,.72)),url('/images/hero-index.jpg') center/cover no-repeat;color:#fff}.hero-inner{padding:4.5rem 1rem}.eyebrow,.pill{color:#1d4ed8;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.pill{display:inline-flex;color:#fff;border:1px solid rgba(255,255,255,.32);background:rgba(255,255,255,.12);border-radius:999px;padding:.55rem .9rem}.hero h1{font-size:clamp(2.4rem,5.5vw,4.7rem);line-height:1.04;margin:1rem 0;font-weight:900;max-width:960px}.hero p{font-size:clamp(1.08rem,2vw,1.28rem);line-height:1.62;color:#eff6ff;max-width:850px}.hero-actions{display:flex;gap:.8rem;flex-wrap:wrap;margin-top:1.4rem}.section{padding:3.7rem 0}.section h2{font-size:clamp(1.9rem,4vw,3rem);line-height:1.1;margin:.4rem 0 1rem;font-weight:900}.lead{font-size:1.1rem;line-height:1.7;color:#334155;max-width:880px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem;margin-top:1.4rem}.card{display:block;background:#fff;border:1px solid #dbeafe;border-radius:8px;padding:1.15rem;text-decoration:none;color:#0f172a;box-shadow:0 12px 28px rgba(15,23,42,.06)}.card h3{font-size:1.1rem;line-height:1.2;margin:0 0 .5rem;font-weight:900}.card p{color:#475569;line-height:1.55;margin:0}.card strong{display:inline-block;color:#1d4ed8;margin-top:.8rem}.card:hover{border-color:#60a5fa;box-shadow:0 16px 34px rgba(37,99,235,.12);transform:translateY(-2px)}.icon-badge{display:inline-flex;align-items:center;justify-content:center;width:2.35rem;height:2.35rem;border-radius:999px;background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;font-weight:900;margin-bottom:.8rem}.rank{display:inline-flex;color:#fff;background:#2563eb;border-radius:999px;padding:.25rem .58rem;font-weight:900;font-size:.8rem;margin-bottom:.7rem}.meta{display:block;color:#64748b;font-weight:800;margin:.6rem 0}.map-list{display:grid;gap:.7rem;margin-top:1.2rem}.map-row{display:grid;grid-template-columns:190px 1fr 220px;gap:.8rem;align-items:center;background:#fff;border:1px solid #dbeafe;border-radius:8px;padding:.85rem}.map-row strong{color:#1e3a8a}.map-row a{color:#1d4ed8;font-weight:900;text-decoration:none}.quick,.soft{background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:1.2rem}.quick{border-left:5px solid #2563eb}.takeaways{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:.75rem;margin:1rem 0 0;padding:0;list-style:none}.takeaways li{background:#fff;border:1px solid #dbeafe;border-radius:8px;padding:.85rem 1rem;color:#1e3a8a;font-weight:800}.article-block{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:clamp(1.2rem,3vw,2rem);box-shadow:0 14px 34px rgba(15,23,42,.06)}.article-block p,.article-block li{font-size:1.04rem;line-height:1.72;color:#334155}.faq details{background:#fff;border:1px solid #dbeafe;border-radius:8px;padding:1rem;margin:.7rem 0}.faq summary{cursor:pointer;font-weight:900;color:#0f172a}.faq p{margin:.75rem 0 0;color:#334155;line-height:1.65}.steps{counter-reset:step}.step:before{counter-increment:step;content:counter(step);display:inline-flex;width:2rem;height:2rem;border-radius:999px;background:#2563eb;color:#fff;align-items:center;justify-content:center;font-weight:900;margin-bottom:.75rem}.footer{border-top:1px solid #e5e7eb;background:#fff;color:#64748b;padding:2rem 0;font-size:.92rem}.footer a{color:#2563eb;text-decoration:none}@media(max-width:800px){.nav{display:none}.header-inner{min-height:76px}.logo{height:54px}.hero-inner{padding-top:3.5rem;padding-bottom:3.5rem}.map-row{grid-template-columns:1fr}}
  </style>
  ${schemaBlocks}
</head>
<body>
  <header class="site-header"><div class="wrap header-inner"><a href="/" aria-label="Quaerens home"><img src="/images/quaerens-logo.png" alt="Quaerens" class="logo"></a><nav class="nav" aria-label="Knowledge navigation"><a href="/consumer-rights-knowledge-centre.html">Knowledge Centre</a><a href="/knowledge/holiday-parks/">Holiday Parks</a><a href="/knowledge/spray-foam/">Spray Foam</a><a href="/knowledge/finance/">Finance</a><a href="/knowledge/property/">Property</a><a href="/contact.html">Contact</a></nav><a class="btn btn-blue" href="/">Home</a></div></header>
${body}
  <footer class="footer"><div class="wrap">&copy; 2026 Quaerens Ltd. Educational guidance only. <a href="/privacy.html">Privacy Policy</a> | <a href="/terms.html">Terms of Use</a> | <a href="/contact.html">Contact</a></div></footer>
</body>
</html>`;
}

function orgSchema() {
  return { '@context': 'https://schema.org', '@type': 'Organization', name: 'Quaerens', url: site, logo: `${site}/images/quaerens-logo.png` };
}

function breadcrumb(items) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item[0], item: `${site}${item[1]}` })) };
}

function categoryPage(cat) {
  const urlPath = `/knowledge/${cat.slug}/`;
  const canonical = `${site}${urlPath}`;
  const faq = [
    ['Can this be reviewed?', `Many ${cat.title.toLowerCase()} concerns can be reviewed if there is enough information to understand the facts, documents, dates and responses received so far.`],
    ['What evidence should I keep?', 'Keep contracts, invoices, photographs, emails, letters, receipts, complaint replies, reference numbers and any inspection or professional reports.'],
    ['What if I no longer have all the paperwork?', 'You can still start by organising what you have. Missing documents can often be identified during a preliminary review.'],
    ['What happens next?', 'Quaerens reviews the information provided, identifies evidence gaps and explains possible complaint or support routes based on the material available.'],
    ['Does Quaerens guarantee an outcome?', 'No. Quaerens does not guarantee refunds, compensation or complaint outcomes. The aim is to organise evidence and explain possible next steps.']
  ];
  const body = `  <main>
    <section class="hero"><div class="wrap hero-inner"><span class="pill">Knowledge category</span><h1>${esc(cat.title)} Knowledge Hub</h1><p>${esc(cat.intro)}</p><div class="hero-actions"><a class="btn btn-blue" href="${cat.commercial}">Open ${esc(cat.commercialLabel)}</a><a class="btn btn-white" href="/consumer-rights-knowledge-centre.html">All knowledge categories</a></div></div></section>
    <section class="section"><div class="wrap"><div class="quick"><p class="eyebrow">Quick Answer</p><p>${esc(cat.intro)} Start by gathering contracts, messages, photographs, receipts and complaint responses, then choose the most relevant guide or commercial review route.</p></div><h2>Key Takeaways</h2><ul class="takeaways">${cat.takeaways.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div></section>
    <section class="section"><div class="wrap article-block"><p class="eyebrow">New here?</p><h2>Read these guides first</h2><p class="lead">These pages help you understand the issue before deciding whether to request a review or use a free tool.</p><div class="grid">${cat.guides.slice(0, 3).map(g => `<a class="card" href="${g[1]}"><h3>${esc(g[0])}</h3><p>${esc(g[2])}</p><strong>Start here -></strong></a>`).join('')}</div></div></section>
    <section class="section"><div class="wrap"><p class="eyebrow">Related guides</p><h2>All ${esc(cat.title)} guides and routes</h2><p class="lead">Each article strengthens the related commercial page by explaining the issue, evidence and next steps in plain English.</p><div class="grid">${cat.guides.map(g => `<a class="card" href="${g[1]}"><h3>${esc(g[0])}</h3><p>${esc(g[2])}</p><strong>Read guide -></strong></a>`).join('')}</div></div></section>
    <section class="section"><div class="wrap article-block"><h2>What documents should I keep?</h2><div class="grid">${['Contracts and terms','Invoices and receipts','Photos or videos','Emails and messages','Complaint letters','Final responses','Inspection reports','Reference numbers'].map(x => `<div class="card"><h3>${x}</h3><p>Keep dated copies where possible and avoid deleting older records.</p></div>`).join('')}</div></div></section>
    <section class="section"><div class="wrap article-block"><h2>What happens next?</h2><div class="grid steps">${['We review the information you provide.','We identify documents or evidence gaps.','We explain possible complaint or support routes.','You decide whether you want further structured help.'].map(x => `<div class="card step"><p>${x}</p></div>`).join('')}</div></div></section>
    <section class="section faq"><div class="wrap article-block"><h2>Common Questions</h2>${faq.map(([q,a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></section>
    <section class="section"><div class="wrap article-block"><h2>Knowledge Panels</h2><div class="grid"><a class="card" href="${cat.commercial}"><h3>Related Topic</h3><p>${esc(cat.commercialLabel)}</p><strong>Request My Free Review -></strong></a><a class="card" href="/knowledge/how-quaerens-reviews-evidence/"><h3>Evidence Needed</h3><p>See how Quaerens reviews documents and evidence gaps.</p><strong>Read process -></strong></a><a class="card" href="/knowledge/document-review-process/"><h3>Common Documents</h3><p>Understand how paperwork is organised before a complaint route is considered.</p><strong>Open guide -></strong></a></div></div></section>
  </main>`;
  const schema = [
    orgSchema(),
    breadcrumb([['Home','/'], ['Knowledge Centre','/consumer-rights-knowledge-centre.html'], [`${cat.title} Knowledge Hub`, urlPath]]),
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: `${cat.title} Knowledge Hub`, description: cat.intro, url: canonical, mainEntity: { '@type': 'ItemList', itemListElement: cat.guides.map((g, i) => ({ '@type': 'ListItem', position: i + 1, name: g[0], url: `${site}${g[1]}` })) } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
  ];
  return layout({ title: `${cat.title} Knowledge Hub | Quaerens`, description: cat.intro, canonical, body, schema });
}

function mainKnowledgePage(isDirectory) {
  const urlPath = isDirectory ? '/knowledge/' : '/consumer-rights-knowledge-centre.html';
  const canonical = `${site}${urlPath}`;
  const description = 'The Quaerens Knowledge Centre provides practical consumer guidance, evidence checklists, complaint preparation information and educational resources across property, finance, travel and consumer disputes.';
  const startHere = [
    ['HP', 'Holiday Park Problems', 'Learn about purchases, contracts, repairs, finance, resale and exit concerns.', '/knowledge/holiday-parks/'],
    ['SF', 'Spray Foam Insulation', 'Guidance on mortgage issues, removal, surveys, roof concerns and evidence.', '/knowledge/spray-foam/'],
    ['TR', 'Travel Problems', 'Airbnb, holidays, flights, cruises, luggage and travel disputes.', '/knowledge/travel/'],
    ['CF', 'Car Finance', 'PCP, HP, commission, rejected vehicles and finance concerns.', '/car-finance.html'],
    ['75', 'Section 75 Support', 'Credit card disputes and consumer payment protection.', '/section75support.html'],
    ['EV', 'Evidence Centre', 'Learn how to organise documents, timelines and complaint evidence.', '/knowledge/document-review-process/']
  ];
  const popularGuides = [
    ['Spray Foam Mortgage Problems', 'Understand mortgage refusal evidence, lender concerns and what documents may help.', '4 min read', '/guidance-spray-foam-mortgage-problems.html'],
    ['Holiday Park Exit Problems', 'Review notice, resale, buyback, removal and surrender issues before leaving a park.', '5 min read', '/holiday-park-exit-problems.html'],
    ['Airbnb Refund Refused', 'Guidance for booking cancellations, refused refunds, host messages and platform evidence.', '4 min read', '/airbnb-refunds.html'],
    ['Section 75 Claim Guide', 'Plain-English support for credit card purchase protection and evidence preparation.', '5 min read', '/section75support.html'],
    ['Car Finance Commission', 'Documents that may help with PCP, HP, commission and car finance complaints.', '4 min read', '/guidance-pcp-car-finance-commission-documents.html'],
    ['Frozen Bank Account Support', 'Evidence for blocked, frozen or restricted account complaints.', '4 min read', '/guidance-frozen-bank-account-complaint-documents.html']
  ];
  const problemCards = [
    ['PS', "I can't sell my property", 'Spray foam, survey, valuation and property sale concerns.', '/knowledge/property/'],
    ['RF', 'My refund was refused', 'Holiday, travel, platform, card and consumer refund routes.', '/knowledge/consumer-law/'],
    ['BK', 'My bank froze my account', 'Frozen account evidence, complaint history and bank responses.', '/guidance-frozen-bank-account-complaint-documents.html'],
    ['TR', 'My holiday was cancelled', 'Holiday cancellation, Airbnb, flight, cruise and travel refund evidence.', '/knowledge/travel/'],
    ['CV', 'My caravan has defects', 'Static caravan condition, repair, handover and warranty concerns.', '/static-caravan-not-as-described.html'],
    ['FN', 'My finance agreement has problems', 'Car finance, equity release, pensions, Section 75 and linked finance routes.', '/knowledge/finance/'],
    ['CP', 'The company ignored my complaint', 'Complaint timelines, escalation wording and next-step preparation.', '/knowledge-company-ignores-complaint.html'],
    ['EV', 'I need help organising evidence', 'Document checklists, complaint timelines and evidence preparation.', '/knowledge-prepare-evidence-consumer-complaint.html']
  ];
  const evidenceGuides = [
    ['How to Build a Complaint Timeline', '/knowledge-how-to-write-complaint-timeline.html'],
    ['How to Organise Evidence', '/knowledge-prepare-evidence-consumer-complaint.html'],
    ['How to Photograph Defects', '/guidance-new-build-snagging-dispute-evidence.html'],
    ['How to Save Emails Correctly', '/knowledge/document-review-process/'],
    ['How to Write a Complaint Letter', '/consumer-complaint-letters.html'],
    ['What Makes Good Evidence?', '/knowledge/how-quaerens-reviews-evidence/'],
    ['Evidence Checklist Library', '/guidance.html'],
    ['Preparing Documents for Review', '/knowledge/document-review-process/'],
    ['Downloadable Templates', '/category-free-tools.html'],
    ['How to Record Telephone Calls and Notes', '/knowledge/complaint-timeline-methodology/'],
    ['How to Keep a Complaint Diary', '/knowledge/complaint-timeline-methodology/'],
    ['How to Present Financial Losses', '/knowledge/how-quaerens-reviews-evidence/']
  ];
  const rightsLibrary = [
    ['Consumer Rights Act', '/consumer-rights-hub.html'],
    ['Consumer Contracts Regulations', '/knowledge/consumer-law/'],
    ['Section 75', '/knowledge-what-is-section-75.html'],
    ['Chargeback', '/knowledge-section-75-vs-chargeback.html'],
    ['Consumer Credit', '/section75support.html'],
    ['Distance Selling', '/consumer-rights-hub.html'],
    ['Alternative Dispute Resolution', '/formal-escalation.html'],
    ['Financial Ombudsman', '/financial-disputes-hub.html'],
    ['Information Commissioner\'s Office', '/gdpr-claims.html'],
    ['Trading Standards', '/consumer-rights-hub.html']
  ];
  const fiveMinute = [
    ['Spray foam and mortgages', 'Quick Answer: lender and surveyor concerns usually depend on installation details, evidence and property access.', '/knowledge/spray-foam/'],
    ['Holiday park agreements', 'Quick Answer: contracts, park rules, fees and resale terms need to be read together.', '/knowledge/holiday-parks/'],
    ['Airbnb refund problems', 'Quick Answer: booking timelines, host messages, listing screenshots and complaint replies often matter.', '/airbnb-refunds.html'],
    ['Section 75 basics', 'Quick Answer: credit card protection may help in some purchase disputes, but it depends on the facts.', '/knowledge-what-is-section-75.html']
  ];
  const mapRows = [
    ['Holiday Parks', 'Static caravan, lodge, pitch fee, resale and exit guides.', '/holidaypark.html'],
    ['Spray Foam', 'Mortgage, survey, removal, roof and evidence guides.', '/foam-insulation.html'],
    ['Travel', 'Airbnb, holiday, flight, luggage, cruise and timeshare guides.', '/travel-claims-hub.html'],
    ['Finance', 'Car finance, pensions, equity release and Section 75 guides.', '/financial-disputes-hub.html'],
    ['Property', 'Spray foam, solar, new build, housing and survey guides.', '/property-disputes-hub.html'],
    ['Banking', 'APP fraud, frozen accounts and packaged account guides.', '/app-fraud-bank-scam-refunds.html'],
    ['Digital', 'Crypto, blocked accounts, platforms, cyber and data guides.', '/digital-platform-disputes-hub.html'],
    ['Consumer Law', 'Section 75, chargeback, complaint letters and escalation guides.', '/consumer-rights-hub.html'],
    ['Evidence Centre', 'Documents, timelines, checklists and complaint preparation.', '/knowledge/document-review-process/']
  ];
  const body = `  <main>
    <section class="hero"><div class="wrap hero-inner"><span class="pill">Consumer rights knowledge centre</span><h1>Consumer Rights Knowledge Centre</h1><p>${description}</p><div class="hero-actions"><a class="btn btn-blue" href="#categories">Browse categories</a><a class="btn btn-white" href="/consumer-rights-hub.html">Consumer Rights Hub</a></div></div></section>
    <section class="section" id="start-here"><div class="wrap article-block"><p class="eyebrow">Start here</p><h2>New to Quaerens?</h2><p class="lead">Not sure where to begin? Start with one of our most popular consumer guidance topics below.</p><div class="grid">${startHere.map(([icon, title, text, href]) => `<a class="card" href="${href}"><span class="icon-badge">${icon}</span><h3>${esc(title)}</h3><p>${esc(text)}</p><strong>Explore -></strong></a>`).join('')}</div></div></section>
    <section class="section"><div class="wrap"><div class="quick"><p class="eyebrow">Quick Answer</p><p>The Knowledge Centre is the central library for Quaerens educational guidance. It helps consumers understand issues, organise evidence and choose the relevant commercial review page only when they are ready.</p></div></div></section>
    <section class="section"><div class="wrap"><p class="eyebrow">Most used guidance</p><h2>Most Popular Guides</h2><p class="lead">These guides answer frequent search questions and help visitors move from confusion to a practical next step.</p><div class="grid">${popularGuides.map((g, i) => `<a class="card" href="${g[3]}"><span class="rank">${i + 1}</span><h3>${esc(g[0])}</h3><p>${esc(g[1])}</p><span class="meta">${esc(g[2])}</span><strong>Read Guide -></strong></a>`).join('')}</div></div></section>
    <section class="section"><div class="wrap article-block"><p class="eyebrow">Find the right route</p><h2>Browse By Problem</h2><p class="lead">Choose the sentence closest to what has happened. Each card points to the most relevant guide, hub or service page.</p><div class="grid">${problemCards.map(([icon, title, text, href]) => `<a class="card" href="${href}"><span class="icon-badge">${esc(icon)}</span><h3>${esc(title)}</h3><p>${esc(text)}</p><strong>Open route -></strong></a>`).join('')}</div></div></section>
    <section class="section" id="categories"><div class="wrap"><p class="eyebrow">Main knowledge categories</p><h2>Start with the topic, then choose the route</h2><p class="lead">Knowledge pages educate. Commercial pages convert. Each category hub connects plain-English guidance to the relevant Quaerens review page.</p><div class="grid">${categories.map(cat => `<a class="card" href="/knowledge/${cat.slug}/"><h3>${esc(cat.title)}</h3><p>${esc(cat.intro)}</p><strong>Open knowledge hub -></strong></a>`).join('')}</div></div></section>
    <section class="section"><div class="wrap article-block"><p class="eyebrow">Evidence centre</p><h2>Evidence Centre</h2><p class="lead">The Evidence Centre helps consumers organise documents, timelines, photographs, emails, complaint notes and financial-loss information before choosing a route.</p><div class="grid">${evidenceGuides.map(([title, href]) => `<a class="card" href="${href}"><h3>${esc(title)}</h3><p>Plain-English guidance for preparing stronger consumer complaint evidence.</p><strong>Open guide -></strong></a>`).join('')}</div></div></section>
    <section class="section"><div class="wrap"><p class="eyebrow">Plain-English education</p><h2>Consumer Rights Library</h2><p class="lead">Educational guides explaining common consumer legislation and complaint bodies. These pages are for general information and do not provide legal advice.</p><div class="grid">${rightsLibrary.map(([title, href]) => `<a class="card" href="${href}"><h3>${esc(title)}</h3><p>Learn what this topic means, what evidence may matter and where it may fit in a consumer complaint.</p><strong>Learn more -></strong></a>`).join('')}</div></div></section>
    <section class="section"><div class="wrap article-block"><p class="eyebrow">Fast summaries</p><h2>Learn in Five Minutes</h2><p class="lead">These featured routes are structured for quick reading and AI search: Quick Answer, Key Takeaways, Evidence Checklist, Common Questions and Related Guides.</p><div class="grid">${fiveMinute.map(([title, text, href]) => `<a class="card" href="${href}"><h3>${esc(title)}</h3><p>${esc(text)}</p><span class="meta">Includes: Key Takeaways, Common Mistakes, Evidence Needed, Next Steps</span><strong>Read summary -></strong></a>`).join('')}</div></div></section>
    <section class="section"><div class="wrap"><p class="eyebrow">Knowledge map</p><h2>How the Knowledge Centre is organised</h2><p class="lead">Each category hub connects educational guides to related commercial pages, so visitors can research first and request a review only when appropriate.</p><div class="map-list">${mapRows.map(([title, text, href]) => `<div class="map-row"><strong>${esc(title)}</strong><span>${esc(text)}</span><a href="${href}">Related service -></a></div>`).join('')}</div></div></section>
    <section class="section"><div class="wrap article-block"><p class="eyebrow">Using the hub</p><h2>How to Use This Knowledge Centre</h2><div class="grid steps">${['Identify your issue.','Read the relevant guide.','Prepare your documents.','Understand possible next steps.','Request a review if appropriate.'].map(text => `<div class="card step"><p>${esc(text)}</p></div>`).join('')}</div></div></section>
    <section class="section"><div class="wrap article-block"><p class="eyebrow">Trust and method</p><h2>How Quaerens Reviews Consumer Issues</h2><p class="lead">Quaerens focuses on evidence, documents, timelines, complaint preparation, practical guidance, structured review and clear next-step information. The purpose is to help organise what happened and identify possible routes based on the material available. Outcomes are not promised or guaranteed.</p><div class="grid">${['Evidence','Documents','Timelines','Complaint preparation','Practical guidance','Structured review','Clear next-step information'].map(x => `<div class="card"><h3>${esc(x)}</h3><p>This is considered as part of an evidence-led preliminary review where relevant.</p></div>`).join('')}</div></div></section>
    <section class="section"><div class="wrap article-block"><p class="eyebrow">EEAT</p><h2>How Quaerens builds guidance</h2><p class="lead">These pages explain editorial standards, evidence methodology and document-review processes so visitors and search systems can understand how the knowledge base is maintained.</p><div class="grid">${eeatPages.map(([slug, title, desc]) => `<a class="card" href="/knowledge/${slug}/"><h3>${esc(title)}</h3><p>${esc(desc)}</p><strong>Read more -></strong></a>`).join('')}</div></div></section>
  </main>`;
  const schema = [
    orgSchema(),
    breadcrumb([['Home','/'], ['Knowledge Centre', urlPath]]),
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Consumer Rights Knowledge Centre', description, url: canonical, mainEntity: { '@type': 'ItemList', itemListElement: [...categories.map((cat, i) => ({ '@type': 'ListItem', position: i + 1, name: `${cat.title} Knowledge Hub`, url: `${site}/knowledge/${cat.slug}/` })), ...popularGuides.map((guide, i) => ({ '@type': 'ListItem', position: categories.length + i + 1, name: guide[0], url: `${site}${guide[3]}` }))] } }
  ];
  return layout({ title: 'Consumer Rights Knowledge Centre | Quaerens', description, canonical, body, schema });
}

function eeatPage([slug, title, desc]) {
  const urlPath = `/knowledge/${slug}/`;
  const canonical = `${site}${urlPath}`;
  const faq = [
    ['Why does this matter?', 'Clear standards help visitors understand what Quaerens guidance is, what it is not, and how evidence-led consumer support is approached.'],
    ['Is this legal advice?', 'No. Quaerens guidance is educational and evidence-led. It does not guarantee outcomes or replace regulated legal advice where that is required.'],
    ['How does this support consumers?', 'It helps consumers organise documents, understand common evidence gaps and choose a practical next step.']
  ];
  const body = `  <main>
    <section class="hero"><div class="wrap hero-inner"><span class="pill">Quaerens methodology</span><h1>${esc(title)}</h1><p>${esc(desc)}</p><div class="hero-actions"><a class="btn btn-blue" href="/consumer-rights-knowledge-centre.html">Open Knowledge Centre</a><a class="btn btn-white" href="/contact.html">Contact Quaerens</a></div></div></section>
    <section class="section"><div class="wrap"><div class="quick"><p class="eyebrow">Quick Answer</p><p>${esc(desc)} The aim is to make consumer guidance consistent, transparent and useful without implying guaranteed outcomes.</p></div><h2>Key Takeaways</h2><ul class="takeaways"><li>Guidance is written in plain English.</li><li>Evidence and chronology are treated as central.</li><li>Commercial pages remain separate from educational pages.</li><li>Outcomes are not guaranteed.</li><li>Where specialist support may be needed, that should be made clear.</li></ul></div></section>
    <section class="section"><div class="wrap article-block"><h2>What is ${esc(title.toLowerCase())}?</h2><p>${esc(desc)} Quaerens uses this approach to keep guidance neutral, structured and focused on what a consumer can gather, compare and explain.</p><h2>What documents are commonly reviewed?</h2><p>Common documents include contracts, invoices, photographs, emails, letters, receipts, complaint replies, final responses, screenshots, payment records, inspection reports and timelines.</p><h2>What happens next?</h2><div class="grid steps">${['Information is sorted by date and issue.','Important documents and missing evidence are identified.','The possible complaint or support route is explained.','The consumer decides whether to request further help.'].map(x => `<div class="card step"><p>${x}</p></div>`).join('')}</div></div></section>
    <section class="section faq"><div class="wrap article-block"><h2>Common Questions</h2>${faq.map(([q,a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></section>
  </main>`;
  const schema = [
    orgSchema(),
    breadcrumb([['Home','/'], ['Knowledge Centre','/consumer-rights-knowledge-centre.html'], [title, urlPath]]),
    { '@context': 'https://schema.org', '@type': 'WebPage', name: title, description: desc, url: canonical },
    { '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, author: { '@type': 'Organization', name: 'Quaerens' }, publisher: { '@type': 'Organization', name: 'Quaerens', logo: { '@type': 'ImageObject', url: `${site}/images/quaerens-logo.png` } }, dateModified: today },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
  ];
  return layout({ title: `${title} | Quaerens`, description: desc, canonical, body, schema });
}

fs.writeFileSync(path.join(root, 'consumer-rights-knowledge-centre.html'), mainKnowledgePage(false));
fs.writeFileSync(path.join(knowledgeRoot, 'index.html'), mainKnowledgePage(true));
for (const cat of categories) {
  const dir = path.join(knowledgeRoot, cat.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), categoryPage(cat));
}
for (const page of eeatPages) {
  const dir = path.join(knowledgeRoot, page[0]);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), eeatPage(page));
}

const sitemapPath = path.join(root, 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');
const urls = [
  '/consumer-rights-knowledge-centre.html',
  '/knowledge/',
  ...categories.map(c => `/knowledge/${c.slug}/`),
  ...eeatPages.map(p => `/knowledge/${p[0]}/`)
];
for (const url of urls) {
  const loc = `${site}${url}`;
  if (!sitemap.includes(`<loc>${loc}</loc>`)) {
    sitemap = sitemap.replace('</urlset>', `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n  </url>\n</urlset>`);
  }
}
fs.writeFileSync(sitemapPath, sitemap);

console.log(`Created ${2 + categories.length + eeatPages.length} Knowledge Centre pages and updated sitemap.`);
