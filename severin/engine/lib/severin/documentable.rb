module Severin
  module Documentable
    def self.extended(base)
      base.instance_variable_set(:@specs, {})
    end

    def spec(method_name = nil, description, &block)
      @current_spec = {
        description: description,
        params: {},
        rid: nil
      }

      DocBuilder.new(@current_spec).instance_eval(&block) if block_given?

      if method_name
        @specs ||= {}
        @specs[method_name] = @current_spec
        @current_spec = nil
      end
    end

    # Hook to catch method definitions if no name was provided to spec
    def method_added(method_name)
      if @current_spec
        @specs ||= {}
        @specs[method_name] = @current_spec
        @current_spec = nil
      end
      super
    end

    def specs
      @specs || {}
    end

    def last_spec
      @specs&.values&.last
    end

    class DocBuilder
      def initialize(spec)
        @spec = spec
      end

      def param(name, type: :string, desc: "", required: false)
        @spec[:params][name] = { type: type, desc: desc, required: required }
      end

      def satisfies(rid)
        @spec[:rid] = rid
      end
    end
  end
end
