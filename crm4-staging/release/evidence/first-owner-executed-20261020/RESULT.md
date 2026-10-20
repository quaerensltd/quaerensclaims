# Initial CRM4 owner provisioned — 20 October 2026

Approved package: 7f87c004. First private entry was rejected before provisioning because the password was shorter than the reviewed minimum; owner explicitly requested another private entry. No automatic retry occurred. Both fresh security preflights passed on the owner-requested retry.

One synthetic owner was created disabled-first, its initial CRM4 administrator membership and attributable audit were verified, and Auth was enabled last. Independent post-operation reads confirmed one Firebase user, one CRM4 membership, no custom claims, COMPLETE operation/audit and anonymous Firestore denial. No bootstrap identity was created. Passwords and tokens are absent from these receipts.

Ordinary Edge dashboard login is pending owner confirmation. This report does not claim browser acceptance. Existing image, IAM/IAP, rules, audit configuration and other CRMs were not modified. The outstanding HIGH, Node reproducibility and Firebase incident risks remain. Expiry: 24 October 2026 09:00 UTC; containment deadline 10:00 UTC. Synthetic-only; production NO-GO.
