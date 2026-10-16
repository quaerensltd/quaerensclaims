# Firebase Auth configuration exposure — incident disposition

Date: 16 October 2026. Baseline: ec8b03da, feature/crm4-isolated-clone. Project: quaerens-crm4-spain-test (558324850479). Shared CRM Framework governance applies. This assessment uses sanitized incident records, local metadata, non-disclosing scans and official documentation. It does not retrieve the exposed configuration or reopen the affected transcript. No cloud requests or mutations were made during this review. Only this report is committed.

## Decision

**GO recommendation for resuming sanitized, non-executing rehearsal preparation, only after separate owner approval of this disposition. NO-GO for account creation, rehearsal execution or production.** The exposure does not establish a direct authentication bypass and need not prevent offline preparation. It is not fully eradicated: task-output access/retention and possible historical copies remain unresolved. Accepting preparation is not accepting future password-hash exposure or approving deployment.

Incident status: propagation into inspected Git/prepared evidence is contained; recurrence safeguards tested; retained-output confidentiality remains open. No evidence reviewed establishes unauthorized access, but the available evidence cannot establish that no other party has accessed the output. No claim of complete erasure or universally restricted access is justified.

## Material and practical risk

The incident concerns the project-specific Firebase Authentication password-hashing configuration: a hashing signer key and associated algorithm, salt-separator and cost-parameter categories. No values, lengths, prefixes or fingerprints of the exposed material are included here. The classification comes from the existing sanitized incident report; actual values were not rechecked. Firebase documents project-specific parameters used with its modified scrypt password hashing. [Firebase password-hashing implementation](https://github.com/firebase/scrypt)

This material is not a Google service-account private key, OAuth client secret, Firebase ID/refresh token or an administrative credential. A password-hashing signer key cannot by itself mint valid Firebase custom tokens; Google's documented custom-token mechanism uses service-account signing authority. There is no supported basis to infer IAM, IAP, workspace membership or platformAdmin authority from this disclosure alone. [Custom-token signing](https://firebase.google.com/docs/auth/admin/create-custom-tokens)

The practical confidentiality risk is offline password-guess verification if an attacker also obtains user password hashes and per-user salts. The hash configuration alone contains neither a user's password nor a user password hash. Google's implementation describes combining those inputs and comparing the resulting hash. This assessment is an inference from that mechanism, not an exploitation test. It does not claim that password hashing becomes reversible. [Firebase scrypt](https://github.com/firebase/scrypt)

The preserved successful user-inventory check at **2026-10-16T10:54:57.269Z** recorded HTTP 200, no users and no next page. It was not rerun in this review. Therefore no current Firebase password-hash targets were present at that observation. This substantially limits immediate authentication impact. Zero current users does not prove no synthetic users ever existed, no historical hash exports exist, or that future users would be unaffected. Future accounts could use the same exposed project configuration. Strong unique synthetic passwords, no password reuse and no hash exports reduce that prospective risk; they do not restore secrecy of this configuration.

Assessment: sensitive configuration disclosure with low demonstrated immediate account impact given the empty inventory, but unresolved distribution/retention and future-hash exposure. No customer-data breach is established by this evidence; this is not a legal notification determination.

## Access and retention boundaries

| Boundary | Established evidence | Limitation |
|---|---|---|
| Local prepared files | Incident response was overwritten with approved fields before commit; current scans below found no signing-key literals | Overwriting does not prove secure erasure from filesystem journals, backups, snapshots, caches or prior process output |
| Local task state | Codex sessions directory and state database exist; history.jsonl was absent; no explicit history persistence override was found in the inspected config | No transcript/database content was read. Absence of history.jsonl does not establish absence of retained output |
| Local directory access | Sessions directory ACL names the local owner, SYSTEM and Administrators; repository/root Codex directory additionally permits the Codex sandbox group read/execute | Directory metadata only; individual files, group membership, backups, endpoint compromise and remote account access were not audited. This is not owner-exclusive access |
| Task/model service | The earlier tool output entered the task context; sanitized incident history confirms this | The exact account/workspace tier, provider retention duration, training choices, compliance exports, existing share links and other sessions/devices are not established by available metadata |
| Git | Inspected tracked sources and incident-file committed history are sanitized | Does not establish absence from external clones, unknown exports, unreachable Git objects or arbitrary binary archives |

Official Codex documentation describes local state and transcript persistence under CODEX_HOME. Changing persistence now would not prove removal of existing output. [Local state and history](https://learn.chatgpt.com/docs/config-file/config-advanced)

Official documentation makes provider data controls dependent on authentication mode and workspace/API organization settings. Consequently this review cannot assert zero retention, a fixed deletion deadline, no training, or absence of administrator/compliance access. No account token/configuration secret was opened to determine those settings. [Codex authentication and data handling](https://learn.chatgpt.com/docs/auth)

The task has been described as private, but actual sharing/access controls have not been independently verified. Treat the affected output as still sensitive. Do not share/fork/export it, attach it to feedback/support, or reproduce it in a new task. A new task can receive this sanitized report only; that does not erase the original.

## Repository and prepared-evidence verification

A non-disclosing scan examined 2,923 tracked paths at HEAD. Git's filename-only search identified one file containing relevant field names: the fictional sentinel regression test. In-process matching found zero signer-key literal candidates. The prepared-release text scan covered 413 files, excluding dependency directories and binary/archive contents; zero such literal candidates were found. All three committed versions of the incident evidence files across reachable refs were checked; zero candidates were found. No matching values were printed, copied, hashed or retained by the scan.

The scan checks field-context patterns for signing-key representations, not a retrieved exact-secret comparison. It therefore supports **no incident material detected within the stated scope**, not a forensic guarantee against transformed, renamed or encoded copies. The scan did not read task transcripts, search deleted storage, decompress artifacts or inspect other CRM resources. No history rewrite or unrelated repository change is warranted by the findings.

The two existing local tests passed: nested allowlist excludes fictional sensitive/unknown fields; Auth request contains an explicit fields selector. Existing code combines API-level field selection with output filtering. These safeguards address the demonstrated recurrence path; they do not retract an already emitted response. Future diagnostic review must prohibit raw response/error dumps and continue to report only approved fields. No changes to those safeguards were needed in this review.

## Supported remediation versus speculation

Google's project Config schema marks hashConfig output-only; the linked HashConfig schema also marks its individual fields output-only. The public updateConfig API does not establish a supported way to replace those output-only fields. No documented self-service rotation procedure for this project password-hash signer key was identified in the reviewed official material. This is a documentation finding, not a claim that Google cannot perform internal remediation. Do not attempt an undocumented PATCH. [Project configuration](https://docs.cloud.google.com/identity-platform/docs/reference/rest/v2/Config), [HashConfig schema](https://docs.cloud.google.com/identity-platform/docs/reference/rest/v2/projects.tenants#HashConfig), [Update API](https://docs.cloud.google.com/identity-platform/docs/reference/rest/v2/projects/updateConfig)

Firebase import configuration accepts source hashing parameters to migrate users; this is not evidence that importing an account rotates the destination project's managed signer key. Do not import dummy users as a remedy. [Import users](https://firebase.google.com/docs/auth/admin/import-users)

Browser API-key rotation, OAuth-secret rotation, service-account key rotation, refresh-token revocation and password resets address different assets. None is documented as rotating this managed hash configuration. There are no current users to reset or revoke on the preserved inventory. Project deletion/recreation or migration would be a significant architectural change, not a routine proven remedy; none is recommended on current evidence.

The supported escalation route is a private Firebase support case asking whether key retirement/regeneration is available and recommended for an empty synthetic project. Supply project identity, time, material category and exposure boundary only; never include the value or raw task output. Ask for the exact supported procedure, impact on future/previous hashes, verification without revealing the key, and whether user recreation is needed. No case was submitted. [Firebase support](https://firebase.google.com/support)

## Exact recommended disposition and next actions

1. **Keep current containment:** no new identities, no deployment, no hash export/retrieval; preserve existing Auth restrictions and all CRM4 gates. Keep the affected task unshared and avoid further propagation. No speculative credential rotation or cloud mutation is justified now.
2. **Owner access review:** confirm the actual task sharing status, signed-in account/workspace data controls, relevant administrator access, local-device access and backup handling. Record only yes/no outcomes and applicable policy identifiers in a sanitized receipt. This is necessary to call access restricted; the current evidence alone is insufficient.
3. **Output containment:** after separate authorization, request supported removal/redaction of the affected output from the platform provider using the task identifier and incident time, without attaching the secret. Establish retention exceptions and local-copy handling. Do not assume archive/delete, disabling history or changing training preferences instantly erases existing copies. Do not directly edit session databases or indiscriminately delete logs.
4. **Google disposition:** obtain the private support guidance above before admitting real users, or before asserting the hash-key risk is eradicated. For a strictly synthetic rehearsal, a documented owner security decision may instead accept the remaining bounded risk, explicitly covering future synthetic password hashes and unresolved retained copies. Such acceptance must accompany separate account/execution approval; this report does not supply it.
5. **Preparation-only resumption:** the owner may separately approve local/read-only preparation on the basis of this report without first inventing a rotation procedure. No real passwords, account creation or activation may be part of that resumption. Use sanitized handoff material if changing tasks. Reverify allowed state, participant availability and a fresh valid UTC slot before any later seal; the previously proposed slot is not automatically carried forward.

No cloud remediation is mandatory on the demonstrated immediate facts alone; **additional access/retention review and explicit residual-risk disposition are necessary before account creation**. Filtering plus an unverified assertion of privacy is not enough to close the incident. If unauthorized access, historical hash leakage, or inability to bound the audience is discovered, stop and obtain Google-supported remediation before proceeding. Production remains NO-GO independently of this incident.

Exact assessed application image, open HIGH CVE-2026-85091, Node binary reproducibility limitation, original security rules and all other CRM4 approval gates remain unchanged. No CRM2/CRM3/CRM5 or production changes occurred. STOP after this report; remediation and resumption both require separate owner approval.
