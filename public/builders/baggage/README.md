# Baggage Complaint Pack Builder

Native QCBF builder ID: `baggage`

Public URL: `/lost-luggage.html`

Storage namespace: `qcbf-baggage`

Pack prefix: `QB`

## Purpose

The baggage builder creates a free self-service Quaerens Consumer Complaint File for delayed, lost, damaged, missing-content and mobility-equipment baggage complaints.

## Modules

- `baggage.config.js` - builder metadata, URL, pack prefix and stages.
- `baggage.questions.js` - eight-stage question map.
- `baggage.analysis.js` - readiness, deadline, evidence and financial-position analysis.
- `baggage.evidence.js` - evidence statuses and missing evidence schedule.
- `baggage.resources.js` - official resources and cautious airline route lookup.
- `baggage.submission.js` - Smart Submission checks and routing guidance.
- `baggage.documents.js` - complaint pack, schedules, letter and export text.
- `baggage.page.js` - browser controller for the public page.
- `baggage.migration.test.js` - Node regression coverage.

## Important wording rules

- Do not guarantee compensation, reimbursement or airline outcome.
- Do not describe the Montreal Convention as a fixed tariff.
- Do not convert SDR into GBP or EUR without a current verified source.
- Do not invent airline email addresses or postal addresses.
- Keep privacy wording browser-local unless a future submission feature is deliberately added.
