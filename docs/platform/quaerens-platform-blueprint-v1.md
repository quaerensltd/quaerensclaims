# Quaerens Platform Blueprint(TM)

Version 1.0  
Foundation Architecture

This Blueprint is the master architecture reference for the future evolution of the Quaerens Consumer Complaint Platform. It is not a public webpage, product build, deployment plan, or Complaint Pack implementation. It exists to keep future Complaint Packs, platform features, QCMS modules, mobile applications, dashboards, partner systems, and operational processes aligned.

## 1. Vision

Quaerens is a consumer complaint platform.

Its long-term purpose is to remove complexity from consumer complaints by helping Platform Users:

- understand complaints;
- organise evidence;
- prepare Complaint Packs;
- manage complaints;
- optionally instruct Quaerens.

The platform should make complaint preparation clearer, more structured, and more accessible, while preserving the user's ability to act independently where they choose to do so.

## 2. Mission

Quaerens helps Platform Users prepare and manage complaints from free DIY Complaint Packs through to optional Complaint Management Services.

The mission is to give people practical structure before they decide whether they need further support. A user should be able to understand the issue, organise the relevant facts, produce a usable complaint file, and choose the next route with confidence.

## 3. The Quaerens Principle

Every free Complaint Pack must be genuinely capable of helping someone resolve their complaint without ever paying Quaerens.

If a free builder only exists to generate leads, then it fails the Quaerens Principle.

Every future feature must satisfy this principle. The free product must have real standalone value: it should help the user understand the problem, collect useful evidence, prepare clear documents, and take practical next steps without requiring a paid upgrade.

Optional paid support may exist, but it must sit above a genuinely useful free layer.

## 4. Platform Users

Quaerens uses the following terminology:

- Platform User: a person using the Quaerens platform before purchasing or instructing any Complaint Management Service.
- Client: a person who has instructed Quaerens to provide a paid Complaint Management Service.
- Complaint Manager: administration or operational staff who manage, review, or support complaints through Quaerens systems.

DIY users must not be described as clients unless they have instructed Quaerens. This distinction protects clarity, expectation management, and future product architecture.

## 5. Platform Architecture

The target platform architecture is:

```text
Complaint Packs(TM)
        |
        v
Evidence Engine(TM)
        |
        v
Case Summary
        |
        v
Recommendation Engine
        |
        +--> DIY
        |
        v
Quaerens Complaint Management Service(TM)
        |
        v
Complaint Manager
        |
        v
CRM
        |
        v
Future Client Portal
        |
        v
Future Mobile App
```

### Complaint Packs(TM)

Complaint Packs are the user's structured self-service output. They combine facts, timeline, evidence, complaint wording, requested outcomes, and route guidance into one usable complaint file.

### Evidence Engine(TM)

The Evidence Engine turns raw user answers into structured complaint material. It identifies gaps, evidence categories, chronology, financial schedules, and complaint readiness.

### Case Summary

The Case Summary is the structured internal and user-facing summary of the complaint. It should become reusable across dashboards, exports, QCMS handover, CRM entries, and future portals.

### Recommendation Engine

The Recommendation Engine is a future layer that helps determine whether a user should continue DIY, gather more evidence, use official routes, or consider optional Quaerens Complaint Management Service support.

### DIY

The DIY route allows the Platform User to prepare, download, copy, print, and submit their own complaint without paying Quaerens.

### Quaerens Complaint Management Service(TM)

QCMS is the optional paid service layer. It should only be offered where the matter appears to require structured support, complaint management, evidence organisation, or escalation handling beyond the user's preferred DIY route.

### Complaint Manager

Complaint Managers support instructed Clients and manage operational complaint workflows. They should work from structured Case Summaries and Evidence Engine outputs, not unstructured raw submissions alone.

### CRM

The CRM stores operational records, contact history, complaint status, tasks, deadlines, and Client-related workflow activity.

### Future Client Portal

The future Client Portal should give instructed Clients visibility of complaint progress, documents, tasks, messages, and next steps.

### Future Mobile App

The future Mobile App should extend platform access, document collection, status updates, notifications, and complaint progress tracking.

## 6. The Three Core Products

### Complaint Packs(TM)

Complaint Packs are the free or self-service complaint outputs generated by the platform. They should be complete enough for a Platform User to send or use independently.

### Evidence Engine(TM)

The Evidence Engine is the structured logic that converts answers into usable evidence schedules, timelines, summaries, letters, and readiness assessments.

### Quaerens Complaint Management Service(TM)

QCMS is the optional managed support product. It sits after the free self-service layer and should be based on complexity, evidence needs, user preference, and complaint route suitability.

## 7. The Evidence Engine

Current and future Evidence Engine responsibilities include:

- Timeline;
- Evidence Checklist;
- Financial Schedule;
- Complaint Letter;
- Supporting Statement;
- Case Health Score (future);
- Complaint Readiness (future);
- Recommendation Engine (future);
- Administration Estimate (future).

The Evidence Engine should remain reusable across builders. Future builders should not recreate isolated document-generation logic where shared Evidence Engine logic can be used.

## 8. The Quaerens Standard

Every Complaint Pack should ultimately contain, where relevant:

- Complaint Summary;
- Timeline;
- Evidence Checklist;
- Complaint Letter;
- Supporting Statement;
- Official Routes;
- Next Steps;
- Knowledge Centre links;
- PDF;
- Editable Word;
- TXT;
- Copy;
- Print;
- Browser-local storage;
- Dashboard registration;
- Future Case Summary;
- Future Case Health Score;
- Future Recommendation.

Not every builder will contain every feature from day one, but this is the target standard.

## 9. Current Flagship Builders

Version 1 status records the following flagship builders:

### Flight

The Flight builder is a flagship because it combines journey data, passenger handling, compensation estimation, airline complaint routes, complaint pack generation, and Smart Submission guidance.

### Cruise

The Cruise builder is a flagship because it handles complex travel scenarios, itinerary disruption, onboard issues, evidence collection, and varied complaint routes.

### Car Finance

The Car Finance builder is a flagship because it shows the Complaint Pack model applied to financial agreements, commission concerns, affordability issues, evidence schedules, and self-service complaint preparation.

### Energy

The Energy builder is a flagship because it brings together account health, switching, billing, metering, direct debit, credit, complaint history, and regulated escalation preparation.

These builders demonstrate the platform direction: complete Complaint Packs, structured evidence, useful self-service output, optional support pathways, and future QCMS compatibility.

## 10. Current Development Process

Quaerens uses a phased release lifecycle:

### Planning

Defines the problem, user need, complaint area, intended output, evidence model, and scope.

### Architecture

Defines shared components, data models, export requirements, platform alignment, and future reuse before page-level work begins.

### Part 1A

Creates the initial builder structure, user flow, fields, core content, and early output model.

### Part 1B

Extends the builder with deeper evidence logic, analysis sections, readiness checks, export structure, and supporting content.

### Part 2A

Refines the builder experience, document generation, user guidance, validation, and internal consistency.

### Part 2B

Completes advanced outputs, edge cases, visual polish, regression scenarios, and cross-builder consistency.

### Production Acceptance

Confirms the builder is stable, useful, credible, legally cautious, mobile friendly, and ready for public use.

### Deployment

Publishes the accepted version using the correct production pipeline only after acceptance.

### Verification

Checks the live page, downloads, mobile layout, key flows, footer, headers, links, encoding, and public wording.

### Freeze

Marks a version as stable so future work can be measured against a known baseline.

## 11. Pricing Philosophy

Prices are based upon complexity, not complaint type.

Current architectural guidance:

- Level 1: Complaint Submission, approximately GBP59;
- Level 2: Managed Complaint, approximately GBP199;
- Level 3: Enhanced Managed Complaint, approximately GBP349.

These are architectural defaults rather than hard-coded pricing. Future pricing should remain flexible and should reflect evidence volume, complexity, urgency, route type, administration load, and user needs.

## 12. Competitive Position

Quaerens sits in a market that includes services and tools such as Resolver, LetterForce, ClearComplaint, and Complainly.

Quaerens is positioned differently because it focuses on complete Complaint Packs and optional Complaint Management rather than only complaint letters.

The strategic distinction is:

- not just letter generation;
- not just signposting;
- not just lead capture;
- not only paid complaint handling;
- but structured complaint preparation, evidence organisation, reusable complaint files, and optional management support.

## 13. The Future Roadmap

The agreed roadmap includes:

- QCMS;
- Client Portal;
- Mobile Apps;
- Partner Portal;
- White Label;
- Business Platform;
- API.

These future layers should build on the same core architecture: Complaint Packs, Evidence Engine, Case Summary, Recommendation Engine, and optional Complaint Management.

## 14. Version History

| Version | Date | Notes |
| --- | --- | --- |
| 1.0 | July 2026 | Initial Platform Blueprint. |

## Known Future Additions

Future versions may add:

- detailed data model definitions;
- shared component catalogue;
- QCMS workflow model;
- dashboard permissions model;
- portal architecture;
- mobile app architecture;
- partner and white-label rules;
- API contract principles;
- compliance wording standards;
- design system references;
- builder acceptance checklist.

## Scope Control

This Blueprint does not:

- create a public webpage;
- deploy anything;
- modify existing Complaint Packs;
- implement QCMS;
- change platform pricing;
- change live website content;
- change canonical URLs;
- change public navigation;
- change deployment configuration.

Blueprint only.
