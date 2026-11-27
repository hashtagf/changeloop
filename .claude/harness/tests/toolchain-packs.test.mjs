import assert from "node:assert/strict";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { detectedProviders, discoverRepositoryQuality } from "../runtime/quality/quality-discovery.mjs";
import {
  QUALITY_PROFILES, profilesForInventory, toolchainPacks, validateToolchainPack
} from "../runtime/quality/language-profiles.mjs";
import { profileCapabilities, validateConsumerQualityConfig, defaultConsumerQualityConfig } from "../runtime/quality/quality-policy.mjs";

// Languages the consumer repositories use: all-repo-ms has Gradle, Flutter,
// Rust and Ruby repositories, zyra-v2 has Terraform; none had a lane.
function repo(t, files) {
  const root = mkdtempSync(join(tmpdir(), "toolchain-packs-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(join(root, path, ".."), { recursive: true });
    if (path.endsWith("/")) mkdirSync(join(root, path), { recursive: true });
    else writeFileSync(join(root, path), body);
  }
  return root;
}

// A PATH holding only the named executables, so a proposal never depends on this machine.
function toolPath(t, names) {
  const bin = mkdtempSync(join(tmpdir(), "toolchain-bin-"));
  t.after(() => rmSync(bin, { recursive: true, force: true }));
  for (const name of names) { writeFileSync(join(bin, name), "#!/bin/sh\n"); chmodSync(join(bin, name), 0o755); }
  return bin;
}

const discover = (root, path, packs = []) => {
  const saved = process.env.PATH;
  process.env.PATH = path;
  try { return discoverRepositoryQuality({ id: "root", path: root, relativePath: "." }, packs); }
  finally { process.env.PATH = saved; }
};

test("every language the consumer repositories use has a shipped pack", () => {
  for (const id of ["toolchain-dart-flutter", "toolchain-jvm-gradle", "toolchain-jvm-maven", "toolchain-rust",
    "toolchain-ruby", "toolchain-terraform", "toolchain-helm", "toolchain-dockerfile", "toolchain-kubernetes",
    "application-js-ts", "application-go", "application-python", "application-php"])
    assert.ok(QUALITY_PROFILES[id], id);
});

test("a Flutter repository gets flutter test and flutter analyze", (t) => {
  const root = repo(t, { "pubspec.yaml": "name: app\n", "lib/main.dart": "void main() {}\n", "test/": "" });
  const found = discover(root, toolPath(t, ["flutter"]));
  assert.ok(found.profiles.includes("toolchain-dart-flutter"));
  assert.deepEqual(found.providers.test.command, ["flutter", "test"]);
  assert.deepEqual(found.providers["static-analysis"].command, ["flutter", "analyze"]);
  assert.equal(found.capabilities.test.status, "available");
});

test("a Gradle repository with a wrapper uses it; without one, the installed gradle", (t) => {
  const wrapped = repo(t, { "build.gradle": "", "gradlew": "#!/bin/sh\n", "src/A.java": "class A {}\n" });
  assert.deepEqual(discover(wrapped, toolPath(t, [])).providers.test.command, ["./gradlew", "test"]);
  const plain = repo(t, { "build.gradle.kts": "", "src/A.kt": "" });
  assert.deepEqual(discover(plain, toolPath(t, ["gradle"])).providers.test.command, ["gradle", "test"]);
  assert.equal(discover(plain, toolPath(t, [])).providers.test, undefined, "no tool, no guess");
});

test("Terraform, Helm and Dockerfile repositories get their static checks", (t) => {
  const terraform = repo(t, { "main.tf": "", "variables.tf": "" });
  const found = discover(terraform, toolPath(t, ["terraform"]));
  assert.ok(found.profiles.includes("toolchain-terraform"));
  assert.deepEqual(found.providers["static-analysis"].command, ["terraform", "fmt", "-check", "-recursive"]);
  const chart = repo(t, { "Chart.yaml": "name: x\n", "templates/a.yaml": "" });
  assert.deepEqual(discover(chart, toolPath(t, ["helm"])).providers["static-analysis"].command, ["helm", "lint", "."]);
  const docker = repo(t, { "Dockerfile": "FROM scratch\n" });
  assert.deepEqual(discover(docker, toolPath(t, ["hadolint"])).providers["static-analysis"].command, ["hadolint", "Dockerfile"]);
});

test("Ruby picks rspec when a spec directory exists", (t) => {
  const root = repo(t, { "Gemfile": "", "spec/a_spec.rb": "", "lib/a.rb": "" });
  assert.deepEqual(discover(root, toolPath(t, ["bundle"])).providers.test.command, ["bundle", "exec", "rspec"]);
});

test("a marker only below the root detects the language but proposes no command", (t) => {
  const root = repo(t, { "README.md": "", "tools/x/Cargo.toml": "", "tools/x/src/main.rs": "" });
  const found = discover(root, toolPath(t, ["cargo"]));
  assert.ok(found.profiles.includes("toolchain-rust"));
  assert.equal(found.providers.test, undefined);
});

test("a Go repository keeps the providers it had", (t) => {
  const root = repo(t, { "go.mod": "module x\n", "main.go": "package main\n" });
  const providers = detectedProviders(root, profilesForInventory({ files: ["go.mod"], extensions: [".go"] }), { path: "" });
  assert.deepEqual(providers.test.command, ["go", "test", "./..."]);
  assert.deepEqual(providers["static-analysis"].command, ["go", "vet", "./..."]);
});

const ELIXIR = { id: "toolchain-elixir", languages: ["elixir"], extensions: [".ex", ".exs"], markers: ["mix.exs"],
  capabilities: ["test"], commands: { test: [{ command: ["mix", "test"] }] } };

test("a project pack teaches discovery a language the harness does not ship", (t) => {
  const root = repo(t, { "mix.exs": "", "lib/a.ex": "" });
  const found = discover(root, toolPath(t, ["mix"]), [ELIXIR]);
  assert.ok(found.profiles.includes("toolchain-elixir"));
  assert.deepEqual(found.languages, ["elixir"]);
  assert.deepEqual(found.providers.test.command, ["mix", "test"]);
  assert.equal(discover(root, toolPath(t, ["mix"])).providers.test, undefined, "without the pack it is unknown");
});

test("a config may declare packs; its profiles take their capabilities from them", () => {
  const config = defaultConsumerQualityConfig([{ id: "root", profiles: ["toolchain-elixir"], providers: {} }]);
  assert.throws(() => validateConsumerQualityConfig(config), /unknown quality profile\(s\): toolchain-elixir/);
  config.toolchains = [ELIXIR];
  assert.equal(validateConsumerQualityConfig(config), config);
  assert.deepEqual(profileCapabilities(["toolchain-elixir"], [ELIXIR]), ["test"]);
  const shipped = toolchainPacks().find((pack) => pack.id === "toolchain-rust");
  const override = { ...shipped, capabilities: ["test"], commands: { test: shipped.commands.test } };
  assert.deepEqual(profileCapabilities(["toolchain-rust"], [override]), ["test"], "a project pack replaces a shipped one by id");
});

test("a malformed pack is refused naming the field", () => {
  const config = defaultConsumerQualityConfig([{ id: "root", profiles: [], providers: {} }]);
  for (const [pack, field] of [
    [{ id: "toolchain-x", markers: ["x"] }, /capabilities must be a non-empty string array/],
    [{ id: "toolchain-x", markers: ["x"], capabilities: [] }, /capabilities must be a non-empty/],
    [{ id: "toolchain-x", markers: "x", capabilities: ["test"] }, /markers must be a string array/],
    [{ id: "toolchain-x", markers: [" "], capabilities: ["test"] }, /markers must be a string array/],
    [{ id: "toolchain-x", extensions: ["ex"], capabilities: ["test"] }, /extensions must start with a dot/],
    [{ id: "toolchain-x", markers: ["x"], capabilities: ["test"], durations: [{}] }, /pattern must be a non-empty string/],
    [{ id: "toolchain-x", markers: ["x"], capabilities: ["test"], durations: [{ pattern: "took" }] }, /needs a capture group/],
    [{ id: "toolchain-x", markers: ["x"], capabilities: ["test"], durations: [{ pattern: "(\\d+)s", flags: "q" }] }, /flags must be/],
    [{ id: "Toolchain X", markers: ["x"], capabilities: ["test"] }, /id must be a lowercase name/],
    [{ id: "toolchain-x", markers: ["x"], capabilities: ["test"], commands: { lint: [{ command: ["x"] }] } }, /commands\.lint is not one of its capabilities/],
    [{ id: "toolchain-x", markers: ["x"], capabilities: ["test"], commands: { test: [{ command: [] }] } }, /command must be a non-empty string array/],
    [{ id: "toolchain-x", markers: ["x"], capabilities: ["test"], durations: [{ pattern: "(" }] }, /valid regular expression/]
  ]) {
    assert.throws(() => validateToolchainPack(pack), field, JSON.stringify(pack));
    assert.throws(() => validateConsumerQualityConfig({ ...config, toolchains: [pack] }), /invalid consumer quality config: toolchains:/);
  }
  assert.throws(() => validateConsumerQualityConfig({ ...config, toolchains: {} }), /toolchains must be an array/);
});

test("a pack without markers or extensions is a profile named by hand, never detected", () => {
  const manual = { id: "toolchain-manual", capabilities: ["test"] };
  assert.equal(validateToolchainPack(manual), manual);
  assert.deepEqual(profilesForInventory({ files: ["x"], extensions: [".x"] }, [manual]).includes("toolchain-manual"), false);
  assert.deepEqual(profileCapabilities(["toolchain-manual"], [manual]), ["test"]);
});

test("without the tool on PATH the language is found but no command is proposed; Flutter test needs test/", (t) => {
  const root = repo(t, { "pubspec.yaml": "name: app\n", "lib/main.dart": "", "test/a_test.dart": "" });
  const none = discover(root, toolPath(t, []));
  assert.ok(none.profiles.includes("toolchain-dart-flutter"));
  assert.equal(none.providers.test, undefined);
  assert.equal(none.providers["static-analysis"], undefined);
  const bare = repo(t, { "pubspec.yaml": "name: app\n", "lib/main.dart": "" });
  const found = discover(bare, toolPath(t, ["flutter"]));
  assert.deepEqual(found.providers["static-analysis"].command, ["flutter", "analyze"]);
  assert.equal(found.providers.test, undefined, "flutter test fails without a test directory");
});
