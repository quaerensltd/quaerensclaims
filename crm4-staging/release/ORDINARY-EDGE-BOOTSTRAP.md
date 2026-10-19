# Ordinary Edge: minimum bootstrap correction

The existing reviewed same-origin Firebase ceremony can run in ordinary Microsoft Edge after the owner signs in through Google IAP. No authentication architecture change is needed: the genuine Firebase session and its token remain in page memory, and the existing crm4AdminCreateUser handler enforces platformAdmin, membership and audit rules. No cookies or tokens are copied to Codex, Node or another browser.

## Change and evidence

The live browser adapter no longer launches or attaches WebDriver/Playwright/CDP. It emits local, bounded requests for Codex to operate the existing ordinary Edge page. Codex returns only a request-bound status and the expected synthetic UID through a strict response validator. Unknown fields (including passwords, tokens or cookies), wrong origins/UIDs, expired results, duplicate responses and uncertain outcomes fail closed. The exchange is local files inside the existing per-session scratch directory: no new server, port, extension, authentication endpoint or cloud resource.

The watcher, independent verifier, private password helper, governed handler, cleanup, expiry and timeout controls remain unchanged. A new unused watcher receipt is allow-listed. Prior receipts are preserved. The old Playwright adapter is retained only for fully intercepted offline fixtures; it cannot launch a live browser.

Validation: 52/52 coordination/watcher regression tests and two intercepted browser scenarios passed. Generated snippets cover readiness, governed owner creation, retained-token/refresh denial and owner identity verification. A fixture missing the issuer claim failed correctly; its fixture was corrected without relaxing the issuer check. Existing six governed emulator scenarios are preserved and were not unnecessarily repeated. No cloud reads/mutations, real credentials, live accounts or application rebuilds were used.

## One remaining local blocker

Both Codex interaction runtimes fail before connecting to Edge: `windows sandbox failed: helper_unknown_error: setup refresh had errors`. The Windows runtime failed again after reset; the existing-browser connector also failed on retry. Therefore actual ordinary Edge UI operation is NOT validated. Local browser tests do not prove this connection works. The inactive manifest records ordinaryEdgeControlValidated=false, and the coordinator refuses to run with that value.

Restore the supported Codex browser/computer interaction runtime first (an app restart may help, but is not a verified remedy). Then perform only a harmless local fixture/status interaction in ordinary Edge and a read-only exact-origin CRM4 readiness observation. No account, Google authentication automation, cookie export or security-warning bypass is allowed in this capability check. Record evidence before changing the validation flag. If the tool remains unavailable, stop; do not transfer watcher coordination or DevTools work to the owner.

## Single consolidated execution procedure

1. After one final approval, Codex verifies the new manifest/tool hashes and fresh project, operator, permissions/IAM, image, audit, rules, expiry and zero Auth/membership inventories. All existing security gates remain mandatory.
2. The owner uses ordinary Edge to sign in through Google IAP as brusseljeroen@gmail.com if required. Codex does not operate the Google login. Codex verifies the exact CRM4 origin and loads the generated READY snippet through supported existing-page interaction. No Google page receives a snippet. A self-XSS/security warning is a stop, not permission to bypass it.
3. Codex returns the observed non-sensitive READY result using browser.respond. The coordinator starts the watcher, performs independent readiness verification and starts the unchanged ten-minute window automatically. No owner relay messages or terminal commands.
4. The owner enters the bootstrap password in the private console. Codex loads the sealed, UID/deadline-bound existing browser ceremony in Edge and closes DevTools before private input. The owner enters that password in its private page control and submits it. Codex observes only the cleared-input non-sensitive completion status and returns it through the validator.
5. The watcher immediately revokes bootstrap privileges/tokens and disables it. Independent account/membership reads verify cleanup. Codex executes the existing retained-token/refresh-denial check through the reviewed snippet and returns only REVOKED. Tokens stay inside the page.
6. The owner enters the new owner password privately in the console and signs in through CRM4's normal Edge login form. Codex loads the read-only owner-status snippet on the exact CRM4 origin, verifies UID/project/issuer/no platformAdmin, and the coordinator independently verifies membership, audit and anonymous denial before declaring PASS.
7. Failure or uncertainty stops progress and invokes the existing account containment. No retry. The ordinary browser is not forcibly closed because it may contain unrelated tabs; Codex stops/removes only the ceremony UI. The existing in-page deadline and independent watcher remain effective. Remote revocation can still be unverifiable during persistent network/credential failure; this remains FAIL.

Codex, not the owner, handles snippet loading, status transfer and timing. No page capture, DevTools/network inspection or logging while credentials are being entered; passwords are never placed in expressions, clipboard, files or messages. Status snippets expose no Auth object, token or password.

## One approval request (not executable yet)

Once the local Edge capability gate passes, approve one ordinary-Edge coordinated operation for bootstrap@crm4.example.test and owner@crm4.example.test only: temporary genuine platformAdmin bootstrap, existing governed owner provisioning, immediate bootstrap claim removal/token revocation/disabling, private owner password setup and independent acceptance. Authorise revocation/disabling of a ceremony-created owner on failed acceptance. No IAM/service/rule/OAuth changes, extra identities or automatic retries.

Inactive proposal SHA-256: de87fcf1e5e8ba96d94916923e78cce40f3bc7ae52fc34bb48c12aa15c25e41c. Execution activation requires verified capability evidence and one owner approval; record the resulting activated manifest hash rather than silently reuse this inactive hash.

Expiry remains 24 October 2026 09:00 UTC; containment ends 10:00 UTC. The assessed image remains sha256:127600049240e507c8ad7ebc93125173ebdca4d094e9839764314e102bd47ceb. The HIGH vulnerability, Node reproducibility limitation and Firebase incident residual risk remain open. No changes to CRM1/2/3/5 or production. Production and real-customer use remain NO-GO.
