const fs = require('fs');
const path = require('path');

const root = __dirname;
const publicDir = path.join(root, 'public');

const hubs = [
  {
    file: 'consumer-rights-hub.html',
    title: 'Consumer Rights Hub',
    eyebrow: 'Consumer rights',
    h1: 'Consumer rights help, evidence guides and complaint routes',
    description: 'A practical consumer rights hub for complaint letters, Section 75, refunds, escalation wording and evidence-led next steps.',
    intro: 'Use this hub when the issue is mainly about poor service, a failed purchase, unclear terms, a rejected refund, misleading information or a complaint that needs better structure.',
    category: 'category-letters-escalation.html',
    categoryLabel: 'Letters & Escalation',
    services: [
      ['section75support.html', 'Section 75 support', 'Credit card purchase problems, supplier failures and rejected card provider decisions.'],
      ['consumer-complaint-letters.html', 'Consumer complaint letters', 'Clear complaint wording for refunds, poor service and unresolved disputes.'],
      ['formal-escalation.html', 'Formal escalation support', 'When a complaint needs a stronger timeline, evidence pack and next-step wording.'],
      ['debt-recovery.html', 'Debt recovery letters', 'Structured wording where money is owed and informal chasing has not worked.'],
      ['return-issues.html', 'Return issues', 'Refund, return and cancellation problems with retailers or service providers.'],
      ['gdpr-claims.html', 'GDPR and data rights', 'Data access, privacy concerns and organisation response issues.']
    ],
    guides: [
      ['guidance-section-75-evidence.html', 'Section 75 evidence checklist'],
      ['guidance-section-75-rejected-claim.html', 'Rejected Section 75 claim guide'],
      ['guidance-online-purchase-refund-evidence.html', 'Online purchase refund evidence'],
      ['guidance-gdpr-data-breach-evidence.html', 'GDPR evidence guide']
    ]
  },
  {
    file: 'property-disputes-hub.html',
    title: 'Property Disputes Hub',
    eyebrow: 'Property disputes',
    h1: 'Property dispute help for homes, surveys, solar and holiday parks',
    description: 'A property disputes hub connecting spray foam, housing, new build, survey, solar, Spanish property and holiday park support routes.',
    intro: 'Use this hub where a property, home improvement, survey, sale, mortgage, installation, tenancy or holiday park issue needs documents organised before choosing a route.',
    category: 'category-property.html',
    categoryLabel: 'Property',
    services: [
      ['foam-insulation.html', 'Spray foam insulation', 'Mortgage, survey, sale, ventilation, removal cost and mis-selling concerns.'],
      ['mis-sold-spray-foam-insulation.html', 'Mis-sold spray foam', 'Sales claims, finance paperwork, guarantees and installation evidence.'],
      ['holidaypark.html', 'Holiday park and caravan', 'Static caravan, lodge, pitch fee, resale and park agreement disputes.'],
      ['newbuild-issues.html', 'New build issues', 'Defects, snagging, delays and developer complaint routes.'],
      ['housing-disrepair.html', 'Housing disrepair', 'Damp, repairs, landlord response and evidence of loss.'],
      ['solar-support.html', 'Solar panel support', 'Solar mis-selling, finance, installation and performance concerns.'],
      ['survey-review.html', 'Survey review', 'Surveyor concerns, valuation problems and property condition evidence.'],
      ['spanish-property.html', 'Spanish property support', 'Cross-border property purchase, mortgage and development concerns.']
    ],
    guides: [
      ['guidance-spray-foam-mortgage-problems.html', 'Spray foam mortgage evidence'],
      ['guidance-spray-foam-removal-costs.html', 'Spray foam removal costs'],
      ['guidance-holiday-park-pitch-fees.html', 'Holiday park pitch fees'],
      ['guidance-new-build-snagging-evidence.html', 'New build snagging evidence']
    ]
  },
  {
    file: 'financial-disputes-hub.html',
    title: 'Financial Disputes Hub',
    eyebrow: 'Financial disputes',
    h1: 'Financial dispute help for banks, credit, finance and pensions',
    description: 'A financial disputes hub for car finance, Section 75, bank scams, frozen accounts, equity release, pensions and investment platform issues.',
    intro: 'Use this hub where money, credit, lending, pension, investment, banking, payment or reimbursement issues need a clearer evidence trail and complaint route.',
    category: 'category-finance.html',
    categoryLabel: 'Finance',
    services: [
      ['car-finance.html', 'Car finance', 'PCP, HP, commission, affordability and motor finance agreement concerns.'],
      ['section75support.html', 'Section 75 support', 'Credit card supplier disputes and rejected card provider responses.'],
      ['app-fraud-bank-scam-refunds.html', 'APP fraud and bank scam refunds', 'Bank transfer scam, investment scam and reimbursement decision reviews.'],
      ['frozen-account-payment-disputes.html', 'Frozen accounts', 'Bank, fintech and payment platform restrictions or withheld funds.'],
      ['equity-release.html', 'Equity release', 'Advice, risk, family impact, compound interest and inheritance loss concerns.'],
      ['pension-issues.html', 'Pension issues', 'Transfers, advice, administration, delay and suitability concerns.'],
      ['investment-platform-dispute-resolution.html', 'Investment platforms', 'Trading, access, withdrawal and platform failure disputes.'],
      ['crypto-scams.html', 'Crypto scams', 'Crypto fraud, blocked withdrawals and platform evidence routes.']
    ],
    guides: [
      ['guidance-pcp-car-finance-commission-documents.html', 'PCP car finance documents'],
      ['guidance-app-fraud-bank-evidence.html', 'APP fraud bank evidence'],
      ['guidance-equity-release-inheritance-loss.html', 'Equity release inheritance loss'],
      ['guidance-section-75-evidence.html', 'Section 75 evidence checklist']
    ]
  },
  {
    file: 'travel-claims-hub.html',
    title: 'Travel Claims Hub',
    eyebrow: 'Travel claims',
    h1: 'Travel claim help for flights, holidays, luggage and leisure disputes',
    description: 'A travel claims hub for flight delay, holiday compensation, lost luggage, cruise, train, Airbnb, timeshare and holiday park routes.',
    intro: 'Use this hub where a journey, booking, holiday, resort, airline, cruise, train, baggage or leisure contract issue needs the right evidence before escalation.',
    category: 'category-travel.html',
    categoryLabel: 'Travel & Leisure',
    services: [
      ['flight-delay.html', 'Flight delay claims', 'Delay, cancellation and airline compensation evidence.'],
      ['freeflightclaim.html', 'Free flight claim tool', 'Start with a free route where the facts are clear.'],
      ['holiday-compensation.html', 'Holiday compensation', 'Package holiday, resort, booking and poor holiday evidence.'],
      ['freeholidaycompensation.html', 'Free holiday compensation tool', 'Organise basic holiday complaint facts at no cost.'],
      ['lost-luggage.html', 'Lost luggage', 'Baggage loss, delay, damage and airline response evidence.'],
      ['train-delay.html', 'Train delay', 'Rail delay, cancellation and refund routes.'],
      ['cruise-compensation-recovery.html', 'Cruise compensation', 'Cruise itinerary, illness, cancellation and service disputes.'],
      ['holidaypark.html', 'Holiday park and caravan', 'Pitch fees, resale, site agreements and mis-selling concerns.'],
      ['timeshare.html', 'Timeshare exits and refunds', 'Timeshare contracts, cooling-off, exit and refund review routes.']
    ],
    guides: [
      ['guidance-flight-delay-evidence.html', 'Flight delay evidence'],
      ['guidance-holiday-complaint-evidence.html', 'Holiday complaint evidence'],
      ['guidance-holiday-park-pitch-fees.html', 'Holiday park pitch fees'],
      ['guidance-timeshare-exit-evidence-checklist.html', 'Timeshare exit evidence']
    ]
  },
  {
    file: 'digital-platform-disputes-hub.html',
    title: 'Digital & Platform Disputes Hub',
    eyebrow: 'Digital disputes',
    h1: 'Digital, scam and platform dispute help',
    description: 'A digital disputes hub for APP fraud, frozen accounts, crypto scams, platform failures, cyber issues and data rights.',
    intro: 'Use this hub where an online account, payment app, crypto platform, marketplace, data breach, scam or digital service has caused loss or blocked access.',
    category: 'category-digital.html',
    categoryLabel: 'Digital',
    services: [
      ['app-fraud-bank-scam-refunds.html', 'APP fraud and bank scam refunds', 'Bank transfer scam, investment scam and refused reimbursement routes.'],
      ['frozen-account-payment-disputes.html', 'Frozen accounts and payments', 'Bank, fintech and payment platform restrictions or withheld money.'],
      ['crypto-scams.html', 'Crypto scams', 'Crypto fraud, blocked withdrawals and exchange evidence routes.'],
      ['cyber-claims.html', 'Cyber claims', 'Cyber incident, identity misuse and loss evidence.'],
      ['digital-platform-failure-claims.html', 'Digital platform failures', 'Marketplace, app, subscription and platform service disputes.'],
      ['gdpr-claims.html', 'GDPR and data rights', 'Data access, privacy, breach and organisation response concerns.']
    ],
    guides: [
      ['guidance-app-fraud-bank-evidence.html', 'APP fraud bank evidence'],
      ['guidance-app-fraud-bank-refused-refund.html', 'Refused bank scam refund'],
      ['guidance-blocked-online-account.html', 'Blocked online account evidence'],
      ['guidance-crypto-blocked-withdrawal-evidence.html', 'Crypto blocked withdrawal evidence']
    ]
  }
];

const priorityPages = {
  'section75support.html': {
    eyebrow: 'Related routes',
    title: 'Section 75 links that help Google and visitors understand the route',
    intro: 'These pages sit close to Section 75 because they deal with card payments, complaint wording, finance disputes and evidence packs.',
    links: [
      ['consumer-rights-hub.html', 'Consumer Rights Hub', 'Refunds, complaint wording and consumer evidence routes.'],
      ['financial-disputes-hub.html', 'Financial Disputes Hub', 'Credit, banking, payment and finance dispute routes.'],
      ['guidance-section-75-evidence.html', 'Section 75 evidence checklist', 'Documents, dates and replies to gather before escalation.'],
      ['guidance-section-75-rejected-claim.html', 'Rejected Section 75 claim guide', 'What to check when a card provider rejects or narrows a claim.'],
      ['consumer-complaint-letters.html', 'Consumer complaint letters', 'Clear wording for supplier and refund complaints.']
    ]
  },
  'foam-insulation.html': {
    eyebrow: 'Related property routes',
    title: 'Spray foam, survey and mortgage links',
    intro: 'These links connect spray foam pages with wider property dispute, survey and lender evidence routes.',
    links: [
      ['property-disputes-hub.html', 'Property Disputes Hub', 'The wider hub for home, survey, installation and mortgageability issues.'],
      ['mis-sold-spray-foam-insulation.html', 'Mis-sold spray foam', 'Sales claims, guarantees, finance paperwork and installation evidence.'],
      ['guidance-spray-foam-mortgage-problems.html', 'Spray foam mortgage evidence', 'Lender, broker and valuation evidence to keep.'],
      ['guidance-spray-foam-removal-costs.html', 'Spray foam removal costs', 'Quotes, inspection records and remediation evidence.'],
      ['survey-review.html', 'Survey review', 'When the problem involves surveyor or valuation concerns.']
    ]
  },
  'holidaypark.html': {
    eyebrow: 'Related leisure and property routes',
    title: 'Holiday park links for pitch fees, resale and mis-selling',
    intro: 'Holiday park disputes often cross travel, leisure, property-style contracts and finance evidence.',
    links: [
      ['travel-claims-hub.html', 'Travel Claims Hub', 'Holiday, leisure and travel-related claim routes.'],
      ['property-disputes-hub.html', 'Property Disputes Hub', 'Property-style contract, sale, survey and home dispute routes.'],
      ['holiday-park-site-fees-dispute.html', 'Holiday park site fees', 'Pitch fee, service charge and annual increase disputes.'],
      ['holiday-park-resale-exit-problems.html', 'Holiday park resale and exit', 'Resale restrictions, commission and exit evidence.'],
      ['guidance-holiday-park-pitch-fees.html', 'Holiday park pitch fee evidence', 'Documents to gather before challenging charges.']
    ]
  },
  'car-finance.html': {
    eyebrow: 'Related finance routes',
    title: 'Car finance links for commission, affordability and evidence',
    intro: 'These pages help connect motor finance issues with wider credit, finance and evidence-led complaint routes.',
    links: [
      ['financial-disputes-hub.html', 'Financial Disputes Hub', 'The main hub for credit, banking, lending and finance complaints.'],
      ['pcp-car-finance-claim.html', 'PCP car finance', 'PCP agreement, commission and end-of-term issue support.'],
      ['hidden-commission-car-finance.html', 'Hidden commission car finance', 'Broker, dealer and lender commission evidence.'],
      ['unaffordable-car-finance.html', 'Unaffordable car finance', 'Affordability checks, pressure and payment difficulty evidence.'],
      ['guidance-pcp-car-finance-commission-documents.html', 'PCP commission documents', 'Documents to gather before reviewing commission concerns.']
    ]
  },
  'app-fraud-bank-scam-refunds.html': {
    eyebrow: 'Related scam and finance routes',
    title: 'APP fraud links for bank, platform and crypto evidence',
    intro: 'Bank scam cases often overlap with fintech, crypto, platform, payment and reimbursement evidence routes.',
    links: [
      ['digital-platform-disputes-hub.html', 'Digital & Platform Disputes Hub', 'The main hub for scam, platform and account access disputes.'],
      ['financial-disputes-hub.html', 'Financial Disputes Hub', 'Banking, payment and reimbursement dispute routes.'],
      ['guidance-app-fraud-bank-evidence.html', 'APP fraud bank evidence', 'Statements, scam messages, bank warnings and complaint replies.'],
      ['guidance-app-fraud-bank-refused-refund.html', 'Refused refund guide', 'What to check when a bank rejects reimbursement.'],
      ['crypto-scams.html', 'Crypto scams', 'Where the scam involved crypto platforms or blocked withdrawals.']
    ]
  },
  'equity-release.html': {
    eyebrow: 'Related finance routes',
    title: 'Equity release links for advice, inheritance and property impact',
    intro: 'Equity release issues can involve financial advice, vulnerability, family impact, property value and inheritance evidence.',
    links: [
      ['financial-disputes-hub.html', 'Financial Disputes Hub', 'The wider hub for finance, pension and advice-related disputes.'],
      ['equity-release-problems.html', 'Equity release problems', 'General concerns about suitability, risk and explanation.'],
      ['equity-release-investment-losses.html', 'Equity release investment losses', 'Where released funds were tied to unsuitable investments.'],
      ['guidance-equity-release-inheritance-loss.html', 'Inheritance loss evidence', 'Family impact, estate and explanation evidence.'],
      ['sale-and-rent-back-claims.html', 'Sale and rent back claims', 'Related property and finance vulnerability concerns.']
    ]
  },
  'timeshare.html': {
    eyebrow: 'Related travel and contract routes',
    title: 'Timeshare links for exit, cooling-off and refund evidence',
    intro: 'Timeshare issues often involve travel, leisure contracts, payment routes, cooling-off rights and historic evidence.',
    links: [
      ['travel-claims-hub.html', 'Travel Claims Hub', 'The wider hub for travel, holiday and leisure disputes.'],
      ['property-disputes-hub.html', 'Property Disputes Hub', 'Useful where the dispute involves overseas property or accommodation rights.'],
      ['timeshare-contract-in-perpetuity.html', 'Timeshare contracts in perpetuity', 'Long-running or ongoing timeshare contract concerns.'],
      ['timeshare-cooling-off-spanish-law.html', 'Spanish law cooling-off', 'Spanish timeshare cooling-off and cancellation evidence.'],
      ['guidance-timeshare-exit-evidence-checklist.html', 'Timeshare exit evidence checklist', 'Documents to organise before asking for review.']
    ]
  }
};

const guidancePages = {
  'guidance-section-75-evidence.html': [['section75support.html', 'Section 75 support'], ['consumer-rights-hub.html', 'Consumer Rights Hub'], ['financial-disputes-hub.html', 'Financial Disputes Hub'], ['guidance-section-75-rejected-claim.html', 'Rejected Section 75 claim guide']],
  'guidance-section-75-rejected-claim.html': [['section75support.html', 'Section 75 support'], ['consumer-rights-hub.html', 'Consumer Rights Hub'], ['financial-disputes-hub.html', 'Financial Disputes Hub'], ['guidance-section-75-evidence.html', 'Section 75 evidence checklist']],
  'guidance-spray-foam-mortgage-problems.html': [['foam-insulation.html', 'Spray foam review'], ['property-disputes-hub.html', 'Property Disputes Hub'], ['guidance-spray-foam-removal-costs.html', 'Spray foam removal costs'], ['survey-review.html', 'Survey review']],
  'guidance-spray-foam-removal-costs.html': [['foam-insulation.html', 'Spray foam review'], ['property-disputes-hub.html', 'Property Disputes Hub'], ['guidance-spray-foam-mortgage-problems.html', 'Mortgage evidence guide'], ['guidance-spray-foam-surveyor-concerns.html', 'Surveyor concerns guide']],
  'guidance-spray-foam-surveyor-concerns.html': [['foam-insulation.html', 'Spray foam review'], ['property-disputes-hub.html', 'Property Disputes Hub'], ['survey-review.html', 'Survey review'], ['guidance-spray-foam-removal-costs.html', 'Removal cost evidence']],
  'guidance-holiday-park-pitch-fees.html': [['holidaypark.html', 'Holiday park support'], ['travel-claims-hub.html', 'Travel Claims Hub'], ['property-disputes-hub.html', 'Property Disputes Hub'], ['holiday-park-resale-exit-problems.html', 'Resale and exit problems']],
  'guidance-app-fraud-bank-evidence.html': [['app-fraud-bank-scam-refunds.html', 'APP fraud refund support'], ['digital-platform-disputes-hub.html', 'Digital & Platform Disputes Hub'], ['financial-disputes-hub.html', 'Financial Disputes Hub'], ['guidance-app-fraud-bank-refused-refund.html', 'Refused refund guide']],
  'guidance-app-fraud-bank-refused-refund.html': [['app-fraud-bank-scam-refunds.html', 'APP fraud refund support'], ['digital-platform-disputes-hub.html', 'Digital & Platform Disputes Hub'], ['financial-disputes-hub.html', 'Financial Disputes Hub'], ['guidance-app-fraud-bank-evidence.html', 'APP fraud evidence guide']],
  'guidance-pcp-car-finance-commission-documents.html': [['car-finance.html', 'Car finance review'], ['financial-disputes-hub.html', 'Financial Disputes Hub'], ['pcp-car-finance-claim.html', 'PCP car finance'], ['hidden-commission-car-finance.html', 'Hidden commission car finance']],
  'guidance-equity-release-inheritance-loss.html': [['equity-release.html', 'Equity release review'], ['financial-disputes-hub.html', 'Financial Disputes Hub'], ['equity-release-problems.html', 'Equity release problems'], ['sale-and-rent-back-claims.html', 'Sale and rent back claims']],
  'guidance-timeshare-exit-evidence-checklist.html': [['timeshare.html', 'Timeshare review'], ['travel-claims-hub.html', 'Travel Claims Hub'], ['property-disputes-hub.html', 'Property Disputes Hub'], ['timeshare-contract-in-perpetuity.html', 'Contracts in perpetuity']],
  'guidance-timeshare-contract-in-perpetuity-evidence.html': [['timeshare.html', 'Timeshare review'], ['travel-claims-hub.html', 'Travel Claims Hub'], ['property-disputes-hub.html', 'Property Disputes Hub'], ['timeshare-cooling-off-spanish-law.html', 'Spanish cooling-off rules']]
};

function readPublic(file) {
  return fs.readFileSync(path.join(publicDir, file), 'utf8');
}

function writePublic(file, html) {
  fs.writeFileSync(path.join(publicDir, file), html, 'utf8');
}

function cleanTrailingWhitespace(file) {
  if (!existsPublic(file)) return;
  const html = readPublic(file).replace(/[ \t]+(?=\r?\n)/g, '');
  writePublic(file, html);
}

function existsPublic(file) {
  return fs.existsSync(path.join(publicDir, file));
}

function stripBlock(html, marker) {
  const re = new RegExp(`\\n?\\s*<!-- ${marker}:start -->[\\s\\S]*?<!-- ${marker}:end -->\\s*\\n?`, 'g');
  return html.replace(re, '\n');
}

function insertBeforeFirst(html, needle, block) {
  const index = html.indexOf(needle);
  if (index === -1) return html + '\n' + block;
  return html.slice(0, index) + block + '\n' + html.slice(index);
}

function cardLinks(links) {
  return links
    .filter(([href]) => existsPublic(href))
    .map(([href, title, text]) => `
          <a class="seo-link-card" href="/${href}">
            <h3>${title}</h3>
            <p>${text}</p>
            <strong>Open route &rarr;</strong>
          </a>`)
    .join('');
}

function simpleGuidanceLinks(links) {
  return links
    .filter(([href]) => existsPublic(href))
    .map(([href, title]) => `<a href="/${href}">${title}</a>`)
    .join('');
}

function hubPage(hub) {
  const serviceCards = cardLinks(hub.services);
  const guideLinks = simpleGuidanceLinks(hub.guides);
  const relatedHubLinks = hubs
    .filter((item) => item.file !== hub.file)
    .map((item) => `<a href="/${item.file}">${item.title}</a>`)
    .join('');
  const itemList = [...hub.services, ...hub.guides]
    .filter(([href]) => existsPublic(href))
    .map(([href, name], index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      url: `https://www.quaerens.co.uk/${href}`
    }));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${hub.title} | Quaerens</title>
  <meta name="description" content="${hub.description}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://www.quaerens.co.uk/${hub.file}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${hub.title} | Quaerens">
  <meta property="og:description" content="${hub.description}">
  <meta property="og:url" content="https://www.quaerens.co.uk/${hub.file}">
  <meta property="og:image" content="https://www.quaerens.co.uk/images/quaerens-logo.png">
  <link rel="icon" href="/images/favicon.png" type="image/png">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box}body{margin:0;font-family:Inter,Arial,sans-serif;background:#f8fafc;color:#0f172a}.wrap{max-width:1140px;margin:0 auto;padding:0 1rem}.site-header{background:#fff;border-bottom:1px solid #e5e7eb;position:sticky;top:0;z-index:20}.header-inner{min-height:92px;display:flex;align-items:center;justify-content:space-between;gap:1rem}.logo{height:68px;width:auto}.nav{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;justify-content:flex-end}.nav a{color:#334155;text-decoration:none;font-weight:800;font-size:.94rem;padding:.65rem .78rem;border-radius:999px}.nav a:hover,.nav .active{background:#eff6ff;color:#1d4ed8}.btn{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:.9rem 1.25rem;font-weight:900;text-decoration:none}.btn-blue{background:#2563eb;color:#fff;box-shadow:0 14px 32px rgba(37,99,235,.22)}.btn-white{background:#fff;color:#1d4ed8;border:1px solid #bfdbfe}.hero{background:linear-gradient(90deg,rgba(15,23,42,.93),rgba(15,23,42,.68)),url('/images/hero-index.jpg') center/cover no-repeat;color:#fff}.hero-inner{min-height:520px;display:flex;align-items:center;padding:4.5rem 1rem}.pill{display:inline-flex;border:1px solid rgba(255,255,255,.32);background:rgba(255,255,255,.12);border-radius:999px;padding:.55rem .9rem;font-weight:900;text-transform:uppercase;letter-spacing:.06em}.hero h1{font-size:clamp(2.6rem,6vw,5rem);line-height:1.03;margin:1rem 0;font-weight:900;max-width:900px}.hero p{font-size:clamp(1.1rem,2vw,1.35rem);line-height:1.6;color:#eff6ff;max-width:820px}.hero-actions{display:flex;gap:.8rem;flex-wrap:wrap;margin-top:1.6rem}.section{padding:4.5rem 0}.section h2{font-size:clamp(2rem,4vw,3.3rem);line-height:1.08;margin:.4rem 0 1rem;font-weight:900}.eyebrow{color:#1d4ed8;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.lead{font-size:1.12rem;line-height:1.7;color:#334155;max-width:860px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem;margin-top:1.6rem}.seo-link-card{display:block;background:#fff;border:1px solid #dbeafe;border-radius:8px;padding:1.15rem;text-decoration:none;color:#0f172a;box-shadow:0 12px 28px rgba(15,23,42,.06)}.seo-link-card:hover{border-color:#60a5fa;box-shadow:0 16px 34px rgba(37,99,235,.12);transform:translateY(-2px)}.seo-link-card h3{font-size:1.15rem;line-height:1.18;margin:0 0 .5rem;font-weight:900}.seo-link-card p{color:#475569;line-height:1.55;margin:0}.seo-link-card strong{display:inline-block;color:#1d4ed8;margin-top:.8rem}.info-band{background:#eff6ff;border-top:1px solid #bfdbfe;border-bottom:1px solid #bfdbfe}.split{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;align-items:start}.panel{background:#fff;border:1px solid #dbeafe;border-radius:8px;padding:1.35rem;box-shadow:0 12px 28px rgba(15,23,42,.05)}.panel ul{margin:0;padding-left:1.2rem;color:#334155;line-height:1.75}.inline-links{display:flex;gap:.75rem;flex-wrap:wrap;margin-top:1rem}.inline-links a{background:#fff;border:1px solid #bfdbfe;border-radius:999px;padding:.65rem .9rem;color:#1d4ed8;text-decoration:none;font-weight:900}.footer{border-top:1px solid #e5e7eb;background:#fff;color:#64748b;padding:2rem 0;font-size:.92rem}.footer-grid{display:grid;grid-template-columns:1fr 1fr 1.4fr;gap:2rem}.footer a{color:#2563eb;text-decoration:none}.footer-logo{height:54px;width:auto}@media(max-width:800px){.nav{display:none}.header-inner{min-height:78px}.logo{height:54px}.split,.footer-grid{grid-template-columns:1fr}.hero-inner{min-height:auto;padding-top:3.5rem;padding-bottom:4rem}}
  </style>
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: hub.title,
    description: hub.description,
    url: `https://www.quaerens.co.uk/${hub.file}`,
    mainEntity: {'@type': 'ItemList', itemListElement: itemList}
  })}</script>
</head>
<body>
  <header class="site-header">
    <div class="wrap header-inner">
      <a href="/"><img src="/images/quaerens-logo.png" alt="Quaerens" class="logo"></a>
      <nav class="nav" aria-label="Main navigation">
        <a href="/category-free-tools.html">Free tools</a>
        <a href="/category-travel.html">Travel &amp; Leisure</a>
        <a href="/category-finance.html">Finance</a>
        <a href="/category-property.html">Property</a>
        <a href="/category-digital.html">Digital</a>
        <a href="/category-letters-escalation.html">Letters &amp; Escalation</a>
      </nav>
      <a class="btn btn-blue" href="/">Home</a>
    </div>
  </header>
  <main>
    <section class="hero">
      <div class="wrap hero-inner">
        <div>
          <span class="pill">${hub.eyebrow}</span>
          <h1>${hub.h1}</h1>
          <p>${hub.intro}</p>
          <div class="hero-actions">
            <a class="btn btn-blue" href="#routes">Browse routes</a>
            <a class="btn btn-white" href="/${hub.category}">Open ${hub.categoryLabel}</a>
          </div>
        </div>
      </div>
    </section>
    <section class="section" id="routes">
      <div class="wrap">
        <p class="eyebrow">Main routes</p>
        <h2>Choose the closest page for the issue</h2>
        <p class="lead">These internal links help visitors move from the broad hub to the specific service, tool or evidence guide that fits their problem.</p>
        <div class="grid">${serviceCards}
        </div>
      </div>
    </section>
    <section class="section info-band">
      <div class="wrap split">
        <div class="panel">
          <p class="eyebrow">Evidence first</p>
          <h2>What to gather before choosing a route</h2>
          <ul>
            <li>Contracts, order confirmations, statements, invoices or payment records.</li>
            <li>Emails, messages, screenshots, complaint replies and decision letters.</li>
            <li>Dates, names, reference numbers and a short timeline of what happened.</li>
            <li>Photos, survey comments, call notes or third-party reports where relevant.</li>
          </ul>
        </div>
        <div class="panel">
          <p class="eyebrow">Guidance</p>
          <h2>Evidence guides linked to this hub</h2>
          <p class="lead">Use these guides when you want to organise documents before sending a complaint or requesting a review.</p>
          <div class="inline-links">${guideLinks}</div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="wrap">
        <p class="eyebrow">Related hubs</p>
        <h2>Other areas that may overlap</h2>
        <p class="lead">Many real disputes cross more than one category. These hub links help Google and visitors understand those relationships.</p>
        <div class="inline-links">${relatedHubLinks}</div>
      </div>
    </section>
  </main>
  <footer class="footer">
    <div class="wrap footer-grid">
      <div><img src="/images/quaerens-logo.png" alt="Quaerens" class="footer-logo"></div>
      <div><strong>Company</strong><br><a href="/privacy.html">Privacy Policy</a><br><a href="/terms.html">Terms of Use</a><br><a href="/gdpr.html">GDPR</a><br><a href="/contact.html">Contact</a></div>
      <div><strong>Get in touch</strong><br>Email: <a href="mailto:info@quaerens.co.uk">info@quaerens.co.uk</a><br>Telephone: +44 (0)20 8050 0725<br>Company No.: 16176152 &middot; Registered in England &amp; Wales<br>Registered office: 71-75 Shelton Street, Covent Garden, London WC2H 9JQ, United Kingdom</div>
    </div>
  </footer>
</body>
</html>
`;
}

function relatedBlock(config) {
  const cards = cardLinks(config.links);
  if (!cards) return '';
  return `
<!-- seo-phase-one-related:start -->
<section class="section-wrap py-6" data-seo-phase-one-related="true">
  <div class="info-box soft-blue fade-up">
    <p class="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-3">${config.eyebrow}</p>
    <h2 class="text-3xl font-extrabold text-gray-900 mb-3">${config.title}</h2>
    <p class="text-gray-700 mb-6">${config.intro}</p>
    <div class="card-grid">
${config.links
  .filter(([href]) => existsPublic(href))
  .map(([href, title, text]) => `      <a href="/${href}" class="feature-card block hover:border-blue-300 transition"><h3 class="font-bold text-lg text-blue-900 mb-2">${title}</h3><p class="text-gray-700">${text}</p></a>`)
  .join('\n')}
    </div>
  </div>
</section>
<!-- seo-phase-one-related:end -->`;
}

function guidanceBlock(links) {
  const valid = links.filter(([href]) => existsPublic(href));
  if (!valid.length) return '';
  return `
<!-- seo-phase-one-guidance:start -->
<section class="section-wrap py-6" data-seo-phase-one-guidance="true">
  <div class="info-box soft-blue fade-up">
    <p class="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-3">Related next steps</p>
    <h2 class="text-3xl font-extrabold text-gray-900 mb-3">Keep exploring this topic</h2>
    <p class="text-gray-700 mb-6">These links connect this guide with the main service pages and wider topical hubs.</p>
    <div class="card-grid">
${valid.map(([href, title]) => `      <a href="/${href}" class="feature-card block hover:border-blue-300 transition"><h3 class="font-bold text-lg text-blue-900 mb-2">${title}</h3><p class="text-gray-700">Open the related page for more context and next-step support.</p></a>`).join('\n')}
    </div>
  </div>
</section>
<!-- seo-phase-one-guidance:end -->`;
}

function homepageHubBlock() {
  return `
<!-- seo-phase-one-hubs:start -->
<section class="issue-selector-section" aria-labelledby="authority-hub-title" data-seo-phase-one-hubs="true">
  <div class="issue-selector-panel">
    <div class="issue-selector-head">
      <p class="eyebrow">Start with a hub</p>
      <h2 id="authority-hub-title">Explore the main dispute hubs</h2>
      <p>These pillar pages group related services, tools and evidence guides so visitors can move from a broad issue to the right detailed page.</p>
    </div>
    <div class="issue-selector-grid">
${hubs.map((hub) => `      <a class="issue-selector-link" href="/${hub.file}"><strong>${hub.title}</strong><span>${hub.description}</span></a>`).join('\n')}
    </div>
  </div>
</section>
<!-- seo-phase-one-hubs:end -->`;
}

function categoryHubBlock(currentHubFile, label) {
  const current = hubs.find((hub) => hub.file === currentHubFile);
  if (!current) return '';
  return `
<!-- seo-phase-one-category-hub:start -->
<section class="section" data-seo-phase-one-category-hub="true">
  <div class="wrap">
    <div class="guidance-links">
      <p class="eyebrow">Authority hub</p>
      <h2>${current.title}</h2>
      <p class="lead">${current.description}</p>
      <div class="card-grid">
        <a class="guidance-card" href="/${current.file}">
          <span>${label}</span>
          <h3>Open the full hub</h3>
          <p>Browse the connected services, evidence guides and related routes for this topic.</p>
          <strong>Open hub &rarr;</strong>
        </a>
        <a class="guidance-card" href="/${current.category}">
          <span>Category</span>
          <h3>Browse all ${label} routes</h3>
          <p>See the wider category page with service cards and callback support.</p>
          <strong>Open category &rarr;</strong>
        </a>
      </div>
    </div>
  </div>
</section>
<!-- seo-phase-one-category-hub:end -->`;
}

function updateHomepage() {
  const file = 'index.html';
  let html = readPublic(file);
  html = stripBlock(html, 'seo-phase-one-hubs');
  html = insertBeforeFirst(html, '<section id="most-looked-for"', homepageHubBlock() + '\n');
  writePublic(file, html);
}

function updateCategoryPages() {
  const pages = [
    ['category-letters-escalation.html', 'consumer-rights-hub.html', 'Consumer rights'],
    ['category-property.html', 'property-disputes-hub.html', 'Property'],
    ['category-finance.html', 'financial-disputes-hub.html', 'Finance'],
    ['category-travel.html', 'travel-claims-hub.html', 'Travel'],
    ['category-digital.html', 'digital-platform-disputes-hub.html', 'Digital']
  ];
  for (const [file, hubFile, label] of pages) {
    if (!existsPublic(file)) continue;
    let html = readPublic(file);
    html = stripBlock(html, 'seo-phase-one-category-hub');
    html = insertBeforeFirst(html, '<section class="section" id="category-routes">', categoryHubBlock(hubFile, label) + '\n');
    writePublic(file, html);
  }
}

function updatePriorityPages() {
  for (const [file, config] of Object.entries(priorityPages)) {
    if (!existsPublic(file)) continue;
    let html = readPublic(file);
    html = stripBlock(html, 'seo-phase-one-related');
    const block = relatedBlock(config);
    const callbackIndex = html.indexOf('id="request-callback"');
    if (callbackIndex !== -1) {
      const sectionStart = html.lastIndexOf('<section', callbackIndex);
      if (sectionStart !== -1) {
        html = html.slice(0, sectionStart) + block + '\n' + html.slice(sectionStart);
      } else {
        html = insertBeforeFirst(html, '</main>', block + '\n');
      }
    } else {
      html = insertBeforeFirst(html, '</main>', block + '\n');
    }
    writePublic(file, html);
  }
}

function updateGuidancePages() {
  for (const [file, links] of Object.entries(guidancePages)) {
    if (!existsPublic(file)) continue;
    let html = readPublic(file);
    html = stripBlock(html, 'seo-phase-one-guidance');
    html = insertBeforeFirst(html, '</main>', guidanceBlock(links) + '\n');
    writePublic(file, html);
  }
}

for (const hub of hubs) {
  writePublic(hub.file, hubPage(hub));
}
updateHomepage();
updateCategoryPages();
updatePriorityPages();
updateGuidancePages();

[
  'index.html',
  ...hubs.map((hub) => hub.file),
  ...Object.keys(priorityPages),
  ...Object.keys(guidancePages),
  'category-letters-escalation.html',
  'category-property.html',
  'category-finance.html',
  'category-travel.html',
  'category-digital.html'
].forEach(cleanTrailingWhitespace);

console.log(`Created ${hubs.length} hub pages.`);
console.log(`Updated ${Object.keys(priorityPages).filter(existsPublic).length} priority service pages.`);
console.log(`Updated ${Object.keys(guidancePages).filter(existsPublic).length} guidance pages.`);
