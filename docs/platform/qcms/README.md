# Quaerens Complaint Management Service (QCMS)

QCMS is the optional managed-support layer that can be explored after a free DIY Complaint Pack has been completed.

Current architecture version: `1.0.0-alpha.4`

Case Summary schema version: `1.0.0`

## Boundaries

- Free DIY builders remain available before any QCMS pathway is considered.
- QCMS previews are local-only unless a later instruction flow clearly asks for permission.
- QCMS does not submit complaints automatically at this stage.
- QCMS does not collect payment, create accounts, upload documents, send emails or create CRM cases in the current local integration.
- Platform users must not be described as clients until a valid instruction process has completed.

## Energy Reference Integration

The Energy Supplier Complaint & Switching Pack Builder uses `public/builders/energy/energy.qcms.adapter.js` to translate a completed local Energy builder draft into the QCMS Case Summary schema.

The adapter:

- reads Energy builder state locally;
- preserves Energy account, complaint, chronology, financial, evidence and route data;
- creates a local QCMS handoff object;
- runs the shared QCMS validation and recommendation services;
- renders an optional QCMS preview after the free export actions.

The adapter does not contain independent recommendation logic. Service level selection remains in the shared QCMS recommendation module.

