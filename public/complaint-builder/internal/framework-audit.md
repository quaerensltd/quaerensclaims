# QCBF 1.1 Framework Audit

## Scope

This audit covers the shared `public/complaint-builder` modules and the registered builder configuration files. Flight, Holiday, Car Finance and public page HTML were not migrated as part of Phase 2.

## Findings

- Builder discovery was implicit. QCBF 1.1 adds a central registry so builders expose consistent metadata, stages, modules and resources.
- Status calculations were split across readiness, evidence and confidence helpers. QCBF 1.1 adds a status engine that produces one shared status object for readiness, evidence, confidence, submission and draft state.
- Card markup was beginning to repeat across builder pages. QCBF 1.1 adds reusable card helpers for overview, timeline, evidence, readiness, confidence, organisation, submission, downloads and financial cards.
- Document generation already used a document model, but builders still needed a clearer complaint-pack abstraction. QCBF 1.1 adds `ComplaintPack` and an export engine that routes a model to TXT, RTF, print HTML and PDF definitions.
- Design tokens existed in CSS. QCBF 1.1 adds a more explicit design-system stylesheet for internal and future builder use.
- Testing covered state, validation, dates, documents and basic components. QCBF 1.1 expands the harness to cover registry, shared status, reusable cards and exports.

## Duplication Reduced

- Builder metadata can now be listed from one registry.
- Submission, draft, evidence, confidence and readiness statuses can be derived from one engine.
- Repeated card shells can use shared component functions.
- Exports can be requested through one pipeline instead of calling renderers separately.

## Migration Readiness

Flight can now be migrated mechanically by registering its modules, mapping its current state to `ComplaintPack`, replacing duplicated status labels with `statusEngine`, and reusing the shared export pipeline.
