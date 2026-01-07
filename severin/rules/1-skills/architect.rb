define_skill "Severin Architect 🔹Arc" do
  tags :architect, :core, :ruby


  #TODO: muss nach zu services
  guidance :service_status, "Dienste müssen über das Severin Service-Management gesteuert werden. Nutze 'sv_start <name>' per MCP."

  description <<~TEXT
    Dieser Skill vermittelt die Kern-Philosophie von Severin.

    ESSENZ DER ARCHITEKTUR:
    1. Code is Truth: Regeln existieren nicht in Markdown, sondern als Ruby-Objekte in `severin/rules/`. Ändere NIEMALS die `.cursorrules` direkt, da sie von `sv_gen` überschrieben werden.
    2. Executable Rules: Jede Regel ist gleichzeitig ein Test. Komplexe Logik wird via RSpec-Integration (`rspec "path"`) in `severin/specs/` validiert.
    3. Actionable Fixes: Schlägt ein `sv_check` fehl, enthalten die Ruby-Definitionen oft direkt ausführbare `fix`-Befehle oder Pfade zur Lösung.
    4. State Awareness & Probes: Services nutzen Probes (Port, Resource), um echte Verfügbarkeit zu signalisieren. Ein Prozess, der nur "läuft", reicht nicht aus – prüfe `sv status`.
    5. RIGID CONTEXT (BETA): In der Beta-Phase werden ALLE Regeln in die .cursorrules injiziert, um maximale Konformität sicherzustellen, auch wenn dies das Kontext-Fenster stärker belastet.
  TEXT

  rule "Agenten dürfen keine Regeln in Markdown-Dateien auslagern. Alles muss in Ruby definiert sein. 🔹4fjeN",
       spec: "severin/engine/spec/integration_spec.rb"

  rule "Nutze IMMER `sv_get_skill`, um den vollen Kontext einer Aufgabe zu verstehen, bevor du startest. 🔹uVr0W",
       spec: "severin/engine/spec/skills_action_spec.rb"

  rule "Ändere niemals `.cursorrules` direkt. Nutze `sv_gen` nach Änderungen in `severin/rules/`. 🔹J4Jp0",
       spec: "severin/engine/spec/generation_spec.rb"

  rule "Erwarte bei fehlschlagenden Checks eine passende Anleitung oder Fix-Aktion vom Framework. Mahne das Fehlen solcher Anleitungen aktiv an. 🔹7knlz",
       spec: "severin/engine/lib/severin.rb"

  rule "Rigidität: In der Beta-Phase werden ALLE Regeln in die .cursorrules injiziert, um maximale Konformität sicherzustellen. 🔹NO-FILTER",
       spec: "severin/engine/spec/generation_spec.rb"

  rule "Shell Integrität: Nutze für Shell-Befehle immer die Framework-Methode `sh()`. Direkte system() Aufrufe oder Backticks in Regeln sind verboten. 🔹SH-STRICT",
       spec: "severin/engine/spec/no_raw_output_spec.rb"

  rule "Integrity Enforcement: Ändere Whitelists in `no_raw_output_spec.rb` niemals ohne explizite Nutzer-Autorisierung. 🔹NO-BYPASS",
       spec: "severin/engine/spec/no_raw_output_spec.rb"
end
