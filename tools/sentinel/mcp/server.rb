require 'json'
require 'socket'
require 'fileutils'
require_relative '../lib/sentinel'

# Sentinel MCP Server - State Machine & Tool Orchestrator
# Kommuniziert via JSON-RPC über Stdio mit Cursor/Claude

class SentinelMCPServer
  def initialize
    @running = true
    @services = {
      'api' => { port: 3101, start_cmd: 'pnpm run api', status: :unknown },
      'achievements' => { port: 3102, start_cmd: 'pnpm run achievements', status: :unknown },
      'sso' => { port: 3103, start_cmd: 'pnpm run sso', status: :unknown },
      'web' => { port: 5201, start_cmd: 'pnpm run web', status: :unknown }
    }
  end

  def run
    STDERR.puts "Sentinel MCP Server started (Stdio mode)"
    while @running
      begin
        input = STDIN.gets
        break unless input
        
        request = JSON.parse(input)
        response = handle_request(request)
        
        STDOUT.puts JSON.generate(response)
        STDOUT.flush
      rescue => e
        STDERR.puts "MCP Error: #{e.message}\n#{e.backtrace.join("\n")}"
      end
    end
  end

  private

  def handle_request(req)
    method = req['method']
    params = req['params'] || {}
    id = req['id']

    result = case method
    when 'initialize'
      {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'sentinel-mcp', version: '0.2.0' }
      }
    when 'tools/list'
      {
        tools: [
          {
            name: 'check_health',
            description: 'Führt alle Sentinel Health-Checks (Ebene 0-1) aus.',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'service_status',
            description: 'Prüft den Zustand aller Hintergrund-Services (API, Web, etc.).',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'ensure_service',
            description: 'Stellt sicher, dass ein Service läuft. Startet ihn falls nötig.',
            inputSchema: { 
              type: 'object', 
              properties: { 
                service: { type: 'string', enum: ['api', 'achievements', 'sso', 'web'] } 
              },
              required: ['service']
            }
          }
        ]
      }
    when 'tools/call'
      execute_tool(params['name'], params['arguments'])
    else
      { error: { code: -32601, message: "Method not found: #{method}" } }
    end

    { jsonrpc: '2.0', id: id, result: result }
  end

  def execute_tool(name, args)
    case name
    when 'check_health'
      output = `SENTINEL_FORMAT=agent ruby test/0-process/branch_health.rb && SENTINEL_FORMAT=agent ruby test/0-process/workflow.rb && SENTINEL_FORMAT=agent ruby test/1-setup/environment.rb`
      { content: [{ type: 'text', text: output }] }
    
    when 'service_status'
      update_service_states
      status_report = @services.map { |k, v| "#{k}: #{v[:status]} (Port #{v[:port]})" }.join("\n")
      { content: [{ type: 'text', text: "Aktueller Service-Status:\n#{status_report}" }] }
    
    when 'ensure_service'
      svc_name = args['service']
      svc = @services[svc_name]
      update_service_states
      
      if svc[:status] == :running
        { content: [{ type: 'text', text: "Service #{svc_name} läuft bereits auf Port #{svc[:port]}." }] }
      else
        # In einer echten Umgebung würden wir hier spawn/detach nutzen
        # Für diesen PoC geben wir die Anweisung zurück, wie zu starten ist
        { content: [{ type: 'text', text: "Service #{svc_name} ist offline. Bitte starte ihn mit:\n`#{svc[:start_cmd]}`" }] }
      end
    else
      { error: { code: -32602, message: "Unknown tool: #{name}" } }
    end
  end

  def update_service_states
    @services.each do |name, data|
      data[:status] = port_open?(data[:port]) ? :running : :stopped
    end
  end

  def port_open?(port)
    Socket.tcp('127.0.0.1', port, connect_timeout: 0.2) { true } rescue false
  end
end

if __FILE__ == $0
  server = SentinelMCPServer.new
  server.run
end
