
require 'date'

suite = Severin.define_suite "Workcycle & Git Regeln 🔹5yJUs" do
  description "Regeln für die Git-Arbeit, Branching-Strategie und die verpflichtende Planung vor der Implementierung."

  current_branch = `git rev-parse --abbrev-ref HEAD`.strip

  check "Feature Branch 🔹brtTX" do
    rule :workflow, :git, "Code NIEMALS ohne einen Feature-Branch (feature/name) erstellen. Direkte Commits auf main sind verboten. 🔹rIJTD"
    condition { current_branch != 'main' && current_branch != 'master' }
    on_fail "Du befindest dich auf dem 'main' Branch."
    fix "Erstelle einen Feature-Branch: 'git checkout -b feature/dein-feature-name'"
  end

  check "Brain Document (Implementierungsplan) 🔹fLd43" do
    rule :workflow, :git, "VOR der Implementierung IMMER einen Plan in docs/brain/YYYY-MM-DD-feature-name🔹ID.md committen. 🔹2Gtf3"
    branch_slug = current_branch.split('/').last

    condition do
      # Suche in brain und done
      plans = Dir.glob("docs/{brain,done}/**/*#{branch_slug.gsub('feature/', '')}*")
      plans.any? do |f|
        !f.include?('walkthrough') && f.match?(/🔹[a-zA-Z0-9]{5}/)
      end
    end

    on_fail "Kein valider Implementierungsplan (ohne '-' vor 🔹ID) in docs/brain/ für den Branch '#{current_branch}' gefunden."
    fix "Nutze `sv_fix_brain_id --path docs/brain` um Dateinamen zu korrigieren."
  end

  check "Brain Title & ID 🔹T1tlI" do
    rule "Der Titel im Brain-Dokument muss die Requirement-ID enthalten. 🔹idG3n"
    branch_slug = current_branch.split('/').last
    # Suche in brain und done
    plans = Dir.glob("docs/{brain,done}/**/*#{branch_slug.gsub('feature/', '')}*").reject { |f| f.include?('walkthrough') }

    condition do
      plans.all? do |f|
        first_line = File.open(f, &:gets)
        first_line&.match?(/🔹[a-zA-Z0-9]{5}/)
      end
    end
    on_fail "Das Brain-Dokument enthält keine Requirement-ID im Titel."
    fix "Führe `sv_fix_brain_id --path [pfad]` aus."
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

  check "Release-Freigabe (Status) 🔹vP2r9" do
    rule :workflow, "Die 'ship' Action darf nur ausgeführt werden, wenn im Brain-Dokument 'Status: ship-it' steht. Agenten dürfen diesen Status niemals selbst setzen. 🔹nM2p1"
    branch_slug = current_branch.split('/').last
    plans = Dir.glob("docs/brain/**/*#{branch_slug}*").reject { |f| f.include?('walkthrough') }

    condition do
      # Wir erlauben ship nur, wenn ein Dokument den Status 'ship-it' hat
      plans.any? do |f|
        content = File.read(f)
        # Wir suchen nach "Status: ship-it" (Case-Insensitive)
        content.match?(/^Status:\s*ship-it/i)
      end
    end
    on_fail "Das Brain-Dokument hat noch nicht den Status 'Status: ship-it'."
    fix :brain_status, "BITTE DEN NUTZER: 'Bitte setze den Status im Brain-Dokument auf ship-it, wenn du bereit für den Release bist.'"
  end

  check "Plan-Status Position 🔹9VGZq" do
    rule "Der Status muss im Brain-Dokument immer direkt unter der H1-Überschrift stehen. 🔹35SbY"
    branch_slug = current_branch.split('/').last
    plans = Dir.glob("docs/brain/*#{branch_slug}*").reject { |f| f.include?('walkthrough') }

    condition do
      plans.all? do |f|
        lines = File.readlines(f).map(&:strip).reject(&:empty?)
        # Erste Zeile H1, zweite Zeile Status
        lines[0]&.start_with?('# ') && lines[1]&.start_with?('Status:')
      end
    end
    on_fail "Der Status im Brain-Dokument fehlt oder steht nicht direkt unter der H1-Überschrift."
    fix "Verschiebe die 'Status:' Zeile direkt unter die H1-Überschrift."
  end

  check "Keine Unterordner in docs/brain 🔹BRN-FLAT" do
    rule "Es darf keine Unterordner unter docs/brain geben. Alle Dokumente müssen direkt dort liegen. 🔹BRN-FLAT"
    condition do
      # Suche alle Einträge in docs/brain
      return true unless Dir.exist?("docs/brain")
      entries = Dir.children("docs/brain").select do |entry|
        path = File.join("docs/brain", entry)
        File.directory?(path) && !entry.include?('walkthrough')
      end
      entries.empty?
    end
    on_fail "Struktur-Fehler: Unterordner in docs/brain/ gefunden: #{Dir.glob("docs/brain/*/").join(', ')}"
    fix "mv docs/brain/*/*.md docs/brain/ 2>/dev/null; find docs/brain -mindepth 1 -type d -not -name 'walkthrough' -exec rm -rf {} +"
  end

  check "Archivierung nach docs/done 🔹BRN-ARCHIVE" do
    rule "Dokumente in docs/brain/done sollen nach docs/done verschoben werden. 🔹BRN-ARCHIVE"
    condition do
      !Dir.exist?("docs/brain/done") || Dir.empty?("docs/brain/done")
    end
    on_fail "Dateien in docs/brain/done gefunden, die nach docs/done verschoben werden müssen."
    fix "mkdir -p docs/done && mv docs/brain/done/* docs/done/ 2>/dev/null; rm -rf docs/brain/done"
  end

  check "Brain ID Format (kein Bindestrich) 🔹BRN-DASH" do
    rule "Die ID im Dateinamen sollte direkt nach dem Titel ohne Bindestrich folgen (z.B. Titel🔹ID.md). 🔹BRN-DASH"
    condition do
      plans_with_dash = Dir.glob("docs/brain/**/*-🔹*")
      plans_with_dash.empty?
    end
    on_fail "Brain-Dokumente mit Bindestrich vor der ID gefunden: #{Dir.glob("docs/brain/**/*-🔹*").join(', ')}"
    fix "Nutze `sv_fix_brain_id --path docs/brain` um die Bindestriche zu entfernen."
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
