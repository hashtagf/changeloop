#!/usr/bin/env bash
# Project-local Pi extension over the shared Change Loop installation.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_PATH=""
SOURCE_PATH="$SCRIPT_DIR"
ASSUME_YES=no
DRY_RUN=no
SHARED_RUNTIME=no
INSTALL_FLAGS=()
fail() { printf '✗ %s\n' "$*" >&2; exit 1; }
while [ "$#" -gt 0 ]; do
  case "$1" in
    --source) [ "$#" -ge 2 ] || fail "--source needs a path"; SOURCE_PATH="$2"; shift ;;
    --yes|-y) ASSUME_YES=yes ;;
    --dry-run) DRY_RUN=yes ;;
    --shared-runtime) SHARED_RUNTIME=yes ;;
    --force|-f) : ;;
    --no-permission-allowlist) INSTALL_FLAGS+=("$1") ;;
    --help|-h)
      printf '%s\n' 'install-pi.sh [target-path] [--source path] [--yes] [--dry-run]' \
        '  [--no-permission-allowlist] [--shared-runtime]' \
        'Requires Pi >=1.5.2 (@earendil-works/pi-coding-agent), Node.js and jq.'
      exit 0 ;;
    -*) fail "unknown option: $1" ;;
    *) [ -z "$TARGET_PATH" ] || fail "unexpected argument: $1"; TARGET_PATH="$1" ;;
  esac
  shift
done
TARGET_PATH="${TARGET_PATH:-$PWD}"
if [ -d "$TARGET_PATH" ]; then TARGET_PATH="$(cd "$TARGET_PATH" && pwd)"
else case "$TARGET_PATH" in /*) ;; *) TARGET_PATH="$PWD/$TARGET_PATH" ;; esac; fi
SOURCE_PATH="$(cd "$SOURCE_PATH" && pwd)"
if [ "$SHARED_RUNTIME" = yes ]; then
  [ "$DRY_RUN" = no ] || { printf 'Shared Pi runtime: global bundle plus settings/artifacts at %s\n' "$TARGET_PATH"; exit 0; }
  node --input-type=module - "$SOURCE_PATH" "$TARGET_PATH" "${PI_CODING_AGENT_DIR:-$HOME/.pi/agent}" <<'NODE'
const [source, target, agent] = process.argv.slice(2);
const {pathToFileURL} = await import('node:url');
const {installSharedPi, initializeSharedProject} = await import(pathToFileURL(source + '/.claude/harness/adapters/pi-installation.mjs'));
const bundle = installSharedPi(source, agent);
const project = initializeSharedProject(target, bundle.path);
console.log(`✓ Change Loop ${bundle.bundle} installed in Pi\n  project settings: ${project.root}\n  no project runtime, hooks, commands or schemas installed\n  trust the project, then /reload`);
NODE
  exit 0
fi
. "$SOURCE_PATH/.claude/harness/adapters/install-support.sh"
adapter_scope_root() { [ "$1" = project ] || return 1; printf '%s\n' "$TARGET_PATH"; }
adapter_legacy_owned() { return 1; }
adapter_manifest_preflight pi "$TARGET_PATH"
args=("$TARGET_PATH" "--source" "$SOURCE_PATH")
[ "$ASSUME_YES" = no ] || args+=("--yes")
[ "$DRY_RUN" = no ] || args+=("--dry-run")
args+=(${INSTALL_FLAGS[@]+"${INSTALL_FLAGS[@]}"})
bash "$SOURCE_PATH/install.sh" "${args[@]}"
[ "$DRY_RUN" = no ] || exit 0
adapter_manifest_init pi "$TARGET_PATH"
rel=.pi/extensions/changeloop.ts
dst="$TARGET_PATH/$rel"
if adapter_manifest_may_write project "$rel" "$dst"; then
  mkdir -p "$(dirname "$dst")"
  adapter_manifest_prepare_file "$dst"
  cp "$SOURCE_PATH/.claude/harness/adapters/pi-extension.ts" "$dst"
  adapter_manifest_record project "$rel"
else
  printf '⚠ keeping existing user-owned Pi extension: %s\n' "$dst" >&2
fi
adapter_manifest_finish
printf '✓ Pi adapter installed at %s\n' "$TARGET_PATH"
printf '  extension: .pi/extensions/changeloop.ts (Pi >=1.5.2; trust this project, then /reload)\n'
adapter_capability_summary "$SOURCE_PATH/.claude/harness/adapters/host-capabilities.json" pi
printf '  boundary: built-in tools and !/!! only; custom tools/extensions are outside live guard coverage.\n'
printf 'Next: describe the outcome with /change <intent>; Land requires /land <change>.\n'
