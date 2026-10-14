#!/usr/bin/env bash
set -euo pipefail
# Run only after separate approval for ONE validation job. No automatic retries.
: "${CRM4_VALIDATION_APPROVED:?Set to yes only after separate owner approval}"
[[ "$CRM4_VALIDATION_APPROVED" == yes ]]
: "${CRM4_CONTEXT_SHA256:?Use the independently supplied reviewed context digest}"
[[ "$CRM4_CONTEXT_SHA256" =~ ^[0-9a-f]{64}$ ]]
project=quaerens-crm4-spain-test
[[ "$(gcloud auth list --filter=status:ACTIVE --format='value(account)')" == martijnpronk76@gmail.com ]]
[[ "$(gcloud projects describe "$project" --format='value(projectId,projectNumber,lifecycleState)')" == $'quaerens-crm4-spain-test\t558324850479\tACTIVE' ]]
node verify-context.cjs . "$CRM4_CONTEXT_SHA256"
# A marker survives ambiguous submission/network failure. Never remove it to retry blindly.
marker="$HOME/crm4-zlib-validation-$CRM4_CONTEXT_SHA256.submitted"
mkdir "$marker"
printf '%s\n' "$CRM4_CONTEXT_SHA256" > "$marker/context.sha256"
gcloud builds submit . --project="$project" --region=europe-west1 \
 --config=cloudbuild.validation.json \
 --gcs-source-staging-dir=gs://quaerens-crm4-spain-test-build-source/zlib-validation \
 --async --format=json > "$marker/submission.json"
cat "$marker/submission.json"
# Retrieve status/logs using the recorded build ID. No build, scan or deploy follows.
