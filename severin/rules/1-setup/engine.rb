define_suite "Severin Engine Health 🔹aUsN8" do
  description "Regeln für die Entwicklung der globalen Severin-Engine."

  rule "Änderungen an der Engine müssen IMMER über den Workspace-Pfad 'severin/engine/' erfolgen. 🔹xe8VT"

  check "Engine Presence 🔹6quEB" do
    rule "Die Engine muss als 'severin/engine' im Workspace vorhanden sein (Symlink oder Submodule). 🔹QD3t9"
    condition { File.symlink?("severin/engine") || File.directory?("severin/engine") }
    on_fail "Der Pfad 'severin/engine' fehlt."
    fix "git submodule add git@github.com:thoka/severin.git severin/engine"
  end

  check "Engine Versioning 🔹Dj9hj" do
    rule "Die Engine-Version in lib/severin.rb muss dem Semantic Versioning folgen. 🔹S9EsU"
    condition do
      content = File.read("severin/engine/lib/severin.rb")
      content.match?(/VERSION = "\d+\.\d+\.\d+"/)
    end
    on_fail "Ungültiges Versionsformat in der Engine."
  end

  check "Engine Integrity 🔹51vXy" do
    rule "Wichtige Engine-Dateien müssen vorhanden sein. 🔹nmKwQ"
    condition do
      File.exist?("severin/engine/bin/sv") &&
      File.exist?("severin/engine/lib/severin.rb") &&
      File.exist?("severin/engine/generate_rules.rb")
    end
    on_fail "Engine-Struktur ist beschädigt."
  end

  check "MCP Availability 🔹MCP-A" do
    rule "Alle registrierten MCP-Server müssen online sein (STRICT-FAIL). 🔹MCP-S"
    condition do
      Severin.mcp_clients.all? { |name, client| client.alive? }
    end
    on_fail "Einer oder mehrere MCP-Server sind offline."
    fix "Prüfe die MCP-Verbindung oder setze 'allow_warnings: [:mcp_offline]' im State."
  end

  check "Engine Environment Integrity 🔹ENG-ENV" do
    rule "Sub-Prozesse der Engine müssen den korrekten Bundler-Kontext nutzen. 🔹xe8VT"
    condition do
      # Wir prüfen, ob in der CLI-Datei der Gemfile-Schutz implementiert ist
      cli_content = File.read("severin/engine/lib/severin/cli.rb")
      cli_content.include?("BUNDLE_GEMFILE=") && cli_content.include?("bundle exec")
    end
    on_fail "Engine-Operationen außerhalb des Engine-Verzeichnisses detektiert ohne BUNDLE_GEMFILE-Schutz."
    fix "Stelle sicher, dass alle 'system'-Aufrufe in der CLI 'BUNDLE_GEMFILE' setzen."
  end
end
