import assert from "node:assert/strict";
import test from "node:test";
import { lightKind } from "../runtime/workflow/validation/dev-document.mjs";
import { verifyPathIssues, verifyTestFileReferences } from "../runtime/workflow/draft/amendment-verify.mjs";
import { designBlueprintWarnings } from "../runtime/workflow/validation/design-blueprints.mjs";

test("JVM, .NET, PHP, Swift, Dart, Elixir, and Ruby test files are tests", () => {
  for (const path of ["src/test/java/FooTest.java", "app/FooTest.kt", "app/FooTests.swift",
    "Billing.Tests/InvoiceSpec.cs", "Billing.Test/Invoice.cs", "src/InvoiceTest.php",
    "lib/calc_test.dart", "lib/calc_test.exs", "lib/calc_spec.rb", "pkg/calc_test.go",
    "app/UITest.kt", "src/APITest.java", "src/UserDTOTest.java", "src/RESTTests.cs", "src/Test.java"])
    assert.equal(lightKind(path), "test", path);
});

test("dependency manifests of these ecosystems are dependency files", () => {
  for (const path of ["pom.xml", "app/build.gradle.kts", "settings.gradle", "gradle.lockfile",
    "Api.csproj", "packages.lock.json", "Directory.Packages.props", "pubspec.yaml", "pubspec.lock",
    "mix.exs", "mix.lock", "Package.swift", "Package.resolved", "go.work"])
    assert.equal(lightKind(path), "dependency", path);
});

test("words that only end in test are product code", () => {
  for (const path of ["src/Contest.java", "src/Latest.cs", "src/attest.php", "src/Testing.java"])
    assert.equal(lightKind(path), "", path);
});

test("a verify naming a missing test class is reported", () => {
  assert.deepEqual(verifyTestFileReferences("./gradlew test --tests app/MissingTest.java"),
    ["app/MissingTest.java"]);
  assert.deepEqual(verifyTestFileReferences("./gradlew test --tests app/UITest.kt"), ["app/UITest.kt"]);
  assert.deepEqual(verifyTestFileReferences("./gradlew test --tests app/CalcTest.groovy"), ["app/CalcTest.groovy"]);
  assert.deepEqual(verifyTestFileReferences("php vendor/bin/phpunit src/Contest.php"), []);
  const issues = verifyPathIssues([{ key: "jvm", verify: "./gradlew test --tests app/MissingTest.java", paths: ["src/**"] }],
    { exists: () => false });
  assert.match(issues.join("\n"), /verify references 'app\/MissingTest\.java', which does not exist/);
  assert.deepEqual(verifyPathIssues([{ key: "jvm", verify: "./gradlew test --tests app/MissingTest.java",
    paths: ["app/**"] }], { exists: () => false }), []);
});

test("a task verifying another task's test class is warned like a *.test.* file", () => {
  const warnings = designBlueprintWarnings({ tasks: [
    { key: "feature", paths: ["src/main/**"], verify: "mvn test -Dtest=src/test/java/CalcTest.java" },
    { key: "api", paths: ["src/main/**"], verify: "mvn test -Dtest=src/test/java/APITest.java" },
    { key: "tests", paths: ["src/test/**"], verify: "mvn test" }] });
  assert.match(warnings.join("\n"),
    /task 'feature' verifies with 'src\/test\/java\/CalcTest\.java' outside its paths \(owned by 'tests'\)/);
  assert.match(warnings.join("\n"), /task 'api' verifies with 'src\/test\/java\/APITest\.java'/);
});
