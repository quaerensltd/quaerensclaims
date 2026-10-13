# CRM4 Spain private-origin and OAuth review

Shared CRM Framework; CRM4 project quaerens-crm4-spain-test / 558324850479 only. Read-only verification is in evidence/phase1/storage-correction-access-review.json. No OAuth, key, domain, IAM or application changes were made.

## External OAuth / IAP

No Cloud Run service exists. Keep brusseljeroen@gmail.com as the sole proposed External testing user and eventual service-specific IAP accessor. A Google login does not create or confer CRM4 Administrator membership.

The IAP brands API still returns 400 because this project has No organization. Google Auth Platform Console setup is required. Browser automation failed before opening a session (Windows sandbox helper failure), so info@quaerens.co.uk support-email eligibility remains unverified. The proposed support email must be a selectable Google account or eligible Google Group managed by the signed-in account. If unavailable, obtain an eligible owner-controlled support account/group or explicit approval of a different eligible contact. Do not create a Google account, substitute an email, or add another tester automatically. The developer contact remains info@quaerens.co.uk subject to Console validation. OAuth client secrets must never enter source, evidence or build context.

After Console eligibility is resolved, confirm External/Testing audience and this sole tester. Keep service-specific IAP accessor and Cloud Run invoker bindings gated by the separate application deployment approval. No public invocation. Preserve verified signed IAP assertions plus revoked-token checking and fresh Firebase membership at the application boundary.

## Public browser key: exact pending restriction review

Key resource: projects/558324850479/locations/global/keys/0be9a348-3160-4749-9240-083aa454e877. Fresh read still shows 27 API targets and no HTTP-referrer allowlist. Firebase public SDK keys are identifiers, not administrative credentials; the Auth restrictions and authorization boundaries remain essential.

The candidate browser API targets for this application are identitytoolkit.googleapis.com (password Auth), securetoken.googleapis.com (refresh), firestore.googleapis.com (client reads) and firebasestorage.googleapis.com (case-owner uploads). Staff upload bytes now use the same-origin authenticated application transport. This is a proposal, not an applied restriction or a claim that every browser request has been observed. Validate the browser login, refresh, Firestore and owner-upload flows before removing any of the 27 existing targets. Retain a required Firebase API only on evidence from those flows; do not add unrelated paid-provider APIs.

The exact HTTPS private service origin is not yet assigned. Before build/deploy approval, resolve the intended service origin through the approved deployment configuration; do not create a placeholder service to obtain it. Proposed referrer allowlist: only the exact approved origin followed by /*. Do not allow *.run.app, public site origins or localhost in the cloud key. Add a project Auth helper origin only if an approved flow demonstrably requires it; password-only login does not justify enabling social sign-in or email-link flows. Review Firebase authorizedDomains separately using the exact hostname.

For any approved key update: fresh project ID/number, key resource, restrictions and etag; preserve the complete previous restrictions for rollback; apply only the reviewed restriction fields with the current etag; verify saved values and the approved browser acceptance matrix. Do not enable the API Keys API just because a quota-header REST request fails: the read-only gcloud describe path already works.

The existing GBP20 monthly budget remains unchanged. Adding info@quaerens.co.uk as a budget recipient still requires an exact verified notification-channel/budget delta; do not duplicate the budget.

Sources: [Firebase API keys](https://firebase.google.com/docs/projects/api-keys), [Cloud Run IAP](https://cloud.google.com/iap/docs/enabling-cloud-run), [OAuth branding](https://support.google.com/cloud/answer/15549049).
