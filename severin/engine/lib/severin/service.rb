require 'socket'
require_relative 'state_machine'

module Severin
  class Service
    include StateMachine

    attr_accessor :name, :command, :port, :pid, :last_error, :started_at, :depends_on

    state :stopped, initial: true
    state :starting
    state :running
    state :error

    event :boot do
      transitions from: [:stopped, :error], to: :starting
    end

    event :up do
      transitions from: :starting, to: :running
    end

    event :fail do
      transitions from: [:starting, :running], to: :error
    end

    event :terminate do
      transitions from: [:starting, :running, :error], to: :stopped
    end

    def initialize(attrs = {})
      initialize_state
      @name = attrs[:name]
      @command = attrs[:command]
      @port = attrs[:port]
      @pid = attrs[:pid]
      @last_error = attrs[:last_error]
      @started_at = attrs[:started_at]
      @depends_on = Array(attrs[:depends_on] || [])
      @probes = {}
      setup_default_probes
    end

    def setup_default_probes
      define_probe(:process_alive) do
        return false unless @pid
        Process.kill(0, @pid)
        true
      rescue Errno::ESRCH, Errno::EPERM
        false
      end

      define_probe(:port_open) do
        return true unless @port
        begin
          Socket.tcp("127.0.0.1", @port, connect_timeout: 1).close
          true
        rescue
          false
        end
      end

      define_probe(:resource_ready) do
        true
      end
    end

    def refresh!
      case @state
      when :starting
        if probe(:port_open) && probe(:resource_ready)
          up!
        elsif timed_out?
          fail!(message: "Timeout: Service did not start within 30s")
        end
      when :running
        unless probe(:process_alive) && probe(:resource_ready)
          msg = probe(:process_alive) ? "Health check failed" : "Process died unexpectedly"
          fail!(message: msg)
        end
      end
    end

    def timed_out?
      return false unless @started_at
      Time.now - @started_at > 30
    end

    def define_probe(name, &block)
      @probes[name] = block
    end

    def probe(name)
      return false unless @probes[name]
      @probes[name].call
    end

    def start!(log_dir)
      return if running? || starting?

      boot!
      @started_at = Time.now

      FileUtils.mkdir_p(log_dir)
      log_file = File.join(log_dir, "#{@name}.log")

      # Use spawn to run in background with its own process group
      @pid = spawn(@command, out: [log_file, "a"], err: [:child, :out], pgroup: true)
      Process.detach(@pid)
    end

    def stop!
      return if stopped?

      if @pid
        begin
          Process.kill("-TERM", @pid) # Kill the whole process group
          # Give it some time to die gracefully
          5.times do
            break unless probe(:process_alive)
            sleep 0.5
          end
          Process.kill("-KILL", @pid) if probe(:process_alive) rescue nil
        rescue Errno::ESRCH, Errno::EPERM
        end
      end

      @pid = nil
      @started_at = nil
      terminate!
    end

    def to_h
      {
        name: @name,
        command: @command,
        port: @port,
        pid: @pid,
        state: @state,
        last_error: @last_error,
        started_at: @started_at,
        depends_on: @depends_on
      }
    end
  end
end
