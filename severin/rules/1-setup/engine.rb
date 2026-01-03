define_suite "📜aUsN8 Severin Engine Health" do
  description "Regeln für die Entwicklung der globalen Severin-Engine."

  rule "📜xe8VT Änderungen an der Engine müssen IMMER über den Workspace-Pfad 'severin/engine/' erfolgen."

  check "📜6quEB Engine Presence" do
    rule "📜QD3t9 Die Engine muss als 'severin/engine' im Workspace vorhanden sein (Symlink oder Submodule)."
    condition { File.symlink?("severin/engine") || File.directory?("severin/engine") }
    on_fail "Der Pfad 'severin/engine' fehlt."
    fix "git submodule add git@github.com:thoka/severin.git severin/engine"
  end

  check "📜Dj9hj Engine Versioning" do
    rule "📜S9EsU Die Engine-Version in lib/severin.rb muss dem Semantic Versioning folgen."
    condition do
      content = File.read("severin/engine/lib/severin.rb")
      content.match?(/VERSION = "\d+\.\d+\.\d+"/)
    end
    on_fail "Ungültiges Versionsformat in der Engine."
  end

  check "📜51vXy Engine Integrity" do
    rule "📜nmKwQ Wichtige Engine-Dateien müssen vorhanden sein."
    condition do
      File.exist?("severin/engine/bin/sv") &&
      File.exist?("severin/engine/lib/severin.rb") &&
      File.exist?("severin/engine/generate_rules.rb")
    end
    on_fail "Engine-Struktur ist beschädigt."
  end
end
