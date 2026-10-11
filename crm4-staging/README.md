# CRM4 isolated source snapshot

This directory is an exact, byte-identical snapshot of the CRM2 top-level public assets from the repository main branch as captured for CRM4 development.

**NOT DEPLOYABLE.** The copied pages still contain CRM2 routes, identity and Firebase dependencies. They are deliberately outside the public hosting directory to prevent accidental CRM2 production access, data writes, or user confusion.

Next: inventory CRM2 dependencies and implement CRM4-specific route and Firebase isolation before moving files to a served location. No production credentials, user data, Firestore rules, indexes or deployed functions are copied or changed.
