# Quaerens Complaint Builder Framework

QCBF is the shared internal platform used by Quaerens complaint pack builders.

Current framework version: **QCBF 1.1**

## Lifecycle

1. A builder registers its config in the builder registry.
2. The page collects answers through shared state, validation and step control.
3. Builder-specific analysis turns answers into evidence, status and document sections.
4. `ComplaintPack` creates a shared document model.
5. The export engine renders the same model to PDF definitions, Word/RTF, TXT and print HTML.
6. Submission modules identify the appropriate route without automatically submitting on the user's behalf.

## Shared Modules

- `core/BuilderRegistry.js` centralises builder metadata.
- `core/StatusEngine.js` centralises readiness, evidence, confidence, submission and draft state.
- `components/CardComponents.js` provides reusable card shells.
- `documents/ComplaintPack.js` provides a shared complaint-pack model.
- `documents/ExportEngine.js` provides the shared export pipeline.
- `styles/design-system.css` provides reusable design tokens and card styling.

## Migration Pattern

Keep public page content stable. Move builder-specific logic into:

- `config`
- `questions`
- `analysis`
- `documents`
- `resources`
- `submission`
- `tests`
- `page`

Holiday is the current reference migration. Flight should be migrated next using the registry, document model, status engine and export engine.
