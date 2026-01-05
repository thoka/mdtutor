# Dynamic Rules & Agent Personality 🔹ns1rt
Status: ship-it

Diese Erweiterung führt ein zustandsabhängiges Regel-System und strikte Standards für das Agenten-Verhalten ein.

## Kontext
Der bisherige Branch-Name `workflow-documentation-glossary` wurde um die Implementierung der dynamischen Skill-Steuerung erweitert.

## Änderungen
- **Agent Personality**: Einführung sachlicher und kritischer Kommunikationsstandards (:core).
- **Dynamic Skills**: Die Engine kann nun via `severin_state.rb` gesteuert werden, um relevante Regeln zu filtern.
- **Prompt Generation**: Automatische Erstellung von `.cursor/prompts/*.md` basierend auf aktiven Skills.
- **Engine Core**: Erweiterung der Severin-Basis um `set_focus` und Tag-Filterung.

## Tasks
- [x] Agenten-Persönlichkeit in Regeln kodifizieren 🔹AGENT-CONDUCT
- [x] Engine für Tag-Filterung erweitern
- [x] Prompt-File Generierung implementieren
- [x] `severin_state.rb` als Steuerzentrale einführen
- [x] Dokumentation des neuen Workflows 🔹DYN-WF

