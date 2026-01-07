require 'spec_helper'
require 'severin/suite'
require 'severin/cli'

RSpec.describe "Programmatic Fixes" do
  let(:root) { File.expand_path("../../tmp/fix_spec", __dir__) }

  before do
    FileUtils.mkdir_p(File.join(root, "severin/rules/1-test"))
    File.write(File.join(root, "severin_state.rb"), "Severin.draw_state { workflow :implementation }")
    Severin.project_root = root
    Severin.reset!
  end

  after do
    FileUtils.rm_rf(root)
  end

  it "executes a programmatic fix when a check fails and re-verifies" do
    @condition_met = false

    Severin.define_suite "Test Suite" do
      check "Failing Check with Fix" do
        condition { @condition_met }
        fix { @condition_met = true }
      end
    end

    expect(Severin.all_results.first.checks.first[:passed]).to be true
    expect(Severin.all_results.first.checks.first[:autofixed]).to be true
  end

  it "can modify the filesystem in a fix block" do
    test_file = File.join(root, "fix_me.txt")

    Severin.define_suite "File Fix Suite" do
      check "Missing File" do
        condition { File.exist?(test_file) }
        fix { File.write(test_file, "fixed") }
      end
    end

    expect(File.exist?(test_file)).to be true
    expect(File.read(test_file)).to eq("fixed")
    expect(Severin.all_results.last.checks.first[:passed]).to be true
  end

  it "marks fixed checks with a specific message for the formatter" do
    Severin.define_suite "Message Suite" do
      check "Auto Fix Message" do
        condition { @fixed ||= false }
        fix { @fixed = true }
      end
    end

    check = Severin.all_results.last.checks.first
    expect(check[:passed]).to be true
    expect(check[:autofixed]).to be true
  end

  it "catches and logs exceptions in fix blocks" do
    Severin.define_suite "Error Suite" do
      check "Crashing Fix" do
        condition { false }
        fix { raise "Boom" }
      end
    end

    check = Severin.all_results.last.checks.first
    expect(check[:passed]).to be false
    expect(check[:exception]).to be_a(StandardError)
    expect(check[:exception].message).to eq("Boom")
    expect(check[:message]).to include("Autofix fehlgeschlagen: Boom")
  end
end
