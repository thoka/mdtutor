Severin.define_action "commit" do
  description "Führt einen orchestrierten Projekt-Commit aus (Generierung, Integritäts-Checks und Git-Commit)."

  guide <<~MARKDOWN
    1. Nutze dieses Tool für ALLE Projekt-Commits. Es stellt sicher, dass Dokumentation und Regeln synchron sind.
    2. Die Commit-Nachricht MUSS Conventional Commits entsprechen.
    3. Das Tool führt automatisch `sv gen` und `sv check` aus. Falls diese fehlschlagen, wird der Commit abgebrochen.
  MARKDOWN

  params do
    requires :message, type: :string, desc: "Die Commit-Nachricht (Conventional Commit Format)"
  end

  execute do |p|
    msg = p[:message] || p["message"]
    unless msg
      puts "❌ Fehler: Eine Commit-Nachricht ist erforderlich."
      false
    else
      puts "🚀 Starte orchestrierten Projekt-Commit..."

      # 1. Generierung
      puts "  -> Generiere Regeln..."
      unless system("ruby severin/engine/generate_rules.rb")
        puts "❌ Abbruch: Generierung fehlgeschlagen."
        false
      else
        # 2. Integritäts-Check (wir laden die CLI um run_stages zu nutzen)
        puts "  -> Prüfe Integrität..."
        require_relative '../engine/lib/severin/cli'
        cli = Severin::CLI.new
        unless cli.run_stages(:agent)
          puts "❌ Abbruch: Integritätstest fehlgeschlagen."
          false
        else
          # 3. Git Commit
          puts "  -> Committe Änderungen..."
          system("git add .")
          if `git status --porcelain`.strip.empty?
            puts "✅ Keine Änderungen zu committen."
            true
          elsif system("git commit -m '#{msg}'")
            puts "✅ Projekt erfolgreich committet."
            true
          else
            puts "❌ Fehler beim Git-Commit."
            false
          end
        end
      end
    end
  end
end
