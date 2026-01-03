Severin.define_action "ship" do
  description "Führt den vollständigen Release-Prozess nach 'main' aus (inkl. Submodule-Sync)."

  guide <<~MARKDOWN
    1. Nutze dieses Tool nur von einem Feature-Branch aus.
    2. Es pusht Änderungen im Submodule `severin/engine` automatisch nach GitHub.
    3. Es führt einen finalen `sv commit` im Hauptprojekt aus.
    4. Es mergt den Feature-Branch nach `main` und pusht alles zu GitHub.
  MARKDOWN

  execute do |p|
    branch = `git rev-parse --abbrev-ref HEAD`.strip
    if branch == "main" || branch == "master"
      puts "❌ Fehler: Ship muss von einem Feature-Branch aus gestartet werden."
      next
    end

    puts "🚀 Starte Release-Prozess für Branch '#{branch}'..."

    # 1. Engine Submodule prüfen und pushen
    engine_path = "severin/engine"
    if Dir.exist?(File.join(engine_path, ".git"))
      puts "  -> Synchronisiere Severin Engine..."
      # Wir nutzen einen Block für Dir.chdir um sicher zurückzukehren
      begin
        Dir.chdir(engine_path) do
          # Prüfe auf uncommittete Änderungen in der Engine
          if `git status --short`.strip != ""
            puts "❌ Fehler: Uncommittete Änderungen in der Engine (severin/engine). Bitte erst 'sv commit-engine' nutzen."
            # Wir werfen eine Exception um den äußeren Prozess zu stoppen
            raise "Engine unclean"
          end
          # Push Engine (falls noch nicht auf Remote)
          unless system("git push origin main")
            puts "❌ Fehler: Push der Engine fehlgeschlagen."
            raise "Engine push failed"
          end
        end
      rescue => e
        next if e.message == "Engine unclean" || e.message == "Engine push failed"
        puts "❌ Unerwarteter Fehler bei der Engine: #{e.message}"
        next
      end
    end

    # 2. Finaler Projekt-Commit (nutzt die bestehende Logik)
    puts "  -> Finaler Projekt-Sync..."
    # Wir laden die Action dynamisch
    commit_action = Severin.actions["commit"]
    if commit_action
      commit_action.call(message: "chore(release): final sync before shipping #{branch}")
    else
      puts "⚠️ Warnung: 'commit' Action nicht gefunden, fahre mit manuellem Sync fort."
      system("sv gen && git add . && git commit -m 'chore(release): final sync before shipping #{branch}'")
    end

    # 3. Merge nach main
    puts "  -> Merging nach main..."
    # Wir holen erst die neuesten Änderungen von main
    system("git fetch origin main")
    
    unless system("git checkout main && git pull origin main --rebase && git merge #{branch} --no-edit")
      puts "❌ Fehler beim Mergen nach main. Bitte Konflikte manuell lösen."
      system("git checkout #{branch}")
      next
    end

    # 4. Push zum Projekt-Remote
    puts "  -> Pushe Änderungen zu GitHub..."
    if system("git push origin main")
      puts "✅ Release erfolgreich nach main gepusht."
    else
      puts "❌ Fehler beim Push von main."
    end

    # Zurück zum Feature Branch
    system("git checkout #{branch}")
  end
end

