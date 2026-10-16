# Owner security checklist and output-containment options

Update: owner access declarations and the current residual-risk decision are recorded in OWNER-ACCESS-ATTESTATION.md. Earlier unknowns about owner sharing/device use are superseded only to that stated extent; provider-side access/retention remains unresolved.

Prepared 16 October 2026 from db00926d. No requests sent, settings changed or transcripts retrieved. Answer each item YES / NO / UNKNOWN with reviewer and UTC review time. Keep account identifiers and evidence references private; return only conclusions. UNKNOWN does not mean restricted access.

1. **Account and workspace:** Which account/workspace holds the affected task? Is it personal or managed? Who administers it, and which workspace/compliance roles can access retained task records? Record the applicable retention policy and data-sharing/training setting without exporting the conversation.
2. **Direct access:** Who used the signed-in computer or account during/after the incident? Check authorised devices, shared Windows accounts, remote-support access and local administrators. Do not share credentials to perform this review.
3. **Copies and sharing:** Was the affected output copied, screenshotted, recorded, exported, forked, included in feedback, or sent to another person/tool? Record recipients/categories and whether access remains. Do not retrieve the sensitive value to compare copies.
4. **Existing share links:** Inspect existing shared-link settings only. Do not open Share to create a new snapshot for this check. Record whether a relevant link exists and its audience; revocation requires a separate action decision. Official documentation says the documented snapshot feature excludes original tool calls/output, but this does not exclude copied output in messages, other export mechanisms, or prove this Windows task's exact behaviour. [Sharing controls](https://learn.chatgpt.com/docs/use-chatgpt)
5. **Local retention:** Confirm who manages device backups, synchronization and endpoint logs. Prior metadata showed sessions/database storage and local owner/SYSTEM/administrator access; repository access also included the Codex sandbox group. Do not open transcripts or search for the key. Record the applicable retention/access boundary, not an unsupported claim of erasure.
6. **Disposition:** Has any untrusted recipient or uncontrolled copy been identified? If YES, keep account creation blocked and seek Google guidance. If NO/UNKNOWN, document the uncertainty explicitly; never claim confidentiality was restored merely because Git is clean.

## Supported options for owner decision — none executed

| Option | What it addresses | Limitation / authorisation |
|---|---|---|
| Revoke an existing shared link through Data Controls > Shared links | Further access through that link | Does not recall downloads or remove original retained task output; owner approval needed |
| Delete the exact saved local session with the installed supported `codex delete` facility | Saved session transcript, unlike archive | Installed CLI help confirms availability. Select the exact session privately, verify target and implications, preserve sanitized handoff first, and approve deletion separately. Not proof of backend/backup deletion; do not use a forced UUID guessed from another context |
| Ask platform support for targeted output redaction/removal or restricted retention | Provider-managed copies, applicable policy and supported deletion scope | Availability, retention exceptions and per-output redaction are not established; obtain a written answer. No guarantee of instantaneous removal |
| Review workspace retention/data-sharing controls with its administrator | Applicable access and future retention policy | Does not retroactively prove deletion; do not change organisation-wide policy without its own approval |

[CLI deletion reference](https://learn.chatgpt.com/docs/cli/reference) distinguishes deletion from archiving. No deletion command has been executed. Avoid direct session-database edits. No raw transcript backup should be created as a precaution. If using a support/feedback entry point, omit the option to attach the existing session and do not include logs or screenshots; the documented feedback flow can share the session. [Troubleshooting guidance](https://learn.chatgpt.com/docs/reference/troubleshooting)

## Platform support request — draft, owner to send privately

Subject: Request for supported redaction/removal and retention clarification for sensitive Codex tool output

An authorised diagnostic in a private local Windows Codex task inadvertently included a Firebase Authentication password-hashing configuration in tool output on 16 October 2026, around 10:55 UTC. We are not including the value, screenshots, raw logs or transcript. The task identifier and account/workspace identifier can be supplied privately through your authenticated support channel.

Please confirm: (1) who can access this task's original tool output under our actual account/workspace settings; (2) its local, synchronized, service, compliance and backup retention boundaries; (3) whether the specific output can be redacted/deleted or restricted, and the supported owner procedure; (4) the effect and limits of deleting the saved local session; (5) deletion timing and applicable exceptions; and (6) whether any existing shared snapshot could contain the original tool output for this client/version.

Please do not request the sensitive configuration or automatically attach the session. We can provide sanitized incident metadata and the affected time range. Please return a non-sensitive case reference and written scope of any confirmed action. No wider account deletion or organisation configuration change is authorised by this request.
