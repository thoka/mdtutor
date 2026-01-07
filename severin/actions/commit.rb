Severin.define_action "commit" do
  description "Führt einen synchronisierten Projekt- und Engine-Commit aus (mit Cleanup und Chat-Referenz)."

  guide <<~MARKDOWN
    1. Löscht automatisch alle temporären Dateien (`tmp_*`).
    2. Ermittelt das neueste Summary in `docs/chat/` und referenziert es.
    3. Führt `sv gen` und `sv check` aus.
    4. Committet Änderungen in Hauptprojekt UND Engine synchron.
  MARKDOWN

  params do
    requires :message, type: :string, desc: "Die Commit-Nachricht"
  end

  execute do |p|
    msg = p[:message] || p["message"]
    unless msg
      Severin.ui_error "Eine Commit-Nachricht ist erforderlich."
      next false
    end

    # Wir arbeiten immer relativ zum Projekt-Root
    Dir.chdir(Severin.project_root) do
      # 1. Cleanup: Lösche tmp_* Dateien im Root
      tmp_files = Dir.glob("tmp_*")
      unless tmp_files.empty?
        Severin.ui_info "🧹 Räume temporäre Dateien auf..."
        tmp_files.each { |f| File.delete(f) if File.file?(f) }
      end

      # 2. Chat-Referenz finden (neueste Datei in docs/chat/)
      chat_files = Dir.glob("docs/chat/*.md")
      latest_chat = chat_files.max_by { |f| File.mtime(f) }
      if latest_chat
        msg = "#{msg}\n\nSee-also: #{latest_chat}"
        Severin.ui_info "🔗 Referenziere Chat: #{latest_chat}"
      end

      # 3. Generierung & Check
      Severin.ui_info "🚀 Starte Integritäts-Checks..."
      
      # Generierung
      unless system("ruby severin/engine/generate_rules.rb")
        Severin.ui_error "Abbruch: Generierung fehlgeschlagen."
        next false
      end

      # Integritäts-Checks
      require_relative '../engine/lib/severin/cli'
      cli = Severin::CLI.new
      unless cli.run_stages(:agent)
        Severin.ui_error "Abbruch: Integritätstest fehlgeschlagen."
        next false
      end

      # 4. Synchroner Commit
      success = true
      
      # Engine (falls vorhanden)
      engine_path = "severin/engine"
      if Dir.exist?(engine_path)
        Severin.ui_info "📦 Committe Engine..."
        Dir.chdir(engine_path) do
          system("git add .")
          if `git status --porcelain`.strip.empty?
            Severin.ui_info "  -> Keine Änderungen in der Engine."
          else
            safe_msg = msg.gsub("'", "'\\\\''")
            unless system("git commit -m '#{safe_msg}'")
              Severin.ui_error "Fehler beim Engine-Commit."
              success = false
            end
          end
        end
      end

      # Hauptprojekt
      Severin.ui_info "🏠 Committe Hauptprojekt..."
      system("git add .")
      if `git status --porcelain`.strip.empty?
        Severin.ui_info "✅ Keine Änderungen im Hauptprojekt."
      else
        safe_msg = msg.gsub("'", "'\\\\''")
        if system("git commit -m '#{safe_msg}'")
          Severin.ui_success "Hauptprojekt erfolgreich committet."
        else
          Severin.ui_error "Fehler beim Projekt-Commit."
          success = false
        end
      end

      success
    end
  end
end
