require 'sentinel'

suite = Sentinel.define_suite "MCP Integrität" do
  description "Stellt sicher, dass der Sentinel MCP-Server für KI-Agenten korrekt installiert und erreichbar ist."

  global_server = File.expand_path("~/.sentinel/mcp/server.rb")

  check "Globale Engine vorhanden" do
    rule "Der MCP-Server muss unter #{global_server} existieren."
    condition { File.exist?(global_server) }
    on_fail "Die globale Sentinel-Engine fehlt oder wurde verschoben."
    fix "Stelle sicher, dass die Engine unter ~/.sentinel/ installiert ist."
  end

  check "MCP Ausführbarkeit" do
    rule "Der MCP-Server muss vom System geladen werden können."
    condition { File.readable?(global_server) }
    on_fail "Berechtigungsproblem beim Zugriff auf den MCP-Server."
    fix "Prüfe die Dateiberechtigungen: 'chmod +r #{global_server}'"
  end

  check "Cursor Integration Hinweis" do
    rule "Der MCP-Server sollte in den Cursor Settings als 'command' Server registriert sein."
    # Dieser Test ist informativ, da wir Cursor-Settings nicht direkt lesen können
    condition { true }
    on_fail "Manuelle Prüfung erforderlich."
    fix "Prüfe in Cursor: Settings -> Features -> MCP -> Add Server (ruby #{global_server})"
  end
end

