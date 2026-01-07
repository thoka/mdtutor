module Severin
  module StateMachine
    def self.included(base)
      base.extend(ClassMethods)
    end

    module ClassMethods
      def states_data
        @states_data ||= {}
      end

      def states
        @states_hash ||= {}
      end

      def state(name, options = {}, &block)
        @states_hash ||= {}
        @states_hash[name] = options
        @initial_state = name if options[:initial]

        if block_given?
          states_data[name] ||= {}
          proxy = StateDataProxy.new
          proxy.instance_eval(&block)
          states_data[name].merge!(proxy.data)
        end

        define_method("#{name}?") { state == name }
      end

      def event(name, &block)
        @events ||= {}
        @events[name] = Event.new(name, &block)
        define_method("#{name}!") do |args = {}|
          event = self.class.instance_variable_get(:@events)[name]
          event.fire(self, args)
        end
      end

      attr_reader :initial_state
    end

    class Event
      def initialize(name, &block)
        @name = name
        @transitions = []
        instance_eval(&block)
      end

      def transitions(from:, to:)
        @transitions << { from: Array(from), to: to }
      end

      def fire(obj, args = {})
        trans = @transitions.find { |t| t[:from].include?(:any) || t[:from].include?(obj.state) }
        unless trans
          raise "Invalid transition: Cannot call '#{@name}' from state '#{obj.state}'"
        end

        new_state = trans[:to]

        # Trigger hooks BEFORE state change
        if Severin.respond_to?(:trigger_transition_hooks)
          Severin.trigger_transition_hooks(obj.state, new_state, obj)
        end

        old_state = obj.state
        obj.state = new_state

        # Handle standard metadata from args (e.g. error messages)
        if args[:message] && obj.respond_to?(:last_error=)
          obj.last_error = args[:message]
        end

        # Trigger on_enter logic if defined via Severin.on_state
        if Severin.respond_to?(:state_definitions_for)
          Severin.state_definitions_for(new_state).each do |blk|
            obj.instance_eval(&blk)
          end
        end
      end
    end

    attr_accessor :state

    def initialize_state
      @state = self.class.initial_state
    end
  end

  class StateDataProxy
    attr_reader :data
    def initialize
      @data = { guidance: nil, rules: [] }
    end

    def guidance(text)
      @data[:guidance] = text
    end

    def rule(text)
      @data[:rules] << text
    end
  end
end
