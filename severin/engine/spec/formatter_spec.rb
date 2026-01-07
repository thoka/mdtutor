require 'spec_helper'
require 'severin/formatter'
require 'stringio'

RSpec.describe Severin::HumanFormatter do
  let(:output) { StringIO.new }
  let(:check_source) { "#{Dir.pwd}/severin/rules/test_rule.rb:10" }
  let(:result) do
    instance_double(
      "Severin::Suite::Result",
      suite_name: "Test Suite",
      success?: false,
      checks: [
        {
          name: "Test Check 🔹12345",
          passed: false,
          severity: :error,
          message: "Failure message",
          source: check_source,
          autofixed: false
        }
      ]
    )
  end

  subject { described_class.new(result, output: output) }

  it "displays the full (absolute) path of the check source" do
    subject.display
    output.rewind
    content = output.read

    # Der aktuelle Formatter kürzt den Pfad relativ zu Dir.pwd
    # Wir wollen aber sicherstellen, dass er den vollen Pfad anzeigt
    expect(content).to include("📍 Check definiert in: #{check_source}")
  end
end
