#!/usr/bin/env bash
set -euo pipefail
SOURCE_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
TEST_ROOT="$(mktemp -d)"
trap 'rm -rf -- "$TEST_ROOT"' EXIT
mkdir -p "$TEST_ROOT/bin" "$TEST_ROOT/sdk/bin" "$TEST_ROOT/script"
cp "$SOURCE_DIR/submit-scan.sh" "$SOURCE_DIR/SHA256SUMS" "$TEST_ROOT/script/"
cat > "$TEST_ROOT/bin/uname" <<'MOCK'
#!/usr/bin/env bash
echo Linux
MOCK
cat > "$TEST_ROOT/bin/gcloud" <<'MOCK'
#!/usr/bin/env bash
set -euo pipefail
case "$1 $2" in
  'auth list') echo "${MOCK_ACCOUNT:-martijnpronk76@gmail.com}";;
  'projects describe')
    if [[ "$*" == *'value(projectId)'* ]]; then echo quaerens-crm4-spain-test; else echo "${MOCK_NUMBER:-558324850479}"; fi;;
  'services list') echo ondemandscanning.googleapis.com;;
  'info --format=value(installation.sdk_root)') echo "$TEST_ROOT/sdk";;
  'artifacts docker')
    if [[ "${4:-}" == describe ]]; then echo '{"mock":true}';
    elif [[ "${4:-}" == scan ]]; then
      [[ "$*" == *'@sha256:0e26c3427691a8daa5144a0a40589a676d0a6d3ad5f800bf296bdd2e0fbdffce'* ]] || exit 99
      echo scan >> "$TEST_ROOT/scans"
      echo '{"name":"projects/quaerens-crm4-spain-test/locations/europe/operations/SYNTHETIC-NOT-A-REAL-OPERATION"}'
    else exit 98; fi;;
  *) echo 'Unexpected mock command' >&2; exit 97;;
esac
MOCK
printf '#!/usr/bin/env bash\nexit 0\n' > "$TEST_ROOT/sdk/bin/local-extract"
chmod +x "$TEST_ROOT/bin/"* "$TEST_ROOT/sdk/bin/local-extract"
export TEST_ROOT PATH="$TEST_ROOT/bin:$PATH"
run_case(){ local receipt_home="$1"; shift; env HOME="$receipt_home" "$@" bash "$TEST_ROOT/script/submit-scan.sh" --approved-one-scan; }
if run_case "$TEST_ROOT/wrong-account" MOCK_ACCOUNT=wrong@example.test >/dev/null 2>&1; then exit 1; fi
[[ ! -f "$TEST_ROOT/scans" ]]
if run_case "$TEST_ROOT/wrong-project" MOCK_NUMBER=999999 >/dev/null 2>&1; then exit 1; fi
[[ ! -f "$TEST_ROOT/scans" ]]
printf '\n# tampered\n' >> "$TEST_ROOT/script/submit-scan.sh"
if run_case "$TEST_ROOT/tampered" >/dev/null 2>&1; then exit 1; fi
[[ ! -f "$TEST_ROOT/scans" ]]
cp "$SOURCE_DIR/submit-scan.sh" "$TEST_ROOT/script/submit-scan.sh"
run_case "$TEST_ROOT/valid" >/dev/null
[[ "$(wc -l < "$TEST_ROOT/scans")" -eq 1 ]]
[[ -s "$TEST_ROOT/valid/crm4-scan-0e26c3427691a8da/scan-operation.json" ]]
if run_case "$TEST_ROOT/valid" >/dev/null 2>&1; then exit 1; fi
[[ "$(wc -l < "$TEST_ROOT/scans")" -eq 1 ]]
printf '%s\n' '{"mockTestsPassed":5,"realCloudCalls":0,"checks":["wrong identity denied","wrong project denied","checksum drift denied","one exact-digest submission and receipt","repeat submission denied"]}'
