# Quaerens Cruise Complaint Pack Builder

Status: Native QCBF builder - production.

This builder powers `/cruise-compensation-recovery.html` and remains isolated from the Flight, Holiday, Car Finance, Baggage, Train, Parking and Gym specialist logic.

## Version 1.0 Boundaries

- Self-service complaint pack builder only.
- No automatic submission to Quaerens, a cruise line, an organiser or a third party.
- No guaranteed refund, compensation, reimbursement or outcome.
- No fixed missed-port compensation calculation.
- No personal injury valuation, diagnosis or legal advice.
- Urgent court, serious injury, crime, formal deadline and specialist-process issues are flagged as boundaries.

## Source of Truth

- Configuration: `cruise.config.js`
- Questions and first-step wording: `cruise.questions.js`
- Booking, itinerary, route and caution analysis: `cruise.analysis.js`
- Official-source metadata and Smart Submission route logic: `cruise.resources.js`
- Generated complaint file sections: `cruise.documents.js`
- Page binding, autosave and exports: `cruise.page.js`

## Official Sources

The builder uses only official or authoritative sources for public references:

- Package Travel and Linked Travel Arrangements Regulations 2018
- Consumer Rights Act 2015
- Maritime passenger rights Regulation 1177/2010
- ABTA help and complaints
- Citizens Advice consumer guidance
- Financial Ombudsman Service complaint guidance

Each source is used as context only. The builder does not decide liability or entitlement.

## Acceptance

Run:

```bash
node public/builders/cruise/cruise.migration.test.js
node public/builders/cruise/cruise.part2.acceptance.test.js
```

The public page must remain indexable, UTF-8, free of internal development notes, and aligned with the visible FAQ content and FAQPage schema.
