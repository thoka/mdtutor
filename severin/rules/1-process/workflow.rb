
require 'date'

suite = Severin.define_suite "Workcycle & Git Regeln 🔹5yJUs" do
  description "Regeln für die Git-Arbeit, Branching-Strategie und die verpflichtende Planung vor der Implementierung."

  current_branch = `git rev-parse --abbrev-ref HEAD`.strip

  check "Feature Branch 🔹brtTX" do
    rule "Code NIEMALS ohne einen Feature-Branch (feature/name) erstellen. Direkte Commits auf main sind verboten. 🔹rIJTD"
    condition { current_branch != 'main' && current_branch != 'master' }
    on_fail "Du befindest dich auf dem 'main' Branch."
    fix "Erstelle einen Feature-Branch: 'git checkout -b feature/dein-feature-name'"
  end

  check "Brain Document (Implementierungsplan) 🔹fLd43" do
    rule "VOR der Implementierung IMMER einen Plan in docs/brain/YYYY-MM-DD-feature-name.md committen. 🔹2Gtf3"
    branch_slug = current_branch.split('/').last

    condition do
      plans = Dir.glob("docs/brain/**/*#{branch_slug}*")
      plans.any? { |f| !f.include?('walkthrough') }
    end

    on_fail "Kein Implementierungsplan in docs/brain/ für den Branch '#{current_branch}' gefunden."
    fix "Erstelle einen Plan in docs/brain/YYYY-MM-DD-#{branch_slug}.md"
  end

  check "Brain Task Format 🔹XdbXR" do
    rule "Tasks müssen als Markdown-Checklisten (- [ ] / - [x]) definiert sein. 🔹cy6jG"
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

  check "Brain Tasks Status 🔹NmRtH" do
    rule "Alle geplanten Tasks im Brain-Dokument sollten vor dem Shipping abgeschlossen (- [x]) sein. 🔹1VAMl"
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

  check "Sprach-Konsistenz (Deutsch) 🔹PJcKP" do
    rule "Alle Regeln und Skill-Beschreibungen in Severin müssen auf Deutsch verfasst sein. 🔹fhmjc"
    condition do
      content = File.read(__FILE__)
      !content.match?(/rule\s+"[^"]*(ALWAYS|NEVER|code without|found in)[^"]*"/)
    end
    on_fail "Englische Begriffe in den deutschen Regeln gefunden."
    fix "Übersetze die Regel-Texte ins Deutsche."
  end

  check "Sauberer Workspace für Core-Dateien 🔹Xg87A" do
    rule "Wichtige Konfigurationsdateien wie package.json sollten keine unsauberen Änderungen enthalten. 🔹ae4E5"
    status = `git status --porcelain`.strip
    condition { !status.include?('package.json') || current_branch.include?('severin') }
    on_fail "Uncommittete Änderungen in package.json gefunden."
    fix "Committe deine Änderungen oder nutze 'git stash'."
  end

  check "Test Dokumentation (README) 🔹fuodx" do
    rule "Das severin/README.md muss die aktuelle Struktur und Nutzungsanweisungen enthalten. 🔹qE5WY"
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
