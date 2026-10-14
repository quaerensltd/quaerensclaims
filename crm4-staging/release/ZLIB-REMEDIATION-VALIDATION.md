# CRM4 zlib native validation — approval handoff

> Historical procedure: its single approved execution timed out on 14 October 2026. See [the execution result](ZLIB-LINUX-VALIDATION-RESULT.md). The approval is consumed; do not resubmit these commands.

Status: both source copies patched locally; Linux compilation and patched-runtime acceptance **pending**. Private synthetic and production deployment remain **NO-GO**. This is Shared CRM Framework release preparation; no shared application behavior changed.

## Recommended next action

Approve **one validation-only Cloud Build job**, project `quaerens-crm4-spain-test` / `558324850479`, region `europe-west1`, existing `crm4-build@quaerens-crm4-spain-test.iam.gserviceaccount.com`, `E2_HIGHCPU_8`, 100 GB ephemeral disk, 7,200-second timeout. Use the exact context digest in `evidence/zlib-remediation/validation-candidate.json` and the existing private build-source bucket. No registry push, scan, application server, Cloud Run service, new IAM or real data is included. The image is local to the ephemeral build worker and discarded afterward. Logs contain compiler/test output, source and binary checksums; no credentials are passed into the Docker build.

This is a validation approval, **not** approval to publish a replacement application image. After success, assemble the application candidate from the verified patched runtime, preserve the pinned npm lock, seal its new context, and obtain separate approval for one replacement image build. Its resulting digest then requires separately approved scanning and deployment gates. Validation binaries must not silently be reused from an unverified host or substituted into an existing image.

## Why Cloud Build instead of Cloud Shell

[Cloud Shell](https://docs.cloud.google.com/shell/docs/how-cloud-shell-works) includes Docker, is Google-managed and needs no Windows installation. It can run the same pinned Dockerfile if its available memory/disk and session quota suffice. Its 5 GB persistent home and ephemeral session lifecycle make a full Node source build less predictable. Do not compile directly against Cloud Shell's changing host libraries: use the pinned Debian compiler container and final pinned distroless stage.

[Cloud Build pricing](https://cloud.google.com/build/pricing?hl=pt) currently lists e2-highcpu-8 at USD 0.0156/minute. 30/60/120 minutes would be approximately $0.47/$0.94/$1.87 compute. These are estimates, not promised duration or total invoice caps. Source storage, logs, applicable network charges, currency conversion and tax are additional. Verify billing SKU/pricing before approval; the existing £20 alert is not a spending cap. No paid build or scan was submitted here. Cloud Shell itself is [free](https://cloud.google.com/shell/pricing), subject to quotas; it does not make Cloud Build free.

## Exact owner procedure — do not execute the build before approval

The prepared archive is `crm4-staging/.scratch/zlib-validation/crm4-zlib-validation.tar.gz`. Obtain its SHA-256 and context digest from the separately reviewed `package-receipt.json`. Upload only that archive to Cloud Shell; no OAuth secret, service-account key or customer data is needed. This package contains only the native validation recipe, public source URLs/checksums, dependency manifests, document smoke test and integrity checker.

```bash
# Supply the two exact values from the reviewed receipt, not from an untrusted download.
ARCHIVE_SHA256='f6828fa97d4c30f01c9a4909a3a3933d748b6eb4b695cd712e62160d20d45cae'
export CRM4_CONTEXT_SHA256='822f8e439be7bc1494f7ac01293ab0414acb11c5e3733084b03b36dbbe70f9e9'
printf '%s  %s\n' "$ARCHIVE_SHA256" crm4-zlib-validation.tar.gz | sha256sum -c -
TASK_DIR=$(mktemp -d /tmp/crm4-zlib-validation.XXXXXX)
tar -xzf crm4-zlib-validation.tar.gz -C "$TASK_DIR"
cd "$TASK_DIR"
node verify-context.cjs . "$CRM4_CONTEXT_SHA256"
gcloud auth list --filter=status:ACTIVE --format='value(account)'
gcloud projects describe quaerens-crm4-spain-test --format='value(projectId,projectNumber,lifecycleState)'
gcloud iam service-accounts describe crm4-build@quaerens-crm4-spain-test.iam.gserviceaccount.com --project=quaerens-crm4-spain-test
```

Expected account is `martijnpronk76@gmail.com`, project number `558324850479`, state ACTIVE. Check existing IAM/bucket permissions and regional quota read-only before submission. If permission or quota is missing, stop and report; do not grant roles or create substitute resources. Existing successful builds are historical evidence, not a fresh permission attestation.

After explicit approval for the reviewed job:

```bash
export CRM4_VALIDATION_APPROVED=yes
bash release/zlib-remediation/submit-validation.sh
```

The script rechecks active identity, project identity and every context file, creates one persistent attempt marker, and invokes exactly one asynchronous regional submission. It preserves JSON in `$HOME/crm4-zlib-validation-$CRM4_CONTEXT_SHA256.submitted/submission.json`. If submission times out or is ambiguous, keep the marker and inspect project build history; **do not rerun** or remove it to bypass the guard. No retry is authorised automatically.

```bash
# Use the actual ID in the submission receipt.
BUILD_ID='<recorded build ID>'
gcloud builds describe "$BUILD_ID" --project=quaerens-crm4-spain-test --region=europe-west1 --format=json
gcloud builds log "$BUILD_ID" --project=quaerens-crm4-spain-test --region=europe-west1
```

Return the build ID and status/log receipts. Success requires system `make check`, system failed-direct-write checks, Node compilation, embedded-zlib failed-direct-write checks, correct symbol-provider checks, final binary SHA-256 equality, final distroless system-library use, nonroot UID 65532 and DOCX/PDF smoke acceptance. Any failure keeps NO-GO. Logs and hashes establish observed build provenance; bit-for-bit repeat-build reproducibility is not claimed before it is measured.

## Cloud Shell-only alternative

This option also awaits owner approval to execute remote validation. Inspect `docker info`, `free -h`, and `df -h /tmp /var/lib/docker` first. Budget at least 8 GB available RAM and 20 GB available ephemeral disk for this two-job compiler recipe as conservative operational requirements, not Google guarantees. If insufficient, stop and prefer the reviewed Cloud Build job; do not install software, resize resources or silently fall back to a paid service.

From the verified context, with sufficient resources:

```bash
COMPILER_IMAGE=$(node -p 'require("./release/zlib-remediation/inputs.lock.json").compilerImage')
RUNTIME_IMAGE=$(node -p 'require("./release/zlib-remediation/inputs.lock.json").runtimeImage')
set -o pipefail
DOCKER_BUILDKIT=1 docker build --progress=plain --platform=linux/amd64 \
  --build-arg "COMPILER_IMAGE=$COMPILER_IMAGE" --build-arg "RUNTIME_IMAGE=$RUNTIME_IMAGE" \
  --file release/zlib-remediation/Dockerfile.validation \
  --tag crm4-zlib-validation:local . 2>&1 | tee "$HOME/crm4-zlib-validation.log"
```

No `docker push`, `gcloud builds submit`, deployment or scan follows this alternative. Save receipts before the session expires. This does not validate an eventual application's new immutable image digest.

## Integrity, maintenance and rollback

The approved upstream fix is `df84af25dc1942490e1d1c899a07619152a46148`, adapted only to the older direct-write error return. Both original gzwrite sources hash to `469b1e58932ea11bdda2a153f6655f7b3c13254240fae157181b49ed1bc93b47`; after patch they hash to `ce2da7e2567c7f3fd361cbdf56bc4354e179c1d91257ea26eeb281cbbe83e1ca`. Public archives and compiler/runtime images are pinned in `inputs.lock.json`. Node's archive checksum was checked against the official HTTPS SHASUMS256 listing; no GPG-signature verification is claimed. Debian source hash matches the prior investigation receipt. The recipe rejects drift before applying the change.

The system library receives an explicitly custom version `1:1.3.dfsg+really1.3.1-1+crm4.1`, a local .deb, updated distroless package control/MD5 metadata and binary SHA-256 evidence. It is not represented as an official Debian security release. Node keeps 22.23.3 with custom source/binary provenance. Upstream release maintenance and any other vulnerabilities remain open review obligations. A scanner may continue flagging either version; no suppression or vendor-fixed claim is made.

The unchanged release npm lock SHA-256 is `bde138edf2752278b1830fde437f4c6db53b90671505430cbb3e9eed4ff197e8`. The original application Dockerfile/context and published hardened image remain unchanged. Validation images contain test-only code and are not deployment artifacts.

Before remote execution, rollback is simply abandoning this candidate or reverting this CRM4-only commit. During an approved Cloud Build job, cancellation uses `gcloud builds cancel BUILD_ID --project=quaerens-crm4-spain-test --region=europe-west1`; worker storage is ephemeral. Retain audit logs and the exact source object/generation receipt. Any later source-object deletion must target that generation only under separate cleanup authority. Do not delete the shared bucket, registry, existing images, logs or unrelated resources. For Cloud Shell, remove only the task's container/tag and explicitly verified temporary directory after retaining logs; no global Docker prune or home-directory cleanup.

## Local completion evidence

Both patches were applied to isolated downloaded source trees. Full CRM4 Windows/emulator regressions passed **117/117**, Storage rules **22/22**, local DOCX/PDF smoke passed and npm audit found **zero** vulnerabilities. Source-manifest verification and intentional context-tampering rejection passed. These are local compatibility/security-control results on the existing Windows Node runtime; they do not claim patched Linux acceptance. The first test attempt lacked running emulators and was stopped; the successful complete run used `firebase emulators:exec` with the demo project. Historic live Storage 38/38 evidence was preserved, not rerun.

No Linux compilation has occurred. The prepared code is an immutable **validation candidate**, not a verified replacement application image. Syntax and source checks cannot establish C compilation, ABI compatibility, native regression success or absence of other vulnerabilities. The separately approved Linux job must establish those results before the application build candidate can be finalised.
