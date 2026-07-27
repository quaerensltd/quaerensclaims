# Quaerens Platform UI Audit

Generated: 2026-07-27T10:53:55.651Z

Baseline commit: `d50e4554d580cecd86a52fdc485708005ce80ed0`

## Scope

Audited 283 public HTML files for header logo usage, footer presence, UTF-8 risk markers, canonical preservation and broken local image references.

This audit intentionally does not start clean URL migration. Existing `.html` URLs, canonical URLs, sitemap URLs and structured-data URLs are treated as fixed during this design-system pass.

## Summary

- Text-only Quaerens logo headers: 0
- Headers already using approved logo imagery: 149
- Non-internal pages missing a footer: 31
- Pages with malformed UTF-8 risk markers: 16
- Broken local image references found: 0

## Text-Only Logo Headers To Replace

- None found

## Non-Internal Pages Missing Footer

- public/agenda.html
- public/agreement-generator.html
- public/assessment-detail.html
- public/chat.html
- public/claim-detail.html
- public/claim-form-traindelay.html
- public/client-file.html
- public/client-intake-portal.html
- public/client-portal.html
- public/client-search.html
- public/client-timeline.html
- public/closer-detail.html
- public/dialer.html
- public/freeflightclaim2.html
- public/intake-detail.html
- public/lister-callbacks.html
- public/lister-intro-emails.html
- public/lister-leads.html
- public/login.html
- public/manager-assessment-detail.html
- public/manager-intro-emails-overview.html
- public/manager-lead-upload.html
- public/manager-leads-overview.html
- public/manager-weekly-attendance.html
- public/processing-case-detail.html
- public/processing-daily-attendance.html
- public/processing-detail.html
- public/processing-monthly-attendance.html
- public/processing-payments.html
- public/processing-weekly-attendance.html
- public/thankyou.html

## Broken Local Image References

- None found

## Design-System Notes

- Homepage footer in `public/index.html` must remain the expanded homepage footer.
- Non-homepage public pages should use the compact footer pattern derived from `public/travel-claims-hub.html`.
- Public headers should use an approved Quaerens logo image where available, linked to the homepage, with meaningful alt text.
- Builder pages may use approved specialist logo variants, but should not fall back to plain text where an image exists.
