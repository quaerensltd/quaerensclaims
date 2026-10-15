#!/usr/bin/env bash
set -euo pipefail
SCRIPT="$PWD/crm4-staging/release/owner-patched-scan/submit-scan.sh"
FIXTURE=$(mktemp -d "$PWD/crm4-staging/.scratch/patched-scan-test-XXXXXX")
export HOME="$FIXTURE/home" SDK_ROOT_FIXTURE="$FIXTURE/sdk" SCAN_LOG="$FIXTURE/calls" MOCK_ACCOUNT='martijnpronk76@gmail.com'
mkdir -p "$HOME" "$SDK_ROOT_FIXTURE/bin"
gcloud() {
 case "$1 $2" in
 'auth list') echo "$MOCK_ACCOUNT";;
 'projects describe') if [[ "$*" == *'value(projectId)'* ]]; then echo quaerens-crm4-spain-test; else echo 558324850479; fi;;
 'services list') echo ondemandscanning.googleapis.com;;
 'info --format=value(installation.sdk_root)') echo "$SDK_ROOT_FIXTURE";;
 'artifacts docker') case "$4" in
 describe) echo '{}';;
 scan) echo scan >> "$SCAN_LOG"; echo '{"name":"projects/quaerens-crm4-spain-test/locations/europe/operations/mock-only"}';;
 *) return 99;; esac;;
 *) return 99;; esac
}
uname() { echo Linux; }
export -f gcloud uname
if bash "$SCRIPT" > "$FIXTURE/no-approval.log" 2>&1; then exit 10; fi
[[ ! -e "$SCAN_LOG" ]]
echo 'PASS approval flag required'
if bash "$SCRIPT" --approved-one-scan > "$FIXTURE/missing.log" 2>&1; then exit 11; fi
[[ ! -e "$HOME/crm4-scan-127600049240e507/submission-intent" && ! -e "$SCAN_LOG" ]]
echo 'PASS missing extractor blocks submission'
printf '#!/bin/sh\nexit 0\n' > "$SDK_ROOT_FIXTURE/bin/local-extract"
chmod +x "$SDK_ROOT_FIXTURE/bin/local-extract"
bash "$SCRIPT" --approved-one-scan > "$FIXTURE/success.log" 2>&1
[[ $(wc -l < "$SCAN_LOG") -eq 1 && -s "$HOME/crm4-scan-127600049240e507/scan-operation.json" ]]
echo 'PASS one mocked submission and receipt'
if bash "$SCRIPT" --approved-one-scan > "$FIXTURE/repeat.log" 2>&1; then exit 12; fi
[[ $(wc -l < "$SCAN_LOG") -eq 1 ]]
echo 'PASS duplicate blocked'
export MOCK_ACCOUNT='wrong@example.test'
if bash "$SCRIPT" --approved-one-scan > "$FIXTURE/identity.log" 2>&1; then exit 13; fi
[[ $(wc -l < "$SCAN_LOG") -eq 1 ]]
echo 'PASS incorrect operator blocked'
echo 'All calls mocked; no cloud scan submitted'
