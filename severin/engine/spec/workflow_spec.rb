require_relative '../lib/severin'
require_relative '../lib/severin/workflow'

RSpec.describe Severin::Workflow do
  let(:workflow) { Severin::Workflow.new }

  it "starts in continue state (ConvArc Identity)" do
    expect(workflow.state).to eq(:continue)
  end

  it "transitions to plan via plan!" do
    workflow.plan!
    expect(workflow.state).to eq(:plan)
  end

  it "transitions from plan to implement via implement!" do
    workflow.plan!
    workflow.implement!
    expect(workflow.state).to eq(:implement)
  end

  it "fails when transitioning implement to implement" do
    workflow.plan!
    workflow.implement!
    expect { workflow.implement! }.to raise_error(/Invalid transition/)
  end

  it "can return to continue via reset!" do
    workflow.plan!
    workflow.reset!
    expect(workflow.state).to eq(:continue)
  end

  it "can move from implement to verify" do
    workflow.plan!
    workflow.implement!
    workflow.verify!
    expect(workflow.state).to eq(:verify)
  end
end
