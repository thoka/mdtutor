Severin.define_action "commit-engine" do
  description "Commitet Änderungen in der Severin-Engine."

  guide <<~MARKDOWN
    1. Nutze dieses Tool, wenn du Dateien unter `severin/engine/` geändert hast.
    2. Die Commit-Nachricht MUSS den 'feat:' oder 'fix:' Präfix nach Conventional Commits enthalten.
    3. Beziehe dich in der Nachricht auf die geänderte Komponente (z.B. `feat(cli): ...`).
  MARKDOWN

  params do
    requires :message, type: :string, desc: "Die Commit-Nachricht (Conventional Commit Format)"
  end

  execute do |p|
    msg = p[:message] || p["message"]
    unless msg
      puts "❌ Fehler: Eine Commit-Nachricht ist erforderlich."
      next
    end

    engine_path = "severin/engine"
    unless Dir.exist?(engine_path)
      puts "❌ Fehler: Pfad #{engine_path} nicht gefunden."
      next
    end

    puts "🚀 Committing engine changes via #{engine_path}..."

    # We use a subshell to avoid changing the current process directory permanently if possible,
    # but Dir.chdir with a block is safer in Ruby.
    Dir.chdir(engine_path) do
      if system("git add .") && system("git commit -m '#{msg}'")
        puts "✅ Engine erfolgreich committet."
      else
        puts "❌ Fehler beim Committen der Engine."
      end
    end
  end
end
