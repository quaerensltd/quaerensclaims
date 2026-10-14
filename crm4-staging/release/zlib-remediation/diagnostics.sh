#!/usr/bin/env bash
# Sourced only inside the disposable compiler. Preserve all diagnostics on /out.
phase() {
  local name="$1"; shift
  local dir="${CRM4_DIAGNOSTICS_DIR:-/out/evidence}"
  local log="$dir/$name.log" start rc pid
  mkdir -p "$dir"
  start=$(date +%s)
  printf 'CRM4 phase=%s event=start utc=%s\n' "$name" "$(date -u +%FT%TZ)"
  "$@" >"$log" 2>&1 & pid=$!
  while kill -0 "$pid" 2>/dev/null; do
    printf 'CRM4 phase=%s elapsed=%s log_bytes=%s memory_bytes=%s\n' "$name" "$(( $(date +%s)-start ))" "$(wc -c <"$log")" "$(cat /sys/fs/cgroup/memory.current 2>/dev/null || echo unavailable)"
    sleep "${CRM4_DIAGNOSTICS_INTERVAL:-30}" & wait $! || true
  done
  if wait "$pid"; then rc=0; else rc=$?; fi
  printf '%s\t%s\t%s\n' "$name" "$(( $(date +%s)-start ))" "$rc" >> "$dir/phase-results.tsv"
  cat /sys/fs/cgroup/memory.peak /sys/fs/cgroup/memory.events 2>/dev/null || true
  sha256sum "$log"
  tail -c 12000 "$log"
  printf '\nCRM4 phase=%s event=end rc=%s\n' "$name" "$rc"
  return "$rc"
}
