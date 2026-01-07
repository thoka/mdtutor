require 'spec_helper'
require 'severin/actions/skills_action'

RSpec.describe Severin::Actions::SkillsAction do
  let(:options) { { full: false } }
  let(:action) { described_class.new(options) }
  let(:root) { File.expand_path("../tmp/spec/project_action", __dir__) }

  before do
    FileUtils.mkdir_p(File.join(root, "severin/rules/stage1"))
    File.write(File.join(root, "severin/rules/stage1/test_skill.rb"), <<~RUBY)
      define_skill "Action Test Skill" do
        tag :action_tag
        rule "Action rule"
        description "Action description"
      end
    RUBY

    File.write(File.join(root, "severin_state.rb"), <<~RUBY)
      Severin.draw_state do
        skill :action_tag
      end
    RUBY

    Severin.reset!
    allow(action).to receive(:find_root).and_return(root)
    # Redirect stdout to capture output
    @output = StringIO.new
    $stdout = @output
  end

  after do
    $stdout = STDOUT
    FileUtils.rm_rf(root)
  end

  describe "#call" do
    it "displays active skills" do
      action.call
      expect(@output.string).to include("Action Test Skill")
      expect(@output.string).to include("[action_tag]")
    end

    it "works when called from a subdirectory" do
      subdir = File.join(root, "some/deep/subdir")
      FileUtils.mkdir_p(subdir)

      # We simulate the directory change
      allow(Dir).to receive(:pwd).and_return(subdir)
      # We ensure the real find_root is called
      allow(action).to receive(:find_root).and_call_original

      action.call
      expect(@output.string).to include("Action Test Skill")
    end

    context "with full option" do
      let(:options) { { full: true } }

      it "displays rules and description" do
        action.call
        expect(@output.string).to include("Beschreibung:")
        expect(@output.string).to include("Action description")
        expect(@output.string).to include("Rules:")
        expect(@output.string).to include("Action rule")
      end
    end
  end
end
