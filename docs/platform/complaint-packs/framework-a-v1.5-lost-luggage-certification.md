# Framework A v1.5 — Lost Luggage certification

Date: 6 August 2026

Category: Lost Luggage
Reference implementation: Airbnb Version 4

## Architecture result

Lost Luggage is registered as the `baggage` category in the frozen declarative Framework A registry. The public route uses the shared Framework A shell and shared state, chronology, evidence, financial, preview, Applicant Details, QCP reference, output, completion and anonymous-metrics implementations.

The public route no longer loads `baggage.page.js` or `baggage.documents.js`. Those legacy files remain in source history for rollback and comparison only; they are not an active production runtime.

## Category extensions

The category preserves baggage-specific journey and bag details, delayed/lost/damaged/missing-content/mobility routes, PIR and WorldTracer records, baggage deadlines, insurance and double-counting safeguards, evidence recommendations, financial loss presentation, airline complaint wording, official guidance and 12-page case-file composition.

## Output structure

1. Cover
2. Applicant and Case Details
3. Executive Summary
4. Detailed Timeline
5. Issue and Journey Analysis
6. Evidence Log & Readiness
7. Financial Schedule
8. Professional Complaint Letter
9. Cover Email
10. Submission Checklist
11. Response Tracker
12. Help the Next Person

## Release gate

Certification requires the focused conformance test, shared Framework A regression suites, browser inspection with a 12-page live preview, keyboard navigation, responsive overflow checks, output action checks, deployment verification and confirmation that the accepted public landing, SEO and anchors remain unchanged.

Rollback baseline before this release: `1d62b16`.
