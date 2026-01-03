
define_suite "📜uVr0W Agent-Anleitungen & Engine" do
  description "Verwaltung von KI-Instruktionen und dem Workflow für die Severin-Engine."

  check "📜lTs5w Agent-Anleitungen via Severin" do
    rule "📜4fjeN Alle Anleitungen für KI-Agenten müssen über das Severin-Framework in 'severin/rules/' definiert werden."
    condition { true }
  end

  check "📜mYkJM Severin Engine Development Workflow" do
    rule "📜cOpGD Änderungen an der Severin-Engine selbst müssen einem spezifischen Workflow folgen."

    # Da 'instruction' nicht als Methode existiert, nutzen wir 'on_fail' oder packen es in die Rule-Beschreibung
    # Die globale Engine scheint diese speziellen Instruktionen in der .cursorrules zu sammeln.
    # Wir nutzen hier die 'rule' Beschreibung für die Instruktionen.

    rule <<~TEXT
📜5cuWw       ### 🐺 Severin Engine Development
      Wenn du die Severin-Engine (unter `severin/engine/`) bearbeitest, folge diesem Workflow:
      1. Entwicklung direkt im Pfad `severin/engine/` (Symlink oder Submodule).
      2. Validierung mit `ruby severin/runner.rb --help` und `ruby severin/runner.rb check`.
      3. Commits direkt im Pfad `severin/engine/` mit Conventional Commits.
    TEXT

    condition { File.symlink?("severin/engine") || File.directory?("severin/engine") }
    on_fail "Die Severin Engine ist nicht korrekt in 'severin/engine' vorhanden."
  end
end
