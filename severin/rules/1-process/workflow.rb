
require 'date'

suite = Severin.define_suite "📜5yJUs Workcycle & Git Regeln" do
  description "Regeln für die Git-Arbeit, Branching-Strategie und die verpflichtende Planung vor der Implementierung."

  current_branch = `git rev-parse --abbrev-ref HEAD`.strip

  check "📜brtTX Feature Branch" do
    rule "📜rIJTD Code NIEMALS ohne einen Feature-Branch (feature/name) erstellen. Direkte Commits auf main sind verboten."
    condition { current_branch != 'main' && current_branch != 'master' }
    on_fail "Du befindest dich auf dem 'main' Branch."
    fix "Erstelle einen Feature-Branch: 'git checkout -b feature/dein-feature-name'"
  end

  check "📜fLd43 Brain Document (Implementierungsplan)" do
    rule "📜2Gtf3 VOR der Implementierung IMMER einen Plan in docs/brain/YYYY-MM-DD-feature-name.md committen."
    branch_slug = current_branch.split('/').last

    condition do
      plans = Dir.glob("docs/brain/**/*#{branch_slug}*")
      plans.any? { |f| !f.include?('walkthrough') }
    end

    on_fail "Kein Implementierungsplan in docs/brain/ für den Branch '#{current_branch}' gefunden."
    fix "Erstelle einen Plan in docs/brain/YYYY-MM-DD-#{branch_slug}.md"
  end

  check "📜XdbXR Brain Task Format" do
    rule "📜cy6jG Tasks müssen als Markdown-Checklisten (- [ ] / - [x]) definiert sein."
    branch_slug = current_branch.split('/').last
    plans = Dir.glob("docs/brain/**/*#{branch_slug}*").reject { |f| f.include?('walkthrough') }

    condition do
      plans.all? do |f|
        content = File.read(f)
        content.include?("- [ ]") || content.include?("- [x]")
      end
    end

    on_fail "Brain-Dokument enthält keine Tasks im Format '- [ ]'."
    fix "Füge Tasks im Format '- [ ]' zum Brain-Dokument hinzu."
  end

  check "📜NmRtH Brain Tasks Status" do
    rule "📜1VAMl Alle geplanten Tasks im Brain-Dokument sollten vor dem Shipping abgeschlossen (- [x]) sein."
    branch_slug = current_branch.split('/').last
    plans = Dir.glob("docs/brain/**/*#{branch_slug}*").reject { |f| f.include?('walkthrough') }

    condition do
      plans.all? do |f|
        content = File.read(f)
        # Suche nach offenen Checkboxen
        !content.match?(/^\s*-\s*\[ \]/)
      end
    end

    on_fail "Es gibt noch offene Tasks in den Brain-Dokumenten: #{plans.join(', ')}"
    fix "Markiere alle erledigten Tasks mit [x]."
  end

  check "📜PJcKP Sprach-Konsistenz (Deutsch)" do
    rule "📜fhmjc Alle Regeln und Skill-Beschreibungen in Severin müssen auf Deutsch verfasst sein."
    condition do
      content = File.read(__FILE__)
      !content.match?(/rule\s+"[^"]*(ALWAYS|NEVER|code without|found in)[^"]*"/)
    end
    on_fail "Englische Begriffe in den deutschen Regeln gefunden."
    fix "Übersetze die Regel-Texte ins Deutsche."
  end

  check "📜Xg87A Sauberer Workspace für Core-Dateien" do
    rule "📜ae4E5 Wichtige Konfigurationsdateien wie package.json sollten keine unsauberen Änderungen enthalten."
    status = `git status --porcelain`.strip
    condition { !status.include?('package.json') || current_branch.include?('severin') }
    on_fail "Uncommittete Änderungen in package.json gefunden."
    fix "Committe deine Änderungen oder nutze 'git stash'."
  end

  check "📜fuodx Test Dokumentation (README)" do
    rule "📜qE5WY Das severin/README.md muss die aktuelle Struktur und Nutzungsanweisungen enthalten."
    target "severin/README.md"
    condition do
      return false unless File.exist?("severin/README.md")
      content = File.read("severin/README.md")
      content.include?("environments.rb")
    end
    on_fail "Das severin/README.md ist unvollständig."
    fix "Aktualisiere das severin/README.md basierend auf der neuen Orchestrator-Struktur."
  end
end
