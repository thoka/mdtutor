# MDTutor Sentinel Orchestrator
# Der zentrale Einstiegspunkt für alle Regeln und Aktionen.

lib_path = File.expand_path("~/.sentinel/lib")
$LOAD_PATH.unshift(lib_path) unless $LOAD_PATH.include?(lib_path)

require 'sentinel'
require 'fileutils'

# Konfiguration der Pfade
RULES_ROOT = File.expand_path("sentinel/rules", Dir.pwd)
STAGES = ["0-process", "0-skills", "1-setup", "2-data", "3-services", "4-contracts", "5-e2e"]

def show_help
  puts "\n\e[1;35m🛡️  SENTINEL ORCHESTRATOR v#{Sentinel::VERSION}\e[0m"
  puts "\e[35m" + "━" * 40 + "\e[0m"
  puts "\n\e[1mNUTZUNG:\e[0m"
  puts "  sn [befehl] [optionen]"
  puts "\n\e[1mBEFEHLE:\e[0m"
  puts "  \e[32mcheck\e[0m          Integrität prüfen."
  puts "  \e[32mgen\e[0m            Doku generieren."
  puts "  \e[32mcommit \"msg\"\e[0m  Prüfen, Generieren & Committen."
  puts "  \e[32mship\e[0m           Alles prüfen & nach main mergen."
  puts "  \e[32mdebug on|off\e[0m   MCP-Logging steuern."
  puts "\n\e[1m" + "━" * 40 + "\e[0m"
  exit 0
end

def current_branch
  `git rev-parse --abbrev-ref HEAD`.strip
end

def run_stages(format)
  Sentinel.config.set_project(Dir.pwd)
  success = true
  
  if format == :agent
    puts "## 🛡️ Sentinel v#{Sentinel::VERSION} Report"
  else
    puts "\n\e[1;35m🛡️  Prüfe Integrität...\e[0m"
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
  
  success
end

def perform_commit(msg)
  unless msg && !msg.empty?
    puts "❌ Fehler: Commit-Nachricht erforderlich. Nutzung: sn commit \"nachricht\""
    exit 1
  end

  puts "🚀 Starte orchestrierten Commit..."
  
  # 1. Check
  unless run_stages(:human)
    puts "\n❌ Commit abgebrochen: Integritätstest fehlgeschlagen."
    exit 1
  end

  # 2. Sync Doku
  puts "\n📝 Synchronisiere Dokumentation..."
  system "ruby ~/.sentinel/generate_rules.rb"

  # 3. Git Action
  puts "💾 Committe Änderungen..."
  system "git add ."
  if system("git commit -m '#{msg}'")
    puts "✅ Commit erfolgreich erstellt."
  else
    puts "⚠️  Nichts zu committen oder Fehler bei git commit."
  end
end

def perform_ship
  branch = current_branch
  if branch == "main" || branch == "master"
    puts "❌ Fehler: Du bist bereits auf #{branch}. Ship funktioniert nur von Feature-Branches."
    exit 1
  end

  puts "🚢 Starte Shipping von '#{branch}' nach 'main'..."

  # 1. Letzter Check & Commit
  perform_commit("chore(sentinel): final automated sync before ship")

  # 2. Merge nach main
  puts "\n🔀 Merging nach main..."
  if system("git checkout main && git merge #{branch} --no-edit")
    puts "🚀 Pushe nach origin/main..."
    system "git push origin main"
    puts "✅ Shipping abgeschlossen. Zurück auf #{branch}."
    system "git checkout #{branch}"
  else
    puts "❌ Merge-Fehler! Bitte Konflikte manuell lösen."
    system "git checkout #{branch}"
    exit 1
  end
end

# CLI Logik
command = ARGV[0] || "check"
format = ENV['SENTINEL_FORMAT'] == 'agent' ? :agent : :human

case command
when "check"
  success = run_stages(format)
  exit(success ? 0 : 1)
when "gen"
  system "ruby ~/.sentinel/generate_rules.rb"
when "commit"
  perform_commit(ARGV[1])
when "ship"
  perform_ship
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
