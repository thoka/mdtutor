require 'spec_helper'
require 'fileutils'
require 'tmpdir'
require 'open3'

RSpec.describe "Fail-Fast Integration" do
  let(:tmp_root) { Dir.mktmpdir("severin_test") }
  let(:engine_bin) { File.expand_path("../bin/sv", __dir__) }

  before do
    # Erstelle Projektstruktur
    FileUtils.mkdir_p(File.join(tmp_root, "severin/rules/1-first"))
    FileUtils.mkdir_p(File.join(tmp_root, "severin/rules/2-second"))

    # Simuliere das Vorhandensein der Engine im Test-Root für bin/sv
    FileUtils.mkdir_p(File.join(tmp_root, "severin/engine"))

    # Mock severin_state.rb
    File.write(File.join(tmp_root, "severin_state.rb"), "Severin.draw_state { focus :test }")

    # Mock environments.rb
    FileUtils.mkdir_p(File.join(tmp_root, "severin"))
    File.write(File.join(tmp_root, "severin/environments.rb"), "define_environment('.cursorrules')")
  end

  after do
    FileUtils.remove_entry(tmp_root)
  end

  def run_sv(args = [])
    # Wir müssen sicherstellen, dass die Engine im LOAD_PATH ist
    lib_path = File.expand_path("../lib", __dir__)
    env = { "RUBYLIB" => lib_path, "SEVERIN_HOME" => File.expand_path("..", __dir__) }
    Open3.capture3(env, "ruby", engine_bin, *args, chdir: tmp_root)
  end

  it "stops execution immediately when a stage fails and DOES NOT load next stage" do
    # Stage 1: Failing rule
    File.write(File.join(tmp_root, "severin/rules/1-first/fail.rb"), <<~RUBY)
      define_suite "Failing Suite" do
        check "Always Fails" do
          condition { false }
        end
      end
    RUBY

    # Stage 2: Sentinel file that SHOULD NOT be created
    sentinel_path = File.join(tmp_root, "should_not_exist.tmp")
    File.write(File.join(tmp_root, "severin/rules/2-second/sentinel.rb"), <<~RUBY)
      File.write("#{sentinel_path}", "I was loaded!")
    RUBY

    stdout, stderr, status = run_sv(["check"])

    expect(status.exitstatus).to eq(1)
    expect(stdout).to include("🛑 KRITISCHER FEHLER: Stage '1-first' enthält Fehler")
    expect(File.exist?(sentinel_path)).to be false
  end

  it "continues to next stage if previous stage passes" do
    # Stage 1: Passing rule
    File.write(File.join(tmp_root, "severin/rules/1-first/pass.rb"), <<~RUBY)
      define_suite "Passing Suite" do
        check "Always Passes" do
          condition { true }
        end
      end
    RUBY

    # Stage 2: Sentinel file that SHOULD be created
    sentinel_path = File.join(tmp_root, "should_exist.tmp")
    File.write(File.join(tmp_root, "severin/rules/2-second/sentinel.rb"), <<~RUBY)
      File.write("#{sentinel_path}", "I was loaded!")
    RUBY

    stdout, stderr, status = run_sv(["check"])

    expect(status.exitstatus).to eq(0)
    expect(File.exist?(sentinel_path)).to be true
  end
end
