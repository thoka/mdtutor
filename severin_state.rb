# severin_state.rb
# Use this file to dynamically activate tags and skills for Cursor.

Severin.draw_state do
  # Additive Skills via Tags (NUR Symbole erlaubt)
  skill :agent
  skill :workflow => :dev
  skill :architect => :dev

  # Globale Tags
  focus :core
  focus :core


  # Ziel des aktuellen Sprints
  objective "Implementierung der Tag-basierten Skill-Steuerung und Validierung"
end
