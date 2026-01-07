require 'json'
require 'fileutils'
require 'open3'
require_relative '../lib/severin'

class SeverinMCPServer
  def initialize
    @running = true
    @pid = Process.pid
    @log_path = File.expand_path("../mcp-debug.log", __dir__)
    File.write(@log_path, "[#{@pid}] [#{Time.now}] 🐺 Severin MCP starting up...\n")
    File.open(@log_path, "a") { |f| f.puts "[#{@pid}] [#{Time.now}] Path: #{Dir.pwd}" }
    detect_project
  end

  def log(msg)
    # Keeping existing log method but adding to our specific debug log if needed
    # (Optional: redirecting or mirroring to the new log file)
    File.open(@log_path, "a") { |f| f.puts "[#{@pid}] [#{Time.now}] #{msg}" } rescue nil

    return unless Severin.config.debug?
    log_path = File.expand_path("../../tmp_mcp.log", __dir__)
    File.open(log_path, "a") { |f| f.puts "[#{@pid}] [#{Time.now}] #{msg}" }
  rescue
  end

  def detect_project
    active = Severin.config.active_project
    if active && Dir.exist?(active)
      Dir.chdir(active)
      log("Switched to active project via config: #{active}")
    end

    @is_severin_project = Dir.exist?('severin/rules') || File.exist?('PROJECT_RULES.md')
    log("Project detection: Severin=#{@is_severin_project} (Rules: #{Dir.exist?('severin/rules')}, File: #{File.exist?('PROJECT_RULES.md')})")

    if @is_severin_project
      Severin.load_all_plugins
      log("Plugin load info: #{Severin.actions.size} actions, #{Severin.tools.size} tools loaded")
    end
  end

  def run
    while @running
      begin
        input = STDIN.gets
        break unless input
        request = JSON.parse(input)
        log("IN: #{request.to_json}")
        response = handle_request(request)
        if response
          STDOUT.puts JSON.generate(response)
          STDOUT.flush
          log("OUT: #{response.to_json}")
        end
      rescue => e
        log("Runtime Error: #{e.message}")
      end
    end
  end

  private

  def handle_request(req)
    id = req['id']
    method = req['method']
    params = req['params'] || {}
    return nil if id.nil? && method != 'initialize'

    result = case method
    when 'initialize'
      {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'severin', version: Severin::VERSION }
      }
    when 'notifications/initialized', 'initialized'
      return nil
    when 'tools/list'
      detect_project
      list_tools
    when 'tools/call'
      execute_tool(params['name'], params['arguments'])
    else
      return { jsonrpc: '2.0', id: id, error: { code: -32601, message: "Method not found" } }
    end
    { jsonrpc: '2.0', id: id, result: result }
  end

  def list_tools
    tools = []

    if @is_severin_project
      tools << { name: 'sv_check', description: 'Führt alle Severin-Checks aus.', inputSchema: { type: 'object', properties: {} } }
      tools << { name: 'sv_gen', description: 'Generiert Dokumentation neu.', inputSchema: { type: 'object', properties: {} } }
      tools << { name: 'sv_mcp_info', description: 'Zeigt Informationen über den aktuellen MCP-Server an.', inputSchema: { type: 'object', properties: {} } }
      tools << { name: 'sv_mcp_restart', description: 'Beendet den MCP-Server (wird meist automatisch neu gestartet).', inputSchema: { type: 'object', properties: {} } }
      tools << { name: 'sv_mcp_test', description: 'Provokation von Fehlern zum Testen des Reportings.', inputSchema: { type: 'object', properties: { mode: { type: 'string', enum: ['exception', 'shell-error', 'success'] } }, required: ['mode'] } }
      tools << { name: 'sv_get_skill', description: 'Ruft detaillierte Anweisungen für einen Skill ab.', inputSchema: { type: 'object', properties: { name: { type: 'string', description: 'Name oder ID des Skills' } }, required: ['name'] } }
      tools << { name: 'sv_upgrade_self', description: 'Aktualisiert die aktuell laufende Severin-Installation via git pull.', inputSchema: { type: 'object', properties: {} } }
      tools << { name: 'sv_upgrade_global', description: 'Aktualisiert die globale Severin-Installation (Launcher-Basis).', inputSchema: { type: 'object', properties: {} } }

      Severin.actions.each do |name, action|
        add_dynamic_tool(tools, "sv_#{name.gsub('-', '_')}", action)
      end

      Severin.tools.each do |name, tool|
        add_dynamic_tool(tools, "sv_#{name.gsub('-', '_')}", tool)
      end
    else
      tools << { name: 'sv_init', description: 'Initialisiert Severin.', inputSchema: { type: 'object', properties: {} } }
    end
    { tools: tools }
  end

  def add_dynamic_tool(tools_array, tool_name, plugin)
    properties = {}
    required = []

    # Bevorzugte Metadaten aus der neuen DSL (falls vorhanden)
    spec = if plugin.class.respond_to?(:specs) && plugin.class.specs[:call]
             plugin.class.specs[:call]
           end

    if spec
      description = spec[:description]
      spec[:params].each do |pname, opts|
        properties[pname.to_s] = {
          type: opts[:type].to_s,
          description: opts[:desc]
        }
        required << pname.to_s if opts[:required]
      end
    else
      description = plugin.full_description
      plugin.params_def.each do |pname, opts|
        properties[pname] = { type: opts[:type] || 'string', description: opts[:desc] }
        required << pname if opts[:required]
      end
    end

    tools_array << {
      name: tool_name,
      description: description,
      inputSchema: {
        type: 'object',
        properties: properties,
        required: required
      }
    }
  end

  def execute_tool(name, args)
    case name
    when 'sv_mcp_info'
      branch = `git rev-parse --abbrev-ref HEAD`.strip rescue "unknown"
      commit = `git rev-parse --short HEAD`.strip rescue "unknown"
      status = `git status --short`.strip rescue "unknown"
      text = "🐺 Severin MCP Info\n" \
             "PID: #{@pid}\n" \
             "Project: #{Dir.pwd}\n" \
             "Branch: #{branch}\n" \
             "Commit: #{commit}\n\n" \
             "Active Launcher: #{$SEVERIN_ACTIVE_LAUNCHER}\n" \
             "Local Available: #{$SEVERIN_LOCAL_LAUNCHER || 'No'}\n" \
             "Ruby: #{RUBY_VERSION} (#{RUBY_PLATFORM})\n\n" \
             "Git Status:\n#{status}\n\n" \
             "Loaded Actions: #{Severin.actions.keys.join(', ')}\n" \
             "Loaded Tools: #{Severin.tools.keys.join(', ')}"
      { content: [{ type: 'text', text: text }] }
    when 'sv_mcp_restart'
      Thread.new { sleep 0.5; exit 0 }
      { content: [{ type: 'text', text: "Server (PID #{@pid}) wird beendet... Neustart erfolgt durch Cursor/Launcher." }] }
    when 'sv_upgrade_self'
      # Upgrade the current active engine
      path = File.expand_path('../..', $SEVERIN_ACTIVE_LAUNCHER)
      if Dir.exist?(File.join(path, '.git'))
        out, err, status = Open3.capture3("git -C #{path} pull origin main")
        if status.success?
          Thread.new { sleep 1; exit 0 } # Auto-restart
          { content: [{ type: 'text', text: "✅ Upgrade erfolgreich:\n#{out}\nServer startet neu..." }] }
        else
          { content: [{ type: 'text', text: "❌ Upgrade fehlgeschlagen:\n#{err}" }], isError: true }
        end
      else
        { content: [{ type: 'text', text: "❌ Fehler: #{path} ist kein Git-Repository." }], isError: true }
      end
    when 'sv_upgrade_global'
      path = File.expand_path('../..', $SEVERIN_GLOBAL_LAUNCHER)
      if Dir.exist?(File.join(path, '.git'))
        out, err, status = Open3.capture3("git -C #{path} pull origin main")
        { content: [{ type: 'text', text: status.success? ? "✅ Global Upgrade:\n#{out}" : "❌ Global Error:\n#{err}" }], isError: !status.success? }
      else
        { content: [{ type: 'text', text: "❌ Fehler: Globaler Pfad #{path} ist kein Git-Repository." }], isError: true }
      end
    when 'sv_mcp_test'
      case args['mode']
      when 'exception'
        raise "Provozierter Ruby-Fehler!"
      when 'shell-error'
        out, err, status = Open3.capture3("ls /nicht/vorhanden")
        { content: [{ type: 'text', text: "STDOUT: #{out}\nSTDERR: #{err}" }], isError: true }
      when 'success'
        { content: [{ type: 'text', text: "Test erfolgreich!" }] }
      end
    when 'sv_check', 'sv_gen'
      cmd = name.sub(/^sv_/, 'sv ')
      out, err, status = Open3.capture3("ruby #{File.expand_path('../../bin/sv', __dir__)} #{name.sub(/^sv_/, '')}")
      { content: [{ type: 'text', text: out + err }], isError: !status.success? }
    else
      plugin_name = name.sub(/^sv_/, '').gsub('_', '-')
      plugin = Severin.tools[plugin_name] || Severin.actions[plugin_name]

      if plugin
        # Wir müssen plugin.call so kapseln, dass wir stdout/stderr von shell calls im block fangen
        # Da wir aber innerhalb des Ruby-Prozesses sind, nutzen wir Capture für den gesamten Block
        require 'stringio'
        old_stdout = $stdout
        old_stderr = $stderr
        $stdout = StringIO.new
        $stderr = StringIO.new
        begin
          # Viele Actions nutzen system(), das wir hier nicht so einfach fangen können
          # außer wir würden system() im Severin-Namespace überschreiben.
          # Für jetzt fangen wir zumindest Ruby-Ausgaben.
          plugin.call(args || {})
          output = $stdout.string + $stderr.string
          { content: [{ type: 'text', text: output }] }
        rescue => e
          { content: [{ type: 'text', text: "Error executing plugin #{plugin_name}: #{e.message}" }], isError: true }
        ensure
          $stdout = old_stdout
          $stderr = old_stderr
        end
      else
        { content: [{ type: 'text', text: "Unknown tool: #{name}" }], isError: true }
      end
    end
  end
end
