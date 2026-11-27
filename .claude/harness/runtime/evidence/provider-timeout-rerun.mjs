import { providerTimeoutDetail } from "./provider-catalog.mjs";

// A provider whose latest receipt timed out on this exact content and
// configuration would only time out again: Prove reports that instead of
// waiting the same limit a second time. FOUNDATION_RERUN_TIMED_OUT=1 runs it
// anyway, for a machine that was only briefly slow.
export const RERUN_TIMED_OUT_ENV = "FOUNDATION_RERUN_TIMED_OUT";

/** The error outcome that replaces the run, or null to run the provider. */
export function timedOutRerunSkip({ receiptValidity, env = process.env }, id, provider, config) {
  if (env[RERUN_TIMED_OUT_ENV] === "1") return null;
  let validity;
  try { validity = receiptValidity(id, provider); } catch { return null; }
  if (validity?.validity !== "error" || !validity.timedOut) return null;
  return {
    status: "error",
    detail: `not run again: its latest run on this same content and configuration ended with ` +
      `'${validity.observed}'. ${providerTimeoutDetail(provider, config)}; or split the slow part ` +
      `into its own provider, or close what keeps the run open. To retry unchanged once, set ${RERUN_TIMED_OUT_ENV}=1`
  };
}
