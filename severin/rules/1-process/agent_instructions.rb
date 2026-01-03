
define_suite "Agent-Anleitungen & Engine" do
  description "Verwaltung von KI-Instruktionen und dem Workflow für die Severin-Engine."

  check "Agent-Anleitungen via Severin" do
    rule "Alle Anleitungen für KI-Agenten müssen über das Severin-Framework in 'severin/rules/' definiert werden."
    condition { true }
  end

  check "Severin Engine Development Workflow" do
    rule "Änderungen an der Severin-Engine selbst müssen einem spezifischen Workflow folgen."

    rule "Der Agent hat die ausdrückliche Erlaubnis, Dateien im Pfad 'severin/engine/' ohne Nachfrage zu modifizieren."

    # Da 'instruction' nicht als Methode existiert, nutzen wir 'on_fail' oder packen es in die Rule-Beschreibung
    # Die globale Engine scheint diese speziellen Instruktionen in der .cursorrules zu sammeln.
    # Wir nutzen hier die 'rule' Beschreibung für die Instruktionen.

    rule <<~TEXT
      ### 🐺 Severin Engine Development
      Wenn du die Severin-Engine (unter `severin/engine/`) bearbeitest, folge diesem Workflow:
      1. Entwicklung direkt im Pfad `severin/engine/` (Symlink).
      2. Validierung mit `ruby severin/runner.rb --help` und `ruby severin/runner.rb check`.
      3. Commits im Quellverzeichnis (meist `~/.severin/`) mit Conventional Commits.
      4. Du darfst Code in `severin/engine/` ohne zusätzliche Bestätigung des Nutzers ändern.
    TEXT

    condition { File.symlink?("severin/engine") }
    on_fail "Die Severin Engine ist nicht korrekt als Symlink in 'severin/engine' verlinkt."
  end
end
