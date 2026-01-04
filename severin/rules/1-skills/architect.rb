define_skill "Severin Architect 🔹Arc" do
  description <<~TEXT
    Dieser Skill vermittelt die Kern-Philosophie der MDTutor-Infrastruktur.

    ESSENZ DER ARCHITEKTUR:
    1. Code is Truth: Regeln existieren nicht in Markdown, sondern als Ruby-Objekte in `severin/rules/`.
    2. Executable Rules: Jede Regel ist gleichzeitig ein Test. Komplexe Logik wird via RSpec-Integration (`rspec "path"`) in `severin/specs/` validiert.
    3. State Awareness: Tests setzen korrekte Umgebungszustände (Services/Ports) voraus, die via `requires :service` gesteuert werden.
    4. Lazy-Loading Skills: Um das Kontext-Window zu schonen, stehen in `.cursorrules` nur Header. Detaillierte Instruktionen müssen LIVE via MCP-Tool `sv_get_skill` abgefragt werden.

    WICHTIGE TOOLS FÜR AGENTEN:
    - `sv_get_skill(name: "...")`: Holt die echten Instruktionen direkt aus den Ruby-Klassen.
    - `sv_gen`: Synchronisiert die minimalen Header in die .cursorrules.
    - `sv_check`: Validiert die gesamte Integrität (inkl. RSpec).
  TEXT

  rule "Agenten dürfen keine Regeln in Markdown-Dateien auslagern. Alles muss in Ruby definiert sein. 🔹4fjeN"
  rule "Nutze IMMER `sv_get_skill`, um den vollen Kontext einer Aufgabe zu verstehen, bevor du startest. 🔹uVr0W"
end
