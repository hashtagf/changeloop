#!/usr/bin/env bash
# Node tests for the maintainer Pi extensions (needs a local Pi >=1.5.2 install).
# Real-terminal smokes are opt-in: pass --tui.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
node --test agent-team/*.test.cjs agent-team/test.cjs ask-user/*.test.cjs background-bash/*.test.cjs background-bash/test.cjs nine-router/*.test.cjs nine-router/test/*.test.cjs
if [ "${1:-}" = --tui ]; then
  for smoke in agent-team/test/tui-smoke.py agent-team/test/chat-smoke.py ask-user/test/tui-smoke.py background-bash/test/tui-smoke.py; do
    python3 "$smoke"
  done
fi
