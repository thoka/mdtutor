define_suite "Severin Engine Health" do
  description "Regeln für die Entwicklung der globalen Severin-Engine."

  rule "Änderungen an der Engine müssen IMMER über den Workspace-Pfad 'severin/engine/' erfolgen."

  check "Engine Presence" do
    rule "Die Engine muss als 'severin/engine' im Workspace vorhanden sein (Symlink oder Submodule)."
    condition { File.symlink?("severin/engine") || File.directory?("severin/engine") }
    on_fail "Der Pfad 'severin/engine' fehlt."
    fix "git submodule add git@github.com:thoka/severin.git severin/engine"
  end

  check "Engine Versioning" do
    rule "Die Engine-Version in lib/severin.rb muss dem Semantic Versioning folgen."
    condition do
      content = File.read("severin/engine/lib/severin.rb")
      content.match?(/VERSION = "\d+\.\d+\.\d+"/)
    end
    on_fail "Ungültiges Versionsformat in der Engine."
  end

  check "Engine Integrity" do
    rule "Wichtige Engine-Dateien müssen vorhanden sein."
    condition do
      File.exist?("severin/engine/bin/sv") &&
      File.exist?("severin/engine/lib/severin.rb") &&
      File.exist?("severin/engine/generate_rules.rb")
    end
    on_fail "Engine-Struktur ist beschädigt."
  end
end
