#!/usr/bin/env bash
# Install the repository's maintainer Pi extensions into the Pi agent directory.
# Repository-only: never shipped by the product installers or the Homebrew formula.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENT_DIR="${PI_CODING_AGENT_DIR:-$HOME/.pi/agent}"
DEST="$AGENT_DIR/extensions"
EXTENSIONS=(agent-team ask-user background-bash nine-router session-title team-webui claude-accounts)
DRY_RUN=no
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=yes ;;
    --help|-h) printf 'pi-extensions/install.sh [--dry-run]\nCopies %s into %s; replaced copies are backed up.\n' "${EXTENSIONS[*]}" "$DEST"; exit 0 ;;
    *) printf 'unknown option: %s\n' "$arg" >&2; exit 2 ;;
  esac
done
BACKUP="$AGENT_DIR/extension-backups/$(date +%Y%m%d-%H%M%S)"
for name in "${EXTENSIONS[@]}"; do
  src="$HERE/$name" dst="$DEST/$name"
  [ -f "$src/index.ts" ] || { printf 'missing %s/index.ts\n' "$src" >&2; exit 1; }
  if [ -d "$dst" ] && diff -rq -x node_modules "$src" "$dst" >/dev/null 2>&1; then
    printf '= %s unchanged\n' "$name"; continue
  fi
  if [ "$DRY_RUN" = yes ]; then
    printf '~ %s would be installed to %s\n' "$name" "$dst"
    if [ -d "$dst" ]; then diff -rq -x node_modules "$src" "$dst" | sed 's/^/    /' || true; fi
    continue
  fi
  if [ -d "$dst" ]; then mkdir -p "$BACKUP"; mv "$dst" "$BACKUP/$name"; fi
  mkdir -p "$DEST"
  cp -R "$src" "$dst"
  printf '✓ %s installed\n' "$name"
done
if [ "$DRY_RUN" = no ]; then
  if [ -d "$BACKUP" ]; then printf 'Previous copies: %s\n' "$BACKUP"; fi
  printf 'Run /reload in open Pi sessions.\n'
fi
