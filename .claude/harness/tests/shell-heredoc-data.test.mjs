import assert from "node:assert/strict";
import test from "node:test";
import { shellMutationViolation } from "../runtime/core/shell-mutation-policy.mjs";

// A quoted heredoc fed to cat or tee is file content, not shell operands, even
// when another part of the same command carries code. One fed to a shell or
// interpreter is that code.
const env = { FOUNDATION_WORKSPACE_ROOT: "/tmp/ws" };
const check = (command) => shellMutationViolation("build", env, command, null);

test("a cat heredoc that mentions ../../.. beside sh -c is not an escape", () => {
  assert.equal(check("cd /tmp/ws && cat > a.mjs <<'EOF'\nconst root = resolve(here, '../../..');\nEOF\nsh -c \"node --test\""), null);
  assert.equal(check("cd /tmp/ws && tee b.txt <<\"END\"\nsee ../../docs\nEND\nnode -e \"require('fs').writeFileSync('c.txt', '1')\""), null);
});

test("a heredoc fed to an interpreter is still read as code", () => {
  assert.match(String(check("cd /tmp/ws && node <<'EOF'\nrequire('fs').writeFileSync('../../x', '1');\nEOF\nsh -c true")),
    /outside the isolated workspace/);
  assert.match(String(check("cd /tmp/ws && bash <<'EOF'\nrm -rf ../../x\nEOF\nsh -c true")),
    /outside the isolated workspace/);
});

test("the command's own redirect outside the workspace is still caught", () => {
  assert.match(String(check("cd /tmp/ws && cat > ../out.txt <<'EOF'\nhello\nEOF\nsh -c true")),
    /outside the isolated workspace/);
});
