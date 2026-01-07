require_relative '../severin'
require_relative 'actions/base'
require_relative 'actions/skills_action'
require 'fileutils'
require 'optparse'

module Severin
  class CLI
    attr_reader :current_stage_index

    def self.run(args)
      # Find and set root early so plugins can be loaded correctly
      root = self.new.send(:find_root)
      Severin.project_root = root if root

      options = {
        format: ENV['SENTINEL_FORMAT'] == 'agent' ? :agent : :human,
        verbose: false
      }

      # Registry für neue Action-Klassen
      actions_registry = {
        "skills" => Severin::Actions::SkillsAction
      }

      # Load actions
      Severin.load_all_plugins

      parser = OptionParser.new do |opts|
        opts.banner = "\n\e[1;35m🐺 SEVERIN GLOBAL ORCHESTRATOR v#{Severin::VERSION}\e[0m\n" \
                      "\e[35m" + "━" * 40 + "\e[0m\n\n" \
                      "\e[1mNUTZUNG:\e[0m\n" \
                      "  sv [befehl] [optionen]\n"

        opts.separator "\n\e[1mBEFEHLE:\e[0m"
      # Registriere Optionen der Actions dynamisch
      actions_registry.each do |name, klass|
        if klass.respond_to?(:specs) && (spec = klass.specs[:call])
          opts.separator "  #{name.ljust(15)} #{spec[:description]}"
        end
        klass.register_options(opts, options)
      end

      # Registriere zusätzliche Plugin-Actions
      Severin.actions.each do |name, action|
        next if actions_registry.key?(name)
        opts.separator "  #{name.ljust(15)} #{action.description_text}"
      end

      # Registriere Tools
      unless Severin.tools.empty?
        opts.separator "\n\e[1mTOOLS:\e[0m"
        Severin.tools.each do |name, tool|
          opts.separator "  #{name.ljust(15)} #{tool.description_text}"
        end
      end

        opts.on("-h", "--help", "Hilfe anzeigen") do
          $stdout.puts opts # SEVERIN_ALLOW_PUTS
          exit
        end

        opts.on("-v", "--verbose", "Detaillierte Ausgabe (auch erfolgreiche Checks)") do
          options[:verbose] = true
        end
      end

      # Parse flags and remove them from args
      begin
        parser.parse!(args)
      rescue OptionParser::InvalidOption => e
        # If it's help, we already handled it in the block, but just in case
        exit 0 if args.include?("-h") || args.include?("--help")
        $stdout.puts "❌ #{e.message}" # SEVERIN_ALLOW_PUTS
        exit 1
      end

      # Load actions
      Severin.load_all_plugins

      command = args.shift || "check"

      case command
      when "check"
        success, _has_warnings = new.run_stages(options[:format], options)
        exit(success ? 0 : 1)
      when "skills"
        actions_registry["skills"].new(options).call(args)
      when "gen"
        root = self.new.send(:find_root)
        if root
          # Ensure current state is evaluated
          require_relative '../severin'
          Severin.project_root = root

          # Verhindere Endlosschleifen durch rekursive Checks
          ENV['SEVERIN_GENERATING'] = 'true'

          # Sicherstellen, dass Bundler das Gemfile in der Engine findet,
          # auch wenn wir uns im Projekt-Root befinden.
          engine_path = File.expand_path("../..", __dir__)
          gemfile_path = File.join(engine_path, "Gemfile")

          bundle_cmd = ""
          if File.exist?(gemfile_path)
            bundle_cmd = "BUNDLE_GEMFILE=#{gemfile_path} bundle exec "
          end

          system "#{bundle_cmd}ruby #{File.expand_path("../../generate_rules.rb", __dir__)} --root #{root}"
        else
          $stdout.puts "❌ Kein Severin-Projekt gefunden." # SEVERIN_ALLOW_PUTS
          exit 1
        end
      when "commit"
        new.perform_commit(args[0], options[:format], options[:force])
      when "ship"
        action = Severin.actions["ship"]
        if action
          action.call(format: options[:format])
        else
          new.perform_ship(options[:format])
        end
      when "start", "stop", "restart", "status"
        new.handle_service_command(command, args)
      when "debug"
        val = args[0] == "on"
        Severin.config.set_debug(val)
        $stdout.puts "Severin MCP Debug Logging: #{val ? 'AN' : 'AUS'}" # SEVERIN_ALLOW_PUTS
      when "help"
        show_help
      else
        # Wandle args in ein Hash um (key=value Format unterstützen)
        param_args = {}
        passed_args = []
        args.each do |arg|
          if arg.include?("=")
            k, v = arg.split("=", 2)
            param_args[k.to_sym] = v
          else
            passed_args << arg
          end
        end

        # Prüfe zuerst registrierte Plugin-Actions
        if Severin.actions.key?(command)
          # Wenn param_args leer ist, übergebe die Liste, sonst den Hash
          call_args = param_args.empty? ? passed_args : param_args
          Severin.actions[command].call(call_args)
        # Dann registrierte Tools
        elsif Severin.tools.key?(command)
          call_args = param_args.empty? ? passed_args : param_args
          result = Severin.tools[command].call(call_args)
          $stdout.puts result if result.is_a?(String) # SEVERIN_ALLOW_PUTS
        else
          $stdout.puts "Unbekannter Befehl: #{command}" # SEVERIN_ALLOW_PUTS
          exit 1
        end
      end
    end

    def self.show_help
      run(["--help"])
    end

    def run_stages(format, options = {})
      @root = find_root
      unless @root
        $stderr.puts "❌ Kein Severin-Projekt gefunden (suche nach 'severin/rules' im Verzeichnisbaum)." # SEVERIN_ALLOW_PUTS
        return false
      end

      # WICHTIG: In den Projekt-Root wechseln, damit Regeln (File.exist? etc.)
      # weiterhin relativ zum Root funktionieren, egal von wo 'sv' aufgerufen wurde.
      Dir.chdir(@root)

      Severin.config.set_project(@root)
      success = true

      rules_root = File.expand_path("severin/rules", @root)
      log_dir = File.expand_path("severin/log", @root)
      FileUtils.mkdir_p(log_dir)

      # 1. Output-Proxy initialisieren
      output_proxy = Severin::Output.new
      output_proxy.add_stream($stdout)

      # Log-Dateien für Persistenz
      human_log = File.open(File.join(log_dir, "human.log"), "a").tap { |f| f.sync = true }
      agent_log = File.open(File.join(log_dir, "agent.log"), "a").tap { |f| f.sync = true }

      human_output = Severin::Output.new
      human_output.add_stream($stdout) if format == :human
      human_output.add_stream(human_log)

      agent_output = Severin::Output.new
      agent_output.add_stream($stdout) if format == :agent
      agent_output.add_stream(agent_log)

      human_log.puts "\n--- SESSION: #{Time.now.utc} ---"
      agent_log.puts "\n--- SESSION: #{Time.now.utc} ---"

      # ... (Lade Konfiguration und State)
      config_path = File.join(@root, "severin/environments.rb")
      unless File.exist?(config_path)
        create_default_config(config_path)
        human_output.puts "ℹ️  Standard-Konfiguration in severin/environments.rb erstellt."
      end
      load config_path

      state_path = File.join(@root, "severin_state.rb")
      if File.exist?(state_path)
        load state_path
        Severin.eval_state!
      end

      Severin.log_debug("CLI run_stages started", format: format, root: @root, stage: "init")

      if format == :human
        human_output.puts "\n\e[1;35m🐺 Prüfe Integrität in #{@root}...\e[0m"
        human_output.puts "\e[35m" + "━" * 40 + "\e[0m"
      end

      # 2. MCP Integrität prüfen
      mcp_ok = true
      Severin.mcp_clients.each do |name, client|
        unless client.alive?
          severity = Severin.allow_warnings.include?(:mcp_offline) ? :warning : :error
          if severity == :error
            human_output.puts "\e[31m❌ 🔹MCP-OFFLINE: MCP Server '#{name}' ist nicht erreichbar!\e[0m"
            human_output.puts "   Abbruch aufgrund von STRICT-INTEGRITY."
            human_output.puts "   Ausnahme via 'allow_warnings: [:mcp_offline]' in severin_state.rb möglich."
            mcp_ok = false
          else
            human_output.puts "\e[33m⚠  🔹MCP-OFFLINE: MCP Server '#{name}' ist offline (erlaubte Ausnahme).\e[0m"
          end
        end
      end

      unless mcp_ok
        human_log.close
        agent_log.close
        return false
      end

      # 3. Alle Stages in severin/rules/ dynamisch finden und sortieren
      stages = Dir.glob(File.join(rules_root, "*")).select { |d| File.directory?(d) }.sort

      stages.each do |stage_dir|
        Severin.current_stage_index = File.basename(stage_dir).split('-').first || "?"
        stage_name = File.basename(stage_dir)

        # Merke dir die Anzahl der Resultate VOR dieser Stage
        previous_results_count = Severin.all_results.size

        Severin.log_debug("Starting Stage: #{stage_name}", stage: Severin.current_stage_index)

        Dir.glob("#{stage_dir}/*.rb").sort.each do |file|
          begin
            load file
          rescue => e
            human_output.puts "\e[31m💥 FEHLER beim Laden der Regeldatei: #{File.basename(file)}\e[0m"
            human_output.puts "   \e[31m#{e.class}: #{e.message}\e[0m"
            human_output.puts "   \e[90m#{e.backtrace.first}\e[0m"

            agent_output.puts "❌ LOAD_ERROR: #{File.basename(file)} - #{e.message}"
            agent_output.puts "💥 Exception: #{e.class} - #{e.message}"
            agent_output.puts "📍 Location: #{e.backtrace.first}"

            success = false
          end
        end

        # 4. Triggere alle on_state Hooks für den aktuellen State
        current_state = Severin.workflow.state
        Severin.trigger_state_hooks(current_state) if current_state

        # Hol die Resultate dieser Stage
        stage_results = Severin.all_results[previous_results_count..-1] || []

        # Fail-Fast: Wenn die aktuelle Stage kritische Fehler enthält, stoppen wir hier.
        unless stage_results.all?(&:success?)
          # Zeige nur die Resultate dieser Stage an, um Fokus zu wahren
          stage_results.each do |res|
            Severin::AgentFormatter.new(res, output: agent_output).display
            Severin::HumanFormatter.new(res, output: human_output, verbose: options[:verbose]).display
          end

          if format == :human
            human_output.puts "\n\e[31m🛑 KRITISCHER FEHLER: Stage '#{stage_name}' enthält Fehler.\e[0m"
            human_output.puts "\e[31m   Prozess wird sofort beendet (🔹STRICT-FAIL).\e[0m"
          elsif format == :agent
            agent_output.puts "🛑 KRITISCHER FEHLER: Stage '#{stage_name}' enthält Fehler (🔹STRICT-FAIL)."
          end

          human_log.close
          agent_log.close
          exit 1
        end
      end

      # Prüfe Ergebnisse (falls alle Stages durchgelaufen sind)
      all_passed = Severin.all_results.all?(&:success?)
      has_warnings = Severin.all_results.any? { |res| res.checks.any? { |c| !c[:passed] && c[:severity] == :warning } }

      Severin.all_results.each do |res|
        Severin::AgentFormatter.new(res, output: agent_output).display
        Severin::HumanFormatter.new(res, output: human_output, verbose: options[:verbose]).display
      end

      if all_passed
        if format == :agent
          agent_output.puts "✅ Alles ok. Integrität gewahrt."
        else
          human_output.puts "\n\e[32m✅ Alles ok. Integrität gewahrt.\e[0m"
        end
      end

      human_log.close
      agent_log.close
      [all_passed, has_warnings]
    end

    def create_default_config(path)
      FileUtils.mkdir_p(File.dirname(path))
      File.write(path, <<~RUBY)
        define_environment "PROJECT_RULES.md" do
          format :human
          doc_language "English"
          description "Central documentation of project rules for humans."
        end

        define_environment ".cursorrules" do
          format :ai
          chat_language "Deutsch"
          doc_language "English"
          description "Direct instructions for AI agents in Cursor."
        end
      RUBY
    end

    def perform_commit(msg, format = :human, force = false)
      unless msg && !msg.empty?
        $stdout.puts "❌ Fehler: Commit-Nachricht erforderlich." # SEVERIN_ALLOW_PUTS
        exit 1
      end

      # 1. Check for engine changes (Submodule)
      @root ||= find_root
      engine_dir = File.expand_path("severin/engine", @root)
      if Dir.exist?(engine_dir) && Dir.exist?(File.join(engine_dir, ".git"))
        engine_status = `cd #{engine_dir} && git status --porcelain`.strip
        unless engine_status.empty?
          $stdout.puts "🐺 Engine-Änderungen erkannt. Committe Engine zuerst..." # SEVERIN_ALLOW_PUTS
          success = system "cd #{engine_dir} && git add . && git commit -m '#{msg}' && git push origin main"
          unless success
            $stdout.puts "❌ Engine Commit fehlgeschlagen." # SEVERIN_ALLOW_PUTS
            exit 1
          end
        end
      end

      $stdout.puts "🚀 Starte orchestrierten Commit..." # SEVERIN_ALLOW_PUTS

      # Führe Generierung ZUERST aus, damit die Tests auf aktuelle Dokumentation nicht fehlschlagen
      system "sv gen"

      success, has_warnings = run_stages(format)

      unless success
        $stdout.puts "\n❌ Commit abgebrochen: Kritische Integritätsfehler gefunden." # SEVERIN_ALLOW_PUTS
        exit 1
      end

      if has_warnings && !force
        $stdout.puts "\n⚠️  Warnungen gefunden. Commit wurde zur Sicherheit unterbrochen." # SEVERIN_ALLOW_PUTS
        if format == :agent
          $stdout.puts "\n### 🤖 Agent-Info" # SEVERIN_ALLOW_PUTS
          $stdout.puts "Der Commit enthält Warnungen. Bitte frage den Nutzer um Erlaubnis." # SEVERIN_ALLOW_PUTS
          $stdout.puts "Wenn der Nutzer zustimmt, führe den Commit erneut mit dem Force-Flag aus:" # SEVERIN_ALLOW_PUTS
          $stdout.puts "\n```bash\nsv commit \"#{msg}\" --force\n```\n" # SEVERIN_ALLOW_PUTS
        else
          $stdout.puts "Nutze 'sv commit \"#{msg}\" --force' zum Fortfahren." # SEVERIN_ALLOW_PUTS
        end
        exit 2
      end

      system "git add ."
      success = system "git commit -m '#{msg}'"
      unless success
        $stdout.puts "\n❌ Git Commit fehlgeschlagen." # SEVERIN_ALLOW_PUTS
        exit 1
      end
    end

    def perform_ship(format = :human)
      # ... existing ship logic ...
    end

    def handle_service_command(cmd, args)
      manager = Severin::ServiceManager.new
      target = args.shift

      if target
        service = manager.services[target]
        unless service
          $stdout.puts "❌ Unbekannter Service: #{target}" # SEVERIN_ALLOW_PUTS
          exit 1
        end

        case cmd
        when "start"
          $stdout.puts "🚀 Starte #{target}..." # SEVERIN_ALLOW_PUTS
          manager.start_service(target, File.join(@root || find_root || Dir.pwd, "severin/log"))
          manager.save!
        when "stop"
          $stdout.puts "🛑 Stoppe #{target}..." # SEVERIN_ALLOW_PUTS
          service.stop!
          manager.save!
        when "restart"
          $stdout.puts "♻️  Starte #{target} neu..." # SEVERIN_ALLOW_PUTS
          service.stop!
          manager.start_service(target, File.join(@root || find_root || Dir.pwd, "severin/log"))
          manager.save!
        when "status"
          display_service_status(target, service)
        end
      else
        if cmd == "status"
          $stdout.puts "\n\e[1;35m🐺 SEVERIN SERVICE STATUS\e[0m" # SEVERIN_ALLOW_PUTS
          $stdout.puts "\e[35m" + "━" * 40 + "\e[0m" # SEVERIN_ALLOW_PUTS
          manager.services.each do |name, svc|
            svc.refresh!
            display_service_status(name, svc)
          end
          manager.save!
        else
          $stdout.puts "❌ Fehler: Service-Name erforderlich für 'sv #{cmd}'." # SEVERIN_ALLOW_PUTS
          exit 1
        end
      end
    end

    def display_service_status(name, service)
      color = case service.state
              when :running then "\e[32m" # Green
              when :starting then "\e[33m" # Yellow
              when :error then "\e[31m" # Red
              else "\e[90m" # Gray
              end

      status_text = service.state.to_s.upcase
      pid_text = service.pid ? " (PID: #{service.pid})" : ""
      port_text = service.port ? " [Port: #{service.port}]" : ""

      $stdout.puts "  #{color}●\e[0m \e[1m#{name.ljust(15)}\e[0m #{color}#{status_text.ljust(10)}\e[0m#{pid_text}#{port_text}" # SEVERIN_ALLOW_PUTS
      $stdout.puts "    \e[31m⚠ #{service.last_error}\e[0m" if service.last_error && service.error? # SEVERIN_ALLOW_PUTS
    end

    private

    def find_root
      require 'pathname'
      curr = Pathname.new(Dir.pwd)
      curr.ascend do |path|
        return path.to_s if File.exist?(File.join(path, "severin_state.rb"))
        return path.to_s if Dir.exist?(File.join(path, "severin/rules"))
      end
      nil
    end
  end
end
