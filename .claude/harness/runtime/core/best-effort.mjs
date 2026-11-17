// The one place a failure is deliberately ignored. Use it only where the
// operation is advisory, a cleanup, or an optional probe whose absence the
// caller already handles; the call site names why in a short comment. Lint
// forbids silent catch blocks everywhere else, so errors that matter surface.

// Runs action and returns its result, or fallback when it throws.
export function bestEffort(action, fallback = undefined) {
  try {
    return action();
  } catch {
    return fallback;
  }
}

// Async form of bestEffort for actions that await.
export async function bestEffortAsync(action, fallback = undefined) {
  try {
    return await action();
  } catch {
    return fallback;
  }
}
