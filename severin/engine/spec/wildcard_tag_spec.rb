require 'spec_helper'
require_relative '../lib/severin/generator'

RSpec.describe "Severin::Generator Wildcard Tag" do
  let(:tmp_root) { File.expand_path("../../tmp/spec/wildcard_test", __dir__) }
  let(:generator) { Severin::Generator.new(tmp_root) }

  before do
    FileUtils.mkdir_p(tmp_root)
    Severin.reset!
    allow(Severin).to receive(:project_root).and_return(tmp_root)
  end

  after do
    FileUtils.rm_rf(tmp_root)
  end

  it "includes skills with the wildcard tag :* even when not in focus" do
    # Environment registrieren
    Severin.define_environment ".cursorrules" do
      format :ai
    end

    # Skill mit Wildcard-Tag
    Severin.define_skill "Always Active Skill" do
      tag :*
      rule "Always Visible Rule 🔹ALWAYS"
    end

    # Normaler Skill ohne aktives Tag
    Severin.define_skill "Normal Skill" do
      tag :normal
      rule "Hidden Rule 🔹HIDDEN"
    end

    # Wir setzen den Fokus auf ein ganz anderes Tag
    Severin.set_focus(tags: [:other_tag])
    Severin.eval_state!

    generator.generate_all

    filtered_content = File.read(File.join(tmp_root, ".cursorrules.filtered"))

    # Der Wildcard-Skill MUSS drin sein
    expect(filtered_content).to include("Always Visible Rule 🔹ALWAYS")

    # Der normale Skill darf NICHT drin sein
    expect(filtered_content).not_to include("Hidden Rule 🔹HIDDEN")
  end

  it "fails when other tags are defined alongside the wildcard tag :*" do
    expect {
      Severin.define_skill "Invalid Skill" do
        tag :*, :other_tag
        rule "Should fail 🔹FAIL"
      end
    }.to raise_error(RuntimeError, /Wildcard tag :\* must be the only tag/)
  end
end
