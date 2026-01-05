# This file defines the dynamic workflow and rule design standards.

define_skill "Dynamischer Regel-Workflow" do
  description "Steuert die zustandsabhängige Aktivierung von KI-Instruktionen."
  tag :workflow

  rule "Zustandssteuerung: Die Auswahl aktiver Skills erfolgt deklarativ in einer " \
       "Steuerdatei (z.B. `severin_state.rb`). Diese Datei wird nicht in 'main' gemerget. 🔹DYN-WF"
  
  rule "Single Source of Truth: Jede programmatische Logik (WANN eine Regel gilt) " \
       "muss in der Regel-Definition selbst liegen, NICHT in der Steuerdatei."

  rule "Generierung: Der Befehl `sv gen` synchronisiert den gewählten State " \
       "mit den `.cursorrules` und den On-Demand Prompts in `.cursor/prompts/`."
end

define_skill "Severin-Regel-Design" do
  description "Vorgaben für das Hinzufügen modularer und dynamischer Regeln."
  tag :architect

  rule "Modularisierung: Nutze `:tag` und `define_skill`, um Regeln thematisch zu gruppieren. " \
       "Vermeide monolithische Regel-Dateien. 🔹RUL-DSG"

  rule "DSL-Power: Nutze die Severin-DSL (Ruby), um Kontext (z.B. Dateiinhalte, " \
       "Branch-Namen) dynamisch in die `guidance` zu injizieren."

  rule "On-Demand Prompts: Definiere spezifische Deep-Dive Instruktionen " \
       "als `prompt_file` innerhalb eines Skills, um sie via `@` in Cursor verfügbar zu machen."

  prompt_file "new-skill", <<~MARKDOWN
    # 🧪 Test Prompt: New Skill Template
    Verwende diese Vorlage, wenn du eine neue Severin-Regel erstellst:
    1. Definiere den Skill in `severin/rules/`
    2. Nutze `:tag` zur Kategorisierung
    3. Führe `sv gen` aus
  MARKDOWN

  rule "Minimalismus: Regeln sollten nur das enthalten, was für den aktuellen " \
       "Zustand (State) notwendig ist. Nutze `condition`-Blöcke zur Validierung."
end

