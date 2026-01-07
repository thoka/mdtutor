require_relative '../lib/severin'
require_relative '../lib/severin/workflow'

RSpec.describe "Severin::Workflow Hook System (ConvArc Identity)" do
  let(:workflow) { Severin::Workflow.new }

  before(:each) do
    # Clear hooks before each test
    Severin.instance_variable_set(:@transition_hooks, [])
    Severin.instance_variable_set(:@state_definitions, {})
  end

  # NEW CONVARC STATES
  it "defines the complete set of ConvArc states" do
    expected_states = [
      :continue, :clarify, :plan, :implement, :verify,
      :reflect, :resumee, :align, :meta, :meta_align, :task_end
    ]
    expect(Severin::Workflow.states.keys).to include(*expected_states)
  end

  # HOOK SYSTEM
  describe "Hook System (Rails/Discourse Style)" do
    it "allows skills to register 'before_transition' hooks" do
      hook_called = false
      Severin.on_transition(to: :implement) do
        hook_called = true
      end

      workflow.plan!
      workflow.implement!
      expect(hook_called).to be true
    end

    it "blocks transition if a 'before_transition' hook returns false" do
      Severin.on_transition(to: :implement) do
        false # Block transition
      end

      workflow.plan!
      expect { workflow.implement! }.to raise_error(Severin::TransitionBlockedError)
    end

    it "executes 'on_enter' logic for a state" do
      entered = false
      Severin.on_state(:meta_align) do
        entered = true
      end

      # Navigate to meta_align (assuming path exists)
      workflow.plan!
      workflow.implement!
      workflow.verify!
      workflow.reflect!
      workflow.resumee!
      workflow.align!
      workflow.meta!
      workflow.meta_align!

      expect(entered).to be true
    end
  end
end
