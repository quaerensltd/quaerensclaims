# Firebase support request — sanitized draft

Status: NOT SENT. Owner may submit through the private [Firebase support case](https://firebase.google.com/support) route. Sending by Codex requires separate explicit instruction. Never post to a public community forum or attach this task, raw response, hash configuration, user export or credentials.

**Subject:** Guidance requested: project password-hash configuration exposure, zero-user synthetic Firebase project

Project ID: quaerens-crm4-spain-test
Project number: 558324850479
Incident date: 16 October 2026, approximately 10:55 UTC
Purpose: isolated, synthetic-only CRM4 Spain testing; no production customer use authorised.

An authorised project configuration read returned Firebase Authentication password-hash configuration. Our diagnostic inadvertently persisted the full response locally and displayed it in private assistant tool output. Local prepared evidence was sanitized before Git commit. The underlying task output may remain retained; we are reviewing its access and retention. We will not provide the exposed values.

A successful read-only inventory at 2026-10-16T10:54:57.269Z reported zero Firebase users and no additional page. Earlier synthetic test users may have existed; zero current users is not an assertion that no historical accounts ever existed. No current user passwords, per-user salts or password hashes were included in this incident evidence. We have stopped identity creation and deployment. Client self-signup/deletion were disabled; password authentication restrictions were preserved. No rotation or other cloud changes have been attempted.

The public Config documentation marks hashConfig output-only. We have not identified a documented self-service rotation procedure and will not attempt an unsupported configuration update. [Config reference](https://docs.cloud.google.com/identity-platform/docs/reference/rest/v2/Config)

Please advise:

1. What risk does disclosure of the project password-hashing signer configuration create independently of access to user password hashes/salts? Does the empty current user inventory change your recommendation?
2. Is supported retirement/regeneration of the exposed project configuration available through Google support or a documented administrator procedure? Please provide prerequisites, exact supported scope and side effects, without returning secret values.
3. Would future accounts use the exposed configuration? How can retirement be verified using non-sensitive evidence? What happens to any previously created/deleted accounts and historical password hashes?
4. Is remediation mandatory before a brief owner-only synthetic rehearsal, using strong unique non-reused passwords and no real data, or can the residual risk be accepted under those controls?
5. If rotation is unavailable, what supported alternative do you recommend? Please distinguish recommended action from optional project migration/recreation, and explain whether any password reset/user recreation is relevant when no current users exist.

Please do not perform configuration changes or retrieve/send the secret as part of the response without separate owner authorisation. A sanitized recommendation and case reference are sufficient. We are separately handling output access/retention with the platform provider. This request does not authorise cloud deployment or real-customer use.
