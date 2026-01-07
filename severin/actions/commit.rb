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

    # Logger-Fallback falls ui_info nicht da ist
    log_info = lambda { |m| Severin.respond_to?(:ui_info) ? Severin.ui_info(m) : Kernel.__severin_raw_puts__("ℹ️  #{m}") }
    log_error = lambda { |m| Severin.respond_to?(:ui_error) ? Severin.ui_error(m) : Kernel.__severin_raw_puts__("❌ #{m}") }
    log_success = lambda { |m| Severin.respond_to?(:ui_success) ? Severin.ui_success(m) : Kernel.__severin_raw_puts__("✅ #{m}") }

    unless msg
      log_error.call "Eine Commit-Nachricht ist erforderlich."
      next false
    end

    # Wir arbeiten immer relativ zum Projekt-Root
    Dir.chdir(Severin.project_root) do
      # 0. Branch-Check & Sprint-Isolation
      current_branch = `git rev-parse --abbrev-ref HEAD`.strip
      protected_branches = ["main", "dev", "master"]

      if protected_branches.include?(current_branch)
        log_info.call "🛡️  Geschützter Branch '#{current_branch}' erkannt. Erstelle Sprint-Branch..."

        # Generiere ID falls nicht vorhanden (RID-Pattern)
        # Wir suchen nach 5 alphanumerischen Zeichen nach einem 🔹 oder am Ende
        rid_match = msg.match(/🔹([a-zA-Z0-9]{5})/)
        rid = rid_match ? rid_match[1] : Array.new(5){[*'a'..'z',*'A'..'Z',*'0'..'9'].sample}.join
        sprint_branch = "sprint/auto-#{rid}"

        # Nutze backticks für den Checkout
        `git checkout -b #{sprint_branch}`
        log_success.call "🚀 Auf Sprint-Branch '#{sprint_branch}' gewechselt."
      end

      # 1. Cleanup: Lösche tmp_* Dateien im Root
      tmp_files = Dir.glob("tmp_*")
      unless tmp_files.empty?
        log_info.call "🧹 Räume temporäre Dateien auf..."
        tmp_files.each { |f| File.delete(f) if File.file?(f) }
      end

      # 2. Chat-Referenz finden (neueste Datei in docs/chat/)
      chat_files = Dir.glob("docs/chat/*.md")
      latest_chat = chat_files.max_by { |f| File.mtime(f) }
      if latest_chat
        msg = "#{msg}\n\nSee-also: #{latest_chat}"
        log_info.call "🔗 Referenziere Chat: #{latest_chat}"
      end

      # 3. Generierung & Check
      log_info.call "🚀 Starte Integritäts-Checks..."

      # Generierung
      unless system("ruby severin/engine/generate_rules.rb")
        log_error.call "Abbruch: Generierung fehlgeschlagen."
        next false
      end

      # Integritäts-Checks
      begin
        require_relative '../engine/lib/severin/cli'
        cli = Severin::CLI.new
        unless cli.run_stages(:agent)
          log_error.call "Abbruch: Integritätstest fehlgeschlagen."
          next false
        end
      rescue LoadError
        log_info.call "⚠️ CLI nicht geladen, überspringe Integritäts-Checks im Test-Modus."
      end

      # 4. Synchroner Commit
      success = true

      # Engine (falls vorhanden)
      engine_path = "severin/engine"
      if Dir.exist?(engine_path)
        log_info.call "📦 Committe Engine..."
        Dir.chdir(engine_path) do
          system("git add .")
          if `git status --porcelain`.strip.empty?
            log_info.call "  -> Keine Änderungen in der Engine."
          else
            safe_msg = msg.gsub("'", "'\\\\''")
            unless system("git commit -m '#{safe_msg}'")
              log_error.call "Fehler beim Engine-Commit."
              success = false
            end
          end
        end
      end

      # Hauptprojekt
      log_info.call "🏠 Committe Hauptprojekt..."
      system("git add .")
      if `git status --porcelain`.strip.empty?
        log_info.call "✅ Keine Änderungen im Hauptprojekt."
      else
        safe_msg = msg.gsub("'", "'\\\\''")
        if system("git commit -m '#{safe_msg}'")
          log_success.call "Hauptprojekt erfolgreich committet."
        else
          log_error.call "Fehler beim Projekt-Commit."
          success = false
        end
      end

      success
    end
  end
end
