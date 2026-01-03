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

    # 0. Bereinigung von Relikten (tmp_*) und Archivierung von Brain-Docs
    puts "  -> Bereinige temporäre Dateien (tmp_*)..."
    Dir.glob("**/tmp_*").each do |f|
      if File.file?(f)
        File.delete(f)
        puts "     - #{f} gelöscht"
      end
    end

    puts "  -> Archiviere fertige Brain-Dokumente..."
    branch_slug = branch.split('/').last
    plans = Dir.glob("docs/brain/*#{branch_slug}*").reject { |f| f.include?('walkthrough') || f.include?('/done/') }
    plans.each do |f|
      content = File.read(f)
      unless content.match?(/^\s*-\s*\[ \]/)
        target_dir = "docs/brain/done"
        FileUtils.mkdir_p(target_dir)
        FileUtils.mv(f, File.join(target_dir, File.basename(f)))
        puts "     - #{f} nach #{target_dir}/ verschoben"
      end
    end

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

          # Globalen MCP-Server automatisch aktualisieren (Discovery)
          global_path = nil

          # 1. Check ENV
          if ENV['SEVERIN_HOME'] && Dir.exist?(ENV['SEVERIN_HOME'])
            global_path = ENV['SEVERIN_HOME']
          else
            # 2. Check via 'which sv'
            sv_bin = `which sv 2>/dev/null`.strip
            if !sv_bin.empty?
              # Folge Symlinks bis zum eigentlichen Skript
              real_bin = File.realpath(sv_bin)
              # Wir nehmen an, dass sv in bin/ liegt, also gehen wir zwei Ebenen hoch
              global_path = File.expand_path('../..', real_bin)
            end
          end

          # Fallback auf Standard, falls Discovery fehlschlug
          global_path ||= File.expand_path('~/.severin')

          if Dir.exist?(File.join(global_path, '.git'))
            # Verhindere Update, wenn wir gerade IM globalen Pfad sind (Rekursion)
            if File.expand_path(global_path) != File.expand_path(File.join(Dir.pwd, 'severin/engine'))
              puts "  -> Automatische Aktualisierung der globalen Installation unter #{global_path}..."
              system("git -C #{global_path} pull origin main")
            end
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
      unless commit_action.call(message: "chore(release): final sync before shipping #{branch}")
        puts "❌ Ship abgebrochen: Projekt-Sync fehlgeschlagen."
        next
      end
    else
      puts "⚠️ Warnung: 'commit' Action nicht gefunden, fahre mit manuellem Sync fort."
      unless system("sv gen && git add . && git commit -m 'chore(release): final sync before shipping #{branch}'")
        puts "❌ Ship abgebrochen: Manueller Sync fehlgeschlagen."
        next
      end
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
