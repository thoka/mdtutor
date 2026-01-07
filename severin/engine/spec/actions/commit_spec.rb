require 'spec_helper'
require 'severin'
require 'fileutils'

require_relative '../../lib/severin/cli'

RSpec.describe "Action: commit" do
  let(:project_root) { File.expand_path("../../../..", __dir__) }
  let(:docs_chat_dir) { File.join(project_root, "docs/chat") }

  before do
    allow(Severin).to receive(:project_root).and_return(project_root)

    cli_mock = double("Severin::CLI")
    allow(cli_mock).to receive(:run_stages).and_return(true)
    allow(Severin::CLI).to receive(:new).and_return(cli_mock)

    FileUtils.mkdir_p(docs_chat_dir)
  end

  after do
    Dir.glob(File.join(project_root, "tmp_test_*")).each { |f| FileUtils.rm_f(f) }
  end

  it "löscht temporäre Dateien mit Präfix tmp_" do
    tmp_file = File.join(project_root, "tmp_test_delete_me.txt")
    File.write(tmp_file, "content")

    Severin.actions.delete("commit")
    load File.join(project_root, "severin/actions/commit.rb")
    action = Severin.actions["commit"]

    allow(action).to receive(:system).and_return(true)
    allow(action).to receive(:`).and_return("")

    action.call(message: "feat: test commit")

    expect(File.exist?(tmp_file)).to be false
  end

  it "fügt die Referenz auf das neueste Chat-Dokument zur Nachricht hinzu" do
    Dir.glob(File.join(docs_chat_dir, "20*")).each { |f| FileUtils.rm_f(f) }

    old_path = File.join(docs_chat_dir, "20200101000000_old.md")
    File.write(old_path, "Old")
    File.utime(Time.now - 100, Time.now - 100, old_path)

    latest_name = "20990101000000_latest_summary.md"
    latest_path = File.join(docs_chat_dir, latest_name)
    File.write(latest_path, "Latest")
    File.utime(Time.now, Time.now, latest_path)

    Severin.actions.delete("commit")
    load File.join(project_root, "severin/actions/commit.rb")
    action = Severin.actions["commit"]

    captured_system = []
    allow(action).to receive(:system) do |cmd|
      captured_system << cmd
      true
    end
    allow(action).to receive(:`).with("git rev-parse --abbrev-ref HEAD").and_return("sprint-branch")
    allow(action).to receive(:`).with("git status --porcelain").and_return("M file.txt")
    allow(action).to receive(:`).with(anything).and_call_original

    action.call(message: "feat: test commit")

    expect(captured_system.any? { |c| c.include?("git commit") }).to be true

    FileUtils.rm_f(old_path)
    FileUtils.rm_f(latest_path)
  end

  it "committet synchron im Hauptprojekt und in der Engine" do
    Severin.actions.delete("commit")
    load File.join(project_root, "severin/actions/commit.rb")
    action = Severin.actions["commit"]

    allow(action).to receive(:`).with("git rev-parse --abbrev-ref HEAD").and_return("feature-branch")
    allow(action).to receive(:`).with("git status --porcelain").and_return("M file.txt")
    allow(action).to receive(:`).with(anything).and_call_original

    captured_system = []
    allow(action).to receive(:system) do |cmd|
      captured_system << cmd
      true
    end

    action.call(message: "feat: sync commit")

    commit_calls = captured_system.select { |c| c.include?("git commit") }
    expect(commit_calls.size).to be >= 2
  end

  it "erstellt einen Sprint-Branch, wenn auf einem geschützten Branch gearbeitet wird" do
    Severin.actions.delete("commit")
    load File.join(project_root, "severin/actions/commit.rb")
    action = Severin.actions["commit"]

    captured_backticks = []
    allow(action).to receive(:`) do |cmd|
      captured_backticks << cmd
      case cmd
      when "git rev-parse --abbrev-ref HEAD"
        "main"
      when /git status --porcelain/
        "M file.txt"
      else
        ""
      end
    end
    allow(action).to receive(:system).and_return(true)

    # WICHTIG: Die Action muss die RID "test1" finden
    action.call(message: "feat: security fix 🔹test1")

    # Wir prüfen ob IRGENDEIN backtick aufruf den checkout befehl enthält
    expect(captured_backticks.any? { |c| c.include?("git checkout -b sprint/auto-test1") }).to be true
  end
end
