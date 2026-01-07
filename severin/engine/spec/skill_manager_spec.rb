require 'spec_helper'
require 'severin/skill_manager'

RSpec.describe Severin::SkillManager do
  let(:root) { File.expand_path("../tmp/spec/project", __dir__) }
  let(:manager) { described_class.new(root) }

  before do
    FileUtils.mkdir_p(File.join(root, "severin/rules/stage1"))
    File.write(File.join(root, "severin/rules/stage1/test_skill.rb"), <<~RUBY)
      define_skill "Test Skill" do
        tag :test_tag
        rule "This is a test rule"
      end
    RUBY

    File.write(File.join(root, "severin_state.rb"), <<~RUBY)
      Severin.draw_state do
        skill :test_tag
      end
    RUBY

    # Reset Severin global state before each test
    Severin.reset!
  end

  after do
    FileUtils.rm_rf(root)
  end

  describe "#active_skills" do
    it "loads and filters skills correctly" do
      # Mock the config load as it might not exist in tmp
      allow(manager).to receive(:load).with(any_args).and_call_original
      allow(File).to receive(:exist?).and_call_original
      allow(File).to receive(:exist?).with(File.join(root, "severin/environments.rb")).and_return(false)

      skills = manager.active_skills

      expect(skills.size).to be >= 1
      test_skill = skills.find { |r| r.suite_name == "Skill: Test Skill" }
      expect(test_skill).not_to be_nil
      expect(test_skill.tags).to include(:test_tag)
      expect(test_skill.rules).to include("This is a test rule")
    end

    it "respects active tags from state" do
      results = manager.active_skills
      expect(results.any? { |r| r.suite_name == "Skill: Test Skill" }).to be true
    end
  end
end
