#!/usr/bin/env sh
# A real v3.7.0 consumer upgrades to the current release without breaking.
#
# v3.7.0 is published. Its own CLI creates every in-flight state a consumer can
# hold (unstarted drafts of each version it accepted, a change mid-Build, proven
# changes with and without a recorded review, a review dispatched but not yet
# recorded, an archived change, changes started from v1/v3 drafts, and the
# opt-in legacy review routing). The current installer then upgrades the
# project, and the current CLI must carry every change to archived. No model is
# called: reviewer CLIs are shadowed and reviews are recorded deterministically.
#
# Usage: run-upgrade-from-3.7-tests.sh [default|legacy]. No argument runs both
# projects; run-all.sh runs them as two parallel rows.

set -eu
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../../.." && pwd)"
. "$ROOT/.claude/tests/lib/assert.sh"

SECTION="${1:-all}"
case "$SECTION" in all|default|legacy) ;; *) echo "unknown section: $SECTION" >&2; exit 2 ;; esac
OLD_TAG=v3.7.0
if ! git -C "$ROOT" rev-parse --verify --quiet "refs/tags/$OLD_TAG^{commit}" >/dev/null; then
  fetch="git fetch --tags"
  [ "$(git -C "$ROOT" rev-parse --is-shallow-repository 2>/dev/null)" = true ] &&
    fetch="git fetch --unshallow --tags"
  echo "test setup incomplete: release tag $OLD_TAG is missing; run $fetch in this checkout before retrying" >&2
  exit 1
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT HUP INT TERM
# Reviewer CLIs a developer host may carry must never run here.
mkdir -p "$TMP/bin"
for reviewer in claude codex gemini opencode cursor-agent; do
  printf '#!/bin/sh\necho "fixture: reviewer CLI disabled" >&2\nexit 127\n' > "$TMP/bin/$reviewer"
  chmod +x "$TMP/bin/$reviewer"
done
PATH="$TMP/bin:$PATH"
export PATH

OLD="$TMP/changeloop-3.7.0"
mkdir -p "$OLD"
git -C "$ROOT" archive "$OLD_TAG" | tar -x -C "$OLD"
REVIEW_HELPER="$ROOT/.claude/tests/lib/dispatched-review.mjs"
TARGET_STAGE=archived

new_project() {
  git -C "$1" init -q
  git -C "$1" config user.email fixture@example.com
  git -C "$1" config user.name "Upgrade Fixture"
  printf '%s\n' '#!/usr/bin/env sh' 'echo "1..1"' 'echo "ok 1 - compat fixture"' \
    > "$1/compat-test.sh"
  printf 'test-results/\n' > "$1/.gitignore"
  git -C "$1" add -A
  git -C "$1" commit -qm initial
  bash "$OLD/install.sh" "$1" --source "$OLD" --yes >/dev/null
  mkdir -p "$1/.foundation/drafts"
}

commit_install() {
  git -C "$1" add -A
  git -C "$1" commit -qm "install Change Loop" >/dev/null
}

# A v4 JSON draft, the format 3.7.0's agents wrote besides v5 folders.
v4_draft() {
  jq -n --arg id "$1" --arg impact "$2" \
    --argjson dims '["current-behavior","affected-actor","desired-behavior","success-path","failure-path","input-boundary","compatibility","non-goals","verification","operability","recoverability"]' \
    '{version:4,id:$id,intent:("Compat "+$id),impact:$impact,coupling:"isolated",
      requirements:[{key:"outcome",capability:$id,operation:"added",
        scenarios:[{name:"Works",when:"the fixture runs",then:"it passes"}],outcome:"The fixture passes"}],
      tasks:[{key:"implement",outcome:"Implement it",covers:["outcome"],paths:[($id+".txt")],verify:"sh compat-test.sh"}],
      evidence:{"outcome":{capabilities:["test"]}},
      discovery:{coverage:($dims|map({dimension:.,status:"covered",covers:["outcome"]})),decisions:[]}}
     + (if $impact == "high" then {scratch:{get:"a value",asIs:"old value",toBe:"new value",
         ifFail:"the value stays old",undo:"revert the fixture file"}} else {} end)'
}

# A v1 draft, which 3.7.0 still started.
v1_draft() {
  jq -n --arg id "$1" '{version:1,id:$id,intent:("Compat "+$id),why:"Keep the fixture compatible.",
    currentState:"The fixture is unchanged.",compatibility:"No public compatibility impact.",
    acceptance:{required:false,reason:null,claimIds:[]},changes:["Edit one fixture file."],
    nonGoals:["No Land."],decisions:[{choice:"Edit a file",why:"Smallest change",rejected:"No change"}],
    risks:[{risk:"None",mitigation:"Tests",owner:"runtime"}],
    tasks:[{id:"T001",outcome:"Edit the fixture",kind:"implementation",paths:[($id+".txt")],verify:"sh compat-test.sh"}],
    claims:[{id:($id+"-outcome"),scenario:"Fixture passes",impact:"low",capabilities:["test"]}],
    specs:[{name:$id,requirement:"Fixture",description:"The fixture SHALL pass.",scenario:"Run",
      when:"the fixture runs",then:"it passes"}],
    execution:{version:1,providers:{test:{adapter:"test-discovery",command:["sh","compat-test.sh"],
      inputs:["compat-test.sh"],minimum:1,timeoutMs:120000}},services:{}}}'
}

# Start a change with v3.7.0, enter Build, and implement its one task.
old_start() { # project id draft-json
  printf '%s\n' "$3" > "$1/.foundation/drafts/$2.json"
  bash "$OLD/cli.sh" --project "$1" change start ".foundation/drafts/$2.json" \
    --consume-draft --approve-spec --decision-ref fixture://user/spec >/dev/null
  bash "$OLD/cli.sh" --project "$1" advance "$2" --through build >/dev/null || true
  printf '%s edit\n' "$2" > "$(jq -r .workspace.path "$1/.foundation/runtime/$2.json")/$2.txt"
}

status_of() { jq -r .status "$1/.foundation/runtime/$2.json"; }
action_of() { printf '%s\n' "$1" | sed -n 's/.*"action": *"\([A-Z_]*\)".*/\1/p' | head -1; }

# ---------------------------------------------------------------------------
# Project A: the default 3.7.0 policy (risk-tiered review, full-delta circuit).
if [ "$SECTION" != legacy ]; then
A="$TMP/project"
mkdir -p "$A"
new_project "$A"
commit_install "$A"
OLDA="bash $OLD/cli.sh --project $A"

old_start "$A" building "$(v4_draft building low)"

old_start "$A" proven "$(v4_draft proven low)"
$OLDA advance proven --through proven >/dev/null

# A required review recorded the 3.7.0 way: request, dispatch, then record.
old_start "$A" reviewed "$(v4_draft reviewed high)"
$OLDA advance reviewed --through build >/dev/null
(cd "$A" && FOUNDATION_CLI=.claude/harness/foundation.mjs node "$REVIEW_HELPER" reviewed pass \
  --observed "fixture review found no blockers" --reviewer harness-test \
  --subject-actor implementation-agent --unresolved-blockers 0 \
  --reference fixture://review >/dev/null)
$OLDA advance reviewed --through proven >/dev/null

# A review 3.7.0 dispatched that nobody has recorded yet.
old_start "$A" review-pending "$(v4_draft review-pending high)"
$OLDA advance review-pending --through build >/dev/null
pending_request="$($OLDA authority request review-pending --type review |
  sed -n 's/.*"requestId": *"\([^"]*\)".*/\1/p' | head -1)"
$OLDA authority dispatch review-pending --request "$pending_request" --scope full \
  --reviewer-type human --reviewer-identity harness-test >/dev/null

old_start "$A" archived "$(v4_draft archived low)"
$OLDA advance archived --through "$TARGET_STAGE" >/dev/null

old_start "$A" v3-building "$(v4_draft v3-building low | jq -c 'del(.discovery) | .version = 3')"
# A change 3.7.0 left inside the retired commit-based Land saga. Its CLI can
# only continue a saga an older release started, so the saga fields that
# `land record` / `land pointers` wrote are added to a real 3.7.0 change.
old_start "$A" saga-stuck "$(v4_draft saga-stuck low)"
jq '.repositories.api = {mode:"worktree",baseHead:"api-base",
      land:{commit:"a1b2c3",status:"child-landed",
        authority:{kind:"host-user-decision",reference:"fixture://user/land-api"}}}
    | .land = {strategy:"ordered-resumable-saga",status:"root-pointers-staged"}' \
  "$A/.foundation/runtime/saga-stuck.json" > "$TMP/saga-stuck.json"
cp "$TMP/saga-stuck.json" "$A/.foundation/runtime/saga-stuck.json"
old_start "$A" v1-building "$(v1_draft v1-building)"

# Unstarted drafts in every version 3.7.0 accepted.
v4_draft pending-v4 low > "$A/.foundation/drafts/pending-v4.json"
v4_draft pending-v3 low | jq 'del(.discovery) | .version = 3' > "$A/.foundation/drafts/pending-v3.json"
v1_draft pending-v1 > "$A/.foundation/drafts/pending-v1.json"
mkdir -p "$A/.foundation/drafts/pending-v5"
v4_draft pending-v5 low | jq '.version = 5 | del(.id) | .language = "en" | .workType = ["feature"]' \
  > "$A/.foundation/drafts/pending-v5/change.json"
printf '## Why\n\nKeep the compat fixture pending across an upgrade.\n' \
  > "$A/.foundation/drafts/pending-v5/proposal.md"

assert_eq "3.7.0 left a change mid-Build" "building" "$(status_of "$A" building)"
assert_eq "3.7.0 proved a change without review" "proven" "$(status_of "$A" proven)"
assert_eq "3.7.0 proved a change with a recorded review" "proven" "$(status_of "$A" reviewed)"
assert_eq "3.7.0 left a dispatched review unrecorded" "dispatched" \
  "$(jq -r .status "$A/.foundation/authority/review-pending/$pending_request.json")"
assert_eq "3.7.0 archived a change" "archived" "$(status_of "$A" archived)"
assert_eq "3.7.0 started a change from a v3 draft" "3" \
  "$(jq -r .semanticDraftVersion "$A/.foundation/runtime/v3-building.json")"
assert_eq "3.7.0 started a change from a v1 draft" "building" "$(status_of "$A" v1-building)"

for shim in .claude/harness/runtime/evidence/codex-reviewer.mjs .claude/hooks/phase-guard-policy.mjs; do
  assert_file_exists "3.7.0 shipped the pass-through module $shim" "$A/$shim"
done
upgrade="$(bash "$ROOT/install.sh" "$A" --source "$ROOT" --yes)"
assert_contains "upgrade reports the in-flight 3.7.0 changes" "$upgrade" \
  "active-change-effects:review-pending"
assert_contains "upgrade names the change stuck in the retired Land saga" "$upgrade" \
  "active-change-effects:saga-stuck status=building changed=false; state-preserved,retired-commit-based-land-saga-refused"
for shim in .claude/harness/runtime/evidence/codex-reviewer.mjs .claude/hooks/phase-guard-policy.mjs; do
  assert_file_absent "upgrade removes the retired pass-through module $shim" "$A/$shim"
done
CLI="bash $ROOT/cli.sh --project $A"
assert_contains "upgraded CLI reports the current version" "$($CLI version)" "$(cat "$ROOT/VERSION")"
changes="$($CLI changes)"
for change in building proven reviewed review-pending v3-building v1-building; do
  assert_contains "changes lists the 3.7.0 change $change" "$changes" "$change"
done
assert_cmd_zero "doctor accepts the upgraded 3.7.0 project" $CLI doctor --stage build
assert_contains "changes marks the retired-saga change" "$changes" \
  "saga-stuck	legacy-land-saga	"

# The retired Land saga is refused with the recovery, never replayed; the
# abandon route it names retires the change.
saga_state="$(shasum -a 256 < "$A/.foundation/runtime/saga-stuck.json")"
refused="$($CLI advance saga-stuck --through archived)"
assert_eq "advance asks the user about the retired-saga change" "ASK_USER" "$(action_of "$refused")"
assert_eq "the refusal is the legacy-land-saga decision" "legacy-land-saga" \
  "$(printf '%s' "$refused" | jq -r .decision.kind)"
assert_contains "the refusal names the runtime file" "$refused" ".foundation/runtime/saga-stuck.json"
assert_eq "the refused change keeps its state" "$saga_state" \
  "$(shasum -a 256 < "$A/.foundation/runtime/saga-stuck.json")"
assert_cmd_zero "the named abandon route retires the retired-saga change" \
  $CLI change abandon saga-stuck --reason "finish-with-3.7.0-declined" \
    --decision-ref fixture://user/abandon
assert_file_absent "abandon moves the retired-saga runtime state" \
  "$A/.foundation/runtime/saga-stuck.json"

# Unstarted drafts: v4/v5 stay startable; a retired v1/v3 draft asks for a
# repair with the exact recovery instead of reporting DONE and then refusing.
for draft in pending-v4.json pending-v5; do
  inspected="$($CLI change start ".foundation/drafts/$draft" --inspect)"
  assert_not_contains "a 3.7.0 $draft draft stays readable" "$inspected" "no longer supported"
done
for version in 1 3; do
  inspected="$($CLI change start ".foundation/drafts/pending-v$version.json" --inspect)"
  assert_eq "a 3.7.0 v$version draft inspects as a draft repair" "EDIT" "$(action_of "$inspected")"
  assert_contains "the v$version draft repair names the supported formats" "$inspected" \
    "draft version $version is no longer supported; author a v5 draft folder"
done

# In-flight changes finish Build and Prove with the current runtime.
for change in building v1-building; do
  built="$($CLI advance "$change" --through build)"
  assert_eq "the 3.7.0 change $change finishes Build" "DONE" "$(action_of "$built")"
  assert_eq "advance speaks protocol 7 with one resume route for $change" "7 false" \
    "$(printf '%s' "$built" | jq -r '"\(.protocol) \(has("resumeCommand"))"')"
done
for change in proven reviewed; do
  assert_eq "the 3.7.0 proof of $change survives the upgrade" "DONE" \
    "$(action_of "$($CLI advance "$change" --through proven)")"
done

# A change started from a v3 draft stays amendable (3.7.0 allowed it).
printf '%s\n' '{"version":1,"reason":"Add the extra fixture",
  "addRequirements":[{"key":"extra","capability":"v3-building","operation":"added",
    "scenarios":[{"name":"Extra","when":"the extra fixture runs","then":"it passes"}],
    "outcome":"The extra fixture passes"}],
  "addTasks":[{"key":"extra-task","outcome":"Implement extra","covers":["extra"],
    "paths":["v3-extra.txt"],"verify":"sh compat-test.sh"}],
  "evidence":{"extra":{"capabilities":["test"]}}}' > "$A/.foundation/amend-v3.json"
assert_contains "amend --inspect on a v3 change names the direct amend route" \
  "$($CLI change amend v3-building .foundation/amend-v3.json --inspect 2>&1 || true)" \
  "apply it directly with claude-foundation change amend v3-building .foundation/amend-v3.json"
assert_cmd_zero "a 3.7.0 change started from a v3 draft accepts an amendment" \
  $CLI change amend v3-building .foundation/amend-v3.json \
    --approve-spec --decision-ref fixture://user/amend
printf 'extra\n' > "$(jq -r .workspace.path "$A/.foundation/runtime/v3-building.json")/v3-extra.txt"
$CLI advance v3-building --through build >/dev/null || true
assert_eq "the amended v3 change finishes Build" "DONE" \
  "$(action_of "$($CLI advance v3-building --through build)")"

# The review 3.7.0 dispatched is recorded by the current runtime.
(cd "$A" && $CLI authority status review-pending --request "$pending_request" --template) |
  jq '.status = "pass" |
      .evidence.observed = "fixture review found no blockers" |
      .evidence["subject-actor"] = "implementation-agent" |
      .evidence["unresolved-blockers"] = "0" |
      .evidence.reference = ["fixture://review"] |
      .evidence |= with_entries(select((.value | type) != "string" or (.value | test("^<.*>$") | not)))' \
  > "$A/.foundation/pending-response.json"
assert_cmd_zero "a review dispatched by 3.7.0 records after the upgrade" \
  $CLI authority record review-pending --request "$pending_request" \
    --response .foundation/pending-response.json

head_before="$(git -C "$A" rev-parse HEAD)"
index_before="$(git -C "$A" diff --cached --binary | shasum -a 256)"
for change in building proven reviewed review-pending v3-building v1-building; do
  delivered="$($CLI advance "$change" --through "$TARGET_STAGE" --pretty)"
  assert_contains "the 3.7.0 change $change reaches $TARGET_STAGE" "$delivered" '"userState": "DELIVERED"'
done
assert_eq "upgraded delivery preserves Git HEAD" "$head_before" "$(git -C "$A" rev-parse HEAD)"
assert_eq "upgraded delivery preserves the Git index" "$index_before" \
  "$(git -C "$A" diff --cached --binary | shasum -a 256)"
assert_eq "the change archived by 3.7.0 stays archived" "archived" "$(status_of "$A" archived)"

fi

# ---------------------------------------------------------------------------
# Project L: 3.7.0's opt-in legacy review routing, retired since.
if [ "$SECTION" != default ]; then
L="$TMP/legacy-project"
mkdir -p "$L"
new_project "$L"
jq '.workflow.reviewPolicy = "legacy" | .workflow.reviewCircuit = "legacy"' \
  "$L/foundation.json" > "$TMP/legacy-foundation.json"
cp "$TMP/legacy-foundation.json" "$L/foundation.json"
commit_install "$L"
OLDL="bash $OLD/cli.sh --project $L"
old_start "$L" legacy-proven "$(v4_draft legacy-proven high)"
$OLDL advance legacy-proven --through build >/dev/null
(cd "$L" && node .claude/harness/foundation.mjs receipt legacy-proven review pass \
  --observed "fixture review found no blockers" --reviewer harness-test \
  --subject-actor implementation-agent --unresolved-blockers 0 \
  --reference fixture://review >/dev/null)
$OLDL advance legacy-proven --through proven >/dev/null
old_start "$L" legacy-unreviewed "$(v4_draft legacy-unreviewed high)"
$OLDL advance legacy-unreviewed --through build >/dev/null
$OLDL advance legacy-unreviewed --through proven >/dev/null || true
assert_eq "3.7.0 proved a change under legacy review routing" "proven" \
  "$(status_of "$L" legacy-proven)"
assert_eq "3.7.0 left a legacy-circuit review request open" "legacy" \
  "$(jq -r .reviewCircuit "$L"/.foundation/authority/legacy-unreviewed/*.json)"

legacy_upgrade="$(bash "$ROOT/install.sh" "$L" --source "$ROOT" --yes)"
assert_contains "the upgrade says what retiring legacy review routing means" \
  "$legacy_upgrade" "upgraded retired legacy review routing to risk-tiered/full-delta"
assert_eq "legacy review policy is upgraded" "risk-tiered" \
  "$(jq -r .workflow.reviewPolicy "$L/foundation.json")"
assert_eq "legacy review circuit is upgraded" "full-delta" \
  "$(jq -r .workflow.reviewCircuit "$L/foundation.json")"
CLIL="bash $ROOT/cli.sh --project $L"
for change in legacy-proven legacy-unreviewed; do
  routed="$($CLIL advance "$change" --through proven)"
  assert_eq "the legacy-routed change $change is routed to one current review" "RUN_EXTERNAL" \
    "$(action_of "$routed")"
  assert_not_contains "the retired legacy request does not trap $change" "$routed" \
    "predates the full-delta circuit"
  (cd "$L" && node "$REVIEW_HELPER" "$change" pass \
    --observed "fixture review found no blockers" --reviewer harness-test \
    --subject-actor implementation-agent --unresolved-blockers 0 \
    --reference fixture://review >/dev/null)
  assert_contains "the legacy-routed change $change reaches $TARGET_STAGE" \
    "$($CLIL advance "$change" --through "$TARGET_STAGE" --pretty)" '"userState": "DELIVERED"'
done

fi

finish "upgrade from 3.7.0 ($SECTION)"
