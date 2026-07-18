# Quaerens Shared Components

This folder documents reusable front-end component patterns used by Quaerens self-service builders and authority landing pages.

Current reusable component patterns:

- Searchable comboboxes for countries, airports and airlines.
- Wizard step navigation with browser-first state.
- Live document preview tabs.
- Evidence checklist and journey/timeline summaries.
- Expense schedule rows with totals by currency.
- Download actions for PDF, editable RTF/Word-compatible text, TXT, copy and print.

Implementation note:

The current public pages are static HTML pages, so components are implemented as page-local JavaScript until the site is moved to a shared build system. New builders should keep component naming and data shapes aligned with the files in `/public/data/` and `/public/builders/`.

