define_skill "Traceable Logic 🔍" do
  tags :logic, :dev, :ruby

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
end
