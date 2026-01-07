require 'spec_helper'
require 'severin/cli'

RSpec.describe Severin::CLI do
  let(:mock_action) { double("Action", description_text: "Mock Action") }
  let(:mock_tool) { double("Tool", description_text: "Mock Tool") }

  before do
    allow(Severin).to receive(:load_all_plugins)
    allow(Severin).to receive(:actions).and_return({ "test-action" => mock_action })
    allow(Severin).to receive(:tools).and_return({ "test-tool" => mock_tool })
  end

  describe ".run" do
    context "when running a registered action" do
      it "executes the action" do
        expect(mock_action).to receive(:call)
        begin
          Severin::CLI.run(["test-action"])
        rescue SystemExit => e
          # Ignore exit
        end
      end
    end

    context "when running a registered tool" do
      it "executes the tool (currently failing)" do
        expect(mock_tool).to receive(:call)
        begin
          Severin::CLI.run(["test-tool"])
        rescue SystemExit => e
          # Expected to exit 1 currently because it's unknown
        end
      end
    end

    context "when running an unknown command" do
      it "exits with an error message" do
        expect {
          begin
            Severin::CLI.run(["unknown"])
          rescue SystemExit
          end
        }.to output(/Unbekannter Befehl: unknown/).to_stdout
      end
    end
  end
end
