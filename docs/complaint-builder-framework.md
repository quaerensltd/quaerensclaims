# Quaerens Complaint Builder Framework

Internal shorthand: QCBF

Baseline recorded before this framework phase:

- Flight Version 1.1 working commit: `e5d0c492db1c4a99e77a0dab7513b4c2004aeb38`
- Live production page to protect: `https://www.quaerens.co.uk/freeflightclaim.html`
- Live holiday builder to protect: `https://www.quaerens.co.uk/freeholidaycompensation.html`

This document describes the shared architecture for current and future Quaerens complaint pack builders. It is a platform refactor plan and foundation, not a new public product launch.

## Architecture Audit

The Flight, Holiday and Car Finance builders share a large amount of behaviour:

- Sticky header, hero positioning, trust cards and CTA patterns.
- Wizard shell with steps, progress bar, previous/next navigation and a final generated pack area.
- Field collection from standard inputs, selected checkboxes and radios.
- Browser draft saving, restoration and clearing.
- Repeating groups for passengers, travellers, expenses, losses and evidence.
- Evidence checklists and readiness-style guidance.
- Live preview areas with tabs.
- Complaint summary, timeline, evidence, financial schedule and next-step documents.
- Download actions for PDF, editable RTF, plain text, copy and print.
- Pack references, dates, currency formatting and cautious fallback wording.
- Official resource lists, FAQs, privacy notices and no-guarantee wording.

Duplicated areas that should move into shared modules:

- Storage namespace handling.
- Validation rules and error summaries.
- Conditional field visibility.
- Repeating group management.
- Timeline sorting and rendering.
- Evidence status and evidence-position calculations.
- Expense/loss totals by currency.
- Readiness and confidence scoring.
- Document model generation and export renderers.
- Submission directory lookup and Smart Submission cards.
- Design tokens and print styles.

Flight-specific code that must remain specialist for now:

- Smart Flight Lookup API calls.
- Airport and airline matching.
- Distance and UK261/EC261 compensation calculation.
- Airline complaint directory details.

Holiday-specific code that must remain specialist for now:

- Package holiday issue logic.
- Promised-versus-actual analysis.
- Organiser/platform distinction.
- Traveller and loss schedule terminology.

Car Finance should not be fully migrated during this phase. It can adopt pack references, storage, validation, document model and wording governance after the Flight and Holiday shared layer is proven.

## Directory Structure

The framework lives under:

`public/complaint-builder/`

Main areas:

- `core/`: engine, state, validation, steps, conditions and errors.
- `components/`: reusable UI render helpers.
- `documents/`: neutral document model and renderers.
- `submission/`: directory schema and Smart Submission helpers.
- `utilities/`: formatting, identifiers, text and safe storage helpers.
- `styles/`: design tokens, builder styles, document styles, print and responsive CSS.
- `schemas/`: JSON schemas for builder config, directory and resource data.
- `tests/`: lightweight test runner and fixtures.

Builder-specific source lives under:

`public/builders/<builder-id>/`

## Builder Lifecycle

1. A builder supplies a configuration object.
2. The shared engine initialises state with a builder-specific namespace.
3. Questions and steps are rendered or wired by the builder.
4. Validation and conditional logic run through shared rules.
5. Builder-specific analysis produces a neutral document model.
6. Shared renderers export the same model as PDF, RTF, TXT and print.
7. Smart Submission resolves the official route and shows review-before-send guidance.

## State Model

State is versioned and namespaced:

`qcbf:<builder-id>:<schema-version>`

The shared state manager supports nested paths, arrays, repeating groups, computed values, draft metadata and stable pack references. Personal data must never be placed in URLs or analytics events.

## Configuration Model

A builder config can define:

- `id`
- `productName`
- `shortName`
- `pageTitle`
- `h1`
- `canonicalUrl`
- `storageNamespace`
- `packPrefix`
- `stages`
- `questions`
- `validation`
- `conditions`
- `evidenceRules`
- `readinessRules`
- `confidenceRules`
- `documentSections`
- `submissionDirectory`
- `officialResources`
- `faq`
- `disclaimers`
- `theme`
- `exportOptions`

## Adding a Question

Add the question to the builder config with:

- stable `id`
- `label`
- input `type`
- optional `required`
- optional validation rules
- optional conditional display rule

Avoid page-specific DOM chains for simple show/hide behaviour.

## Adding Evidence Rules

Each evidence rule should include:

- `id`
- `category`
- `label`
- `description`
- `importance`
- `appliesWhen`

The engine can then produce available, missing, requested or not-applicable evidence outputs.

## Adding a Document Section

Builder logic should first create neutral document blocks:

- heading
- paragraph
- key-value table
- data table
- checklist
- timeline
- callout
- disclaimer
- page break
- resource link

The shared renderers then output PDF, RTF, TXT and print consistently.

## Privacy Rules

Approved claims:

- Answers are saved only in the browser when the user chooses device saving.
- External API lookups are disclosed at the point of use.
- Quaerens does not automatically submit complaints unless a future feature explicitly says so.

Do not claim everything stays in the browser on pages that use an external lookup API.

## Wording Governance

Use cautious terms:

- potential compensation
- estimated statutory compensation
- possible remedy
- requested outcome
- evidence position
- data confidence
- complaint pack completeness
- self-service
- official complaint route

Avoid or qualify:

- guaranteed
- definitely owed
- success probability
- winning chance
- we will recover
- automatic submission
- no-win-no-fee

## Accessibility Requirements

Shared components should provide:

- connected labels and errors
- error summaries
- focus to first invalid field
- `aria-live` announcements where useful
- accessible accordions
- keyboard-safe buttons
- readable mobile layouts

## Rollback Procedure

If a framework migration breaks a live builder:

1. Revert the framework wiring commit only.
2. Restore the last known standalone builder version.
3. Verify `freeflightclaim.html` and `freeholidaycompensation.html`.
4. Redeploy through Git push to the Vercel-connected `main` branch.
5. Keep framework files if they are not loaded by the broken page; remove wiring first.

Do not delete the known working standalone implementations until the migrated version has passed production tests.

## Deployment Architecture

Static public files are served from `public/`. The public `www.quaerens.co.uk` domain is served by Vercel through Git integration. Firebase Hosting may also deploy `public/`, but it is not the current `www` production domain.

Framework source under `public/complaint-builder/` is static and can be loaded by future pages without a build step. Tests and scaffold scripts run locally and are not public user flows.

## Recommended Next Builder

After Flight and Holiday use the shared layer safely, the next best candidate is Lost Luggage or Rail Delay because their builder logic is simpler than Flight but close enough to reuse travel evidence, timeline, expense and Smart Submission modules.
