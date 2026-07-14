const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

const articles = [
  {
    file: 'knowledge-what-is-section-75.html',
    title: 'What is Section 75?',
    description: 'A plain-English guide to Section 75 credit card protection, when it may apply and what evidence usually helps.',
    category: 'Consumer rights',
    hub: ['consumer-rights-hub.html', 'Consumer Rights Hub'],
    relatedHub: ['financial-disputes-hub.html', 'Financial Disputes Hub'],
    service: ['section75support.html', 'Section 75 support'],
    intro: 'Section 75 is a UK consumer protection rule that can make a credit card provider jointly responsible with a supplier in some purchase disputes.',
    sections: [
      ['What Section 75 is', 'Section 75 of the Consumer Credit Act can apply where you use a credit card to buy goods or services and something goes wrong with the supplier. In broad terms, if the supplier has breached contract or misrepresented what was being sold, the card provider may also have responsibility. It is not automatic, and the details matter. The price, payment route, supplier relationship and evidence all affect whether it is a realistic route.'],
      ['When it may help', 'It may be relevant where a supplier goes out of business, refuses a valid refund, delivers something materially different from what was promised, fails to provide the service, or rejects a complaint without dealing with the evidence. It can also matter in travel, home improvement, training, online purchase and finance-linked disputes.'],
      ['What evidence usually matters', 'Useful evidence often includes the credit card statement, invoice, order confirmation, contract, supplier correspondence, screenshots of promises, cancellation or complaint emails, delivery records and any final response from the card provider. A short timeline is especially helpful because it shows what was promised, what happened and when you raised the issue.'],
      ['Where people get stuck', 'Many rejected claims fail because the complaint is too broad, the supplier problem is not clearly linked to the card payment, or the evidence is scattered. Before escalating, it helps to separate the legal basis from the practical story: what was bought, who sold it, how it was paid for, what went wrong and what outcome is being requested.']
    ],
    faqs: [
      ['Is Section 75 the same as a refund?', 'No. It is a potential route for making a credit card provider responsible where the supplier has breached contract or misrepresented the purchase.'],
      ['Does Section 75 apply to debit cards?', 'No. Debit card disputes are usually handled through chargeback or other complaint routes.'],
      ['Do I need the full purchase on the credit card?', 'Not always, but the payment structure matters and should be checked carefully.']
    ],
    next: [
      ['knowledge-section-75-vs-chargeback.html', 'Section 75 vs chargeback'],
      ['guidance-section-75-evidence.html', 'Section 75 evidence checklist'],
      ['guidance-section-75-rejected-claim.html', 'Rejected Section 75 claim guide']
    ]
  },
  {
    file: 'knowledge-section-75-vs-chargeback.html',
    title: 'Section 75 vs chargeback: what is the difference?',
    description: 'Understand the practical difference between Section 75 and chargeback before choosing the next complaint route.',
    category: 'Consumer rights',
    hub: ['consumer-rights-hub.html', 'Consumer Rights Hub'],
    relatedHub: ['financial-disputes-hub.html', 'Financial Disputes Hub'],
    service: ['section75support.html', 'Section 75 support'],
    intro: 'Section 75 and chargeback are often mentioned together, but they are not the same and they do not work in the same way.',
    sections: [
      ['The simple difference', 'Section 75 is a legal protection connected to qualifying credit agreements. Chargeback is a card scheme process that can sometimes reverse a card payment through the payment network. One is based on statutory responsibility; the other is a practical payment dispute mechanism.'],
      ['Why the difference matters', 'A chargeback may be faster and can sometimes apply to debit card payments, but it is usually time sensitive and depends on card scheme rules. Section 75 may be more powerful in the right case, but it requires a clearer explanation of the supplier breach, the payment relationship and the loss being claimed.'],
      ['Evidence overlap', 'Both routes need clear evidence. You normally want the payment record, order or contract, proof of what was promised, proof of what went wrong, supplier correspondence and a timeline. The difference is how that evidence is framed. Chargeback often focuses on the transaction problem; Section 75 focuses on supplier breach or misrepresentation.'],
      ['How to avoid a weak complaint', 'Avoid simply saying "I want my money back". Explain the purchase, the payment method, the supplier failure, what you asked the supplier to do, and what response you received. If a bank rejects one route, check whether it properly considered the other where relevant.']
    ],
    faqs: [
      ['Can I try chargeback and Section 75?', 'Sometimes both may be discussed, but the right sequence and wording depend on the payment and the facts.'],
      ['Is chargeback a legal right?', 'Chargeback is usually a card scheme process rather than the same kind of statutory protection as Section 75.'],
      ['Which route is better?', 'It depends on the payment method, timing, evidence and supplier problem.']
    ],
    next: [
      ['knowledge-what-is-section-75.html', 'What is Section 75?'],
      ['guidance-section-75-evidence.html', 'Section 75 evidence checklist'],
      ['consumer-complaint-letters.html', 'Consumer complaint letters']
    ]
  },
  {
    file: 'knowledge-spray-foam-unsuitable-mortgages.html',
    title: 'What makes spray foam unsuitable for some mortgages?',
    description: 'A practical explanation of why some lenders and surveyors raise concerns about spray foam insulation.',
    category: 'Property',
    hub: ['property-disputes-hub.html', 'Property Disputes Hub'],
    relatedHub: ['consumer-rights-hub.html', 'Consumer Rights Hub'],
    service: ['foam-insulation.html', 'Spray foam insulation review'],
    intro: 'Spray foam is not automatically a problem in every home, but some installations make lenders, buyers and surveyors cautious.',
    sections: [
      ['Why lenders may be cautious', 'Mortgage lenders need confidence that the property is suitable security. If spray foam hides roof timbers, restricts inspection, affects ventilation or creates uncertainty about future repair costs, a lender may ask for more evidence or decline to proceed.'],
      ['Closed-cell and open-cell concerns', 'Different products and installations can raise different concerns. The key issue is usually not the label alone, but whether the roof structure can be inspected, whether moisture risk has been addressed and whether the paperwork explains the installation clearly.'],
      ['What surveyors usually look for', 'Surveyors may look at access, ventilation, condensation risk, timber condition, roof covering, installation certificates, guarantees and whether the product was installed according to suitable guidance. If the roof cannot be properly inspected, uncertainty itself can become the problem.'],
      ['Evidence that may help', 'Useful evidence can include the installation contract, product details, guarantee, photographs before and after installation, surveyor comments, lender emails, removal quotes, roof inspection reports and any complaint response from the installer or finance provider.']
    ],
    faqs: [
      ['Does spray foam always stop a mortgage?', 'No. Outcomes vary by lender, property, product, installation and available evidence.'],
      ['Is removal always required?', 'Not always. A proper review should look at the reason for the concern before assuming removal is the only route.'],
      ['What is the first document to find?', 'Start with the installer paperwork and any surveyor or lender comments explaining the concern.']
    ],
    next: [
      ['knowledge-why-lenders-worry-about-spray-foam.html', 'Why lenders worry about spray foam'],
      ['guidance-spray-foam-mortgage-problems.html', 'Spray foam mortgage evidence'],
      ['guidance-spray-foam-removal-costs.html', 'Spray foam removal costs']
    ]
  },
  {
    file: 'knowledge-why-lenders-worry-about-spray-foam.html',
    title: 'Why do lenders worry about spray foam insulation?',
    description: 'Understand the lender and surveyor concerns that can arise after spray foam insulation has been installed.',
    category: 'Property',
    hub: ['property-disputes-hub.html', 'Property Disputes Hub'],
    relatedHub: ['financial-disputes-hub.html', 'Financial Disputes Hub'],
    service: ['foam-insulation.html', 'Spray foam insulation review'],
    intro: 'Lender concerns are usually about risk and evidence, not simply whether a homeowner likes or dislikes the insulation.',
    sections: [
      ['Security and resale risk', 'A lender wants to know that the property can be valued, inspected, insured, sold and maintained. If spray foam creates uncertainty about the roof structure or future marketability, the lender may treat that uncertainty as a risk.'],
      ['Inspection difficulty', 'If foam covers rafters, felt, battens or other roof components, a surveyor may not be able to see whether timber is dry, sound and ventilated. That can make it harder to confirm the condition of the roof.'],
      ['Paperwork gaps', 'Concerns become stronger where there is little paperwork: no proper product details, no installer records, unclear guarantees, missing ventilation explanation or no independent inspection. Good paperwork does not guarantee acceptance, but missing paperwork can make the issue harder to resolve.'],
      ['How to respond', 'The most practical response is to gather the exact lender or surveyor wording, then match evidence to each concern. A generic complaint is usually weaker than a focused pack showing installation details, roof condition, ventilation, costs and the impact on sale or mortgage.']
    ],
    faqs: [
      ['Can a surveyor change their view?', 'Sometimes further evidence helps, but it depends on the original concern and the lender policy.'],
      ['Should I remove spray foam immediately?', 'Do not assume removal is the answer without understanding the lender or surveyor concern and the cost evidence.'],
      ['Can finance paperwork matter?', 'Yes, especially where the installation was sold with finance or representations about mortgageability.']
    ],
    next: [
      ['knowledge-spray-foam-unsuitable-mortgages.html', 'What makes spray foam unsuitable?'],
      ['guidance-spray-foam-surveyor-concerns.html', 'Surveyor concerns evidence'],
      ['mis-sold-spray-foam-insulation.html', 'Mis-sold spray foam']
    ]
  },
  {
    file: 'knowledge-how-caravan-agreements-work.html',
    title: 'How caravan and holiday park agreements typically work',
    description: 'A plain-English guide to common holiday park agreement terms, pitch fees, resale rules and evidence to keep.',
    category: 'Travel & leisure',
    hub: ['travel-claims-hub.html', 'Travel Claims Hub'],
    relatedHub: ['property-disputes-hub.html', 'Property Disputes Hub'],
    service: ['holidaypark.html', 'Holiday park and caravan support'],
    intro: 'Holiday park and static caravan agreements can feel like property ownership, but the legal and practical structure is often very different.',
    sections: [
      ['The caravan and the pitch are different', 'In many cases the customer owns the caravan or lodge but does not own the land underneath it. The right to keep the unit on the park is usually controlled by a pitch licence or site agreement. That agreement can contain important rules about fees, age limits, resale, subletting and removal.'],
      ['Pitch fees and annual costs', 'Pitch fees are often only one part of the cost. There may also be utilities, insurance, maintenance, commission, transfer fees, disconnection costs, storage or removal charges. A dispute often starts when the long-term cost turns out to be very different from what the buyer expected.'],
      ['Resale and exit restrictions', 'Some agreements restrict who can buy the caravan, how it can be advertised, whether park approval is needed, and what commission the park takes on resale. These rules can be very important where a buyer thought the caravan would keep its value or be easy to sell.'],
      ['Evidence to keep', 'Keep the purchase agreement, site rules, pitch licence, finance agreement, sales brochure, emails, text messages, pitch fee notices, resale valuations, commission terms, income projections and any complaint replies from the park or finance provider.']
    ],
    faqs: [
      ['Is a holiday park caravan the same as buying a house?', 'Usually no. The caravan and pitch rights are normally governed by specific agreements and site rules.'],
      ['Can pitch fee increases be challenged?', 'Sometimes the wording, explanation, evidence and complaint route matter. The agreement should be reviewed carefully.'],
      ['Why is resale evidence important?', 'Because many disputes turn on what was promised about value, exit, commission or resale restrictions.']
    ],
    next: [
      ['knowledge-what-are-holiday-park-pitch-fees.html', 'What are holiday park pitch fees?'],
      ['guidance-holiday-park-pitch-fees.html', 'Holiday park pitch fee evidence'],
      ['holiday-park-resale-exit-problems.html', 'Holiday park resale and exit problems']
    ]
  },
  {
    file: 'knowledge-what-are-holiday-park-pitch-fees.html',
    title: 'What are holiday park pitch fees?',
    description: 'Understand holiday park pitch fees, common extra charges and the evidence that helps when fees become disputed.',
    category: 'Travel & leisure',
    hub: ['travel-claims-hub.html', 'Travel Claims Hub'],
    relatedHub: ['property-disputes-hub.html', 'Property Disputes Hub'],
    service: ['holidaypark.html', 'Holiday park and caravan support'],
    intro: 'Pitch fees are the regular charges for keeping a caravan or lodge on a holiday park pitch, but they are rarely the only cost.',
    sections: [
      ['What the pitch fee usually covers', 'The pitch fee often covers the right to station the caravan on the pitch and use the park within the rules. It may also contribute to communal areas, park facilities or site maintenance. Exactly what it covers should be checked against the written agreement.'],
      ['Why disputes happen', 'Disputes often arise where increases are larger than expected, extra charges appear, facilities change, promised income does not materialise, or the owner feels they were not given a realistic picture of annual costs before buying.'],
      ['Documents to compare', 'Compare the sales information, pitch agreement, annual fee notices, invoices, site rules, emails and any finance paperwork. If a salesperson made claims about affordability or likely resale value, keep those messages and notes separately.'],
      ['How to prepare the issue clearly', 'A strong complaint should explain the fee history, what was represented before purchase, what changed, what written term is being relied on and what outcome is being requested. A table of annual charges can make the issue much easier to understand.']
    ],
    faqs: [
      ['Are pitch fees fixed?', 'Usually not. Many agreements allow increases, but the wording and explanation matter.'],
      ['Can extra charges matter?', 'Yes. Utilities, maintenance, commission and exit costs can be relevant to the overall complaint.'],
      ['What is the most useful evidence?', 'The pitch agreement, fee notices and pre-sale promises are usually central.']
    ],
    next: [
      ['knowledge-how-caravan-agreements-work.html', 'How caravan agreements work'],
      ['guidance-holiday-park-pitch-fees.html', 'Holiday park pitch fee evidence'],
      ['holiday-park-site-fees-dispute.html', 'Holiday park site fee disputes']
    ]
  },
  {
    file: 'knowledge-prepare-evidence-consumer-complaint.html',
    title: 'How to prepare evidence for a consumer complaint',
    description: 'A practical guide to organising documents, timelines and correspondence before making a consumer complaint.',
    category: 'Consumer rights',
    hub: ['consumer-rights-hub.html', 'Consumer Rights Hub'],
    relatedHub: ['digital-platform-disputes-hub.html', 'Digital & Platform Disputes Hub'],
    service: ['consumer-complaint-letters.html', 'Consumer complaint letters'],
    intro: 'A complaint is much stronger when the evidence is organised before the wording is written.',
    sections: [
      ['Start with the timeline', 'Write a short timeline in date order. Include the purchase date, important conversations, delivery or service dates, when the problem appeared, when you complained and how the company responded. This keeps the complaint factual and easier to follow.'],
      ['Separate proof from opinion', 'Evidence is stronger when it shows what happened: invoices, contracts, screenshots, emails, photos, statements, call notes and complaint replies. Opinion can still matter, but it should sit behind the documents rather than replacing them.'],
      ['Name the outcome clearly', 'Say what you want the company to do. That might be a refund, repair, cancellation, replacement, explanation, correction of records or a final response. A complaint with no clear requested outcome is easier to ignore or deflect.'],
      ['Keep a clean copy pack', 'Save copies of everything you send and receive. Use clear file names where possible, such as invoice, payment record, complaint email, company reply and photo evidence. This helps if the issue later needs escalation.']
    ],
    faqs: [
      ['Should I send every document at once?', 'Send enough to prove the issue clearly, but keep the complaint organised and relevant.'],
      ['Is a timeline really necessary?', 'Yes. It often turns scattered evidence into a coherent complaint.'],
      ['What if I only have screenshots?', 'Screenshots can help, especially if they show dates, sender details, promises or payment information.']
    ],
    next: [
      ['knowledge-how-to-write-complaint-timeline.html', 'How to write a complaint timeline'],
      ['knowledge-company-ignores-complaint.html', 'What if a company ignores your complaint?'],
      ['formal-escalation.html', 'Formal escalation support']
    ]
  },
  {
    file: 'knowledge-how-to-write-complaint-timeline.html',
    title: 'How to write a complaint timeline',
    description: 'Learn how to turn scattered dates, messages and documents into a clear complaint timeline.',
    category: 'Consumer rights',
    hub: ['consumer-rights-hub.html', 'Consumer Rights Hub'],
    relatedHub: ['financial-disputes-hub.html', 'Financial Disputes Hub'],
    service: ['formal-escalation.html', 'Formal escalation support'],
    intro: 'A complaint timeline is a short date-ordered summary of what happened and why it matters.',
    sections: [
      ['What to include', 'Include the date, what happened, who was involved, what document proves it and why the event matters. Keep each entry short. A timeline is not a full story; it is a map that lets the reader understand the evidence quickly.'],
      ['What to leave out', 'Avoid repeating the same frustration several times. Avoid long paragraphs inside the timeline. Put emotion and wider context in the complaint letter, but keep the timeline focused on events and proof.'],
      ['A simple structure', 'A useful format is: date, event, evidence, impact. For example: 12 March, ordered product after sales call, invoice and call note, product later failed to match the promised specification.'],
      ['Why timelines help escalation', 'Ombudsmen, card providers, finance firms and complaint teams often need to understand the sequence quickly. A clear timeline helps show delay, missed warnings, ignored evidence and whether deadlines may matter.']
    ],
    faqs: [
      ['How long should a timeline be?', 'Long enough to show the important events, but short enough to scan. Most issues can start with 5 to 12 key entries.'],
      ['Should I include phone calls?', 'Yes, if they mattered. Add the date, who you spoke to and any note or follow-up evidence.'],
      ['Can I add documents later?', 'Yes, but keep a record of what you have already sent.']
    ],
    next: [
      ['knowledge-prepare-evidence-consumer-complaint.html', 'Prepare evidence for a complaint'],
      ['consumer-complaint-letters.html', 'Consumer complaint letters'],
      ['knowledge-company-ignores-complaint.html', 'Company ignored your complaint']
    ]
  },
  {
    file: 'knowledge-company-ignores-complaint.html',
    title: 'What to do when a company ignores your complaint',
    description: 'Practical steps to take when a company does not respond properly to a consumer complaint.',
    category: 'Consumer rights',
    hub: ['consumer-rights-hub.html', 'Consumer Rights Hub'],
    relatedHub: ['digital-platform-disputes-hub.html', 'Digital & Platform Disputes Hub'],
    service: ['formal-escalation.html', 'Formal escalation support'],
    intro: 'When a company ignores a complaint, the next step is usually to make the silence visible, documented and easier to escalate.',
    sections: [
      ['Check where the complaint was sent', 'Make sure the complaint went to the correct email, address, portal or complaint channel. Keep proof of sending. If the company has a specific complaints process, note whether you followed it.'],
      ['Send a short follow-up', 'A follow-up should be calm and specific. Refer to the original complaint date, attach or quote the key evidence, ask for a response by a reasonable date and state what outcome you are seeking.'],
      ['Create an escalation pack', 'Gather the original complaint, proof of sending, any automatic acknowledgements, follow-up messages, call notes and a short timeline. This is useful if you later complain to a card provider, finance firm, regulator, ombudsman or another escalation route.'],
      ['Avoid weakening the record', 'Do not send multiple angry messages that make the issue harder to follow. A clear, dated paper trail is usually more effective than volume.']
    ],
    faqs: [
      ['How long should I wait?', 'It depends on the sector and route, but keep the key dates and any published complaint timescales.'],
      ['Should I phone them?', 'You can, but follow up important calls in writing so there is a record.'],
      ['What if the business has closed?', 'Keep evidence of closure or non-response because other routes may depend on it.']
    ],
    next: [
      ['knowledge-how-to-write-complaint-timeline.html', 'Write a complaint timeline'],
      ['consumer-complaint-letters.html', 'Consumer complaint letters'],
      ['section75support.html', 'Section 75 support']
    ]
  },
  {
    file: 'knowledge-app-fraud-refund-evidence.html',
    title: 'What evidence helps with APP fraud refund complaints?',
    description: 'A practical guide to evidence for APP fraud, bank transfer scams and refused reimbursement complaints.',
    category: 'Digital & finance',
    hub: ['digital-platform-disputes-hub.html', 'Digital & Platform Disputes Hub'],
    relatedHub: ['financial-disputes-hub.html', 'Financial Disputes Hub'],
    service: ['app-fraud-bank-scam-refunds.html', 'APP fraud and bank scam refund support'],
    intro: 'APP fraud complaints are often decided on the detail: what happened, what warnings were shown, how the bank responded and what evidence was available.',
    sections: [
      ['Payment evidence', 'Keep bank statements, transaction records, payee details, payment references, dates, amounts and any confirmation screens. If there were several payments, put them into a simple table.'],
      ['Scam communication evidence', 'Save texts, WhatsApp messages, emails, social media messages, website screenshots, investment portal screenshots, call logs and names used by the scammer. Do not edit screenshots if the original context may matter.'],
      ['Bank interaction evidence', 'Keep bank warnings, fraud alerts, branch notes, call notes, secure messages, complaint replies and any final decision. The timing of warnings and what the bank knew can be important.'],
      ['Personal circumstances and pressure', 'If vulnerability, urgency, impersonation, coercion or emotional pressure played a part, note it clearly and gather documents that help explain it. The issue should be presented factually, not dramatically.']
    ],
    faqs: [
      ['Do screenshots matter?', 'Yes. They can show the scam story, payment instructions, pressure and false promises.'],
      ['What if the bank already refused?', 'Keep the refusal letter and compare its reasons against the evidence.'],
      ['Should I contact the scammer again?', 'Generally avoid further contact and focus on preserving existing evidence and reporting routes.']
    ],
    next: [
      ['guidance-app-fraud-bank-evidence.html', 'APP fraud bank evidence guide'],
      ['guidance-app-fraud-bank-refused-refund.html', 'Refused refund guide'],
      ['crypto-scams.html', 'Crypto scam support']
    ]
  },
  {
    file: 'knowledge-car-finance-documents.html',
    title: 'What documents matter in car finance complaints?',
    description: 'A practical guide to the documents that matter in PCP, HP, commission and affordability car finance complaints.',
    category: 'Finance',
    hub: ['financial-disputes-hub.html', 'Financial Disputes Hub'],
    relatedHub: ['consumer-rights-hub.html', 'Consumer Rights Hub'],
    service: ['car-finance.html', 'Car finance review'],
    intro: 'Car finance complaints are much easier to assess when the agreement, sales process, commission clues and affordability evidence are organised.',
    sections: [
      ['Agreement documents', 'Start with the finance agreement, pre-contract information, statement of account, deposit records, payment schedule and any settlement figures. These documents show the structure of the deal and the cost of borrowing.'],
      ['Sales and broker evidence', 'Keep dealer emails, adverts, quotes, order forms, part-exchange records, call notes and any explanation of commission or finance options. This helps show what was explained before you signed.'],
      ['Affordability evidence', 'If affordability is part of the concern, keep bank statements, income evidence, expenditure details, arrears letters and records of financial pressure at the time. The point is to show what should reasonably have been considered.'],
      ['Complaint and response evidence', 'Keep your complaint, acknowledgements, final response letters, call notes and any offer. If the response ignores key documents, make a note of what was missed.']
    ],
    faqs: [
      ['Do I need the original finance agreement?', 'It is very useful, but statements, lender copies or subject access documents may help if the original is missing.'],
      ['Does commission always mean there is a complaint?', 'No. The issue is what was disclosed, how the sale worked and whether the agreement was fair and suitable.'],
      ['Can affordability be reviewed years later?', 'Sometimes, but evidence from the time is much stronger than memory alone.']
    ],
    next: [
      ['guidance-pcp-car-finance-commission-documents.html', 'PCP commission documents'],
      ['hidden-commission-car-finance.html', 'Hidden commission car finance'],
      ['unaffordable-car-finance.html', 'Unaffordable car finance']
    ]
  }
];

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

function escapeXml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function card(article) {
  return `<a class="knowledge-card" href="/${article.file}">
          <span>${article.category}</span>
          <h3>${article.title}</h3>
          <p>${article.description}</p>
          <strong>Read article &rarr;</strong>
        </a>`;
}

function commonCss() {
  return `*{box-sizing:border-box}body{margin:0;font-family:Inter,Arial,sans-serif;background:#f8fafc;color:#0f172a}.wrap{max-width:1120px;margin:0 auto;padding:0 1rem}.site-header{background:#fff;border-bottom:1px solid #e5e7eb;position:sticky;top:0;z-index:20}.header-inner{min-height:92px;display:flex;align-items:center;justify-content:space-between;gap:1rem}.logo{height:68px;width:auto}.nav{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;justify-content:flex-end}.nav a{color:#334155;text-decoration:none;font-weight:800;font-size:.94rem;padding:.65rem .78rem;border-radius:999px}.nav a:hover{background:#eff6ff;color:#1d4ed8}.btn{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:.9rem 1.25rem;font-weight:900;text-decoration:none}.btn-blue{background:#2563eb;color:#fff;box-shadow:0 14px 32px rgba(37,99,235,.22)}.btn-white{background:#fff;color:#1d4ed8;border:1px solid #bfdbfe}.hero{background:linear-gradient(90deg,rgba(15,23,42,.94),rgba(15,23,42,.70)),url('/images/hero-index.jpg') center/cover no-repeat;color:#fff}.hero-inner{min-height:470px;display:flex;align-items:center;padding:4rem 1rem}.pill{display:inline-flex;border:1px solid rgba(255,255,255,.32);background:rgba(255,255,255,.12);border-radius:999px;padding:.55rem .9rem;font-weight:900;text-transform:uppercase;letter-spacing:.06em}.hero h1{font-size:clamp(2.5rem,5.5vw,4.6rem);line-height:1.04;margin:1rem 0;font-weight:900;max-width:920px}.hero p{font-size:clamp(1.08rem,2vw,1.32rem);line-height:1.62;color:#eff6ff;max-width:840px}.hero-actions{display:flex;gap:.8rem;flex-wrap:wrap;margin-top:1.5rem}.section{padding:4rem 0}.section h2{font-size:clamp(2rem,4vw,3.25rem);line-height:1.08;margin:.4rem 0 1rem;font-weight:900}.eyebrow{color:#1d4ed8;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.lead{font-size:1.12rem;line-height:1.7;color:#334155;max-width:860px}.knowledge-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem;margin-top:1.6rem}.knowledge-card{display:block;background:#fff;border:1px solid #dbeafe;border-radius:8px;padding:1.2rem;text-decoration:none;color:#0f172a;box-shadow:0 12px 28px rgba(15,23,42,.06)}.knowledge-card:hover{border-color:#60a5fa;box-shadow:0 16px 34px rgba(37,99,235,.12);transform:translateY(-2px)}.knowledge-card span{display:inline-flex;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:999px;padding:.28rem .58rem;font-size:.75rem;font-weight:900}.knowledge-card h3{font-size:1.2rem;line-height:1.18;margin:.75rem 0 .5rem;font-weight:900}.knowledge-card p{color:#475569;line-height:1.55;margin:0}.knowledge-card strong{display:inline-block;color:#1d4ed8;margin-top:.85rem}.article-wrap{max-width:900px;margin:0 auto;padding:0 1rem}.article{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:clamp(1.25rem,4vw,2.4rem);box-shadow:0 14px 34px rgba(15,23,42,.06)}.article h2{font-size:clamp(1.55rem,3vw,2.25rem);line-height:1.14;margin:2rem 0 .7rem;font-weight:900}.article p{font-size:1.06rem;line-height:1.78;color:#334155}.article a{color:#1d4ed8;font-weight:800}.note{background:#eff6ff;border:1px solid #bfdbfe;border-left:5px solid #2563eb;border-radius:8px;padding:1rem 1.1rem;margin:1.5rem 0;color:#1e3a8a;font-weight:750;line-height:1.6}.faq{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:1rem;margin-top:1rem}.faq h3{font-size:1.05rem;margin:.2rem 0 .35rem;font-weight:900}.faq p{margin:0}.inline-links{display:flex;gap:.75rem;flex-wrap:wrap;margin-top:1rem}.inline-links a{background:#fff;border:1px solid #bfdbfe;border-radius:999px;padding:.65rem .9rem;color:#1d4ed8;text-decoration:none;font-weight:900}.footer{border-top:1px solid #e5e7eb;background:#fff;color:#64748b;padding:2rem 0;font-size:.92rem}.footer-grid{display:grid;grid-template-columns:1fr 1fr 1.4fr;gap:2rem}.footer a{color:#2563eb;text-decoration:none}.footer-logo{height:54px;width:auto}@media(max-width:800px){.nav{display:none}.header-inner{min-height:78px}.logo{height:54px}.footer-grid{grid-template-columns:1fr}.hero-inner{min-height:auto;padding-top:3.5rem;padding-bottom:4rem}}`;
}

function header() {
  return `<header class="site-header">
    <div class="wrap header-inner">
      <a href="/"><img src="/images/quaerens-logo.png" alt="Quaerens" class="logo"></a>
      <nav class="nav" aria-label="Main navigation">
        <a href="/knowledge-hub.html">Knowledge Hub</a>
        <a href="/category-free-tools.html">Free tools</a>
        <a href="/category-travel.html">Travel &amp; Leisure</a>
        <a href="/category-finance.html">Finance</a>
        <a href="/category-property.html">Property</a>
        <a href="/category-digital.html">Digital</a>
      </nav>
      <a class="btn btn-blue" href="/">Home</a>
    </div>
  </header>`;
}

function footer() {
  return `<footer class="footer">
    <div class="wrap footer-grid">
      <div><img src="/images/quaerens-logo.png" alt="Quaerens" class="footer-logo"></div>
      <div><strong>Company</strong><br><a href="/privacy.html">Privacy Policy</a><br><a href="/terms.html">Terms of Use</a><br><a href="/gdpr.html">GDPR</a><br><a href="/contact.html">Contact</a></div>
      <div><strong>Get in touch</strong><br>Email: <a href="mailto:info@quaerens.co.uk">info@quaerens.co.uk</a><br>Telephone: +44 (0)20 8050 0725<br>Company No.: 16176152 &middot; Registered in England &amp; Wales<br>Registered office: 71-75 Shelton Street, Covent Garden, London WC2H 9JQ, United Kingdom</div>
    </div>
  </footer>`;
}

function landingPage() {
  const itemList = articles.map((article, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: article.title,
    url: `https://www.quaerens.co.uk/${article.file}`
  }));
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Knowledge Hub | Quaerens</title>
  <meta name="description" content="Plain-English consumer, finance, property, travel and digital dispute explainers from Quaerens.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://www.quaerens.co.uk/knowledge-hub.html">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Knowledge Hub | Quaerens">
  <meta property="og:description" content="Plain-English consumer, finance, property, travel and digital dispute explainers from Quaerens.">
  <meta property="og:url" content="https://www.quaerens.co.uk/knowledge-hub.html">
  <meta property="og:image" content="https://www.quaerens.co.uk/images/quaerens-logo.png">
  <link rel="icon" href="/images/favicon.png" type="image/png">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>${commonCss()}</style>
  <script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'CollectionPage',name:'Knowledge Hub',description:'Plain-English consumer, finance, property, travel and digital dispute explainers from Quaerens.',url:'https://www.quaerens.co.uk/knowledge-hub.html',mainEntity:{'@type':'ItemList',itemListElement:itemList}})}</script>
</head>
<body>
  ${header()}
  <main>
    <section class="hero">
      <div class="wrap hero-inner">
        <div>
          <span class="pill">Knowledge Hub</span>
          <h1>Plain-English guides before you complain, escalate or request a review</h1>
          <p>These pages explain common consumer, finance, property, travel and digital dispute topics without turning every question into a service page.</p>
          <div class="hero-actions">
            <a class="btn btn-blue" href="#articles">Browse articles</a>
            <a class="btn btn-white" href="/consumer-rights-hub.html">Open dispute hubs</a>
          </div>
        </div>
      </div>
    </section>
    <section class="section" id="articles">
      <div class="wrap">
        <p class="eyebrow">Educational guides</p>
        <h2>Start with the explanation, then choose the route</h2>
        <p class="lead">These articles are designed for earlier-stage visitors who are still trying to understand the issue, the evidence and the possible next steps.</p>
        <div class="knowledge-grid">
          ${articles.map(card).join('\n          ')}
        </div>
      </div>
    </section>
  </main>
  ${footer()}
</body>
</html>`;
}

function articlePage(article) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faqs.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {'@type': 'Answer', text: a}
    }))
  };
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {'@type': 'Organization', name: 'Quaerens Ltd'},
    publisher: {'@type': 'Organization', name: 'Quaerens Ltd', logo: {'@type': 'ImageObject', url: 'https://www.quaerens.co.uk/images/quaerens-logo.png'}},
    mainEntityOfPage: `https://www.quaerens.co.uk/${article.file}`
  };
  const nextLinks = [...article.next, article.hub, article.relatedHub, article.service]
    .filter(([href]) => exists(href))
    .map(([href, title]) => `<a href="/${href}">${title}</a>`)
    .join('');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.title} | Quaerens Knowledge Hub</title>
  <meta name="description" content="${article.description}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://www.quaerens.co.uk/${article.file}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${article.title} | Quaerens Knowledge Hub">
  <meta property="og:description" content="${article.description}">
  <meta property="og:url" content="https://www.quaerens.co.uk/${article.file}">
  <meta property="og:image" content="https://www.quaerens.co.uk/images/quaerens-logo.png">
  <link rel="icon" href="/images/favicon.png" type="image/png">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>${commonCss()}</style>
  <script type="application/ld+json">${JSON.stringify(articleSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
</head>
<body>
  ${header()}
  <main>
    <section class="hero">
      <div class="wrap hero-inner">
        <div>
          <span class="pill">${article.category}</span>
          <h1>${article.title}</h1>
          <p>${article.intro}</p>
          <div class="hero-actions">
            <a class="btn btn-blue" href="#article">Read the guide</a>
            <a class="btn btn-white" href="/knowledge-hub.html">Knowledge Hub</a>
          </div>
        </div>
      </div>
    </section>
    <section class="section" id="article">
      <div class="article-wrap">
        <article class="article">
          <p class="eyebrow">Plain-English explainer</p>
          <p>${article.intro}</p>
          ${article.sections.map(([heading, body]) => `<h2>${heading}</h2>\n          <p>${body}</p>`).join('\n          ')}
          <div class="note">This guide is general information, not legal advice. The right route depends on the documents, timing, value, complaint history and the organisation involved.</div>
          <h2>Common questions</h2>
          ${article.faqs.map(([q, a]) => `<div class="faq"><h3>${q}</h3><p>${a}</p></div>`).join('\n          ')}
          <h2>Useful next steps</h2>
          <p>If this topic matches your situation, these related pages can help you move from background reading to evidence organisation or the right support route.</p>
          <div class="inline-links">${nextLinks}</div>
        </article>
      </div>
    </section>
  </main>
  ${footer()}
</body>
</html>`;
}

function stripBlock(html, marker) {
  const re = new RegExp(`\\n?\\s*<!-- ${marker}:start -->[\\s\\S]*?<!-- ${marker}:end -->\\s*\\n?`, 'g');
  return html.replace(re, '\n');
}

function insertBefore(html, needle, block) {
  const index = html.indexOf(needle);
  if (index === -1) return `${html}\n${block}`;
  return `${html.slice(0, index)}${block}\n${html.slice(index)}`;
}

function updateHomepage() {
  const file = 'index.html';
  let html = read(file);
  html = stripBlock(html, 'knowledge-hub-home');
  const block = `
<!-- knowledge-hub-home:start -->
  <section class="issue-selector-section" aria-labelledby="knowledge-hub-home-title" data-knowledge-hub-home="true">
    <div class="issue-selector-panel">
      <div class="issue-selector-head">
        <p class="eyebrow">Knowledge Hub</p>
        <h2 id="knowledge-hub-home-title">Useful guides before choosing a route</h2>
        <p>Plain-English explainers for people still working out what happened, what evidence matters and which route may fit.</p>
      </div>
      <div class="issue-selector-grid">
        ${articles.slice(0, 6).map((article) => `<a class="issue-selector-link" href="/${article.file}"><strong>${article.title}</strong><span>${article.description}</span></a>`).join('\n        ')}
      </div>
      <div style="margin-top:1rem"><a class="btn btn-blue" href="/knowledge-hub.html">Open Knowledge Hub</a></div>
    </div>
  </section>
<!-- knowledge-hub-home:end -->`;
  html = insertBefore(html, '<section id="most-looked-for"', block);
  write(file, html);
}

function updateHubPages() {
  const hubMap = {
    'consumer-rights-hub.html': ['knowledge-what-is-section-75.html', 'knowledge-section-75-vs-chargeback.html', 'knowledge-prepare-evidence-consumer-complaint.html', 'knowledge-how-to-write-complaint-timeline.html', 'knowledge-company-ignores-complaint.html'],
    'property-disputes-hub.html': ['knowledge-spray-foam-unsuitable-mortgages.html', 'knowledge-why-lenders-worry-about-spray-foam.html', 'knowledge-how-caravan-agreements-work.html', 'knowledge-what-are-holiday-park-pitch-fees.html'],
    'financial-disputes-hub.html': ['knowledge-what-is-section-75.html', 'knowledge-section-75-vs-chargeback.html', 'knowledge-app-fraud-refund-evidence.html', 'knowledge-car-finance-documents.html'],
    'travel-claims-hub.html': ['knowledge-how-caravan-agreements-work.html', 'knowledge-what-are-holiday-park-pitch-fees.html'],
    'digital-platform-disputes-hub.html': ['knowledge-app-fraud-refund-evidence.html', 'knowledge-company-ignores-complaint.html']
  };
  for (const [file, articleFiles] of Object.entries(hubMap)) {
    if (!exists(file)) continue;
    let html = read(file);
    html = stripBlock(html, 'knowledge-hub-links');
    const selected = articleFiles.map((name) => articles.find((article) => article.file === name)).filter(Boolean);
    const block = `
<!-- knowledge-hub-links:start -->
    <section class="section">
      <div class="wrap">
        <p class="eyebrow">Knowledge Hub</p>
        <h2>Helpful explainers before choosing a route</h2>
        <p class="lead">These are educational pages for visitors who are still understanding the issue and gathering evidence.</p>
        <div class="grid">
          ${selected.map((article) => `<a class="seo-link-card" href="/${article.file}"><h3>${article.title}</h3><p>${article.description}</p><strong>Read article &rarr;</strong></a>`).join('\n          ')}
        </div>
      </div>
    </section>
<!-- knowledge-hub-links:end -->`;
    html = insertBefore(html, '</main>', block);
    write(file, html);
  }
}

function updateSitemap() {
  const file = 'sitemap.xml';
  if (!exists(file)) return;
  let xml = read(file);
  const urls = ['knowledge-hub.html', ...articles.map((article) => article.file)];
  for (const url of urls) {
    if (xml.includes(`/${url}</loc>`)) continue;
    const entry = `\n  <url>\n    <loc>https://www.quaerens.co.uk/${escapeXml(url)}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${url === 'knowledge-hub.html' ? '0.8' : '0.7'}</priority>\n  </url>`;
    xml = xml.replace('\n</urlset>', `${entry}\n</urlset>`);
  }
  write(file, xml);
}

write('knowledge-hub.html', landingPage());
for (const article of articles) {
  write(article.file, articlePage(article));
}
updateHomepage();
updateHubPages();
updateSitemap();

console.log(`Created Knowledge Hub plus ${articles.length} educational articles.`);
console.log('Updated homepage, pillar hubs and sitemap.');
