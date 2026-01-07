require 'spec_helper'
require 'severin/state_machine'

RSpec.describe Severin::StateMachine do
  class TestModel
    include Severin::StateMachine

    attr_accessor :last_error

    state :stopped, initial: true
    state :starting
    state :running
    state :error

    event :boot do
      transitions from: :stopped, to: :starting
    end

    event :up do
      transitions from: :starting, to: :running
    end

    event :fail do
      transitions from: [:starting, :running], to: :error
    end

    def initialize
      initialize_state
    end
  end

  let(:model) { TestModel.new }

  it "sets the initial state" do
    expect(model.state).to eq(:stopped)
  end

  it "performs a valid transition" do
    model.boot!
    expect(model.state).to eq(:starting)
    expect(model.starting?).to be true
  end

  it "raises error on invalid transition" do
    expect { model.up! }.to raise_error(/Invalid transition/)
  end

  it "supports transitioning to error with a message" do
    model.boot!
    model.fail!(message: "Something went wrong")
    expect(model.state).to eq(:error)
    expect(model.last_error).to eq("Something went wrong")
  end

  it "supports multiple 'from' states" do
    model.boot!
    model.up!
    model.fail!(message: "Crash")
    expect(model.state).to eq(:error)
  end
end

