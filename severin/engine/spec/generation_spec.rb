require 'spec_helper'
require_relative '../lib/severin/generator'

RSpec.describe Severin::Generator do
  let(:tmp_root) { File.expand_path("../../tmp/spec/gen_test", __dir__) }
  let(:generator) { Severin::Generator.new(tmp_root) }

  before do
    FileUtils.mkdir_p(tmp_root)
    Severin.reset!
    allow(Severin).to receive(:project_root).and_return(tmp_root)
  end

  after do
    FileUtils.rm_rf(tmp_root)
  end

  it "generates both rigid and filtered .cursorrules" do
    # Environment registrieren
    Severin.define_environment ".cursorrules" do
      format :ai
      chat_language "Deutsch"
      doc_language "English"
    end

    # Suite mit inaktivem Tag
    Severin.define_suite "Inactive Suite" do
      tag :inactive_tag
      rule "Hidden Rule 🔹HIDDEN"
    end

    # Suite mit aktivem Tag
    Severin.define_suite "Active Suite" do
      tag :core
      rule "Visible Rule 🔹VISIBLE"
    end

    Severin.set_focus(tags: [:core])
    Severin.eval_state!

    generator.generate_all

    # 1. Rigid Version (Standard)
    rigid_content = File.read(File.join(tmp_root, ".cursorrules"))
    expect(rigid_content).to include("Hidden Rule 🔹HIDDEN")
    expect(rigid_content).to include("Visible Rule 🔹VISIBLE")
    expect(rigid_content).to include("Complete Context")

    # 2. Filtered Version (Preview)
    filtered_content = File.read(File.join(tmp_root, ".cursorrules.filtered"))
    expect(filtered_content).not_to include("Hidden Rule 🔹HIDDEN")
    expect(filtered_content).to include("Visible Rule 🔹VISIBLE")
    expect(filtered_content).to include("Filtered Context (Preview)")
  end

  it "includes all rules in PROJECT_RULES.md" do
    Severin.define_suite "Any Suite" do
      rule "Common Guideline 🔹GUIDE-1"
    end

    env = Severin::Environment.new("PROJECT_RULES.md")
    env.format :human

    generator.generate_project_rules(env)

    content = File.read(File.join(tmp_root, "PROJECT_RULES.md"))
    expect(content).to include("Common Guideline 🔹GUIDE-1")
  end
end
