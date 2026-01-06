Severin.define_action "branch" do
  description "Erstellt einen neuen Feature-Branch basierend auf einer Brain-ID."

  guide <<~MARKDOWN
    1. Nutze dieses Tool, um einen neuen Feature-Branch zu starten.
    2. Das Tool sucht automatisch nach dem passenden Brain-Dokument zur ID.
    3. Es erstellt einen Branch im Format `feature/titel-🔹ID`.
    4. Optional: Aktiviert den Branch-Fokus in der `severin_state.rb` (manuell/geplant).
  MARKDOWN

  params do
    requires :id, type: :string, desc: "Die Requirement-ID (🔹xxxxx)"
  end

  execute do |p|
    id = p[:id] || p["id"]
    unless id
      puts "❌ Fehler: Eine ID (🔹xxxxx) ist erforderlich."
      next
    end

    # Normalisiere ID (🔹 entfernen falls vorhanden für die Suche, dann wieder dran)
    id_clean = id.gsub("🔹", "")
    id_full = "🔹#{id_clean}"

    # Suche Brain Doc
    brain_dir = File.expand_path("docs/brain", Severin.project_root)
    docs = Dir.glob(File.join(brain_dir, "*#{id_clean}*.md"))

    if docs.empty?
      puts "❌ Kein Brain-Dokument für ID #{id_full} unter docs/brain/ gefunden."
      next
    end

    doc_path = docs.first
    filename = File.basename(doc_path, ".md")

    # Extrahiere Titel (alles vor der ID)
    title_part = filename.split("🔹").first
    # Entferne Datum am Anfang (YYYY-MM-DD-)
    title = title_part.gsub(/^\d{4}-\d{2}-\d{2}-/, "")

    branch_name = "feature/#{title}-#{id_full}"

    puts "🌿 Erstelle Branch: #{branch_name}..."

    if system("git checkout -b #{branch_name}")
      puts "✅ Branch '#{branch_name}' erfolgreich erstellt und gewechselt."
    else
      puts "❌ Fehler beim Erstellen des Branches."
    end
  end
end
