# Quaerens Confidence Rewrite Phase 2 Plan

Version: 1.0  
Status: Implementation Plan  
Date: 1 August 2026

## Purpose

Confidence Rewrite Phase 2 is a controlled editorial, experience and consistency pass across the core public Quaerens pages. The work is not a redesign. It is intended to make the public journey clearer, calmer and more evidence-led while preserving current functionality, SEO value, forms, builders, QCBF integrations, QCMS integrations, structured data, canonicals, analytics and conversion tracking.

The governing journey for the included pages is:

1. Understand
2. Prepare
3. Decide
4. Progress

The supporting trust language is:

- Trust
- Evidence
- People
- Solutions

No deployment will be performed as part of this phase.

## Shared Protections

- Preserve all public filenames and canonical URLs.
- Preserve existing search intent, FAQ substance, internal links and structured data.
- Preserve Firebase submission logic, builder storage keys, export functions and QCBF/QCMS integrations.
- Preserve compensation, eligibility and financial calculations unless a verified defect is found.
- Avoid unsupported claims, outcome promises or aggressive sales language.
- Consolidate repeated content only where the same idea appears multiple times.
- Repair anchors, duplicate IDs, invalid nesting and CTA targets where directly relevant.
- Do not touch unrelated uncommitted files.

## Page Plans

### 1. `public/index.html`

Current purpose: Introduce Quaerens as the public front door for free complaint tools, guided support, knowledge routes and platform navigation.

Current strengths: Strong visual identity, clear route cards, free tools positioning, useful internal links, broad category coverage and trust-led homepage sections.

Current repetition: Some platform, guided-support and category-navigation ideas appear in multiple areas. Several action sections can feel like parallel routes rather than one journey.

Current structural defects: Confirm hero and internal anchors remain aligned after recent navigation changes. Check card CTA text consistency and image/link references.

CTA issues: The opening should avoid competing generic CTAs and should make the first meaningful action sequence clearer.

Proposed final journey: Visitor problem recognition, Understand/Prepare/Decide/Progress pathway, free DIY Complaint Pack Builders, guided support where appropriate, Knowledge Centre and platform explanation, company purpose, final route selection.

Content to preserve: Category routes, free builder cards, complaint-platform links, Knowledge Centre links, trust blocks, footer and SEO headings.

Sections to consolidate: Repeated “how it works” wording into “Your Journey” where it reads naturally; overlapping company-purpose explanations.

Functionality at risk: Category card links, hash navigation, language switcher, live chat and any conversion tracking.

SEO protections: Preserve route keywords, category links, internal-link depth, title/meta/canonical unless a defect is found.

Planned changes: Replace hero direction with a visitor-first H1, introduce the four-stage journey, use the Heart statement once, use the Quaerens Promise once late in the page, and reduce any cluttered navigation or repeated CTA language.

### 2. `public/the-quaerens-platform.html`

Current purpose: Explain the Quaerens Platform and how its systems fit together.

Current strengths: Dedicated platform narrative, ecosystem structure, status language and visual explanation of connected systems.

Current repetition: Some explanations may overlap with About and Knowledge Centre content.

Current structural defects: Verify the coded ecosystem visual remains intact and responsive.

CTA issues: The page should guide understanding before asking for action.

Proposed final journey: Why the platform exists, visitor journey, central ecosystem, free knowledge and Complaint Packs, optional professional support, people supported by technology, continual improvement.

Content to preserve: Ecosystem visual, Public Platform, Operations Platform, Delivery Platform and Intelligence Platform distinctions.

Sections to consolidate: Repeated software/platform claims that do not help the visitor understand responsibility.

Functionality at risk: Coded ecosystem visual, responsive layout and internal anchors.

SEO protections: Preserve platform title intent, canonicals, structured data and internal links.

Planned changes: Make the page feel less like a software sales page and more like a human explanation of how Quaerens removes uncertainty. Use the Heart statement once.

### 3. `public/about-quaerens.html`

Current purpose: Establish Quaerens’ people, principles, accountability and operating boundaries.

Current strengths: Company information, contact information, trust facts and a people-focused narrative.

Current repetition: Architecture and ecosystem language can duplicate the Platform page.

Current structural defects: Confirm bottom navigation/buttons remain clean after prior footer work and no obsolete homepage buttons remain.

CTA issues: The page should not over-convert; it should build trust and link onward naturally.

Proposed final journey: Why Quaerens was created, people and philosophy, evidence-first working, boundaries, standards, informed choice, human support, company accountability.

Content to preserve: Company registration information, addresses, contact details, privacy/accountability information and official boundary language.

Sections to consolidate: Full ecosystem explanations should be replaced with a link to the Platform page.

Functionality at risk: Header, footer, contact links and language switcher.

SEO protections: Preserve About intent, company details and Organization-related schema.

Planned changes: Refine heading toward “Meet the people and principles behind The Quaerens Platform” and keep factual trust language.

### 4. `public/consumer-rights-knowledge-centre.html`

Current purpose: Educational front door for consumers who do not yet know which route or legal term applies.

Current strengths: Broad knowledge architecture, route cards, issue-led navigation and strong internal linking.

Current repetition: Some hub, route and knowledge-map explanations overlap.

Current structural defects: Confirm image/text pairings are cropped cleanly and mobile friendly after recent image additions.

CTA issues: Navigation should not present every card as equally important.

Proposed final journey: You do not need legal terminology, choose by what happened, identify evidence, understand guide types, move to free Complaint Packs or professional support where suitable.

Content to preserve: Authority links, category coverage, guide cards, hub relationships and search depth.

Sections to consolidate: Repeated category introductions and overlapping “browse by” explanations.

Functionality at risk: Card links, image references, header links and mobile grids.

SEO protections: Preserve Knowledge Centre terms, guide links, hub links, title/meta/canonical and schema.

Planned changes: Emphasise Understand/Prepare/Decide/Progress and make the difference between knowledge guides, evidence guides, free Complaint Packs and professional support more explicit.

### 5. `public/freeflightclaim.html`

Current purpose: Flagship free Flight Disruption Complaint Pack Builder.

Current strengths: Rich builder, journey analysis, compensation estimate, expenses, airline directory, Smart Submission, preview and exports.

Current repetition: Tool mechanics, free/self-service disclaimers and pack contents can repeat before and inside the builder.

Current structural defects: Verify no old claim-letter positioning, public notes, duplicate headings or broken footer structure remain.

CTA issues: Hero should focus on the travel problem and outcome clarity, with “Build My Complaint Pack” as the clear action.

Proposed final journey: Check disruption, organise journey details, build pack, review, send yourself, track response.

Content to preserve: UK261/EC261 cautions, calculators, passenger handling, airline/airport lookup, Smart Submission, exports, live preview and official resources.

Sections to consolidate: Repeated free/builder feature lists where they do not add new confidence.

Functionality at risk: Flight lookup, compensation calculation, passenger count, airport distance, PDF/RTF/TXT/copy/print, storage, reset and preview.

SEO protections: Preserve flight delay, flight cancellation, compensation and complaint-pack search language while avoiding old “letter template only” positioning.

Planned changes: Editorial tightening only, with direct regression tests for flight/QCBF and export paths.

### 6. `public/section75support.html`

Current purpose: Explain Section 75 support, evidence and alternatives.

Current strengths: Strong search intent, useful FAQ content, payment protection terminology and consumer education.

Current repetition: Section 75 applicability, evidence requirements and alternatives may repeat across sections.

Current structural defects: Check H1 count, FAQ schema parity and CTA anchors.

CTA issues: Avoid implying Section 75 automatically applies.

Proposed final journey: Empathy-led introduction, what Section 75 is, when it may apply, when it may not, evidence, alternatives, Quaerens review, FAQs, next step.

Content to preserve: Creditor-debtor-supplier explanation, purchase-price limits, payment evidence, chargeback and direct complaint alternatives.

Sections to consolidate: Repeated evidence and applicability explanations.

Functionality at risk: Any interactive Section 75 route, forms, anchors and FAQ expansion.

SEO protections: Preserve “Section 75”, “credit card protection”, “chargeback” and related long-tail language.

Planned changes: Clarify evidence sequence and cautious language.

### 7. `public/foam-insulation.html`

Current purpose: High-value professional assessment route for spray foam mortgage, sale, survey, finance and removal concerns.

Current strengths: Strong hero, visual assets, detailed evidence guidance, FAQs, official references and commercial conversion.

Current repetition: Evidence, review process, financial loss, mortgage concerns and imagery may repeat.

Current structural defects: Confirm FAQ answers expand, card CTAs do not overflow, and all anchors resolve.

CTA issues: Maintain commercial strength without creating alarm or implying guaranteed outcomes.

Proposed final journey: Understand the concern, gather property/installation evidence, review lending or valuation impact, identify complaint routes, decide whether support is appropriate.

Content to preserve: Mortgage/equity-release concern language, saleability uncertainty, installer representations, finance/card routes, image evidence and official references.

Sections to consolidate: Repeated visual galleries or duplicate explanation blocks only where they interrupt flow.

Functionality at risk: Forms, callback CTA, FAQ behaviour, image layout, link cards and schema.

SEO protections: Preserve spray foam, mortgage, surveyor, removal cost and compensation-related search terms where accurate.

Planned changes: Balanced editorial refinement, not a structural rebuild.

### 8. `public/holidaypark.html`

Current purpose: Professional assessment route for static caravan, holiday lodge, rental-income, site-fee, resale, finance and exit disputes.

Current strengths: Strong hero/form, detailed coverage, educational visuals, official guidance, Knowledge Centre links and FAQs.

Current repetition: Multiple process sections, multiple evidence sections, overlapping problem sections and repeated conversion points.

Current structural defects: Known anchor variations include `#request-assessment`, `#evidence-checklist` and `#holidaypark-html-hero-form`; every CTA target needs verification.

CTA issues: Hero form and final callback route should serve distinct purposes and avoid repeated identical asks.

Proposed final journey: Hero and form, trust reassurance, recognise the issue, Your Holiday Park Review Journey, evidence that matters, financial loss and possible routes, Knowledge Centre/official guidance, FAQs, final assessment CTA.

Content to preserve: Rental income, site fees, resale restrictions, finance, exit promises, operator neutrality language, visuals with distinct educational value and official sources.

Sections to consolidate: “What Happens Next?” plus “A practical 3-step preliminary assessment”; “Documents That May Help” plus “Documents that make the assessment clearer”; overlapping problem sections.

Functionality at risk: Hero form, callback form, Firebase submission, consent validation, image gallery, FAQ expansion and CTA anchors.

SEO protections: Preserve holiday park, static caravan, lodge, site fees, resale, rental income and mis-sold wording where accurate.

Planned changes: Substantial consolidation with careful anchor repair and form preservation.

### 9. `public/car-finance.html`

Current purpose: Complex free Car Finance Complaint Pack Builder and analysis experience.

Current strengths: Strong builder, pack generation, lender search, agreement analysis, live preview, exports and QCBF integration.

Current repetition: Multiple process explanations, duplicated function names and repeated free/Premium distinctions may create cognitive load.

Current structural defects: Known duplicate-function risk requires mapping declarations before any consolidation. No major JavaScript refactor is planned.

CTA issues: Pre-builder route should explain what the tool does before starting, with non-disruptive Premium distinction.

Proposed final journey: Hero, free/private reassurance, Your Car Finance Complaint Journey, important current update, what the pack includes, start builder.

Content to preserve: FCA/FOS cautions, time-sensitive regulatory content, agreement ranges, lender data logic, calculations, exports, storage and QCBF metadata.

Sections to consolidate: Repeated “How the Complaint Process Works” text into one “Your Car Finance Complaint Journey” where safe.

Functionality at risk: Ten steps, storage, remember-device, lender search, unknown/manual lender route, calculations, validation warnings, live preview, PDF/RTF/TXT/copy/print/reset.

SEO protections: Preserve PCP, HP, commission, car finance complaint, lender and redress search terms without changing regulatory facts.

Planned changes: Minimal editorial and journey refinements; document duplicate-function findings and defer risky refactoring.

### 10. `public/airbnb-refunds.html`

Current purpose: Airbnb refund and booking dispute review page with forms, evidence guidance and conversion flow.

Current strengths: Strong search intent, hero form, detailed evidence content, FAQs, visuals and payment/escalation routes.

Current repetition: Evidence guidance, process sections, Airbnb refund refused headings and large infographics repeat.

Current structural defects: The lower callback area may contain nested content sections in the left column; inspect and repair if present.

CTA issues: Hero currently risks duplicate CTA wording. Primary should be “Request My Free Airbnb Review”; secondary should be “See What Evidence Matters”.

Proposed final journey: Hero and form, trust reassurance, recognise the issue, Your Airbnb Dispute Review Journey, Evidence That Matters, host versus platform responsibility, payment/escalation routes, Knowledge/related guidance, FAQs, final CTA, callback route.

Content to preserve: Firebase form submission, conversion tracking, Airbnb refund refused terms, cancellation/refund/listing/hidden-fee evidence, payment routes and FAQs.

Sections to consolidate: Evidence sections, process explanations and repeated “Airbnb Refund Refused?” headings.

Functionality at risk: Hero form, callback form, consent validation, success/error states, review-potential tool, image layout and FAQ/schema parity.

SEO protections: Preserve Airbnb refund, Airbnb dispute, Airbnb complaint, cancellation refund, holiday rental dispute and vacation rental dispute language.

Planned changes: Repair flow and CTA duplication while retaining page length and useful SEO substance.

### 11. `public/energy-switch.html`

Current purpose: Free Energy Supplier Complaint and Switching Pack Builder.

Current strengths: Strong QCBF architecture, energy analysis, official source/directory work, Smart Submission, exports and account health logic.

Current repetition: The pre-builder guidance grid has many equal-weight cards and may overwhelm visitors before they start.

Current structural defects: Check step tabs, wide tables, preview, form controls and export controls on narrow screens.

CTA issues: Hero and builder start should reduce anxiety and make the route clear without overloading technical language.

Proposed final journey: Understand the issue, prepare the account history, gather evidence, choose requested outcome, review the Complaint Pack, send it yourself, track the response.

Content to preserve: QCBF field identifiers, builder configuration, scripts, energy analysis, evidence logic, document generation, QCMS adapter, storage behaviour, export options, official source directory and urgent safety wording.

Sections to consolidate: Reorganise large guidance grid into high-level groups: Switching, Billing, Metering, Payments and refunds, Moving home, Vulnerability and urgent issues, Complaint escalation.

Functionality at risk: Builder state, QCMS adapter, exports, official sources, supplier directory, dynamic tables and storage.

SEO protections: Preserve switching, billing, metering, refund, direct debit, supplier complaint and Energy Ombudsman terms.

Planned changes: Simplify pre-builder presentation and explain technology in human terms without altering builder internals.

## Commit Plan

1. Commit the Phase 2 plan.
2. Commit core public pages: `index.html`, `the-quaerens-platform.html`, `about-quaerens.html`, `consumer-rights-knowledge-centre.html`.
3. Commit flagship free and payment routes: `freeflightclaim.html`, `section75support.html`.
4. Commit professional assessment routes: `foam-insulation.html`, `holidaypark.html`, `airbnb-refunds.html`.
5. Commit complex builders: `car-finance.html`, `energy-switch.html`.
6. Commit validation report.

## Validation Plan

Run direct tests where available because npm has previously been unavailable in this workspace:

- `node public/platform-services/qcms/qcms.test.js`
- `node public/platform-services/qcms/qcms.ui.test.js`
- `node public/platform-services/qcms-operations/qcms-operations.test.js`
- `node public/complaint-builder/tests/qcbf.test.js`
- `node public/builders/holiday/holiday.migration.test.js`
- `node public/builders/flight/flight.migration.test.js`
- `node public/builders/car-finance/carfinance.partial-integration.test.js`
- `node public/builders/energy/energy.qcms.integration.test.js`

Additional validation:

- JavaScript syntax checks for changed pages or extracted scripts where possible.
- Internal anchor checks for the 11 pages.
- Duplicate ID checks for the 11 pages.
- JSON-LD parsing checks.
- Image reference checks for newly touched sections.
- Mobile review instructions for desktop, 414px, 390px, 360px and 320px where browser automation is available.

## Known Risks Before Implementation

- `public/car-finance.html` and `public/freeflightclaim.html` are large, functionally dense builders; editorial changes must avoid active JavaScript paths.
- `public/holidaypark.html` and `public/airbnb-refunds.html` require consolidation but contain valuable SEO substance that should not be removed carelessly.
- Existing unrelated uncommitted files must remain untouched and unstaged.
- If validation exposes pre-existing defects outside the 11 pages, those will be recorded rather than folded into this rewrite unless they directly block safe completion.
