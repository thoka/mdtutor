Severin.define_action "ship" do
  description "Führt den stabilen Stand vom aktuellen Entwicklungs-Branch (z.B. 'dev') nach 'main' zusammen."

  guide <<~MARKDOWN
    1. Nutze dieses Tool, wenn der Stand auf deinem Arbeits-Branch stabil ist.
    2. Es pusht Änderungen in der Engine automatisch.
    3. Es mergt den aktuellen Branch nach 'main' und pusht alles zu GitHub.
  MARKDOWN

  execute do |p|
    branch = `git rev-parse --abbrev-ref HEAD`.strip
    if branch == "main" || branch == "master"
      Severin.ui_error "Ship muss von einem Entwicklungs-Branch (z.B. 'dev') aus gestartet werden."
      next false
    end

    Severin.ui_info "🚀 Starte Release-Prozess für Branch '#{branch}'..."

    # 1. Engine Submodule prüfen und pushen
    engine_path = "severin/engine"
    if Dir.exist?(File.join(engine_path, ".git"))
      Severin.ui_info "  -> Synchronisiere Severin Engine..."
      begin
        Dir.chdir(engine_path) do
          if `git status --short`.strip != ""
            Severin.ui_error "Uncommittete Änderungen in der Engine. Bitte erst 'sv commit' nutzen."
            raise "Engine unclean"
          end
          unless system("git push origin main")
            Severin.ui_error "Push der Engine fehlgeschlagen."
            raise "Engine push failed"
          end
        end
      rescue => e
        next false
      end
    end

    # 2. Finaler Projekt-Commit
    Severin.ui_info "  -> Finaler Projekt-Sync..."
    commit_action = Severin.actions["commit"]
    if commit_action
      unless commit_action.call(message: "chore(release): final sync before shipping #{branch}")
        Severin.ui_error "Projekt-Sync fehlgeschlagen."
        next false
      end
    else
      Severin.ui_error "Commit-Action nicht gefunden."
      next false
    end

    # 3. Merge nach main
    Severin.ui_info "  -> Merging #{branch} nach main..."
    system("git fetch origin main")

    unless system("git checkout main && git pull origin main --rebase && git merge #{branch} --no-edit")
      Severin.ui_error "Fehler beim Mergen nach main. Bitte Konflikte manuell lösen."
      system("git checkout #{branch}")
      next false
    end

    # 4. Push main
    Severin.ui_info "  -> Pushe Änderungen zu GitHub..."
    if system("git push origin main")
      Severin.ui_success "Release erfolgreich nach main gepusht."
      # Trigger MCP Restart
      system("sv mcp-restart >/dev/null 2>&1") if system("which sv >/dev/null 2>&1")
    else
      Severin.ui_error "Fehler beim Push von main."
      system("git checkout #{branch}")
      next false
    end

    # Zurück zum Ursprungs-Branch
    system("git checkout #{branch}")
    true
  end
end
