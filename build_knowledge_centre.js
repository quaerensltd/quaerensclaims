const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'public');
const knowledgeRoot = path.join(root, 'knowledge');
fs.mkdirSync(knowledgeRoot, { recursive: true });

const site = 'https://www.quaerens.co.uk';
const today = '2026-07-16';
const nextReview = 'Reviewed when significant guidance changes';

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function orgSchema() {
  return { '@context': 'https://schema.org', '@type': 'Organization', name: 'Quaerens', url: site, logo: `${site}/images/quaerens-logo.png` };
}

function breadcrumb(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item[0], item: `${site}${item[1]}` }))
  };
}

function crumbs(items) {
  return `<nav class="breadcrumbs" aria-label="Breadcrumb">${items.map(([label, href], i) => i === items.length - 1 ? `<span>${esc(label)}</span>` : `<a href="${href}">${esc(label)}</a>`).join('<span>/</span>')}</nav>`;
}

function reviewPanel(type = 'Consumer guidance') {
  return `<aside class="review-panel" aria-label="Content review information"><p><strong>Prepared by:</strong> Quaerens Editorial Team</p><p><strong>Content type:</strong> ${esc(type)}</p><p><strong>Last reviewed:</strong> ${today}</p><p><strong>Next review:</strong> ${esc(nextReview)}</p><p><strong>Important:</strong> This content provides general educational information and does not constitute legal advice.</p></aside>`;
}

function card(title, text, href, cta = 'Open guide ->') {
  return `<a class="card" href="${href}"><h3>${esc(title)}</h3><p>${esc(text)}</p><strong>${esc(cta)}</strong></a>`;
}

function externalLink(label, href) {
  return `<a href="${href}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;
}

function layout({ title, description, canonical, body, schema = [] }) {
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
    *{box-sizing:border-box}body{margin:0;font-family:Inter,Arial,sans-serif;background:#f8fafc;color:#0f172a}.wrap{max-width:1140px;margin:0 auto;padding:0 1rem}.site-header{background:#fff;border-bottom:1px solid #e5e7eb;position:sticky;top:0;z-index:20}.header-inner{min-height:88px;display:flex;align-items:center;justify-content:space-between;gap:1rem}.logo{height:64px;width:auto}.nav{display:flex;gap:.45rem;align-items:center;flex-wrap:wrap;justify-content:flex-end}.nav a{color:#334155;text-decoration:none;font-weight:800;font-size:.93rem;padding:.62rem .76rem;border-radius:999px}.nav a:hover,.nav .active{background:#eff6ff;color:#1d4ed8}.btn{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:.86rem 1.18rem;font-weight:900;text-decoration:none}.btn-blue{background:#2563eb;color:#fff;box-shadow:0 14px 32px rgba(37,99,235,.22)}.btn-white{background:#fff;color:#1d4ed8;border:1px solid #bfdbfe}.hero{background:linear-gradient(90deg,rgba(15,23,42,.94),rgba(15,23,42,.72)),url('/images/hero-index.jpg') center/cover no-repeat;color:#fff}.hero-inner{padding:4.5rem 1rem}.eyebrow,.pill{color:#1d4ed8;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.pill{display:inline-flex;color:#fff;border:1px solid rgba(255,255,255,.32);background:rgba(255,255,255,.12);border-radius:999px;padding:.55rem .9rem}.hero h1{font-size:clamp(2.4rem,5.5vw,4.7rem);line-height:1.04;margin:1rem 0;font-weight:900;max-width:960px}.hero p{font-size:clamp(1.08rem,2vw,1.28rem);line-height:1.62;color:#eff6ff;max-width:850px}.hero-actions{display:flex;gap:.8rem;flex-wrap:wrap;margin-top:1.4rem}.breadcrumbs{display:flex;flex-wrap:wrap;gap:.55rem;align-items:center;font-size:.9rem;color:#64748b;margin:1.4rem 0}.breadcrumbs a{color:#1d4ed8;text-decoration:none;font-weight:800}.section{padding:3.7rem 0}.section h2{font-size:clamp(1.9rem,4vw,3rem);line-height:1.1;margin:.4rem 0 1rem;font-weight:900}.lead{font-size:1.1rem;line-height:1.7;color:#334155;max-width:880px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem;margin-top:1.4rem}.card{display:block;background:#fff;border:1px solid #dbeafe;border-radius:8px;padding:1.15rem;text-decoration:none;color:#0f172a;box-shadow:0 12px 28px rgba(15,23,42,.06)}.card h3{font-size:1.1rem;line-height:1.2;margin:0 0 .5rem;font-weight:900}.card p{color:#475569;line-height:1.55;margin:0}.card strong{display:inline-block;color:#1d4ed8;margin-top:.8rem}.card:hover{border-color:#60a5fa;box-shadow:0 16px 34px rgba(37,99,235,.12);transform:translateY(-2px)}.icon-badge{display:inline-flex;align-items:center;justify-content:center;width:2.35rem;height:2.35rem;border-radius:999px;background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;font-weight:900;margin-bottom:.8rem}.map-list{display:grid;gap:.7rem;margin-top:1.2rem}.map-row{display:grid;grid-template-columns:190px 1fr 220px;gap:.8rem;align-items:center;background:#fff;border:1px solid #dbeafe;border-radius:8px;padding:.85rem}.map-row strong{color:#1e3a8a}.map-row a{color:#1d4ed8;font-weight:900;text-decoration:none}.quick,.soft,.review-panel,.source-box{background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:1.2rem}.quick{border-left:5px solid #2563eb}.review-panel{background:#fff;margin-top:1.2rem}.review-panel p{margin:.3rem 0}.takeaways{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:.75rem;margin:1rem 0 0;padding:0;list-style:none}.takeaways li{background:#fff;border:1px solid #dbeafe;border-radius:8px;padding:.85rem 1rem;color:#1e3a8a;font-weight:800}.article-block{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:clamp(1.2rem,3vw,2rem);box-shadow:0 14px 34px rgba(15,23,42,.06)}.article-block p,.article-block li{font-size:1.04rem;line-height:1.72;color:#334155}.article-block a,.source-box a{color:#1d4ed8;font-weight:800}.faq details{background:#fff;border:1px solid #dbeafe;border-radius:8px;padding:1rem;margin:.7rem 0}.faq summary{cursor:pointer;font-weight:900;color:#0f172a}.faq p{margin:.75rem 0 0;color:#334155;line-height:1.65}.steps{counter-reset:step}.step:before{counter-increment:step;content:counter(step);display:inline-flex;width:2rem;height:2rem;border-radius:999px;background:#2563eb;color:#fff;align-items:center;justify-content:center;font-weight:900;margin-bottom:.75rem}.footer{border-top:1px solid #e5e7eb;background:#fff;color:#64748b;padding:2rem 0;font-size:.92rem}.footer a{color:#2563eb;text-decoration:none}@media(max-width:800px){.nav{display:none}.header-inner{min-height:76px}.logo{height:54px}.hero-inner{padding-top:3.5rem;padding-bottom:3.5rem}.map-row{grid-template-columns:1fr}}
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

const categories = [
  {
    slug: 'holiday-parks',
    title: 'Holiday Parks',
    intro: 'Guidance for static caravan, holiday lodge, pitch fee, resale, exit, finance and holiday park agreement concerns.',
    commercial: '/holidaypark.html',
    commercialLabel: 'Holiday Park Review',
    docs: [
      ['Purchase agreement', 'Shows what was bought, who sold it and the terms said to apply.'],
      ['Park rules and fee notices', 'Helps separate annual site charges, pitch rules, utilities and service charges.'],
      ['Sales brochures and messages', 'Can show income, resale, upgrade or easy-exit promises made before purchase.'],
      ['Repair and defect photographs', 'Dated images help explain condition issues, handover problems and later changes.']
    ],
    guides: [
      ['Holiday Park Knowledge Hub', '/holiday-park-knowledge-hub.html', 'Start with the full holiday park and static caravan guide collection.'],
      ['Holiday Park Misrepresentation', '/holiday-park-misrepresentation.html', 'Sales promises, income claims, resale value and occupation representations.'],
      ['Static Caravan Not As Described', '/static-caravan-not-as-described.html', 'Condition, specification, fixture and handover concerns.'],
      ['Holiday Park Site Fee Disputes', '/holiday-park-site-fee-disputes.html', 'Pitch fees, service charges, utilities and unexpected increases.'],
      ['Holiday Park Finance Problems', '/holiday-park-finance-problems.html', 'Finance agreements, affordability, deposits and linked purchase issues.'],
      ['Holiday Park Exit Problems', '/holiday-park-exit-problems.html', 'Leaving a park, resale restrictions, buyback and removal charges.'],
      ['Holiday Park Resale Problems', '/holiday-park-resale-problems.html', 'Low buyback offers, age limits, depreciation and resale restrictions.'],
      ['What Are Holiday Park Pitch Fees?', '/knowledge-what-are-holiday-park-pitch-fees.html', 'Plain-English guide to pitch fee evidence and running costs.']
    ],
    takeaways: ['Keep the purchase agreement, park rules and site licence documents.', 'Save brochures, emails and messages from the sales process.', 'Separate purchase issues from later site fee, repair or resale concerns.', 'Keep invoices, annual fee notices and any park correspondence.', 'A review depends on documents, dates, representations and available routes.']
  },
  {
    slug: 'spray-foam',
    title: 'Spray Foam',
    intro: 'Evidence-led guidance on spray foam insulation, mortgage refusals, surveyor concerns, removal costs and complaint routes.',
    commercial: '/foam-insulation.html',
    commercialLabel: 'Spray Foam Review',
    docs: [
      ['Installation paperwork', 'Identifies product, installer, date, warranty and any promised benefits.'],
      ['Surveyor or lender comments', 'Shows the actual concern raised about access, ventilation, roof condition or resale.'],
      ['Loft photographs', 'Images before and after installation can help explain what can or cannot be inspected.'],
      ['Removal or repair quotes', 'Scope of works, assumptions and costs help separate evidence from estimates.']
    ],
    guides: [
      ['Spray Foam Review', '/foam-insulation.html', 'The main review route for spray foam mortgage, sale, survey and removal concerns.'],
      ['Spray Foam Mortgage Problems', '/guidance-spray-foam-mortgage-problems.html', 'Mortgage refusal evidence and lender concern guidance.'],
      ['Spray Foam Surveyor Concerns', '/guidance-spray-foam-surveyor-concerns.html', 'Survey, timber visibility, ventilation and roof inspection evidence.'],
      ['Spray Foam Removal Costs', '/guidance-spray-foam-removal-costs.html', 'Removal quotes, roof repair costs and scope of works evidence.'],
      ['Why Lenders Worry About Spray Foam', '/knowledge-why-lenders-worry-about-spray-foam.html', 'Plain-English explanation of lender and surveyor concerns.'],
      ['Spray Foam Unsuitable for Some Mortgages', '/knowledge-spray-foam-unsuitable-mortgages.html', 'How installation, certification and inspection access can affect lending.'],
      ['Spray Foam Mortgage Refused', '/spray-foam-mortgage-refused.html', 'Dedicated route for refused mortgage or remortgage scenarios.']
    ],
    takeaways: ['Keep installation contracts, invoices and product documents.', 'Save lender, broker, valuer and surveyor comments.', 'Photograph the loft and roof space where possible.', 'Removal quotes should include scope of works and assumptions.', 'Outcomes depend on evidence, installation details and timing.']
  },
  {
    slug: 'travel',
    title: 'Travel',
    intro: 'Guidance on holiday refunds, Airbnb disputes, flight delay, lost luggage, cruise, insurance and timeshare evidence.',
    commercial: '/travel-claims-hub.html',
    commercialLabel: 'Travel Claims Hub',
    docs: [
      ['Booking confirmations', 'Shows dates, supplier, price, passengers or guests and the agreed service.'],
      ['Cancellation or delay notices', 'Helps connect the complaint to the exact event and provider explanation.'],
      ['Platform messages', 'Airbnb, airline, cruise or insurer messages often contain key admissions and deadlines.'],
      ['Extra cost receipts', 'Replacement accommodation, meals, transport or luggage costs should be linked to the event.']
    ],
    guides: [
      ['Airbnb Refunds', '/airbnb-refunds.html', 'Refund refused, host cancellation, property not as described and platform dispute support.'],
      ['Travel Claims Hub', '/travel-claims-hub.html', 'Start here for travel and leisure complaint routes.'],
      ['Holiday Cancellation Refund Evidence', '/guidance-holiday-cancellation-refund-evidence.html', 'Evidence for cancellation, refund and holiday-provider complaints.'],
      ['Lost Luggage Claim Evidence', '/guidance-lost-luggage-claim-evidence.html', 'Documents and timelines for baggage delay and loss complaints.'],
      ['Flight Delay Rejected Claim', '/guidance-flight-delay-claim-rejected-next-steps.html', 'Next steps after a rejected delay compensation claim.'],
      ['Timeshare Exit Evidence Checklist', '/guidance-timeshare-exit-evidence-checklist.html', 'Evidence for timeshare exit and complaint preparation.'],
      ['Timeshare Contract in Perpetuity Evidence', '/guidance-timeshare-contract-in-perpetuity-evidence.html', 'Documents for long-term timeshare contract concerns.']
    ],
    takeaways: ['Keep booking confirmations and cancellation notices.', 'Save platform messages and complaint reference numbers.', 'Photograph accommodation problems where relevant.', 'Keep receipts for replacement accommodation or travel expenses.', 'Match each cost to the event and supporting evidence.']
  },
  {
    slug: 'finance',
    title: 'Finance',
    intro: 'Guidance on car finance, pensions, loans, investments, equity release, Section 75 and finance-linked consumer disputes.',
    commercial: '/financial-disputes-hub.html',
    commercialLabel: 'Financial Disputes Hub',
    docs: [
      ['Finance agreement', 'Shows the product type, lender, dates, payment terms and total amount payable.'],
      ['Sales explanation', 'Dealer, broker or adviser messages can show what was explained before signing.'],
      ['Statements and payment history', 'Helps connect charges, arrears, settlement figures or affordability concerns to records.'],
      ['Final response letters', 'Dates and complaint references matter if an ombudsman or escalation route is considered.']
    ],
    guides: [
      ['Financial Disputes Hub', '/financial-disputes-hub.html', 'Main hub for financial complaint and evidence routes.'],
      ['Free Car Finance Complaint Pack Builder', '/car-finance.html', 'Create, review and send your own car-finance complaint documents using the free self-service tool.'],
      ['PCP Car Finance Documents', '/guidance-pcp-car-finance-commission-documents.html', 'Documents that help with commission and car finance complaints.'],
      ['Pension Transfer Documents', '/guidance-pension-transfer-complaint-documents.html', 'Evidence for pension transfer and advice complaints.'],
      ['Equity Release Complaint Evidence', '/guidance-equity-release-complaint-evidence.html', 'Documents for equity release and later-life lending concerns.'],
      ['Section 75 Support', '/section75support.html', 'Credit-card purchase protection route.'],
      ['What Documents Matter in Car Finance Complaints?', '/knowledge-car-finance-documents.html', 'Plain-English car finance evidence guide.']
    ],
    takeaways: ['Keep finance agreements, statements and key facts documents.', 'Save sales explanations, affordability discussions and complaint replies.', 'Separate product problems from finance-provider issues.', 'Keep final response letters and dates.', 'Finance routes depend on evidence, timing and provider responsibility.']
  },
  {
    slug: 'property',
    title: 'Property',
    intro: 'Guidance on spray foam, solar, new build, housing disrepair, survey, mortgage, equity release and sale-and-rent-back issues.',
    commercial: '/property-disputes-hub.html',
    commercialLabel: 'Property Disputes Hub',
    docs: [
      ['Contracts and surveys', 'Show obligations, condition, inspection findings and what was known at the time.'],
      ['Dated photographs', 'Defect, disrepair and installation evidence is stronger when images can be placed in time.'],
      ['Repair correspondence', 'Emails, reports and contractor comments help show what was reported and when.'],
      ['Quotes and invoices', 'Useful for separating confirmed costs from estimates or general dissatisfaction.']
    ],
    guides: [
      ['Property Disputes Hub', '/property-disputes-hub.html', 'Main property support hub.'],
      ['Spray Foam Review', '/foam-insulation.html', 'Spray foam mortgage, survey, sale and removal concerns.'],
      ['Solar Support', '/solar-support.html', 'Solar panel finance, installation and system performance issues.'],
      ['New Build Issues', '/newbuild-issues.html', 'Snagging, defects, workmanship and developer delay concerns.'],
      ['Housing Disrepair', '/housing-disrepair.html', 'Damp, mould, leaks and unresolved landlord repairs.'],
      ['New Build Snagging Evidence', '/guidance-new-build-snagging-dispute-evidence.html', 'Evidence checklist for new build defects.'],
      ['Housing Disrepair Evidence Checklist', '/guidance-housing-disrepair-evidence-checklist.html', 'Evidence for disrepair and repair delay complaints.']
    ],
    takeaways: ['Keep contracts, surveys, photographs and repair correspondence.', 'Create a dated schedule of defects or concerns.', 'Separate condition evidence from finance or sales-promise evidence.', 'Save all inspection notes and professional comments.', 'Property complaint routes depend on documents, chronology and responsibility.']
  },
  {
    slug: 'banking',
    title: 'Banking',
    intro: 'Guidance on APP fraud, frozen accounts, packaged accounts, refused refunds and banking complaint evidence.',
    commercial: '/app-fraud-bank-scam-refunds.html',
    commercialLabel: 'Bank Scam Refund Review',
    docs: [
      ['Bank warnings and messages', 'Warnings, payment prompts and fraud-team messages can be central to a banking complaint.'],
      ['Transaction records', 'Amounts, dates, recipient details and reference numbers should be preserved exactly.'],
      ['Scam communications', 'Chats, adverts, emails and platform messages may explain how the payment happened.'],
      ['Complaint response history', 'Keep acknowledgements, final responses and any refund refusal reasons.']
    ],
    guides: [
      ['APP Fraud Bank Scam Refunds', '/app-fraud-bank-scam-refunds.html', 'Refused reimbursement and bank transfer scam support.'],
      ['APP Fraud Refused Refund Evidence', '/guidance-app-fraud-bank-refused-refund.html', 'Evidence for refused APP fraud reimbursement complaints.'],
      ['APP Fraud Evidence', '/guidance-app-fraud-bank-evidence.html', 'Documents and screenshots that may help APP fraud reviews.'],
      ['Frozen Bank Account Documents', '/guidance-frozen-bank-account-complaint-documents.html', 'Evidence for frozen, blocked or restricted bank accounts.'],
      ['Mis-sold Packaged Bank Account Evidence', '/guidance-mis-sold-packaged-bank-account-evidence.html', 'Documents for packaged bank account complaints.'],
      ['Missold Bank Accounts', '/misssold-bankaccounts.html', 'Commercial support for packaged or unsuitable bank account concerns.']
    ],
    takeaways: ['Keep bank messages, warnings and scam communications.', 'Save transaction records and complaint reference numbers.', 'Keep screenshots of adverts, chats, platforms or payment requests.', 'Record the timeline from first contact to bank report.', 'Banking outcomes depend on evidence, timing and provider response.']
  },
  {
    slug: 'digital',
    title: 'Digital',
    intro: 'Guidance on crypto recovery, digital platforms, blocked accounts, cyber incidents, data rights and online consumer disputes.',
    commercial: '/digital-platform-disputes-hub.html',
    commercialLabel: 'Digital Platform Disputes Hub',
    docs: [
      ['Screenshots', 'Capture account status, balances, listings, warnings and messages before they change.'],
      ['Platform tickets', 'Support references and replies help prove what was reported and when.'],
      ['Transaction records', 'Wallet, transfer, order or subscription records should be exported where possible.'],
      ['Account notices', 'Suspension, restriction and data-rights notices may explain the platform position.']
    ],
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
    docs: [
      ['Proof of purchase', 'Receipts, invoices and order confirmations show what was bought and when.'],
      ['Payment method evidence', 'Credit card, debit card, finance or transfer records affect the available route.'],
      ['Complaint letters and replies', 'A clear paper trail helps show what was raised and how the business responded.'],
      ['Final responses', 'Dates and final decision wording are important for escalation and ombudsman routes.']
    ],
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

const methodologyPages = {
  'editorial-standards': {
    title: 'Editorial Standards',
    description: 'How Quaerens plans, writes, reviews and corrects consumer guidance while keeping educational content separate from commercial service pages.',
    quick: 'The Quaerens editorial standards explain how educational pages are planned, written and reviewed. The aim is to make guidance useful, neutral and evidence-led while making clear that outcomes are not guaranteed and that educational content is separate from commercial service pages.',
    takeaways: ['Educational pages explain issues and evidence; they do not promise outcomes.', 'Plain-English wording is preferred over legal or technical jargon.', 'Commercial service pages are kept separate from neutral guidance pages.', 'Important factual changes are reviewed and corrected where needed.', 'Illustrative examples should be labelled as examples, not guaranteed results.'],
    sections: [
      ['What Are the Quaerens Editorial Standards?', 'The standards guide how Quaerens educational content is planned, written and maintained. Articles should help visitors understand common consumer issues, the documents that may matter and the practical routes that may be relevant. They should not exaggerate likely outcomes or suggest that every issue has the same answer.'],
      ['How Is Content Researched?', 'Topics are planned around common consumer questions, Search Console evidence, client enquiries and known evidence problems. Official sources are preferred for legal, regulatory or technical claims. Consumer documents, correspondence and complaint decisions are treated as evidence of an individual matter, not as proof that every similar matter will have the same result.'],
      ['How Do We Keep Guidance Neutral?', 'Neutral guidance separates what is known, what may be relevant and what still needs checking. Wording should avoid phrases such as guaranteed claim, definite refund or certain compensation. Where facts are uncertain, the page should say so plainly. Quaerens should not be presented as a law firm or regulated legal adviser.'],
      ['How Are Corrections Made?', 'If a material error is identified, the content should be reviewed and corrected. Visitors can raise corrections through the contact page at /contact.html. Corrections should focus on accuracy, clarity and whether the page may have become outdated.'],
      ['How Often Is Content Reviewed?', `Pages show a last-reviewed date where practical. Some pages are reviewed when official guidance changes, when Search Console shows a new search pattern, or when repeated enquiries show that a section is unclear.`],
      ['How Do We Separate Guidance From Commercial Services?', 'Knowledge Centre pages are educational. Service pages explain available Quaerens routes. A guidance page may link to a relevant service page, but it should not pretend that reading a guide means the visitor qualifies for a particular outcome.']
    ],
    sources: [['GOV.UK', 'https://www.gov.uk/'], ['Financial Conduct Authority', 'https://www.fca.org.uk/'], ['Financial Ombudsman Service', 'https://www.financial-ombudsman.org.uk/']]
  },
  'sources-we-use': {
    title: 'Sources We Use',
    description: 'The hierarchy of official, technical, professional and consumer-specific sources used when preparing Quaerens guidance.',
    quick: 'Quaerens gives most weight to official, current and verifiable sources. Consumer documents are important for individual complaints, but they are not treated as general authority for every similar case. AI-generated text is never treated as an authoritative source.',
    takeaways: ['Official sources are preferred for legal and regulatory points.', 'Technical claims should be supported by technical or professional material.', 'Consumer documents help explain an individual issue.', 'Older material is checked for continued relevance.', 'Anonymous or unverifiable claims are not treated as authoritative.'],
    sections: [
      ['What Sources Does Quaerens Use?', 'Sources can include legislation, GOV.UK guidance, regulator pages, ombudsman material, technical bodies, professional reports, manufacturer documents and consumer-specific evidence such as contracts, invoices, emails, photographs and payment records.'],
      ['Which Sources Are Given Most Weight?', 'Primary official sources are given the greatest weight for legal and regulatory statements. These include UK legislation, GOV.UK, the Financial Conduct Authority, the Financial Ombudsman Service, the Information Commissioner, the Competition and Markets Authority and official local-authority or Trading Standards material where relevant.'],
      ['How Do We Check Whether Information Is Current?', 'Pages should be checked against the latest available official source where the topic is legal, regulatory or time-sensitive. Older sources may still be useful background, but they should not be relied upon if official guidance has changed.'],
      ['How Are Conflicting Sources Handled?', 'When sources disagree, the page should avoid overstating certainty. It should explain the issue in cautious terms, prefer official material where appropriate and make clear that individual evidence may affect the route available.'],
      ['How Are Consumer Documents Used?', 'Consumer documents are used to understand what happened in a specific situation. They can show dates, representations, payments, complaints and responses, but they do not prove that every similar consumer has the same complaint or outcome.']
    ],
    sources: [['legislation.gov.uk', 'https://www.legislation.gov.uk/'], ['GOV.UK', 'https://www.gov.uk/'], ['FCA', 'https://www.fca.org.uk/'], ['Financial Ombudsman Service', 'https://www.financial-ombudsman.org.uk/'], ['ICO', 'https://ico.org.uk/'], ['CMA', 'https://www.gov.uk/government/organisations/competition-and-markets-authority']]
  },
  'research-methodology': {
    title: 'Research Methodology',
    description: 'How Quaerens selects consumer topics, checks sources and uses search intent without allowing keywords to dictate conclusions.',
    quick: 'Quaerens researches consumer topics by combining common enquiry patterns, search demand, official sources and practical evidence needs. Search intent helps decide what to explain first, but it should not change the conclusion where official guidance or documents point elsewhere.',
    takeaways: ['Search demand helps prioritise topics, not conclusions.', 'Official sources are identified before legal or regulatory claims are made.', 'Technical statements should be checked against relevant technical material.', 'Uncertain issues should be qualified rather than overstated.', 'AI tools may assist drafting but do not replace source checking.'],
    sections: [
      ['How Does Quaerens Research Consumer Topics?', 'Topics are chosen from common consumer enquiries, Search Console data, recurring evidence gaps and areas where visitors need plain-English guidance before choosing a route. A topic should have a clear practical purpose rather than exist only to target a keyword.'],
      ['How Are Official Sources Identified?', 'For legal, regulatory or ombudsman topics, the first step is to look for official sources such as legislation, GOV.UK, regulators or ombudsman bodies. Secondary sources can help explain background, but they should not override official material.'],
      ['How Is Search Intent Used?', 'Search intent helps shape headings, examples and the order of information. For example, a visitor searching for a refused refund may need a direct answer before reading a detailed evidence checklist.'],
      ['How Do We Check Legal and Regulatory Information?', 'Legal and regulatory information should be checked against the relevant jurisdiction and date. If a topic is changing, wording should make clear that current official guidance should be checked before action is taken.'],
      ['How Do We Handle Uncertainty?', 'Uncertain points are qualified. A page may explain that evidence, timing, contract wording, provider response or official rules can affect the route. It should not imply that the same outcome follows in every case.'],
      ['How Are Articles Reviewed and Updated?', 'Articles may be reviewed after official updates, repeated visitor confusion, Search Console changes or internal quality checks. Corrections should improve accuracy and clarity without turning educational pages into sales pages.']
    ],
    sources: [['Google Search Central', 'https://developers.google.com/search'], ['GOV.UK', 'https://www.gov.uk/'], ['Financial Ombudsman Service', 'https://www.financial-ombudsman.org.uk/']]
  },
  'document-review-process': {
    title: 'Document Review Process',
    description: 'How consumer documents can be sorted, indexed and checked for chronology, evidence gaps and possible next-step routes.',
    quick: 'A document review is an organisation exercise. It sorts records by issue, date and document type so the facts can be understood more clearly. It does not decide legal liability, replace expert evidence or guarantee that a complaint will succeed.',
    takeaways: ['Documents are grouped by type and issue.', 'A date-order chronology helps reveal gaps and contradictions.', 'Contracts and payment records are separated from complaint correspondence.', 'Financial impact should be scheduled where relevant.', 'A review pack should make evidence easier to understand, not exaggerate it.'],
    sections: [
      ['What Happens During a Document Review?', 'The issue is identified first, then available documents are collected and sorted. Duplicate, irrelevant or unclear items are separated so the useful records can be indexed. The aim is to understand what happened, what evidence supports it and what is still missing.'],
      ['How Are Documents Categorised?', 'Common categories include contracts, invoices, finance documents, photographs, reports, emails, complaint letters, final responses, payment records and notes of calls. The categories should match the dispute rather than force every file into the same template.'],
      ['How Is a Chronology Prepared?', 'Key dates are placed in order: purchase, promise, installation, discovery of the issue, complaint, response and escalation. Each date should be linked to a source where possible, such as an email, invoice or report.'],
      ['How Are Evidence Gaps Identified?', 'A gap may be a missing agreement, unclear payment record, absent photograph, unknown lender, missing final response or unsupported verbal promise. Gaps should be recorded calmly so the consumer knows what may still be useful.'],
      ['What Does a Document Review Not Decide?', 'A document review does not provide legal advice, technical expert evidence, regulated claims management or a guarantee of compensation. It helps organise information so a possible next step can be considered.'],
      ['What Might Be Included in a Review Pack?', 'A review pack may include a document index, chronology, issue summary, evidence-gap list, financial-impact schedule and suggested routes for complaint preparation or self-help.']
    ],
    sources: [['Financial Ombudsman Service', 'https://www.financial-ombudsman.org.uk/'], ['GOV.UK complaints guidance', 'https://www.gov.uk/consumer-protection-rights']]
  },
  'how-we-prepare-complaint-packs': {
    title: 'How We Prepare Complaint Packs',
    description: 'How facts, evidence, chronology and financial impact can be structured into a clear consumer complaint pack.',
    quick: 'A complaint pack turns scattered documents into a structured explanation of the issue. It should identify the complaint objective, the parties, the chronology, the evidence relied on, any financial impact and the outcome requested, without exaggerating unsupported points.',
    takeaways: ['The complaint objective should be clear from the start.', 'Facts should be linked to documents where possible.', 'Financial loss should be separated from general inconvenience.', 'Unsupported conclusions should be removed or qualified.', 'A complaint pack does not guarantee acceptance or compensation.'],
    sections: [
      ['What Is a Complaint Pack?', 'A complaint pack is a structured set of documents that explains the issue, the evidence and the requested outcome. It may include a complaint letter, chronology, evidence index, financial-impact schedule and supporting documents.'],
      ['What Does a Complaint Pack Contain?', 'It usually contains the parties involved, contract or transaction summary, key representations or disputed events, complaint history, documents relied on, unresolved gaps and the practical outcome being requested.'],
      ['How Are Facts Linked to Evidence?', 'Each important statement should be supported by a document, date, photograph, email, message, report or payment record where possible. If the evidence is missing or based on recollection, that should be made clear.'],
      ['How Is Financial Loss Presented?', 'Financial impact should be set out as a schedule with dates, amounts, descriptions and supporting records. Not every cost is recoverable, so the pack should distinguish documented costs from assumptions.'],
      ['How Is the Requested Outcome Explained?', 'The requested outcome should be realistic, specific and linked to the issue. It may ask for a refund, explanation, repair, correction, response, records or escalation, depending on the complaint route.'],
      ['What Is Excluded From a Complaint Pack?', 'A complaint pack should exclude unsupported allegations, irrelevant background, duplicate documents and language that overstates what the evidence proves.']
    ],
    sources: [['Financial Ombudsman Service', 'https://www.financial-ombudsman.org.uk/consumers/how-to-complain'], ['Citizens Advice', 'https://www.citizensadvice.org.uk/']]
  },
  'complaint-timeline-methodology': {
    title: 'Complaint Timeline Methodology',
    description: 'How dates, phone calls, correspondence and evidence references are arranged into a clear complaint chronology.',
    quick: 'A complaint timeline puts events in date order so the issue is easier to follow. It separates what happened, when it happened, how it is evidenced and what remains uncertain. A good timeline is factual rather than emotional.',
    takeaways: ['Exact dates are best, but approximate dates should be labelled clearly.', 'Purchase, discovery, complaint and response dates should be separated.', 'Phone calls should record date, time, person spoken to and summary.', 'Unanswered correspondence and delays can be important timeline events.', 'Contradictions should be corrected or explained, not hidden.'],
    sections: [
      ['What Is a Complaint Timeline?', 'A complaint timeline is a dated sequence of events. It helps a reader understand the purchase or agreement, the issue, when it was discovered, what was reported and how the business responded.'],
      ['Which Dates Should Be Included?', 'Include purchase dates, delivery or installation dates, discovery of defects, finance or payment milestones, complaint dates, acknowledgement dates, final responses, missed deadlines and escalation dates.'],
      ['How Should Telephone Calls Be Recorded?', 'Record the date, approximate time, number called, person or team spoken to, what was discussed and any promised action. Avoid reconstructing long conversations as exact quotes unless a recording or note supports that.'],
      ['What if the Exact Date Is Unknown?', 'Use an approximate date and label it clearly, such as early March 2025 or around the week after installation. Do not present a guessed date as exact.'],
      ['How Should Supporting Evidence Be Referenced?', 'Add a short evidence reference beside each event, such as Invoice 1, Email 4, Photo 7 or Final Response. This helps the reader connect the chronology to the document bundle.'],
      ['What Common Timeline Mistakes Should Be Avoided?', 'Avoid emotional commentary, repeated events, unsupported allegations, missing dates, unexplained gaps and mixing several different issues into one confusing paragraph.']
    ],
    sources: [['Financial Ombudsman Service complaints process', 'https://www.financial-ombudsman.org.uk/consumers/how-to-complain']]
  },
  'how-quaerens-reviews-evidence': {
    title: 'How Quaerens Reviews Evidence',
    description: 'How evidence is checked for relevance, chronology, source, consistency, gaps and possible next-step routes.',
    quick: 'Evidence review means checking whether documents support the issue being raised. It looks at dates, source reliability, consistency, missing records and financial impact. It does not turn weak evidence into a guaranteed complaint outcome.',
    takeaways: ['Evidence should be relevant to the issue, not simply plentiful.', 'Dates and document sources help show reliability.', 'Contradictions should be identified early.', 'Missing evidence can be as important as available evidence.', 'The outcome still depends on the route, provider response and facts.'],
    sections: [
      ['What Makes Evidence Useful?', 'Useful evidence helps show what happened, when it happened, who was involved and how the consumer was affected. Contracts, invoices, emails, photographs and official responses are often stronger than general recollection alone.'],
      ['How Is Evidence Checked?', 'Evidence is checked against the issue raised. A photograph may help with a defect, a contract may help with a disputed term, and a bank statement may help with payment history. Each item should have a reason for being included.'],
      ['How Are Contradictions Handled?', 'Contradictions should be recorded and explained where possible. If an email says one thing and a later letter says another, both documents may matter. The aim is clarity, not hiding difficult evidence.'],
      ['How Are Evidence Gaps Treated?', 'A gap may mean the issue needs more information before a complaint route is clear. A missing agreement, missing quote or missing final response should be listed rather than ignored.'],
      ['How Is Financial Impact Presented?', 'Financial impact should be supported by invoices, receipts, payment records, quotes or schedules. A general feeling of unfairness should be separated from documented loss.'],
      ['What Does Evidence Review Not Do?', 'It does not guarantee compensation, provide legal advice or replace a technical expert where specialist inspection is needed.']
    ],
    sources: [['Financial Ombudsman Service', 'https://www.financial-ombudsman.org.uk/'], ['GOV.UK consumer rights', 'https://www.gov.uk/consumer-protection-rights']]
  }
};

const evidencePages = [
  {
    slug: 'knowledge-save-emails-correctly',
    title: 'How to Save Emails Correctly',
    description: 'How to preserve consumer complaint emails, attachments, dates and message threads without losing important evidence.',
    quick: 'Save complaint emails in a way that keeps the sender, recipient, date, subject, message body and attachments together. Screenshots can help, but exported emails or PDFs are usually clearer because they preserve more detail.',
    takeaways: ['Keep the full email thread where possible.', 'Save attachments with the email they came with.', 'Do not edit the message body before saving evidence.', 'Use clear filenames with dates and sender names.', 'Keep both sent and received messages.'],
    steps: ['Create a folder for the dispute.', 'Save key emails as PDF or email files where possible.', 'Download attachments and name them consistently.', 'Keep sent items, not only replies received.', 'Record any missing emails in a short note.'],
    examples: ['A booking cancellation email should be saved with the original booking confirmation and any refund reply.', 'A lender email should be saved with the agreement number and any attached final response.'],
    mistakes: ['Only keeping screenshots with no date or sender.', 'Deleting attachments after saving the email body.', 'Forwarding messages to yourself and losing the original header detail.']
  },
  {
    slug: 'knowledge-complaint-diary',
    title: 'How to Keep a Complaint Diary',
    description: 'How to keep a dated complaint diary for calls, messages, missed responses and practical impact.',
    quick: 'A complaint diary is a simple dated record of what happened after the issue was discovered. It can include phone calls, unanswered emails, repair visits, promises, delays and practical impact. It should be factual and updated close to the event.',
    takeaways: ['Write entries close to the event.', 'Separate facts from feelings or assumptions.', 'Record who you contacted and what they said.', 'Include unanswered messages and missed deadlines.', 'Keep the diary consistent with your document timeline.'],
    steps: ['Set up a table with date, contact, event, evidence and next action.', 'Add phone calls and emails on the day they happen.', 'Note missed deadlines or promised callbacks.', 'Link diary entries to documents where possible.', 'Review for accuracy before using it in a complaint.'],
    examples: ['A disrepair diary might record each report to the landlord and each missed repair appointment.', 'A holiday refund diary might record each platform message and refund refusal.'],
    mistakes: ['Writing long emotional paragraphs instead of dated facts.', 'Adding guessed dates without labelling them as approximate.', 'Leaving out unanswered contact attempts.']
  },
  {
    slug: 'knowledge-record-phone-calls-notes',
    title: 'How to Record Telephone Calls and Notes',
    description: 'How to keep useful records of calls, names, dates, promises and follow-up actions during a complaint.',
    quick: 'Phone-call notes should record when the call happened, who was involved, what was discussed and what action was promised. Notes are strongest when written immediately after the call and linked to any follow-up email or reference number.',
    takeaways: ['Record the date, time and number called.', 'Ask for the name or department if appropriate.', 'Write down any complaint reference number.', 'Summarise promises or next steps in plain language.', 'Send a follow-up email if the call included an important promise.'],
    steps: ['Prepare a call-note template before calling.', 'Record the time, department and reference number.', 'Summarise the issue discussed.', 'List any action promised and deadline given.', 'Save the note with the rest of the complaint evidence.'],
    examples: ['A lender call note might record a promised final response date.', 'A park operator call note might record an explanation of transfer fees.'],
    mistakes: ['Treating memory months later as an exact record.', 'Not recording who you spoke to.', 'Mixing several calls into one vague note.']
  },
  {
    slug: 'knowledge-present-financial-losses',
    title: 'How to Present Financial Losses',
    description: 'How to set out claimed costs, payments, quotes and losses clearly without overstating what the evidence proves.',
    quick: 'Financial losses should be listed in a simple schedule with dates, amounts, description, reason and supporting evidence. Not every cost will be recoverable, so separate documented costs from estimates, inconvenience and general dissatisfaction.',
    takeaways: ['Use a table rather than scattered paragraphs.', 'Link every amount to a document where possible.', 'Separate paid costs from quotes or estimates.', 'Do not include unsupported figures as confirmed loss.', 'Explain how each cost relates to the issue.'],
    steps: ['List each cost on a separate line.', 'Add the date and amount.', 'Describe why the cost arose.', 'Reference the invoice, receipt, quote or bank statement.', 'Mark estimates clearly as estimates.'],
    examples: ['A spray foam removal quote should be labelled as a quote unless already paid.', 'A replacement accommodation receipt should be linked to the cancelled or unsafe booking.'],
    mistakes: ['Adding round-number estimates without evidence.', 'Mixing emotional impact with financial loss.', 'Claiming every inconvenience as a recoverable cost.']
  },
  {
    slug: 'knowledge-preserve-screenshots-online-listings',
    title: 'How to Preserve Screenshots and Online Listings',
    description: 'How to capture online adverts, listings, account screens and platform messages before they change or disappear.',
    quick: 'Online evidence can disappear quickly. Capture screenshots showing the date, page address where possible, full listing text, price, images, terms and messages. Save the files with clear names and keep them with the rest of the complaint bundle.',
    takeaways: ['Capture the full page, not only the attractive headline.', 'Include the URL and date where possible.', 'Save listing images and terms together.', 'Keep original files, not just compressed chat images.', 'Record when the page changed or disappeared.'],
    steps: ['Take screenshots of the page header, listing details and terms.', 'Save the URL in a note or PDF.', 'Capture relevant messages or account notices.', 'Name files by date and topic.', 'Add the screenshots to the evidence index.'],
    examples: ['An Airbnb listing screenshot may show amenities promised before booking.', 'A crypto platform screenshot may show a blocked withdrawal message.'],
    mistakes: ['Cropping out the date or account context.', 'Relying on a live link that may later change.', 'Saving images without noting what they show.']
  },
  {
    slug: 'knowledge-index-complaint-documents',
    title: 'How to Index Complaint Documents',
    description: 'How to create a document index so complaint evidence is easier to follow, review and reference.',
    quick: 'A document index is a numbered list of evidence. It gives each item a short title, date, document type and relevance note. This helps complaint letters and timelines refer to evidence without overwhelming the reader.',
    takeaways: ['Number each document once.', 'Use short descriptive titles.', 'Record the date and document type.', 'Explain why each item matters.', 'Use the same document numbers in the timeline.'],
    steps: ['Gather the documents in one folder.', 'Remove duplicates where safe to do so.', 'Create a numbered list.', 'Add date, title, type and relevance.', 'Use those numbers in the complaint letter or timeline.'],
    examples: ['Document 4: Installer invoice dated 12 May 2024.', 'Document 9: Final response letter dated 3 February 2026.'],
    mistakes: ['Renumbering documents halfway through a complaint.', 'Including every duplicate copy.', 'Using vague titles such as email 1, email 2, email 3.']
  },
  {
    slug: 'knowledge-record-missing-evidence',
    title: 'How to Record Missing or Unavailable Evidence',
    description: 'How to explain missing documents, unavailable records and evidence gaps without weakening the clarity of a complaint.',
    quick: 'Missing evidence should be recorded honestly. A short gap list can explain what is missing, why it may matter, whether it has been requested and what evidence is available instead. Do not pretend missing documents exist.',
    takeaways: ['List missing items separately.', 'Explain whether the item has been requested.', 'Do not invent dates or document wording.', 'Use alternative evidence where available.', 'Review gaps before sending a complaint.'],
    steps: ['Create a missing evidence list.', 'Record why each item may matter.', 'Say whether it has been requested and from whom.', 'Add any alternative evidence.', 'Update the list if the document is later found.'],
    examples: ['An unknown lender can be recorded as a gap while a dealer request is prepared.', 'A missing agreement can be noted alongside bank statements showing payments.'],
    mistakes: ['Ignoring gaps until the business raises them.', 'Guessing the content of a missing document.', 'Mixing missing evidence with proven facts.']
  }
];

const evidenceGuideCards = [
  ['How to Build a Complaint Timeline', 'Create a date-order record of purchases, promises, problems, complaints and responses.', '/knowledge-how-to-write-complaint-timeline.html'],
  ['How to Organise Evidence', 'Sort documents by issue, date and type before choosing a complaint route.', '/knowledge-prepare-evidence-consumer-complaint.html'],
  ['How to Photograph Defects', 'Capture dated, useful images of defects, repairs and condition problems.', '/guidance-new-build-snagging-dispute-evidence.html'],
  ['How to Save Emails Correctly', 'Preserve sender, date, thread, attachments and message context.', '/knowledge-save-emails-correctly.html'],
  ['How to Write a Complaint Letter', 'Use clear, supported wording without exaggeration or unsupported conclusions.', '/consumer-complaint-letters.html'],
  ['What Makes Good Evidence?', 'Understand relevance, reliability, chronology, gaps and contradictions.', '/knowledge/how-quaerens-reviews-evidence/'],
  ['Evidence Checklist Library', 'Browse practical evidence checklists across consumer, property, finance and travel topics.', '/guidance.html'],
  ['Preparing Documents for Review', 'Understand how documents are categorised, indexed and checked for gaps.', '/knowledge/document-review-process/'],
  ['Downloadable Templates', 'Find free calculators, templates, letter tools and practical complaint routes.', '/category-free-tools.html'],
  ['How to Record Telephone Calls and Notes', 'Keep useful records of calls, references, promises and follow-up actions.', '/knowledge-record-phone-calls-notes.html'],
  ['How to Keep a Complaint Diary', 'Maintain a factual diary of reports, responses, delays and practical impact.', '/knowledge-complaint-diary.html'],
  ['How to Present Financial Losses', 'List costs, quotes, payments and supporting documents clearly.', '/knowledge-present-financial-losses.html'],
  ['How to Preserve Screenshots and Online Listings', 'Capture online evidence before pages, prices or messages change.', '/knowledge-preserve-screenshots-online-listings.html'],
  ['How to Index Complaint Documents', 'Number and describe evidence so letters and timelines are easy to follow.', '/knowledge-index-complaint-documents.html'],
  ['How to Record Missing or Unavailable Evidence', 'Explain gaps honestly and record what has been requested.', '/knowledge-record-missing-evidence.html']
];

const eeatPages = Object.entries(methodologyPages).map(([slug, p]) => [slug, p.title, p.description]);

function categoryPage(cat) {
  const urlPath = `/knowledge/${cat.slug}/`;
  const canonical = `${site}${urlPath}`;
  const faq = [
    [`What is the ${cat.title} Knowledge Hub for?`, `It brings together practical ${cat.title.toLowerCase()} guidance, evidence checklists and related routes so visitors can research the issue before choosing a next step.`],
    ['What documents should I keep?', `Keep the documents most relevant to the issue, including ${cat.docs.map(d => d[0].toLowerCase()).slice(0, 3).join(', ')} and any complaint replies.`],
    ['Does reading this hub mean I have a valid complaint?', 'No. The hub is educational. Whether a complaint route is available depends on the facts, documents, dates and provider response.'],
    ['Where should I go next?', `Start with the guide closest to your issue, then use the Evidence Centre or the related ${cat.commercialLabel} page if that is appropriate.`]
  ];
  const cta = cat.slug === 'finance'
    ? ['Use the Free Car Finance Complaint Pack Builder', '/car-finance.html', 'Create, review and send your own car-finance complaint documents using the free self-service tool.']
    : [`Open ${cat.commercialLabel}`, cat.commercial, `Review the related ${cat.title.toLowerCase()} route when you have enough information to consider next steps.`];
  const body = `  <main>
    <div class="wrap">${crumbs([['Home','/'], ['Consumer Rights Knowledge Centre','/consumer-rights-knowledge-centre.html'], [`${cat.title} Knowledge Hub`, urlPath]])}</div>
    <section class="hero"><div class="wrap hero-inner"><span class="pill">Knowledge category</span><h1>${esc(cat.title)} Knowledge Hub</h1><p>${esc(cat.intro)}</p><div class="hero-actions"><a class="btn btn-blue" href="${cta[1]}">${esc(cta[0])}</a><a class="btn btn-white" href="/consumer-rights-knowledge-centre.html">All knowledge categories</a></div></div></section>
    <section class="section"><div class="wrap"><div class="quick"><p class="eyebrow">Quick Answer</p><p>${esc(cat.intro)} Use this hub to understand the issue, gather the right evidence and move to the relevant guide or route only when the facts are clearer.</p></div><h2>Key Takeaways</h2><ul class="takeaways">${cat.takeaways.map(t => `<li>${esc(t)}</li>`).join('')}</ul>${reviewPanel()}</div></section>
    <section class="section"><div class="wrap article-block"><p class="eyebrow">New here?</p><h2>Read these guides first</h2><p class="lead">These pages help you understand the issue before deciding whether to request support or use a free tool.</p><div class="grid">${cat.guides.slice(0, 3).map(g => card(g[0], g[2], g[1], 'Start here ->')).join('')}</div></div></section>
    <section class="section"><div class="wrap"><p class="eyebrow">Related guides</p><h2>All ${esc(cat.title)} guides and routes</h2><p class="lead">Each page explains the issue, evidence and practical next steps in plain English.</p><div class="grid">${cat.guides.map(g => card(g[0], g[2], g[1], 'Read guide ->')).join('')}</div></div></section>
    <section class="section"><div class="wrap article-block"><h2>What documents should I keep?</h2><div class="grid">${cat.docs.map(([title, text]) => `<div class="card"><h3>${esc(title)}</h3><p>${esc(text)}</p></div>`).join('')}</div></div></section>
    <section class="section"><div class="wrap article-block"><h2>What happens next?</h2><div class="grid steps">${['Choose the guide closest to the issue.','Use the Evidence Centre to organise documents.','Check whether any official or provider response changes the route.','Move to the related service or free tool only if it fits the facts.'].map(x => `<div class="card step"><p>${esc(x)}</p></div>`).join('')}</div></div></section>
    <section class="section faq"><div class="wrap article-block"><h2>Common Questions</h2>${faq.map(([q,a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></section>
    <section class="section"><div class="wrap article-block"><h2>Useful next steps</h2><div class="grid">${card(cta[0], cta[2], cta[1], 'Open route ->')}${card('Evidence Centre', 'Organise documents, timelines, emails, screenshots and financial-loss evidence.', '/knowledge/document-review-process/', 'Use evidence guides ->')}${card('Consumer Rights Knowledge Centre', 'Return to the central hub for all consumer guidance categories.', '/consumer-rights-knowledge-centre.html', 'Open main hub ->')}</div></div></section>
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
    ['HP', 'Holiday Park Problems', 'Start with caravan, lodge, pitch fee, resale, finance and exit guidance.', '/knowledge/holiday-parks/'],
    ['SF', 'Spray Foam Insulation', 'Review mortgage, sale, survey, ventilation, removal and roof-evidence guides.', '/knowledge/spray-foam/'],
    ['TR', 'Travel Problems', 'Find Airbnb, holiday, flight, cruise, luggage, insurance and timeshare evidence routes.', '/knowledge/travel/'],
    ['CF', 'Car Finance', 'Use guidance for PCP, HP, commission and vehicle-finance documents.', '/knowledge/finance/'],
    ['75', 'Section 75 Support', 'Understand credit-card purchase protection, chargeback and complaint evidence.', '/section75support.html'],
    ['EV', 'Evidence Centre', 'Organise documents, timelines, screenshots, emails, calls and financial losses.', '/knowledge/document-review-process/']
  ];
  const featuredGuides = [
    ['Spray Foam Mortgage Problems', 'Understand lender concerns, survey comments and the documents that may help explain a refusal.', '/guidance-spray-foam-mortgage-problems.html'],
    ['Holiday Park Exit Problems', 'Review notices, resale restrictions, buyback offers, removal charges and surrender evidence.', '/holiday-park-exit-problems.html'],
    ['Airbnb Refund Refused', 'Organise booking timelines, host messages, listing screenshots and platform correspondence.', '/airbnb-refunds.html'],
    ['Section 75 Claim Guide', 'Learn how credit-card purchase protection may fit with evidence and complaint history.', '/section75support.html'],
    ['Car Finance Commission', 'Identify PCP, HP, broker, dealer and lender documents before using the free tool.', '/guidance-pcp-car-finance-commission-documents.html'],
    ['Frozen Bank Account Support', 'Keep bank notices, transaction records, complaint replies and account-restriction timelines.', '/guidance-frozen-bank-account-complaint-documents.html']
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
  const rightsLibrary = [
    ['Consumer Rights Act', 'Learn how consumer-rights principles can connect to contracts, refunds, repairs and evidence.', '/consumer-rights-hub.html'],
    ['Consumer Contracts Regulations', 'Understand distance, online and cancellation issues before choosing a route.', '/knowledge/consumer-law/'],
    ['Section 75', 'Plain-English guidance for credit-card purchase protection and evidence preparation.', '/knowledge-what-is-section-75.html'],
    ['Chargeback', 'Compare chargeback with Section 75 and understand when card evidence matters.', '/knowledge-section-75-vs-chargeback.html'],
    ['Consumer Credit', 'Find finance-linked complaint routes for credit cards, loans, PCP, HP and linked agreements.', '/section75support.html'],
    ['Alternative Dispute Resolution', 'Understand when escalation or an ombudsman route may be relevant.', '/formal-escalation.html'],
    ['Financial Ombudsman', 'Learn how finance complaint evidence and final responses may be used.', '/financial-disputes-hub.html'],
    ['Information Commissioner Office', 'Understand data-rights, access requests and mishandled personal data routes.', '/gdpr-claims.html']
  ];
  const fiveMinute = [
    ['Spray foam and mortgages', 'Lender and surveyor concerns usually depend on installation details, evidence and inspection access.', '/knowledge/spray-foam/'],
    ['Holiday park agreements', 'Contracts, park rules, pitch fees and resale terms need to be read together.', '/knowledge/holiday-parks/'],
    ['Airbnb refund problems', 'Booking timelines, host messages, listing screenshots and complaint replies often matter.', '/airbnb-refunds.html'],
    ['Section 75 basics', 'Credit-card protection may help in some purchase disputes, but the facts and payment route matter.', '/knowledge-what-is-section-75.html']
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
  const reviewCards = [
    ['Evidence', 'Evidence helps support what happened, when it happened and how the issue affected the consumer.'],
    ['Documents', 'Contracts, invoices, correspondence and reports establish the transaction, obligations and complaint history.'],
    ['Timelines', 'A chronology places purchases, promises, defects, payments, complaints and responses in date order.'],
    ['Complaint Preparation', 'Facts and supporting documents are presented clearly, professionally and without unsupported exaggeration.'],
    ['Practical Guidance', 'Relevant self-help, complaint and escalation routes are explained in plain English where appropriate.'],
    ['Structured Review', 'Available information is grouped into key issues, evidence strengths, gaps and possible next-step routes.'],
    ['Clear Next-Step Information', 'The consumer receives a clearer understanding of what information may still be needed and what practical actions may be worth considering.']
  ];
  const body = `  <main>
    <div class="wrap">${crumbs([['Home','/'], ['Consumer Rights Knowledge Centre', urlPath]])}</div>
    <section class="hero"><div class="wrap hero-inner"><span class="pill">Consumer rights knowledge centre</span><h1>Consumer Rights Knowledge Centre</h1><p>${description}</p><div class="hero-actions"><a class="btn btn-blue" href="#categories">Browse categories</a><a class="btn btn-white" href="/consumer-rights-hub.html">Consumer Rights Hub</a></div></div></section>
    <section class="section" id="start-here"><div class="wrap article-block"><p class="eyebrow">Start here</p><h2>New to Quaerens?</h2><p class="lead">Not sure where to begin? Start with one of these practical entry points.</p><div class="grid">${startHere.map(([icon, title, text, href]) => `<a class="card" href="${href}"><span class="icon-badge">${esc(icon)}</span><h3>${esc(title)}</h3><p>${esc(text)}</p><strong>Explore -></strong></a>`).join('')}</div></div></section>
    <section class="section"><div class="wrap"><div class="quick"><p class="eyebrow">Quick Answer</p><p>The Knowledge Centre is the central library for Quaerens educational guidance. It helps consumers understand issues, organise evidence and choose a relevant service page or free tool only when they are ready.</p></div></div></section>
    <section class="section"><div class="wrap"><p class="eyebrow">Useful places to start</p><h2>Featured Guides</h2><p class="lead">These guides answer frequent search questions and help visitors move from confusion to a practical next step.</p><div class="grid">${featuredGuides.map(g => card(g[0], g[1], g[2], 'Read guide ->')).join('')}</div></div></section>
    <section class="section"><div class="wrap article-block"><p class="eyebrow">Find the right route</p><h2>Browse By Problem</h2><p class="lead">Choose the sentence closest to what has happened. Each card points to the most relevant guide, hub or service page.</p><div class="grid">${problemCards.map(([icon, title, text, href]) => `<a class="card" href="${href}"><span class="icon-badge">${esc(icon)}</span><h3>${esc(title)}</h3><p>${esc(text)}</p><strong>Open route -></strong></a>`).join('')}</div></div></section>
    <section class="section" id="categories"><div class="wrap"><p class="eyebrow">Main knowledge categories</p><h2>Start with the topic, then choose the route</h2><p class="lead">Knowledge pages educate. Commercial pages convert. Each category hub connects plain-English guidance to the relevant Quaerens review page or free tool.</p><div class="grid">${categories.map(cat => card(cat.title, cat.intro, `/knowledge/${cat.slug}/`, 'Open knowledge hub ->')).join('')}</div></div></section>
    <section class="section"><div class="wrap article-block"><p class="eyebrow">Evidence centre</p><h2>Evidence Centre</h2><p class="lead">The Evidence Centre helps consumers organise documents, timelines, photographs, emails, complaint notes and financial-loss information before choosing a route.</p><div class="grid">${evidenceGuideCards.map(g => card(g[0], g[1], g[2], 'Open guide ->')).join('')}</div></div></section>
    <section class="section"><div class="wrap"><p class="eyebrow">Plain-English education</p><h2>Consumer Rights Library</h2><p class="lead">Educational guides explaining common consumer legislation and complaint bodies. These pages are for general information and do not provide legal advice.</p><div class="grid">${rightsLibrary.map(g => card(g[0], g[1], g[2], 'Learn more ->')).join('')}</div></div></section>
    <section class="section"><div class="wrap article-block"><p class="eyebrow">Fast summaries</p><h2>Learn in Five Minutes</h2><p class="lead">These featured routes are structured for quick reading and AI search: direct answer, key points, evidence needs and related routes.</p><div class="grid">${fiveMinute.map(g => card(g[0], g[1], g[2], 'Read summary ->')).join('')}</div></div></section>
    <section class="section"><div class="wrap"><p class="eyebrow">Knowledge map</p><h2>How the Knowledge Centre is organised</h2><p class="lead">Each category hub connects educational guides to related commercial pages, so visitors can research first and request a review only when appropriate.</p><div class="map-list">${mapRows.map(([title, text, href]) => `<div class="map-row"><strong>${esc(title)}</strong><span>${esc(text)}</span><a href="${href}">Related service -></a></div>`).join('')}</div></div></section>
    <section class="section"><div class="wrap article-block"><p class="eyebrow">Using the hub</p><h2>How to Use This Knowledge Centre</h2><div class="grid steps">${['Identify your issue.','Read the relevant guide.','Prepare your documents.','Understand possible next steps.','Request a review or use a free tool if appropriate.'].map(text => `<div class="card step"><p>${esc(text)}</p></div>`).join('')}</div></div></section>
    <section class="section"><div class="wrap article-block"><p class="eyebrow">Trust and method</p><h2>How Quaerens Reviews Consumer Issues</h2><p class="lead">Quaerens focuses on evidence, documents, timelines, complaint preparation, practical guidance, structured review and clear next-step information. Outcomes are not promised or guaranteed.</p><div class="grid">${reviewCards.map(([title, text]) => `<div class="card"><h3>${esc(title)}</h3><p>${esc(text)}</p></div>`).join('')}</div></div></section>
    <section class="section"><div class="wrap article-block"><p class="eyebrow">Editorial and methodology</p><h2>How Quaerens builds guidance</h2><p class="lead">These pages explain editorial standards, evidence methodology and document-review processes so visitors and search systems can understand how the knowledge base is maintained.</p><div class="grid">${eeatPages.map(([slug, title, desc]) => card(title, desc, `/knowledge/${slug}/`, 'Read more ->')).join('')}</div></div></section>
  </main>`;
  const schema = [
    orgSchema(),
    breadcrumb([['Home','/'], ['Knowledge Centre', urlPath]]),
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Consumer Rights Knowledge Centre', description, url: canonical, mainEntity: { '@type': 'ItemList', itemListElement: [...categories.map((cat, i) => ({ '@type': 'ListItem', position: i + 1, name: `${cat.title} Knowledge Hub`, url: `${site}/knowledge/${cat.slug}/` })), ...featuredGuides.map((guide, i) => ({ '@type': 'ListItem', position: categories.length + i + 1, name: guide[0], url: `${site}${guide[2]}` }))] } }
  ];
  return layout({ title: 'Consumer Rights Knowledge Centre | Quaerens', description, canonical, body, schema });
}

function methodologyPage(slug, page) {
  const urlPath = `/knowledge/${slug}/`;
  const canonical = `${site}${urlPath}`;
  const faq = [
    ['Is this page legal advice?', 'No. It is general educational information and does not replace legal advice where that is required.'],
    ['Why does this process matter?', 'A clear method helps visitors understand what evidence may matter and what the guidance does not decide.'],
    ['Where should I go next?', 'Use the Consumer Rights Knowledge Centre, the Evidence Centre or a related topic hub to continue researching the issue.']
  ];
  const body = `  <main>
    <div class="wrap">${crumbs([['Home','/'], ['Consumer Rights Knowledge Centre','/consumer-rights-knowledge-centre.html'], [page.title, urlPath]])}</div>
    <section class="hero"><div class="wrap hero-inner"><span class="pill">Quaerens methodology</span><h1>${esc(page.title)}</h1><p>${esc(page.description)}</p><div class="hero-actions"><a class="btn btn-blue" href="/consumer-rights-knowledge-centre.html">Open Knowledge Centre</a><a class="btn btn-white" href="/knowledge/document-review-process/">Evidence Centre</a></div></div></section>
    <section class="section"><div class="wrap"><div class="quick"><p class="eyebrow">Quick Answer</p><p>${esc(page.quick)}</p></div><h2>Key Takeaways</h2><ul class="takeaways">${page.takeaways.map(t => `<li>${esc(t)}</li>`).join('')}</ul>${reviewPanel('Methodology and editorial guidance')}</div></section>
    <section class="section"><div class="wrap article-block">${page.sections.map(([h, p]) => `<h2>${esc(h)}</h2><p>${esc(p)}</p>`).join('')}</div></section>
    <section class="section"><div class="wrap article-block"><h2>Key sources</h2><div class="source-box">${page.sources.map(([label, href]) => `<p>${externalLink(label, href)}</p>`).join('')}</div></div></section>
    <section class="section faq"><div class="wrap article-block"><h2>Common Questions</h2>${faq.map(([q,a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></section>
    <section class="section"><div class="wrap article-block"><h2>Related guidance</h2><div class="grid">${card('Consumer Rights Knowledge Centre', 'Return to the central educational hub.', '/consumer-rights-knowledge-centre.html', 'Open hub ->')}${card('Evidence Centre', 'Understand how documents, timelines and evidence are organised.', '/knowledge/document-review-process/', 'Open evidence centre ->')}${card('How to Build a Complaint Timeline', 'Create a clear date-order record of events and responses.', '/knowledge-how-to-write-complaint-timeline.html', 'Open guide ->')}</div></div></section>
  </main>`;
  const schema = [
    orgSchema(),
    breadcrumb([['Home','/'], ['Knowledge Centre','/consumer-rights-knowledge-centre.html'], [page.title, urlPath]]),
    { '@context': 'https://schema.org', '@type': 'WebPage', name: page.title, description: page.description, url: canonical },
    { '@context': 'https://schema.org', '@type': 'Article', headline: page.title, description: page.description, author: { '@type': 'Organization', name: 'Quaerens' }, publisher: { '@type': 'Organization', name: 'Quaerens', logo: { '@type': 'ImageObject', url: `${site}/images/quaerens-logo.png` } }, dateModified: today },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
  ];
  return layout({ title: `${page.title} | Quaerens`, description: page.description, canonical, body, schema });
}

function evidencePage(page) {
  const urlPath = `/${page.slug}.html`;
  const canonical = `${site}${urlPath}`;
  const faq = [
    ['Do I need every document before complaining?', 'No. Start with what you have and record what is missing. Missing evidence can often be requested or explained.'],
    ['Should I edit evidence before saving it?', 'No. Keep original copies where possible. Make separate notes or summaries rather than changing the original record.'],
    ['Where does this fit in the Knowledge Centre?', 'This guide is part of the Evidence Centre and links back to the main Consumer Rights Knowledge Centre.']
  ];
  const body = `  <main>
    <div class="wrap">${crumbs([['Home','/'], ['Consumer Rights Knowledge Centre','/consumer-rights-knowledge-centre.html'], ['Evidence Centre','/knowledge/document-review-process/'], [page.title, urlPath]])}</div>
    <section class="hero"><div class="wrap hero-inner"><span class="pill">Evidence Centre</span><h1>${esc(page.title)}</h1><p>${esc(page.description)}</p><div class="hero-actions"><a class="btn btn-blue" href="/knowledge/document-review-process/">Evidence Centre</a><a class="btn btn-white" href="/consumer-rights-knowledge-centre.html">Knowledge Centre</a></div></div></section>
    <section class="section"><div class="wrap"><div class="quick"><p class="eyebrow">Quick Answer</p><p>${esc(page.quick)}</p></div><h2>Key Takeaways</h2><ul class="takeaways">${page.takeaways.map(t => `<li>${esc(t)}</li>`).join('')}</ul>${reviewPanel('Evidence guide')}</div></section>
    <section class="section"><div class="wrap article-block"><h2>Step-by-step guidance</h2><div class="grid steps">${page.steps.map(s => `<div class="card step"><p>${esc(s)}</p></div>`).join('')}</div><h2>Practical examples</h2><ul>${page.examples.map(x => `<li>${esc(x)}</li>`).join('')}</ul><h2>Common mistakes</h2><ul>${page.mistakes.map(x => `<li>${esc(x)}</li>`).join('')}</ul><h2>Checklist</h2><ul>${page.takeaways.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div></section>
    <section class="section faq"><div class="wrap article-block"><h2>Common Questions</h2>${faq.map(([q,a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></section>
    <section class="section"><div class="wrap article-block"><h2>Related guides</h2><div class="grid">${card('Document Review Process', 'See how documents are sorted, indexed and checked for gaps.', '/knowledge/document-review-process/', 'Open guide ->')}${card('How to Build a Complaint Timeline', 'Create a date-order chronology linked to evidence.', '/knowledge-how-to-write-complaint-timeline.html', 'Open guide ->')}${card('Consumer Rights Knowledge Centre', 'Return to the central hub for all consumer guidance.', '/consumer-rights-knowledge-centre.html', 'Open hub ->')}</div></div></section>
  </main>`;
  const schema = [
    orgSchema(),
    breadcrumb([['Home','/'], ['Knowledge Centre','/consumer-rights-knowledge-centre.html'], ['Evidence Centre','/knowledge/document-review-process/'], [page.title, urlPath]]),
    { '@context': 'https://schema.org', '@type': 'Article', headline: page.title, description: page.description, author: { '@type': 'Organization', name: 'Quaerens' }, dateModified: today, publisher: { '@type': 'Organization', name: 'Quaerens', logo: { '@type': 'ImageObject', url: `${site}/images/quaerens-logo.png` } } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
  ];
  return layout({ title: `${page.title} | Quaerens`, description: page.description, canonical, body, schema });
}

fs.writeFileSync(path.join(root, 'consumer-rights-knowledge-centre.html'), mainKnowledgePage(false));
fs.writeFileSync(path.join(knowledgeRoot, 'index.html'), mainKnowledgePage(true));

for (const cat of categories) {
  const dir = path.join(knowledgeRoot, cat.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), categoryPage(cat));
}

for (const [slug, page] of Object.entries(methodologyPages)) {
  const dir = path.join(knowledgeRoot, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), methodologyPage(slug, page));
}

for (const page of evidencePages) {
  fs.writeFileSync(path.join(root, `${page.slug}.html`), evidencePage(page));
}

const sitemapPath = path.join(root, 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');
const urls = [
  '/consumer-rights-knowledge-centre.html',
  '/knowledge/',
  ...categories.map(c => `/knowledge/${c.slug}/`),
  ...Object.keys(methodologyPages).map(slug => `/knowledge/${slug}/`),
  ...evidencePages.map(p => `/${p.slug}.html`)
];
for (const url of urls) {
  const loc = `${site}${url}`;
  if (!sitemap.includes(`<loc>${loc}</loc>`)) {
    sitemap = sitemap.replace('</urlset>', `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n  </url>\n</urlset>`);
  }
}
fs.writeFileSync(sitemapPath, sitemap);

console.log(`Created ${2 + categories.length + Object.keys(methodologyPages).length + evidencePages.length} Knowledge Centre pages and updated sitemap.`);
