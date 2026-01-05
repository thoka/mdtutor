# severin_state.rb
# Use this file to dynamically activate tags and skills for Cursor.

Severin.draw_state do
  # Additive Skills mit optionaler Tag-Filterung
  skill "Agenten-Verhalten"
  skill "Strict Integrity Enforcement"
  skill "Dynamischer Regel-Workflow" => :workflow
  skill "Severin-Regel-Design" => :architect
  
  # Globale Tags
  focus :core
  
  # Bewusste Ausnahmen für diesen Sprint (nur Checks ohne 🔹ID nutzen)
  allow :brain_tasks_status
  
  # Ziel des aktuellen Sprints
  objective "Implementierung der schönen State-DSL und intelligenten Skill-Filterung"
end
