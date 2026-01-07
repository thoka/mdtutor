require_relative 'documentable'

module Severin
  class Action
    extend Severin::Documentable
    attr_reader :name, :description_text, :guide_text, :params_def, :execution_block

    def initialize(name, &block)
      @name = name
      @params_def = {}

      # Automatische Registrierung für die DSL
      self.class.instance_variable_set(:@specs, {}) unless self.class.instance_variable_defined?(:@specs)

      instance_eval(&block)

      # Synchronisiere DSL-Metadaten mit den alten Feldern für Rückwärtskompatibilität
      if @description_text
        self.class.spec :call, @description_text do
          # Wir übertragen die Parameter von params_def (falls vorhanden) in die Spec
          # Aber idealerweise wird spec direkt genutzt.
        end
      end
    end

    def description(text)
      @description_text = text
    end

    def guide(text)
      @guide_text = text
    end

    def params(&block)
      ParamBuilder.new(self).instance_eval(&block)
    end

    def execute(&block)
      @execution_block = block
    end

    def full_description
      desc = @description_text || ""
      desc += "\n\nGUIDE:\n#{@guide_text}" if @guide_text
      desc
    end

    def call(args = {})
      # Automatische Zuordnung von Positions-Argumenten zu benannten Parametern
      if args.is_a?(Array) && !args.empty? && !@params_def.empty?
        # Wir ordnen die Argumente der Reihe nach den definierten Parametern zu
        params_hash = {}
        @params_def.keys.each_with_index do |key, index|
          params_hash[key] = args[index] if args[index]
        end
        args = params_hash
      end

      # Validierung (optional, aber hilfreich)
      @params_def.each do |name, opt|
        if opt[:required] && (!args.is_a?(Hash) || !args[name])
          $stderr.puts "❌ Fehler: Parameter '#{name}' fehlt für Aktion '#{@name}'." # SEVERIN_ALLOW_PUTS
          return false
        end
      end

      @execution_block.call(args)
    end

    class ParamBuilder
      def initialize(action)
        @action = action
      end

      def requires(name, options = {})
        @action.params_def[name] = options.merge(required: true)
      end

      def optional(name, options = {})
        @action.params_def[name] = options.merge(required: false)
      end
    end
  end
end
