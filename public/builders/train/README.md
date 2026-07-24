# Quaerens Train Builder

Status: QCBF 1.2 migrated production builder.

The Train builder powers `public/train-delay.html` and uses one shared source of truth for:

- journey issue questions and requested outcomes;
- rail operator resources and official source links;
- delay, refund and expense analysis;
- cautious Delay Repay compensation estimates;
- evidence status and readiness scoring;
- Quaerens Consumer Complaint File document generation;
- Smart Submission guidance;
- PDF, Word/RTF, TXT, copy and print exports.

The page should not contain a second inline builder implementation. Browser behaviour is wired through `train.page.js`, and future train pages should reuse these modules rather than duplicating layouts or calculation logic.

Run:

`node public/builders/train/train.foundation.test.js`

`node public/builders/train/train.version2.test.js`
