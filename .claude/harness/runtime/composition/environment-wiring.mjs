// Composition: the runtime environment, command registry, instruction
// recorder, and source cohort provider. Wiring only.
import { ADVANCE_PROTOCOL_VERSION } from "../workflow/advance/advance-envelope.mjs";
import { DELIVERY_PROTOCOL_VERSION, DELIVERY_RECEIPT_SCHEMA_VERSION } from "../workflow/delivery/delivery-projection.mjs";
import { FEEDBACK_SCHEMA_VERSION } from "../observability/feedback-runtime.mjs";
import { createCommandRegistry } from "../core/command-registry.mjs";
import { createInstructionRecorder } from "../core/instruction-recorder.mjs";
import { createRuntimeEnvironment, policyExecutionLimit } from "../core/runtime-environment.mjs";
import { createSourceCohortProvider } from "../observability/metrics-runtime.mjs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isSharedProject } from "../core/project-installation.mjs";

// The harness directory (.claude/harness), two levels above this module.
const HARNESS_DIRECTORY = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

export function composeEnvironment({
  ACCEPTANCE_PROTOCOL_VERSION, ADAPTER_PROTOCOL_VERSION, AGENT_PLAN_SCHEMA_VERSION,
  ATTESTATION_PROTOCOL_VERSION, AUTHORITY_PROTOCOL_VERSION,
  AUTOMATED_MUTATION_PROTOCOL_VERSION, CI_EVIDENCE_PROTOCOL_VERSION,
  COMMAND_TELEMETRY_SCHEMA_VERSION, CONTEXT_EVENT_SCHEMA_VERSION, CRAP_PROTOCOL_VERSION,
  INSTRUCTION_MANIFESTS, METRICS_SCHEMA_VERSION, PACKET_SCHEMA_VERSION, PROOF_PROTOCOL_VERSION,
  PROVIDER_PROTOCOL_VERSION, QUALITY_CAPABILITIES_PROTOCOL_VERSION,
  REVIEW_PACKET_SCHEMA_VERSION, REVIEW_PROTOCOL_VERSION, ROOT, RUNTIME_API_VERSION,
  SEMANTIC_ACCEPTANCE_PROTOCOL_VERSION, VERSION, commandPhaseRecorder, die, readJson,
  writeJson
}) {
  process.on("exit", (code) => commandPhaseRecorder.finish(code));

  const {
    describeCommand,
    assertRegisteredRuntimeCommand
  } = createCommandRegistry({
    path: join(HARNESS_DIRECTORY, "commands.json"),
    readJson,
    fail: die
  });

  const {
    protocolDescriptor,
    commandExists,
    playwrightAvailability,
    foundationPolicy,
    reviewAssurancePosture
  } = createRuntimeEnvironment({
    root: ROOT,
    // During Foundation's own Build, state remains pinned to the control root
    // while the candidate entrypoint runs from its sandbox. Protocol integrity
    // belongs to that executable bundle, not to the state root it operates on.
    protocolPath: join(HARNESS_DIRECTORY, "protocol.json"),
    policyPath: isSharedProject(ROOT) ? join(ROOT, 'foundation.json') : join(HARNESS_DIRECTORY, "..", "..", "foundation.json"),
    protocols: {
      runtime: VERSION,
      runtimeApi: RUNTIME_API_VERSION,
      providerProtocol: PROVIDER_PROTOCOL_VERSION,
      adapterProtocol: ADAPTER_PROTOCOL_VERSION,
      proofProtocol: PROOF_PROTOCOL_VERSION,
      packetSchema: PACKET_SCHEMA_VERSION,
      agentPlanSchema: AGENT_PLAN_SCHEMA_VERSION,
      contextEventSchema: CONTEXT_EVENT_SCHEMA_VERSION,
      metricsSchema: METRICS_SCHEMA_VERSION,
      advanceProtocol: String(ADVANCE_PROTOCOL_VERSION),
      feedbackSchema: String(FEEDBACK_SCHEMA_VERSION),
      commandTelemetrySchema: COMMAND_TELEMETRY_SCHEMA_VERSION,
      reviewProtocol: REVIEW_PROTOCOL_VERSION,
      acceptanceProtocol: ACCEPTANCE_PROTOCOL_VERSION,
      semanticAcceptanceProtocol: SEMANTIC_ACCEPTANCE_PROTOCOL_VERSION,
      reviewPacketSchema: REVIEW_PACKET_SCHEMA_VERSION,
      attestationProtocol: ATTESTATION_PROTOCOL_VERSION,
      authorityProtocol: AUTHORITY_PROTOCOL_VERSION,
      ciEvidenceProtocol: CI_EVIDENCE_PROTOCOL_VERSION,
      qualityCapabilitiesProtocol: QUALITY_CAPABILITIES_PROTOCOL_VERSION,
      crapProtocol: CRAP_PROTOCOL_VERSION,
      automatedMutationProtocol: AUTOMATED_MUTATION_PROTOCOL_VERSION,
      deliveryProtocol: String(DELIVERY_PROTOCOL_VERSION),
      deliveryReceiptSchema: String(DELIVERY_RECEIPT_SCHEMA_VERSION)
    },
    readJson,
    fail: die
  });
  const maxParallelProviders = policyExecutionLimit.bind(
    null, foundationPolicy, "maxParallelProviders");

  const sourceCohort = createSourceCohortProvider({
    runtimeVersion: VERSION,
    protocolBundle: protocolDescriptor(),
    directory: HARNESS_DIRECTORY
  });
  const { recordInstructionManifest } = createInstructionRecorder({
    root: ROOT,
    foundationVersion: VERSION,
    instructionManifests: INSTRUCTION_MANIFESTS,
    writeJson
  });
  return {
    assertRegisteredRuntimeCommand, commandExists, describeCommand, foundationPolicy,
    maxParallelProviders, playwrightAvailability, protocolDescriptor,
    recordInstructionManifest, reviewAssurancePosture, sourceCohort
  };
}
