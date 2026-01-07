require 'open3'
require 'json'
require 'thread'
require 'timeout'

module Severin
  class MCPClient
    def initialize(name, command, args = [])
      @name = name
      @command = command
      @args = args
      @id_counter = 0
      @running = false
      @lock = Mutex.new
    end

    def start
      @lock.synchronize do
        return if @running
        @stdin, @stdout, @stderr, @wait_thr = Open3.popen3(@command, *@args)
        @running = true
        # Optional: Read and discard/log stderr in a separate thread
        Thread.new do
          while line = @stderr.gets
            # Severin.log_debug "MCP[#{@name}] STDERR: #{line}"
          end
        end
        # MCP Handshake (initialize)
        begin
          Timeout.timeout(5) do
            call("initialize", {
              protocolVersion: "2024-11-05",
              capabilities: {},
              clientInfo: { name: "severin-orchestrator", version: Severin::VERSION }
            })
            call("notifications/initialized", {})
          end
        rescue Timeout::Error
          @running = false
          raise "MCP Server '#{@name}' reagiert nicht auf Handshake (Timeout nach 5s)"
        end
      end
    end

    def call(method, params = {})
      start unless @running
      @id_counter += 1
      request = {
        jsonrpc: "2.0",
        id: @id_counter,
        method: method,
        params: params
      }

      @stdin.puts JSON.generate(request)
      @stdin.flush

      line = @stdout.gets
      unless line
        @running = false
        raise "MCP Server '#{@name}' hat die Verbindung unerwartet geschlossen (stdout is nil)"
      end
      JSON.parse(line)
    rescue => e
      Severin.log_debug "MCP Error [#{@name}]: #{e.message}"
      { "error" => { "message" => e.message } }
    end

    def alive?
      return false unless @running && @wait_thr && @wait_thr.alive?
      # Wir versuchen ein minimales Request, um die Kommunikation zu prüfen
      # Mit kurzem Timeout, damit wir nicht hängen bleiben
      begin
        Timeout.timeout(2) do
          res = call("tools/list", {})
          !res.nil? && !res.key?("error")
        end
      rescue Timeout::Error, StandardError
        false
      end
    end

    def call_tool(tool_name, args = {})
      res = call("tools/call", { name: tool_name, arguments: args })
      if res && res["result"]
        res["result"]
      else
        { "isError" => true, "content" => [{ "type" => "text", "text" => "MCP Error: #{res["error"]}" }] }
      end
    end

    def stop
      @lock.synchronize do
        return unless @running
        @stdin.close
        @stdout.close
        @stderr.close
        @wait_thr.kill
        @running = false
      end
    end
  end
end
