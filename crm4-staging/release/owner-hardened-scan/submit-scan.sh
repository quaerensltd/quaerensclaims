#!/usr/bin/env bash
set -euo pipefail
umask 077
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
(cd "$SCRIPT_DIR" && sha256sum --check --status SHA256SUMS) || { echo "Script checksum mismatch or missing SHA256SUMS; stop."; exit 1; }
[[ "${1:-}" == "--approved-one-scan" ]] || { echo "Separate owner approval required before this one paid scan. No scan submitted."; exit 1; }
readonly PROJECT='quaerens-crm4-spain-test'
readonly NUMBER='558324850479'
readonly DIGEST='sha256:0e26c3427691a8daa5144a0a40589a676d0a6d3ad5f800bf296bdd2e0fbdffce'
readonly IMAGE="europe-west1-docker.pkg.dev/$PROJECT/crm4-release/crm4-spain@$DIGEST"
readonly RECEIPTS="$HOME/crm4-scan-0e26c3427691a8da"
case "$(uname -s)" in Linux|Darwin) ;; *) echo 'Supported Linux/macOS host required'; exit 1;; esac
[[ "$(gcloud auth list --filter=status:ACTIVE --format='value(account)')" == 'martijnpronk76@gmail.com' ]] || { echo 'Use the existing authorized provisioner account; do not grant new access.'; exit 1; }
[[ "$(gcloud projects describe "$PROJECT" --format='value(projectId)')" == "$PROJECT" && "$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')" == "$NUMBER" ]] || { echo 'Project identity mismatch'; exit 1; }
[[ "$(gcloud services list --enabled --project="$PROJECT" --filter='config.name=ondemandscanning.googleapis.com' --format='value(config.name)')" == 'ondemandscanning.googleapis.com' ]] || { echo 'Approved scanning API is not enabled; stop'; exit 1; }
mkdir -p "$RECEIPTS"
chmod 700 "$RECEIPTS"
[[ ! -e "$RECEIPTS/submission-intent" ]] || { echo "Submission already attempted. Do not rerun; inspect $RECEIPTS/scan-operation.json and share only its operation name."; exit 1; }
gcloud artifacts docker images describe "$IMAGE" --project="$PROJECT" --format=json > "$RECEIPTS/image-before.json"
# Detect the extractor without invoking the disabled component manager.
SDK_ROOT="$(gcloud info --format='value(installation.sdk_root)')"
EXTRACTOR=''
if [[ -n "$SDK_ROOT" && -x "$SDK_ROOT/bin/local-extract" ]]; then
  EXTRACTOR="$SDK_ROOT/bin/local-extract"
elif command -v local-extract >/dev/null 2>&1; then
  EXTRACTOR="$(command -v local-extract)"
fi
if [[ -z "$EXTRACTOR" ]]; then
  printf '%s\n' 'Missing local-extract. In Cloud Shell run:' '  sudo apt-get update' '  sudo apt-get install google-cloud-cli-local-extract' 'Then rerun this script. No scan was submitted and no submission marker was created.' >&2
  exit 1
fi
printf '%s\n' "$EXTRACTOR" > "$RECEIPTS/extractor-path.txt"
# Recheck project immediately before the one permitted scanning request.
[[ "$(gcloud projects describe "$PROJECT" --format='value(projectId)')" == "$PROJECT" && "$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')" == "$NUMBER" ]]
(set -o noclobber; printf '%s\n' "$IMAGE" > "$RECEIPTS/submission-intent") || exit 1
gcloud artifacts docker images scan "$IMAGE" --project="$PROJECT" --remote --location=europe --async --quiet --format=json > "$RECEIPTS/scan-operation.json" 2> "$RECEIPTS/scan-stderr.log"
# Operation metadata contains no OAuth client secret or access token.
cat "$RECEIPTS/scan-operation.json"
printf '
Share only the operation name above with Codex. Do not repeat the scan command. Receipts: %s
' "$RECEIPTS"
