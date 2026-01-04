Severin.define_tool "next-id" do
  description "Generiert eine neue, projektweit eindeutige Requirement-ID (🔹xxxxx)."
  execute do
    puts Severin::Identifier.next_unique
  end
end

Severin.define_tool "fix-brain-id" do
  description "Stellt sicher, dass Brain-Dokumente eine ID im Titel und Dateinamen haben (ohne führenden Bindestrich)."
  params do
    requires :path, type: :string, desc: "Pfad zur Datei oder zum Verzeichnis"
  end
  execute do |p|
    path = p[:path] || p["path"]
    unless path && File.exist?(path)
      puts "❌ Fehler: Pfad '#{path}' nicht gefunden."
      next
    end

    files = File.directory?(path) ? Dir.glob(File.join(path, "**/*.md")) : [path]
    files.each do |file|
      content = File.read(file)
      ids = Severin::Identifier.extract(content)
      id = ids.first

      unless id
        id = Severin::Identifier.next_unique.sub("🔹", "")
        # Füge ID zur ersten Zeile hinzu, falls sie fehlt
        content.sub!(/^(# .*)/, "\\1 🔹#{id}")
        File.write(file, content)
        puts "✅ ID 🔹#{id} zu #{file} hinzugefügt."
      end

      dirname = File.dirname(file)
      basename = File.basename(file, ".md")
      
      # Entferne Bindestrich vor der ID falls vorhanden und stelle sicher dass die ID am Ende steht
      # Wir suchen nach der ID mit oder ohne Bindestrich davor
      clean_basename = basename.gsub(/-?🔹#{id}/, "")
      new_basename = "#{clean_basename}🔹#{id}"
      
      if basename != new_basename
        new_path = File.join(dirname, "#{new_basename}.md")
        File.rename(file, new_path)
        puts "✅ Umbenannt: #{file} -> #{new_path}"
      else
        puts "OK: #{file}"
      end
    end
  end
end
