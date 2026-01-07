require 'json'
require 'fileutils'
require 'securerandom'
require 'time'

module Severin
  class Logger
    LOG_PATH = "severin/log"

    def self.instance
      @instance ||= self.new
    end

    def initialize
      @run_id = SecureRandom.hex(4)
      @human_initialized = false
      @machine_initialized = false
    end

    def debug(message, **context)
      write_to_human_log(message, context)
      write_to_machine_log(message, context)
    end

    private

    def human_log_file
      @human_log_file ||= begin
        # Fallback auf Dir.pwd, falls project_root nicht definiert oder nil ist
        root = (Severin.respond_to?(:project_root) && Severin.project_root) || Dir.pwd
        path = File.join(root, LOG_PATH, "debug.log")
        ensure_dir(path)
        # Wir öffnen die Datei im append-Modus und erzwingen die Synchronisation
        f = File.open(path, "a")
        f.sync = true
        f
      end
    end

    def machine_log_file
      @machine_log_file ||= begin
        root = (Severin.respond_to?(:project_root) && Severin.project_root) || Dir.pwd
        path = File.join(root, LOG_PATH, "debug.jsonl")
        ensure_dir(path)
        f = File.open(path, "a")
        f.sync = true
        f
      end
    end

    def ensure_dir(path)
      FileUtils.mkdir_p(File.dirname(path))
    end

    def write_to_human_log(message, context)
      unless @human_initialized
        human_log_file.puts "\n" + "="*80
        human_log_file.puts "🚀 RUN START: #{Time.now.utc.iso8601} (ID: #{@run_id})"
        human_log_file.puts "="*80 + "\n"
        @human_initialized = true
      end

      # Kompakte Darstellung für das Human-Readable Log
      stage_info = context[:stage] ? "[#{context[:stage]}] " : ""
      log_line = "[#{Time.now.utc.strftime('%H:%M:%S')}] #{stage_info}"

      if message.start_with?("Check result:")
        status_emoji = context[:passed] ? "✅" : "❌"
        check_name = message.sub("Check result: ", "")
        log_line += "#{status_emoji} #{check_name}"
        log_line += " | 💡 #{context[:message]}" if context[:message]
      elsif message.start_with?("Running check:")
        # Wir loggen den Start nicht mehr im Human Log, um es kurz zu halten
        return
      elsif message.start_with?("Initializing Suite:")
        suite_name = message.sub("Initializing Suite: ", "")
        log_line += "📁 #{suite_name}"
      elsif message.start_with?("Starting Stage:")
        log_line += "🏁 #{message}"
      elsif message.start_with?("CLI run_stages started")
        log_line += "🎬 Start: Stage Execution"
      else
        context_str = context.empty? ? "" : " | #{context.inspect}"
        log_line += "#{message}#{context_str}"
      end

      human_log_file.puts log_line
    end

    def write_to_machine_log(message, context)
      payload = {
        t: Time.now.utc.to_f,
        run: @run_id,
        m: message
      }.merge(context)

      machine_log_file.puts payload.to_json
    end
  end
end
