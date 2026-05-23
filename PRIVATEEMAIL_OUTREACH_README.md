# PrivateEmail Outreach Sender

This sends prepared backlink outreach emails through PrivateEmail SMTP and updates the outreach tracker after successful sends.

## Setup

1. Copy `.env.example` to `.env`.
2. Fill in your PrivateEmail address and password in `.env`.
3. Add direct email addresses in `seo-backlink-outreach-tracker.csv` under `Contact email or form`.

The script will skip rows where the contact value is a contact-form URL. Those still need manual form submission.

## Commands

Preview what would send:

```powershell
node .\send_privateemail_outreach.js
```

Send up to five emails that are marked `Ready to send`:

```powershell
node .\send_privateemail_outreach.js --send --limit=5
```

Send only one matching target:

```powershell
node .\send_privateemail_outreach.js --send --only=CompareFlights
```

## Safety

- Dry-run is the default.
- `.env` is ignored by Git.
- The tracker is only updated after SMTP confirms a send.
- The script waits briefly between sends.
