suite = Severin.define_suite "MCP Integrität 🔹yLjQ5" do
  description "Stellt sicher, dass der Severin MCP-Server für KI-Agenten korrekt konfiguriert ist."

  engine_server = File.expand_path("severin/engine/mcp/server.rb")

  check "Globale Engine vorhanden 🔹PjBKu" do
    rule "Der MCP-Server muss unter #{engine_server} existieren. 🔹SwcSe"
    condition { File.exist?(engine_server) }
    on_fail "Die Severin-Engine fehlt im Projektverzeichnis."
    fix "Stelle sicher, dass 'severin/engine' vorhanden ist (Symlink oder Submodule)."
  end

  check "MCP Ausführbarkeit 🔹ZfPam" do
    rule "Der MCP-Server muss vom System geladen werden können. 🔹TJUET"
    condition { File.readable?(engine_server) }
    on_fail "Berechtigungsproblem beim Zugriff auf den MCP-Server."
    fix "Prüfe die Dateiberechtigungen: 'chmod +r #{engine_server}'"
  end

  check "Cursor Integration Hinweis 🔹2Pw8c" do
    rule "Der MCP-Server sollte in den Cursor Settings als 'command' Server registriert sein. 🔹mzrvu"
    condition { true }
    on_fail "Manuelle Prüfung erforderlich."
    fix "Prüfe in Cursor: Settings -> Features -> MCP -> Add Server (ruby #{engine_server})"
  end
end
