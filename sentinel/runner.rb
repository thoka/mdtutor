# MDTutor Sentinel Orchestrator
# Der zentrale Einstiegspunkt für alle Regeln und Aktionen.

lib_path = File.expand_path("~/.sentinel/lib")
$LOAD_PATH.unshift(lib_path) unless $LOAD_PATH.include?(lib_path)

require 'sentinel'
require 'fileutils'

# Konfiguration der Pfade
RULES_ROOT = File.expand_path("sentinel/rules", Dir.pwd)
ACTIONS_ROOT = File.expand_path("sentinel/actions", Dir.pwd)

STAGES = [
  "0-process",
  "0-skills",
  "1-setup",
  "2-data",
  "3-services",
  "4-contracts",
  "5-e2e"
]

def run_stages(format)
  success = true
  STAGES.each do |stage|
    stage_dir = File.join(RULES_ROOT, stage)
    next unless Dir.exist?(stage_dir)
    
    Dir.glob("#{stage_dir}/*.rb").sort.each do |file|
      load file
      last_res = Sentinel.all_results.last
      if last_res && !last_res.success?
        success = false
        break
      end
    end
    break unless success
  end

  # Report ausgeben
  Sentinel.all_results.each do |res|
    if format == :agent
      Sentinel::AgentFormatter.new(res).display
    else
      Sentinel::HumanFormatter.new(res).display
    end
  end
  
  if format == :human
    puts "\nOverall Status: #{success ? "\e[32mPASSED\e[0m" : "\e[31mFAILED\e[0m"}"
  end
  exit(success ? 0 : 1)
end

# CLI Logik
command = ARGV[0] || "check"
format = ENV['SENTINEL_FORMAT'] == 'agent' ? :agent : :human

case command
when "check"
  run_stages(format)
when "action"
  action_name = ARGV[1]
  # Hier kommt später die Action-Logik
  puts "Action '#{action_name}' wird bald unterstützt."
else
  puts "Unbekannter Befehl: #{command}"
  exit 1
end
