define_skill "Severin Architect 🔹Arc" do
  description <<~TEXT
    Dieser Skill vermittelt die Kern-Philosophie der MDTutor-Infrastruktur.

    ESSENZ DER ARCHITEKTUR:
    1. Code is Truth: Regeln existieren nicht in Markdown, sondern als Ruby-Objekte in `severin/rules/`. Ändere NIEMALS die `.cursorrules` direkt, da sie von `sv_gen` überschrieben werden.
    2. Executable Rules: Jede Regel ist gleichzeitig ein Test. Komplexe Logik wird via RSpec-Integration (`rspec "path"`) in `severin/specs/` validiert.
    3. Actionable Fixes: Schlägt ein `sv_check` fehl, enthalten die Ruby-Definitionen oft direkt ausführbare `fix`-Befehle oder Pfade zur Lösung.
    4. State Awareness & Probes: Services nutzen Probes (Port, Resource), um echte Verfügbarkeit zu signalisieren. Ein Prozess, der nur "läuft", reicht nicht aus – prüfe `sv status`.
    5. Lazy-Loading Skills: Um das Kontext-Window zu schonen, stehen in `.cursorrules` nur Header. Detaillierte Instruktionen müssen LIVE via MCP-Tool `sv_get_skill` abgefragt werden.

    WICHTIGE TOOLS FÜR AGENTEN:
    - `sv_get_skill(name: "...")`: Holt die echten Instruktionen direkt aus den Ruby-Klassen.
    - `sv_gen`: Synchronisiert die minimalen Header in die .cursorrules.
    - `sv_check`: Validiert die gesamte Integrität (inkl. RSpec).
  TEXT

  rule "Agenten dürfen keine Regeln in Markdown-Dateien auslagern. Alles muss in Ruby definiert sein. 🔹4fjeN"
  rule "Nutze IMMER `sv_get_skill`, um den vollen Kontext einer Aufgabe zu verstehen, bevor du startest. 🔹uVr0W"
  rule "Ändere niemals `.cursorrules` direkt. Nutze `sv_gen` nach Änderungen in `severin/rules/`. 🔹J4Jp0"
  rule "Prüfe bei fehlschlagenden Checks die Ruby-Regeln in `severin/rules/` auf hinterlegte `fix`-Aktionen. 🔹7knlz"
end
