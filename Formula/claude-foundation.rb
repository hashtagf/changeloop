class ClaudeFoundation < Formula
  desc "OpenSpec-native change harness for AI coding agents"
  homepage "https://changeloop.ai/"
  url "https://github.com/hashtagf/changeloop/archive/refs/tags/v3.7.3.tar.gz"
  sha256 "bb718f1d0d81c3668e81ee3d8486edaea508ecc54ec049fdb3ec944274b8dfcf"
  license "MIT"
  head "https://github.com/hashtagf/changeloop.git", branch: "main"

  # This formula compiles nothing — `install` only copies files. But Homebrew
  # runs its fatal "Xcode/CLT too outdated" check on every *build-from-source*
  # install (formula_installer.rb: `!pour_bottle? && DevelopmentTools.installed?`),
  # so without a bottle, users on a newer macOS with an older Xcode are blocked
  # for a toolchain they never need. The bottle below makes `pour_bottle?` true
  # on a matching platform and skips that check there.
  #
  # The `bin` wrapper bakes an absolute prefix, so brew produces a *per-platform*
  # bottle (not an `:all` one). An older-macOS bottle pours on newer macOS
  # (forward-compatible), so arm64_sequoia also covers arm64_tahoe; add a
  # `sha256 … <tag>:` line per platform (see .github/workflows/bottle.yml +
  # RELEASING.md). Platforms with no line fall back to build-from-source.
  bottle do
    root_url "https://github.com/hashtagf/changeloop/releases/download/v3.7.3"
    sha256 cellar: :any_skip_relocation, arm64_sequoia: "152b786638b66d06e2e7fb4fa09cfdef7e35af3514848c37313dc456539a07a2"
  end

  def install
    libexec.install ".claude", ".foundation", "openspec",
                    "WORKFLOW.md", "CLAUDE.md", "package.json", "package-lock.json",
                    "foundation.json", "install.sh", "install-cursor.sh",
                    "install-opencode.sh", "install-codex.sh", "install-pi.sh", "cli.sh", "dashboard"

    # VERSION is cli.sh's source of truth for `cloop version`.
    # Ship the repo file when present (HEAD builds, and tags cut after it was
    # added); otherwise synthesize it from the formula version so older stable
    # tarballs that predate the file still report correctly. The repo file wins
    # on HEAD builds, so this never clobbers it with a "HEAD-<sha>" string.
    if File.exist?("VERSION")
      libexec.install "VERSION"
    else
      (libexec/"VERSION").write("#{version}\n")
    end

    # cli.sh routes install/dashboard commands and forwards native workflow
    # commands to the runtime installed in the current project.
    # `cloop` is the one command for people and agents.
    (bin/"cloop").write <<~EOS
      #!/usr/bin/env bash
      exec "#{libexec}/cli.sh" "$@"
    EOS
    chmod 0755, bin/"cloop"
  end

  test do
    help = shell_output("#{bin}/cloop --help")
    assert_match "change start", help
    assert_match "advance", help

    full_help = shell_output("#{bin}/cloop help --all")
    assert_match "proof readiness", full_help
    assert_match "land check", full_help
    assert_match version.to_s, shell_output("#{bin}/cloop version")

    instruction = JSON.parse(shell_output("#{bin}/cloop host instruction changes"))
    assert_equal 1, instruction.fetch("protocol")
    assert_equal "changes", instruction.fetch("command")

    project = testpath/"project"
    project.mkpath
    system bin/"cloop", "init", project, "--yes"
    assert_path_exists project/"foundation.json"
  end
end
