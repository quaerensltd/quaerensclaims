# QCMS Version 1.0 Part 1B Acceptance Matrix

Status: complete locally, not deployed.

Architecture version: 1.0.0-alpha.2  
Case Summary schema version: 1.0.0

| Area | Acceptance check | Status | Evidence |
| --- | --- | --- | --- |
| Blueprint continuity | Part 1B continues from Part 1A and does not recreate the architecture. | Pass | Reuses `qcms.case-summary`, `qcms.validation`, `qcms.recommendation`, `qcms.pricing` and `qcms.fixtures`. |
| Case Summary UX | Prototype displays the Case Summary before optional QCMS service exploration. | Pass | `qcms.render.js` renders completion, summary, health, evidence and recommendation sections. |
| Case Health | Health indicators are visible and explain what they measure. | Pass | Evidence, chronology, financial, readiness, complexity and administration estimate cards are rendered. |
| Service recommendation | Recommendation consumes the shared recommendation output. | Pass | `renderQCMSExperience()` calls `recommendQCMSService()` and does not duplicate recommendation rules. |
| Public wording | Service names, scope, exclusions and comparison copy come from the content layer. | Pass | `qcms.content.js` centralises public wording and scope lists. |
| Free DIY comparison | The Platform User can clearly see free DIY remains available. | Pass | `Continue with Free DIY` and the DIY/QCMS comparison table are rendered. |
| Scope and exclusions | Each service level displays included, not included and separate-agreement items. | Pass | L1, L2, L3 and manual review content exist in `qcms.content.js`. |
| Manual review | Manual review path avoids fixed pricing and data transfer language. | Pass | Manual fixture renders `Service Review Required`, `Manual review required` and no final payable wording. |
| Privacy and transfer | Prototype states that exploring QCMS does not transfer data. | Pass | Privacy copy states local browser storage and no transfer without later permission. |
| Consent preview | Future instruction steps are preview-only and not collected. | Pass | Consent preview lists future checks and says they are not collected during Part 1B. |
| No prohibited actions | No payment, CRM, email, auth, signature, public purchase or automatic transfer is created. | Pass | Prototype is static local HTML and tests reject public-action wording. |
| Terminology | Uses Platform User terminology rather than Client. | Pass | UI tests reject the word `client`. |
| Accessibility | Sections use labelled regions and readable semantic headings. | Pass | Rendered sections include headings and aria labels; fixture selector uses buttons. |
| Responsive behaviour | Tables and fixture controls collapse for small screens. | Pass | `qcms.styles.css` includes responsive grids and table fallback styles. |
| Security hygiene | User-provided values are escaped before rendering. | Pass | UI regression covers hostile HTML strings. |
| Prototype scope | Prototype is non-public and not linked from navigation, sitemap or SEO metadata. | Pass | Located under `docs/platform/prototypes/qcms/` with `noindex,nofollow`. |

## Test Coverage

- `npm run test:qcms`
- Existing QCBF regression
- Existing Holiday migration regression
- Existing Flight migration regression
- Existing Car Finance partial integration regression

## Known Limitations

- The prototype is static and fixture based.
- No real Complaint Pack transfer, payment, account, CRM case, email, instruction or signature workflow exists in Part 1B.
- QCMS instruction, purchase and transfer flows are intentionally deferred to a later phase.
