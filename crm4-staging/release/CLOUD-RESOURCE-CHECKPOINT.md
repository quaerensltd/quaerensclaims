> Next phase: [exact bootstrap approval package](BOOTSTRAP-APPROVAL.md) and `bootstrap-plan.json` refine the minimum API list to eight and specify the Token Creator treatment. No changes have been applied.

# CRM4 Spain — owner-created project verification

Shared CRM Framework; branch `feature/crm4-isolated-clone`. Read-only observations are saved in `cloud-observed-state.json`. All agent-controlled mutation approvals remain false. The owner performed project creation, Blaze upgrade and reported budget creation outside this task.

## Verified existing state

- Project `quaerens-crm4-spain-test`, number `558324850479`, ACTIVE; created 13 October 2026 at 19:25:09 UTC. Resource Manager returns no parent, consistent with the confirmed No organization destination. Firebase independently returns the same ID and number.
- Billing is enabled on `billingAccounts/016627-0BEE7F-D03ADE` (Firebase Payment). No project creation or billing attachment is needed.
- `martijnpronk76@gmail.com` is the active CLI identity and the only human principal in the returned project IAM policy, with Owner role. No allUsers/allAuthenticatedUsers or CRM2/CRM3/CRM5 principals appear in that policy. This is project-policy evidence, not proof that every identity lacks grants in other projects; other projects and production were not changed or copied.
- Firebase-created identities have Firebase management/SDK service-agent roles. The SDK service account also has project-wide `roles/iam.serviceAccountTokenCreator`. This differs from the proposed no-Token-Creator design and can matter once new service accounts exist. Review necessity and separately authorize removal/narrowing before runtime/build identity provisioning; no existing grant was changed.
- No Firebase web apps, Storage buckets or Cloud Monitoring notification channels were listed. Firebase Auth configuration returned `CONFIGURATION_NOT_FOUND`; enabled Identity Toolkit API alone does not mean email/password Auth is configured.
- Firestore, Cloud Run, IAP, IAM, Artifact Registry, Cloud Build and Firebase Storage APIs are not enabled. Resource absence behind disabled APIs has not been independently established. Firebase reports a hosting-site identifier; no public application deployment was performed or approved here.

## Budget verification limitation

The owner reports an existing GBP 20 monthly budget. The Budget API read failed with `SERVICE_DISABLED` both through CLI quota-context discovery and with an explicit `x-goog-user-project: quaerens-crm4-spain-test`. It was not enabled automatically. Budget amount, calendar period, project filter, thresholds and actual recipients remain unverified through the API. The empty channel list means the proposed CRM4 Monitoring email channel for `info@quaerens.co.uk` does not yet exist in this project; it does not prove the existing budget lacks another delivery route.

After separately authorized Budget API enablement, inspect the existing budget first. Do not create a duplicate. The existing `budget.request.proposed.json` is only a desired configuration reference, now filtered to `projects/558324850479`; use a reviewed update with the existing budget name/etag if changes are necessary. The requested custom recipient is `info@quaerens.co.uk`. Existing default billing IAM recipients remain in the proposal. Any new notification channel or verification message requires the authorized provisioning stage.

## Remaining approval package

1. **API enablement on CRM4 only:** proposed missing APIs are `cloudbilling.googleapis.com`, `billingbudgets.googleapis.com`, `firestore.googleapis.com`, `firebasestorage.googleapis.com`, `run.googleapis.com`, `artifactregistry.googleapis.com`, `cloudbuild.googleapis.com`, `iam.googleapis.com`, `iap.googleapis.com`. Cloud Billing API is a proposed administrative API, not an application runtime dependency. No unrelated enabled APIs will be disabled automatically.
2. **EU resources and Firebase configuration:** create the default Native Standard Firestore database in `europe-west1`, reviewed indexes/rules and seven-day daily backups; create the regional Firebase Storage bucket with uniform IAM, public-access prevention and seven-day soft delete; initialize synthetic-only email/password Auth and one Firebase web app. Existing Auth location limitation remains accepted. No real staff/client users or imported production records.
3. **IAM and build infrastructure:** review the existing Token Creator exception; authorize the dedicated CRM4 runtime/build identities, resource-scoped bindings, regional Artifact Registry repository and source staging bucket listed in `infrastructure-scope.json`. Never reuse the automatically created SDK account as the runtime. Inspect effective access before claiming full isolation.
4. **Budget recipient configuration:** inspect the owner-created budget; authorize only necessary updates and one proposed CRM4 Monitoring email channel for `info@quaerens.co.uk`. Preserve GBP 20 and avoid duplicate budgets.
5. **Private IAP/OAuth and synthetic membership:** configure External OAuth with proposed support/developer contact `info@quaerens.co.uk`, subject to Google's eligibility; grant service-specific IAP access only to `brusseljeroen@gmail.com`, and Run Invoker only to the IAP service agent. The exact JWT audience is `/projects/558324850479/locations/europe-west1/services/crm4-spain-test`. IAP does not authorize Firebase roles. Owner Administrator membership is separate; two synthetic staff retain one UID each with the existing Lister + Closer contract. Manager, assessment, processing, ownership and audit protections remain unchanged.
6. **Build and application deployment are separate:** approve cloud build submission (Docker unavailable locally), record/scan the immutable image and review the residual dependency advisory, then approve the exact image, runtime configuration, rules/index hashes and private service deployment. Actual service origin and Firebase public web configuration are still unavailable. Do not deploy a placeholder service merely to obtain them without approval.

The minimum runtime remains one CPU/1 GiB, min 0/max 2 instances, concurrency 8 and 120-second timeout in `europe-west1`, with direct IAP, capture-only providers, no public invoker, no load balancer and no production access. Live private acceptance must subsequently verify IAP allow/deny, token revocation, membership/ownership isolation, query indexes, Storage preconditions and dual-role Spray Foam journeys.

`project-create.request.json` is historical and must not be executed now. No further project or billing-link creation is required. Local startup continues to reject the incomplete cloud configuration and missing deployment approval.

Local validation after recording the actual project number: nine focused release, IAP, private browser, startup-approval and container/source checks passed. No staff capability implementation changed.
