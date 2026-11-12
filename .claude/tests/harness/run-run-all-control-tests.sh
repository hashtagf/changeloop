#!/usr/bin/env sh
set -eu

HERE="$(cd "$(dirname "$0")" && pwd)"
RUN_ALL="$HERE/../run-all.sh"
WORK="$(mktemp -d)"
parent=""

cleanup() {
  [ -n "$parent" ] && kill -KILL "$parent" 2>/dev/null || true
  rm -rf "$WORK"
}
trap cleanup EXIT HUP INT TERM

sh -c 'sleep 60 & echo "$!" > "$1"; wait' sh "$WORK/child.pid" 2>/dev/null &
parent=$!
tries=0
while [ ! -s "$WORK/child.pid" ] && [ "$tries" -lt 50 ]; do
  sleep 0.02
  tries=$((tries + 1))
done
[ -s "$WORK/child.pid" ] || { echo "FAIL: child PID was not recorded"; exit 1; }
child="$(cat "$WORK/child.pid")"

sh "$RUN_ALL" --kill-tree "$parent"
wait "$parent" 2>/dev/null || true
parent=""

# kill -0 also succeeds for a zombie, and when the TERMed parent dies before
# reaping, the dead child reparents to pid 1 — which containers often never
# reap. Only a non-Z state means kill_tree actually left it running.
child_running() {
  _state="$(ps -o state= -p "$1" 2>/dev/null | tr -d ' ')"
  [ -n "$_state" ] && [ "$_state" != "Z" ]
}
tries=0
while child_running "$child" && [ "$tries" -lt 50 ]; do
  sleep 0.02
  tries=$((tries + 1))
done
if child_running "$child"; then
  echo "FAIL: run-all left a descendant process alive"
  exit 1
fi

repository="$WORK/repository"
mkdir -p "$repository"
git -C "$repository" init -q
git -C "$repository" config user.email test@example.invalid
git -C "$repository" config user.name "Foundation Test"
printf 'tracked\n' > "$repository/tracked.txt"
git -C "$repository" add tracked.txt
git -C "$repository" commit -qm baseline
git -C "$repository" status --porcelain=v1 --untracked-files=all > "$WORK/baseline.status"

sh "$RUN_ALL" --assert-repository-unchanged "$repository" "$WORK/baseline.status"
printf 'residue\n' > "$repository/generated.txt"
if sh "$RUN_ALL" --assert-repository-unchanged \
  "$repository" "$WORK/baseline.status" > "$WORK/residue.out" 2>&1
then
  echo "FAIL: run-all accepted repository residue"
  exit 1
fi
grep -q 'repository residue detected' "$WORK/residue.out" || {
  echo "FAIL: repository residue failure was not actionable"
  exit 1
}
grep -q 'generated.txt' "$WORK/residue.out" || {
  echo "FAIL: repository residue failure did not name the leaked path"
  exit 1
}

affected_first="$(FOUNDATION_CHANGED_FILES='.claude/tests/affected-suite-selector.mjs' \
  sh "$RUN_ALL" --affected --list)"
list_first="$(FOUNDATION_CHANGED_FILES='.claude/tests/affected-suite-selector.mjs' \
  sh "$RUN_ALL" --list --affected)"
[ "$affected_first" = "$list_first" ] || {
  echo "FAIL: --affected and --list depend on argument order"
  exit 1
}
printf '%s\n' "$affected_first" | grep -qFx 'affected test selection' || {
  echo "FAIL: --affected --list did not select the changed suite"
  exit 1
}

no_changes="$(FOUNDATION_CHANGED_FILES='' sh "$RUN_ALL" --affected 2>&1)"
printf '%s\n' "$no_changes" | grep -q 'ALL SUITES PASS (0 suites,' || {
  echo "FAIL: no-change affected run did not report zero suites"
  exit 1
}

missing_dependencies="$WORK/missing-dependencies/.claude/tests"
mkdir -p "$missing_dependencies"
cp "$RUN_ALL" "$missing_dependencies/run-all.sh"
git -C "$WORK/missing-dependencies" init -q
if sh "$missing_dependencies/run-all.sh" --full > "$WORK/missing-dependencies.out" 2>&1; then
  echo "FAIL: full runner accepted missing benchmark dependencies"
  exit 1
fi
grep -q 'test setup incomplete: c8 is missing' "$WORK/missing-dependencies.out" || {
  echo "FAIL: missing dependency did not fail during setup"
  exit 1
}
if grep -q '^=== ' "$WORK/missing-dependencies.out"; then
  echo "FAIL: runner launched suites before checking dependencies"
  exit 1
fi
sh "$missing_dependencies/run-all.sh" --full --list > "$WORK/missing-dependencies-list.out"
grep -q 'openspec native benchmark' "$WORK/missing-dependencies-list.out" || {
  echo "FAIL: listing suites unexpectedly needs benchmark dependencies"
  exit 1
}

# Two tiers. The default is the fast local gate: it keeps ordinary suites and
# drops the slow tier and the exclusive benchmark; `--quick` is the same gate.
# `--full` (CI) owns every non-release row, and `--release` adds the sentinel.
sh "$HERE/../run-all.sh" --list > "$WORK/default-list.out"
sh "$HERE/../run-all.sh" --quick --list > "$WORK/quick-list.out"
sh "$HERE/../run-all.sh" --full --list > "$WORK/full-list.out"
sh "$HERE/../run-all.sh" --release --list > "$WORK/release-list.out"
cmp -s "$WORK/default-list.out" "$WORK/quick-list.out" || {
  echo "FAIL: --quick is not the default gate"; exit 1; }
for label in 'runtime syntax' 'run-all process control' 'land surface mutation'; do
  grep -qFx "$label" "$WORK/default-list.out" || {
    echo "FAIL: the default gate dropped ordinary suite: $label"; exit 1; }
done
for label in 'installer smoke' 'harness contracts (topology planning)' \
  'pull request delivery' 'evidence binding mutation' 'openspec native benchmark'; do
  grep -qFx "$label" "$WORK/full-list.out" || {
    echo "FAIL: full list is missing: $label"; exit 1; }
  if grep -qFx "$label" "$WORK/default-list.out"; then
    echo "FAIL: the default gate kept slow suite: $label"; exit 1
  fi
done
# The default gate is exactly the full gate minus the slow tier and exclusive rows.
grep -vxF -f "$WORK/default-list.out" "$WORK/full-list.out" > "$WORK/slow-only.out" || true
[ "$(wc -l < "$WORK/default-list.out" | tr -d ' ')" -gt 200 ] || {
  echo "FAIL: the default gate lost ordinary suites"; exit 1; }
[ "$(wc -l < "$WORK/slow-only.out" | tr -d ' ')" -lt 40 ] || {
  echo "FAIL: the slow tier grew past its budget"; exit 1; }
grep -vxF -f "$WORK/full-list.out" "$WORK/default-list.out" > "$WORK/default-extra.out" || true
[ ! -s "$WORK/default-extra.out" ] || {
  echo "FAIL: the default gate runs suites the full gate does not"; exit 1; }
# Every SLOW and EARLY name is a registered row (a typo would silently move a
# slow suite into the default gate or lose its early start), and EARLY rows
# stay in the default gate.
for tier in SLOW EARLY; do
  awk -v tier="$tier" '
    index($0, tier "=\047") == 1 { on = 1; sub(/^[A-Z_]+=\047/, "") }
    on { line = $0; done = sub(/\047$/, "", line); print line; if (done) exit }
  ' "$RUN_ALL" > "$WORK/tier-$tier.out"
  [ -s "$WORK/tier-$tier.out" ] || { echo "FAIL: could not read $tier"; exit 1; }
  while IFS= read -r label; do
    grep -qFx -- "$label" "$WORK/full-list.out" || {
      echo "FAIL: $tier names an unregistered suite: $label"; exit 1; }
  done < "$WORK/tier-$tier.out"
done
while IFS= read -r label; do
  grep -qFx -- "$label" "$WORK/default-list.out" || {
    echo "FAIL: EARLY suite is not in the default gate: $label"; exit 1; }
done < "$WORK/tier-EARLY.out"
slow_affected="$(FOUNDATION_CHANGED_FILES='.claude/tests/harness/run-installer-tests.sh' \
  sh "$RUN_ALL" --affected --list)"
printf '%s\n' "$slow_affected" | grep -qFx 'installer smoke' || {
  echo "FAIL: --affected did not select a slow suite for its own edit"; exit 1; }

# The sentinel reruns the whole workload suite: `--release` owns it, the full
# and default gates leave it out, and a benchmark edit still selects it.
for list in full default; do
  if grep -qFx 'openspec native sentinel' "$WORK/$list-list.out"; then
    echo "FAIL: the $list gate kept the release-only sentinel"; exit 1
  fi
done
grep -qFx 'openspec native sentinel' "$WORK/release-list.out" || {
  echo "FAIL: --release dropped the sentinel"; exit 1; }
if grep -vFx 'openspec native sentinel' "$WORK/release-list.out" |
  cmp -s - "$WORK/full-list.out"; then :; else
  echo "FAIL: --release is not the full gate plus the sentinel"; exit 1
fi
bench_affected="$(FOUNDATION_CHANGED_FILES='.claude/tests/bench/openspec-native/sentinel.mjs' \
  sh "$RUN_ALL" --affected --list)"
printf '%s\n' "$bench_affected" | grep -qFx 'openspec native sentinel' || {
  echo "FAIL: --affected did not select the sentinel for a benchmark edit"; exit 1; }

# The watchdog's limits and its timeout reporting are checked as structured
# node:test cases, which is also the report Prove reads from this script.
node --test "$HERE/../../harness/tests/run-all-timeout.test.mjs"

echo "run-all process control: PASS"
