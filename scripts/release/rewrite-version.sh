#!/usr/bin/env bash
# Rewrite the release candidate from PREV to NEW: a dated changelog section,
# its compare links, VERSION, and every executable, protocol, guidance, and
# documentation surface that states the release. The release job and each
# upgrade-matrix shard run this same script, so they test the same candidate.
#
#   scripts/release/rewrite-version.sh <prev> <new>
set -euo pipefail
PREV="${1:?usage: rewrite-version.sh <prev> <new>}"
NEW="${2:?usage: rewrite-version.sh <prev> <new>}"
GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-hashtagf/changeloop}"
cd "$(dirname "$0")/../.."
DATE=$(date +%F)
REPO="https://github.com/${GITHUB_REPOSITORY}"

# Add a dated [NEW] section directly under [Unreleased].
awk -v new="$NEW" -v date="$DATE" '
  !done && /^## \[Unreleased\]$/ { print; print ""; print "## [" new "] - " date; done=1; next }
  { print }' CHANGELOG.md > CHANGELOG.tmp && mv CHANGELOG.tmp CHANGELOG.md

# Bump the [Unreleased] link ref + add the [NEW] compare line.
awk -v new="$NEW" -v prev="$PREV" -v repo="$REPO" '
  /^\[Unreleased\]:/ {
    print "[Unreleased]: " repo "/compare/v" new "...HEAD"
    print "[" new "]: " repo "/compare/v" prev "...v" new
    next }
  { print }' CHANGELOG.md > CHANGELOG.tmp && mv CHANGELOG.tmp CHANGELOG.md

printf '%s\n' "$NEW" > VERSION

perl -pi -e "s/const VERSION = \"\Q${PREV}\E\"/const VERSION = \"${NEW}\"/" \
  .claude/harness/foundation.mjs
perl -pi -e "s/\"runtime\": \"\Q${PREV}\E\"/\"runtime\": \"${NEW}\"/" \
  .claude/harness/protocol.json
perl -pi -e "s/Change Loop \Q${PREV}\E/Change Loop ${NEW}/" \
  .claude/harness/AGENT.md
perl -pi -e "s/\Q${PREV}\E/${NEW}/g" \
  .claude/harness/DEVELOPER-SETUP.md

# Every surface that states the release has to move with it. The
# documentation suite derives its expectations from VERSION, so a
# surface left behind here fails `run-doc-consistency.sh` rather than
# drifting quietly the way the website did for four releases.
perl -pi -e "s/\*\*Version \Q${PREV}\E\*\*/**Version ${NEW}**/" \
  WORKFLOW.md README.md README.th.md
perl -pi -e "s/<b>v\Q${PREV}\E<\/b>/<b>v${NEW}<\/b>/" website/index.html
perl -pi -e "s/\*\*v\Q${PREV}\E\*\*/**v${NEW}**/" \
  website/docs/src/content/docs/index.md \
  website/docs/src/content/docs/th/index.md
perl -pi -e "s/\| Pin \| v\Q${PREV}\E \|/| Pin | v${NEW} |/" \
  website/docs/src/content/docs/cli.md \
  website/docs/src/content/docs/th/cli.md
perl -pi -e "s/\| runtime \| \Q${PREV}\E \|/| runtime | ${NEW} |/" \
  website/docs/src/content/docs/cli.md \
  website/docs/src/content/docs/th/cli.md

grep -q "const VERSION = \"$NEW\"" .claude/harness/foundation.mjs ||
  { echo "::error::.claude/harness/foundation.mjs version not updated"; exit 1; }
jq -e --arg version "$NEW" '.runtime == $version' \
  .claude/harness/protocol.json >/dev/null ||
  { echo "::error::.claude/harness/protocol.json runtime not updated"; exit 1; }
grep -q "Change Loop $NEW" .claude/harness/AGENT.md ||
  { echo "::error::.claude/harness/AGENT.md version not updated"; exit 1; }
grep -q "Change Loop v$NEW" .claude/harness/DEVELOPER-SETUP.md ||
  { echo "::error::.claude/harness/DEVELOPER-SETUP.md version not updated"; exit 1; }
grep -q 'version` is `'$NEW'`' .claude/harness/DEVELOPER-SETUP.md ||
  { echo "::error::.claude/harness/DEVELOPER-SETUP.md CLI pin not updated"; exit 1; }
grep -q 'clone tag `v'$NEW'`' .claude/harness/DEVELOPER-SETUP.md ||
  { echo "::error::.claude/harness/DEVELOPER-SETUP.md clone tag not updated"; exit 1; }
grep -q "claude-foundation/$NEW" .claude/harness/DEVELOPER-SETUP.md ||
  { echo "::error::.claude/harness/DEVELOPER-SETUP.md install path not updated"; exit 1; }

for f in WORKFLOW.md README.md README.th.md; do
  grep -q "\*\*Version $NEW\*\*" "$f" ||
    { echo "::error::$f version line not updated"; exit 1; }
done
grep -q "<b>v$NEW</b>" website/index.html ||
  { echo "::error::website/index.html version line not updated"; exit 1; }
for f in website/docs/src/content/docs/index.md \
         website/docs/src/content/docs/th/index.md; do
  grep -q "\*\*v$NEW\*\*" "$f" ||
    { echo "::error::$f version line not updated"; exit 1; }
done
for f in website/docs/src/content/docs/cli.md \
         website/docs/src/content/docs/th/cli.md; do
  grep -q "| Pin | v$NEW |" "$f" ||
    { echo "::error::$f pin row not updated"; exit 1; }
  grep -q "| runtime | $NEW |" "$f" ||
    { echo "::error::$f runtime row not updated"; exit 1; }
done
