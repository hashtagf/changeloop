# frozen_string_literal: true

# Installs the Change Loop CLI and its project installer.
class Cloop < Formula
  desc "OpenSpec-native change harness for AI coding agents"
  homepage "https://changeloop.ai/"
  url "https://github.com/hashtagf/changeloop/archive/refs/tags/v3.7.5.tar.gz"
  sha256 "b5d8becb02b38d9b9e0f9e095004cfbc929ece450449fd403be1e9b51b65c382"
  license "MIT"
  head "https://github.com/hashtagf/changeloop.git", branch: "main"

  # Add bottle metadata only after a bottle under the cloop name is published.

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
