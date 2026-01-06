define_skill "Traceable Logic 🔍" do
  tags :logic, :dev, :ruby, :traceability

  description "Verpflichtet Agenten dazu, Code so zu schreiben, dass seine Ausführung ohne externe Test-Scripte allein durch Logs nachvollziehbar ist."

  rule "Log critical Transitions: Dokumentiere jede Zustandsänderung. 🔹LOG-STATE" do
    condition { true }
  end

  rule "Contextual Breadcrumbs: Logs müssen Kontext enthalten (Structured Logging). 🔹LOG-CTX" do
    condition { true }
  end

  rule "Performance Transparency: Logge die Dauer teurer Operationen via `log_duration`. 🔹LOG-TIME" do
    condition { true }
  end

  guidance :logic, <<~TEXT
    Ziel ist 'Observability by Design':
    1. Vermeide Print-Debugging: Nutze das zentrale `Severin.log_debug` (oder den jeweiligen System-Logger).
    2. Fehlersuche ohne Code-Änderung: Ein Agent muss in der Lage sein, einen Bug allein durch das Lesen der `debug.jsonl` zu lokalisieren.
    3. Log-Levels sinnvoll nutzen: INFO für den Fluss, DEBUG für Daten-Details.
    4. Nutze das Discourse-Pattern `Severin.log_duration("Task Name") { ... }` für alle IO- oder komplexen Operationen.
  TEXT

  prompt_file "implement", <<~MARKDOWN
    # 🛠 ConvArc Phase: Implementation & Iteration
    Der Plan steht, nun wird gebaut. Folge diesen Prinzipien für hochqualitativen, nachvollziehbaren Code.

    1. **Traceable Logic**: Schreibe Code, der seine Geschichte durch Logs erzählt (`Severin.log_debug`).
    2. **Discourse Patterns**: Nutze Keyword-Arguments, Lazy Initialization und UTC.
    3. **Small Steps**: Implementiere in atomaren Einheiten.
    4. **Integrity Check**: Führe regelmäßig `sv check` aus, um sicherzustellen, dass Pfade und RIDs korrekt bleiben.
    5. **Functional Test**: Verifiziere die Logik (z.B. via RSpec oder manueller Prüfung).

    *Ziel: Funktionierender Code, der keine ad-hoc Scripte zum Verständnis benötigt.*
  MARKDOWN
end
