require 'severin'
require 'date'

suite = Severin.define_suite "Workcycle & Git Regeln" do
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
    rule "Alle Regeln und Skill-Beschreibungen in Severin müssen auf Deutsch verfasst sein."
    condition do
      content = File.read(__FILE__)
      !content.match?(/rule\s+"[^"]*(ALWAYS|NEVER|code without|found in)[^"]*"/)
    end
    on_fail "Englische Begriffe in den deutschen Regeln gefunden."
    fix "Übersetze die Regel-Texte ins Deutsche."
  end

  check "Sauberer Workspace für Core-Dateien" do
    rule "Wichtige Konfigurationsdateien wie package.json sollten keine unsauberen Änderungen enthalten."
    status = `git status --porcelain`.strip
    condition { !status.include?('package.json') || current_branch.include?('severin') }
    on_fail "Uncommittete Änderungen in package.json gefunden."
    fix "Committe deine Änderungen oder nutze 'git stash'."
  end

  check "Test Dokumentation (README)" do
    rule "Das severin/README.md muss die aktuelle Struktur und Nutzungsanweisungen enthalten."
    target "severin/README.md"
    condition do
      return false unless File.exist?("severin/README.md")
      content = File.read("severin/README.md")
      content.include?("rules/") &&
      content.include?("actions/") &&
      content.include?("SENTINEL_FORMAT=agent")
    end
    on_fail "Das severin/README.md ist unvollständig oder fehlt."
    fix "Aktualisiere das severin/README.md basierend auf der neuen Orchestrator-Struktur."
  end
end

