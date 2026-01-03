suite = Severin.define_suite "MCP Integrität" do
  description "Stellt sicher, dass der Severin MCP-Server für KI-Agenten korrekt konfiguriert ist."

  engine_server = File.expand_path("severin/engine/mcp/server.rb")

  check "Globale Engine vorhanden" do
    rule "Der MCP-Server muss unter #{engine_server} existieren."
    condition { File.exist?(engine_server) }
    on_fail "Die Severin-Engine fehlt im Projektverzeichnis."
    fix "Stelle sicher, dass 'severin/engine' vorhanden ist (Symlink oder Submodule)."
  end

  check "MCP Ausführbarkeit" do
    rule "Der MCP-Server muss vom System geladen werden können."
    condition { File.readable?(engine_server) }
    on_fail "Berechtigungsproblem beim Zugriff auf den MCP-Server."
    fix "Prüfe die Dateiberechtigungen: 'chmod +r #{engine_server}'"
  end

  check "Cursor Integration Hinweis" do
    rule "Der MCP-Server sollte in den Cursor Settings als 'command' Server registriert sein."
    condition { true }
    on_fail "Manuelle Prüfung erforderlich."
    fix "Prüfe in Cursor: Settings -> Features -> MCP -> Add Server (ruby #{engine_server})"
  end
end
