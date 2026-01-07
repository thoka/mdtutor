# severin_state.rb
# Use this file to dynamically activate tags and skills for Cursor.

Severin.draw_state do
  skill :severin

  # Globale Fokus-Tags (sparsam halten)
  focus :core
  focus :ruby

  # Ziel des aktuellen Sprints
  objective "Implementierung der Tag-basierten Skill-Steuerung und Validierung"

  # Aktueller Workflow-State (discussion, planning, implementation, review, shipping)
  workflow :implementation

  # Temporäre Ausnahmen für CI/Shell-Umgebung
  allow "Direnv Initialization 🔹DIRENV-INIT"

end
