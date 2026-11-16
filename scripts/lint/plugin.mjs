// Repository-only ESLint rules. Each message names the root-cause fix, because
// the next agent reads the message, not the history behind it. When an agent
// repeats a mistake, add a rule here instead of another line of prose.

const TIMER_CALLS = new Set(["setTimeout", "setInterval", "setImmediate"]);
const PROCESS_CALLS = new Set(["spawn", "spawnSync", "exec", "execSync", "execFile", "execFileSync"]);
const SLEEP_COMMAND = /^\s*sleep(?:\s|$)/;

function calleeName(callee) {
  if (callee.type === "Identifier") return callee.name;
  if (callee.type === "MemberExpression" && !callee.computed && callee.property.type === "Identifier")
    return callee.property.name;
  return null;
}

function literalString(node) {
  if (!node) return null;
  if (node.type === "Literal" && typeof node.value === "string") return node.value;
  if (node.type === "TemplateLiteral" && node.expressions.length === 0)
    return node.quasis[0].value.cooked;
  return null;
}

const noTimerWait = {
  meta: {
    type: "problem",
    docs: { description: "Disallow timers and sleep as a way to wait for something" },
    schema: [],
    messages: {
      timer: "{{name}} used as a wait hides the real dependency and races under load. " +
        "Wait for the actual event, promise, exit, or file condition instead; a bounded " +
        "timeout belongs in one named helper whose disable comment states why.",
      atomics: "Atomics.wait blocks the process to sleep. Wait for the real condition " +
        "(child exit, lock release, file event) instead.",
      sleep: "Spawning sleep is a timer wait. Poll the real condition or wait for the " +
        "process/event that signals readiness."
    }
  },
  create(context) {
    return {
      CallExpression(node) {
        const name = calleeName(node.callee);
        if (!name) return;
        if (TIMER_CALLS.has(name)) {
          context.report({ node, messageId: "timer", data: { name } });
          return;
        }
        if (name === "wait" && node.callee.type === "MemberExpression" &&
            node.callee.object.type === "Identifier" && node.callee.object.name === "Atomics") {
          context.report({ node, messageId: "atomics" });
          return;
        }
        if (PROCESS_CALLS.has(name)) {
          const command = literalString(node.arguments[0]);
          if (command !== null && SLEEP_COMMAND.test(command))
            context.report({ node, messageId: "sleep" });
        }
      }
    };
  }
};

const WORKAROUND_MARKER = /\b(?:TODO|FIXME|HACK|XXX)\b|\bwork-?arounds?\b/i;
const DIRECTIVE = /^\s*(?:eslint|global|exported)\b/;

const noWorkaroundComment = {
  meta: {
    type: "suggestion",
    docs: { description: "Disallow TODO/FIXME/HACK/XXX and workaround comments" },
    schema: [],
    messages: {
      marker: "A TODO/HACK/workaround comment is unenforceable and gets copied as if it " +
        "were intended. Fix the root cause now, or encode the constraint as a test or " +
        "lint rule and track the follow-up on the task board."
    }
  },
  create(context) {
    const source = context.sourceCode;
    return {
      Program() {
        for (const comment of source.getAllComments()) {
          if (DIRECTIVE.test(comment.value)) continue;
          if (WORKAROUND_MARKER.test(comment.value))
            context.report({ loc: comment.loc, messageId: "marker" });
        }
      }
    };
  }
};

const noSilentCatch = {
  meta: {
    type: "problem",
    docs: { description: "Disallow catch blocks without statements" },
    schema: [],
    messages: {
      silent: "An empty catch swallows every failure, including the ones you did not " +
        "expect. Handle the error, rethrow it, or test a named condition " +
        "(for example error.code === \"ENOENT\") and rethrow everything else."
    }
  },
  create(context) {
    return {
      CatchClause(node) {
        if (node.body.body.length === 0) context.report({ node, messageId: "silent" });
      }
    };
  }
};

const DISABLE = /^\s*eslint-disable(?:-next-line|-line)?(?:\s|$)/;

const noBareDisable = {
  meta: {
    type: "suggestion",
    docs: { description: "Require a reason after -- on every eslint-disable comment" },
    schema: [],
    messages: {
      bare: "eslint-disable without a reason. Fix the finding, or name the rule and add " +
        "\"-- <why this case is safe>\" so the exception is reviewable."
    }
  },
  create(context) {
    const source = context.sourceCode;
    return {
      Program() {
        for (const comment of source.getAllComments()) {
          if (!DISABLE.test(comment.value)) continue;
          const reason = comment.value.split(/\s--\s*/)[1];
          if (!reason || !reason.trim()) context.report({ loc: comment.loc, messageId: "bare" });
        }
      }
    };
  }
};

export default {
  meta: { name: "changeloop", version: "1.0.0" },
  rules: {
    "no-timer-wait": noTimerWait,
    "no-workaround-comment": noWorkaroundComment,
    "no-silent-catch": noSilentCatch,
    "no-bare-disable": noBareDisable
  }
};
