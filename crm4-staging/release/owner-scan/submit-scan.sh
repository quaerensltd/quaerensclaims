#!/usr/bin/env bash
set -euo pipefail
umask 077
readonly PROJECT='quaerens-crm4-spain-test'
readonly NUMBER='558324850479'
readonly DIGEST='sha256:f62e96fef639c362e2aeb86630bbf6487c861017acdc74aa5b7f52a64b8d253e'
readonly IMAGE="europe-west1-docker.pkg.dev/$PROJECT/crm4-release/crm4-spain@$DIGEST"
readonly RECEIPTS="$HOME/crm4-scan-f62e96fef639c362"
case "$(uname -s)" in Linux|Darwin) ;; *) echo 'Supported Linux/macOS host required'; exit 1;; esac
[[ "$(gcloud auth list --filter=status:ACTIVE --format='value(account)')" == 'martijnpronk76@gmail.com' ]] || { echo 'Use the existing authorized provisioner account; do not grant new access.'; exit 1; }
[[ "$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')" == "$NUMBER" ]] || { echo 'Project identity mismatch'; exit 1; }
[[ "$(gcloud services list --enabled --project="$PROJECT" --filter='config.name=ondemandscanning.googleapis.com' --format='value(config.name)')" == 'ondemandscanning.googleapis.com' ]] || { echo 'Approved scanning API is not enabled; stop'; exit 1; }
mkdir -p "$RECEIPTS"
[[ ! -e "$RECEIPTS/submission-intent" ]] || { echo "Submission already attempted. Do not rerun; inspect $RECEIPTS/scan-operation.json and share only its operation name."; exit 1; }
gcloud artifacts docker images describe "$IMAGE" --project="$PROJECT" --format=json > "$RECEIPTS/image-before.json"
# Install only Google's scanning extractor into Cloud Shell, if missing.
# This does not create a build, image, service, IAM grant or scanning request.
gcloud components install local-extract --quiet
# Recheck project immediately before the one permitted scanning request.
[[ "$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')" == "$NUMBER" ]]
(set -o noclobber; printf '%s
' "$IMAGE" > "$RECEIPTS/submission-intent") || exit 1
gcloud artifacts docker images scan "$IMAGE" --project="$PROJECT" --remote --location=europe --async --quiet --format=json > "$RECEIPTS/scan-operation.json"
# Operation metadata contains no OAuth client secret or access token.
cat "$RECEIPTS/scan-operation.json"
printf '
Share only the operation name above with Codex. Do not repeat the scan command. Receipts: %s
' "$RECEIPTS"
