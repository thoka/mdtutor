module Severin
  class Result
    attr_reader :suite_name, :checks, :rules_with_metadata
    attr_accessor :description

    def initialize(suite_name)
      @suite_name = suite_name
      @description = ""
      @checks = []
      @rules_with_metadata = []
      @tags = []
      @prompt_files = {}
      @references = []
    end

    def add_tag(tag)
      @tags << tag.to_sym unless @tags.include?(tag.to_sym)
    end

    def tags; @tags; end

    def add_prompt_file(name, content)
      @prompt_files[name.to_s] = content
    end

    def prompt_files; @prompt_files; end

    def add_reference(path)
      @references << path unless @references.include?(path)
    end

    def references; @references; end

    def add_check(check_data)
      @checks << check_data
    end

    def add_rule(text, metadata = {})
      @rules_with_metadata << { text: text, metadata: metadata }
    end

    def rules
      @rules_with_metadata.map { |r| r[:text] }
    end

    def success?
      @checks.all? do |c|
        c[:passed] || (c[:severity] == :warning && Severin.allow_warnings.include?(c[:name].to_sym))
      end
    end
  end

  class CheckContext
    attr_reader :data
    def initialize(name)
      normalized_name = name.to_s.gsub(/\s+🔹[a-zA-Z0-9]{5}/, '').strip.to_sym
      severity = Severin.allow_warnings.include?(normalized_name) ? :warning : :error

      @data = {
        name: name, passed: false, autofixed: false, target: nil, message: nil,
        fix_command: nil, fix_action: nil, rule: "", source: nil, severity: severity,
        guidance: {}
      }
      @required_services = []
      loc = caller_locations(3, 1).first
      @data[:source] = "#{loc.path}:#{loc.lineno}" if loc
    end

    def target(path = nil); @data[:target] = path if path; @data[:target]; end
    def condition(&block); @condition_block = block; end

    def rspec(spec_path)
      condition do
        # Engine-Kontext für Bundler sicherstellen
        engine_path = File.expand_path("../..", __dir__)
        gemfile_path = File.join(engine_path, "Gemfile")

        cmd = ""
        if File.exist?(gemfile_path)
          cmd = "BUNDLE_GEMFILE=#{gemfile_path} bundle exec "
        end

        system("#{cmd}rspec #{spec_path} --format documentation")
      end
    end

    def on_fail(*args)
      @data[:message_tags] = args.select { |a| a.is_a?(Symbol) }
      @data[:message] = args.pop if args.last.is_a?(String)
    end

    def fix(*args, &block)
      if block_given?
        @data[:fix_action] = block
      else
        @data[:fix_tags] = args.select { |a| a.is_a?(Symbol) }
        @data[:fix_command] = args.pop if args.last.is_a?(String)
      end
    end

    def rule(*args)
      @data[:rule] = args.pop if args.last.is_a?(String)
      @data[:tags] = args.select { |a| a.is_a?(Symbol) }
    end

    def sh(cmd)
      Severin.sh(cmd)
    end

    def options
      Severin.current_options
    end

    def guidance(scenario, text)
      @data[:guidance][scenario.to_sym] = text
    end

    def run
      stage_idx = Severin.current_stage_index
      Severin.log_debug("Running check: #{@data[:name]}", source: @data[:source], stage: stage_idx)
      catch(:halt_check) do
        @data[:passed] = !!@condition_block.call
      end

      # Automatische Fixes sofort ausführen, falls der Check fehlschlägt
      if !@data[:passed] && @data[:fix_action]
        Severin.log_debug("Executing immediate programmatic fix for: #{@data[:name]}", stage: stage_idx)
        begin
          @data[:fix_action].call
          # Bedingung nach dem Fix erneut prüfen
          @data[:passed] = !!@condition_block.call
          @data[:autofixed] = true if @data[:passed]
        rescue => e
          @data[:passed] = false
          @data[:exception] = e
          @data[:message] = "Autofix fehlgeschlagen: #{e.message}"
          Severin.log_debug("Programmatic fix FAILED for: #{@data[:name]}", error: e.message)
        end
      end

      log_data = { passed: @data[:passed], stage: stage_idx }
      log_data[:message] = @data[:message] unless @data[:passed] # Nur bei Fehler loggen

      Severin.log_debug("Check result: #{@data[:name]}", **log_data)
      @data
    rescue => e
      @data[:passed] = false
      @data[:message] = "Fehler: #{e.message}"
      Severin.log_debug("Check ERROR: #{@data[:name]}", error: e.message)
      @data
    end
  end

  class Suite
    def initialize(name, &block)
      stage_idx = Severin.current_stage_index
      Severin.log_debug("Initializing Suite: #{name}", stage: stage_idx)
      @result = Result.new(name)
      instance_eval(&block)
    end

    def rule(*args, **metadata)
      text = args.pop if args.last.is_a?(String)
      @result.add_rule(text, metadata.merge(tags: args))
    end

    def guidance(tag, text)
      Severin.register_guidance(tag, text)
    end

    def tag(*args)
      args.each do |t|
        @result.add_tag(t)
        Severin.register_tag(t)
      end
    end
    alias_method :tags, :tag

    def prompt_file(name, content)
      @result.add_prompt_file(name, content)
    end

    def use_mcp(name, command: nil, args: [])
      Severin.mcp(name, command, args)
    end

    def references(*paths)
      paths.each { |p| @result.add_reference(p) }
    end

    def check(name, &block)
      ctx = CheckContext.new(name)
      ctx.instance_eval(&block)
      @result.add_check(ctx.run)
    end

    def on_state(state_id, &block)
      # Registriert einen Callback, der im Kontext dieser Suite ausgeführt wird,
      # wenn der entsprechende State aktiv ist.
      Severin.on_state(state_id) do
        instance_eval(&block)
      end
    end

    def description(text); @result.description = text; end
    def result; @result; end
  end
end
