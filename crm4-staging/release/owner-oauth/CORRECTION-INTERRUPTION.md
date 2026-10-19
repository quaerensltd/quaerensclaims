# Correction interruption review — 19 October 2026

Owner reports checksum and read-only preflight passed, then interruption at ENABLED before secret entry. The exact helper creates its attempt marker only inside transact(), after masked double-entry, input validation, APPLY-SECRET-ONLY confirmation and a second unchanged-state snapshot. A new offline regression reproduces KeyboardInterrupt at ENABLED and proves no secret prompt, transaction or marker creation. All 13 correction tests pass. Executable helper unchanged; checksum remains as published.

Independent reads: exact project/number verified; attached public client ID correct; Run and IAP policies identical to approved receipts. At 11:23:23 UTC the audit query for today's UpdateIapSettings events returned only the original successful 09:44:32 UTC update, with no further page. No new update observed. Audit ingestion can lag; this is supporting evidence, not a cryptographic comparison of the stored secret. No secret/fingerprint retrieved. Initial audit field projection returned HTTP 400; corrected read-only projection succeeded. No cloud mutations, retries or marker removal performed.

Conclusion: the reported interruption path cannot submit a change or create the marker. Current public state and observed audit trail agree. The remote Cloud Shell filesystem has not been directly inspected; marker absence must be confirmed there. Do not claim absolute live secret equality or remote marker verification.

Owner read-only existence check (does not print contents or delete anything):

```sh
if [ -e "$HOME/.crm4-oauth-secret-correction-attempted.json" ] || [ -L "$HOME/.crm4-oauth-secret-correction-attempted.json" ]; then printf '%s\n' 'MARKER_PRESENT_STOP'; else printf '%s\n' 'MARKER_ABSENT'; fi
```

If present, STOP: do not remove it, rerun --apply or infer that a write succeeded. If absent, the minimum recovery for separate owner approval is to checksum-verify the unchanged helper, run its default read-only preflight again, then authorise one fresh --apply invocation with the same enabled replacement and all original safeguards. Do not rotate credentials or bypass checks. Independent fingerprint MATCH, unchanged settings and successful OAuth authentication remain prerequisites; Firebase provisioning is paused.
