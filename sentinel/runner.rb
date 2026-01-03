# MDTutor Sentinel Orchestrator
# Der zentrale Einstiegspunkt für alle Regeln und Aktionen.

lib_path = File.expand_path("~/.sentinel/lib")
$LOAD_PATH.unshift(lib_path) unless $LOAD_PATH.include?(lib_path)

require 'sentinel'
require 'fileutils'

# Konfiguration der Pfade
RULES_ROOT = File.expand_path("sentinel/rules", Dir.pwd)
ACTIONS_ROOT = File.expand_path("sentinel/actions", Dir.pwd)

STAGES = ["0-process", "0-skills", "1-setup", "2-data", "3-services", "4-contracts", "5-e2e"]

def show_help
  puts "\n\e[1;35m🛡️  SENTINEL ORCHESTRATOR v#{Sentinel::VERSION}\e[0m"
  puts "\e[35m" + "━" * 40 + "\e[0m"
  puts "\n\e[1mNUTZUNG:\e[0m"
  puts "  sn [befehl] [optionen]"
  puts "\n\e[1mBEFEHLE:\e[0m"
  puts "  \e[32mcheck\e[0m          Integrität prüfen."
  puts "  \e[32mgen\e[0m            Doku generieren."
  puts "  \e[32mdebug on|off\e[0m   MCP-Logging steuern."
  puts "  \e[32m--help\e[0m         Diese Hilfe."
  puts "\n\e[1m" + "━" * 40 + "\e[0m"
  exit 0
end

def run_stages(format)
  # Bei jedem sn-Aufruf das aktuelle Verzeichnis als aktiv markieren
  Sentinel.config.set_project(Dir.pwd)
  
  success = true
  if format == :agent
    puts "## 🛡️ Sentinel v#{Sentinel::VERSION} Report"
  else
    puts "\n\e[1;35m🛡️  SENTINEL ORCHESTRATOR v#{Sentinel::VERSION}\e[0m"
    puts "\e[35m" + "━" * 40 + "\e[0m"
  end

  STAGES.each do |stage|
    stage_dir = File.join(RULES_ROOT, stage)
    next unless Dir.exist?(stage_dir)
    Dir.glob("#{stage_dir}/*.rb").sort.each do |file|
      load file
      last_res = Sentinel.all_results.last
      if last_res && !last_res.success?; success = false; break; end
    end
    break unless success
  end

  Sentinel.all_results.each do |res|
    if format == :agent; Sentinel::AgentFormatter.new(res).display; else; Sentinel::HumanFormatter.new(res).display; end
  end
  
  if format == :human
    status_color = success ? "\e[32m" : "\e[31m"
    puts "\n\e[1m" + "━" * 40 + "\e[0m"
    puts "\e[1mOverall Status: #{status_color}#{success ? "PASSED" : "FAILED"}\e[0m"
  end
  exit(success ? 0 : 1)
end

# CLI Logik
command = ARGV[0] || "check"
format = ENV['SENTINEL_FORMAT'] == 'agent' ? :agent : :human

case command
when "check"
  run_stages(format)
when "gen"
  system "ruby ~/.sentinel/generate_rules.rb"
when "debug"
  val = ARGV[1] == "on"
  Sentinel.config.set_debug(val)
  puts "Sentinel MCP Debug Logging: #{val ? 'AN' : 'AUS'}"
when "--help", "-h", "help"
  show_help
else
  puts "Unbekannter Befehl: #{command}"
  exit 1
end
