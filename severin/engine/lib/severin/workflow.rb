module Severin
  class Workflow
    include StateMachine

    attr_accessor :last_error
    attr_reader :context

    def initialize
      initialize_state
    end

    # CONVARC STATES
    state :continue, initial: true
    state :clarify
    state :plan
    state :implement
    state :verify
    state :reflect
    state :resumee
    state :align
    state :meta
    state :meta_align
    state :task_end

    # Global reset/any transitions
    event :reset do
      transitions from: :any, to: :continue
    end

    # Sequence events
    event :clarify do
      transitions from: [:continue, :verify], to: :clarify
    end

    event :plan do
      transitions from: [:continue, :clarify, :implement], to: :plan
    end

    event :implement do
      transitions from: [:plan, :verify], to: :implement
    end

    event :verify do
      transitions from: :implement, to: :verify
    end

    event :reflect do
      transitions from: :verify, to: :reflect
    end

    event :resumee do
      transitions from: :reflect, to: :resumee
    end

    event :align do
      transitions from: :resumee, to: :align
    end

    event :meta do
      transitions from: :align, to: :meta
    end

    event :meta_align do
      transitions from: :meta, to: :meta_align
    end

    event :finish do
      transitions from: :meta_align, to: :task_end
    end

    # Legacy mappings (temporary)
    alias_method :plan!, :plan!
    alias_method :implement!, :implement!
  end
end
