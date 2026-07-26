# Gym Membership Cancellation & Dispute Pack Builder

Native QCBF 1.2 builder for `gym-cancellation.html`.

## Scope

The builder helps consumers prepare a self-service cancellation, billing dispute, refund request, evidence summary or formal complaint about a gym, health club, leisure club, online fitness subscription or related membership.

Quaerens does not contact the gym, cancel the membership, guarantee release from a contract, provide court representation or generate formal court defences.

## Supported routes

- Rolling monthly cancellation
- Fixed-term cancellation request
- Online, telephone, app and off-premises joining review
- Illness or injury-related cancellation or freeze request
- Relocation cancellation request
- Financial hardship freeze, reduction or cancellation request
- Price increase review
- Facility or service-change review
- Mis-selling or sales-explanation review
- Automatic renewal review
- Freeze dispute
- Cancellation refusal
- Charges after cancellation
- Direct Debit and recurring-card payment dispute
- Debt collector or Letter Before Claim factual evidence summary

## Storage and references

Drafts are stored in browser-local storage under `qcbf-gym`. Pack references use `QG-YYYY-XXXXXX` and contain no personal data.

## Official-source handling

The builder links to public consumer, payment and court-response guidance. Users must check current official guidance and the contract before submitting.

## Tests

Run:

```bash
node public/builders/gym/gym.migration.test.js
```

## Rollback

Restore the previous `public/gym-cancellation.html`, remove `public/builders/gym`, and remove the `gym` entry from `public/complaint-builder/registry.js`.
