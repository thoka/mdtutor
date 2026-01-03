require_relative '../../tools/sentinel/lib/sentinel'
require 'date'

suite = Sentinel.define_suite "Workcycle & Git Regeln" do
  description "Regeln für die Git-Arbeit, Branching-Strategie und die verpflichtende Planung vor der Implementierung."

  current_branch = `git rev-parse --abbrev-ref HEAD`.strip

  check "Feature Branch" do
    rule "Code NIEMALS ohne einen Feature-Branch (feature/name) erstellen. Direkte Commits auf main sind verboten."
    condition { current_branch != 'main' && current_branch != 'master' }
    on_fail "Du befindest dich auf dem 'main' Branch."
    fix "Erstelle einen Feature-Branch: 'git checkout -b feature/dein-feature-name'"
  end

  check "Brain Document (Implementierungsplan)" do
    rule "VOR der Implementierung IMMER einen Plan in docs/brain/YYYY-MM-DD-feature-name.md committen."
    branch_slug = current_branch.split('/').last

    condition do
      plans = Dir.glob("docs/brain/*#{branch_slug}*")
      plans.any? { |f| !f.include?('walkthrough') }
    end

    on_fail "Kein Implementierungsplan in docs/brain/ für den Branch '#{current_branch}' gefunden."
    fix "Erstelle einen Plan in docs/brain/YYYY-MM-DD-#{branch_slug}.md"
  end

  check "Sprach-Konsistenz (Deutsch)" do
    rule "Alle Regeln und Skill-Beschreibungen in Sentinel müssen auf Deutsch verfasst sein."
    condition do
      # Heuristischer Check: Wir suchen nach typisch englischen Rule-Pattern
      # Wir lesen die Datei selbst ein
      content = File.read(__FILE__)
      # Suche nach rule "..." Blöcken mit englischen Keywords
      !content.match?(/rule\s+"[^"]*(ALWAYS|NEVER|code without|found in)[^"]*"/)
    end
    on_fail "Englische Begriffe in den deutschen Regeln gefunden."
    fix "Übersetze die Regel-Texte ins Deutsche."
  end

  check "Sauberer Workspace für Core-Dateien" do
    rule "Wichtige Konfigurationsdateien wie package.json sollten keine unsauberen Änderungen enthalten."
    status = `git status --porcelain`.strip
    condition { !status.include?('package.json') || current_branch.include?('sentinel') }
    on_fail "Uncommittete Änderungen in package.json gefunden."
    fix "Committe deine Änderungen oder nutze 'git stash'."
  end

  check "Test Dokumentation (README)" do
    rule "Das test/README.md muss die aktuelle Test-Kaskade und Nutzungsanweisungen enthalten."
    target "test/README.md"
    condition do
      return false unless File.exist?("test/README.md")
      content = File.read("test/README.md")
      content.include?("0-process") && 
      content.include?("5-e2e") && 
      content.include?("pnpm run test:sentinel:agent")
    end
    on_fail "Das test/README.md ist unvollständig oder fehlt."
    fix "Aktualisiere das test/README.md basierend auf der aktuellen Framework-Struktur."
  end
end

# Automatisches Format-Wahl
if __FILE__ == $0
  format = ENV['SENTINEL_FORMAT'] == 'agent' ? :agent : :human
  suite.report(format)
  exit(suite.result.success? ? 0 : 1)
end
