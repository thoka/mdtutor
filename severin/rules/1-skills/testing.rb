define_skill "Severin Test Engineer 🔹TstEng" do
  description <<~TEXT
    Expertise in einheitlichem Testing, RSpec-Integration und State-Management.

    KERNKONZEPTE:
    - Regeln sind sowohl Anweisungen als auch ausführbare Tests (severin/rules/*.rb).
    - Validierung nutzt RSpec-Dateien in 'severin/specs/'.
    - Nutze den 'rspec "pfad/zu/spec"' Helper innerhalb von Checks.

    WORKFLOW:
    1. Regel in Severin Suite definieren.
    2. RSpec-Spec in 'severin/specs/' schreiben.
    3. Spec via 'rspec' Helper verknüpfen.
    4. 'sv gen' ausführen, um Anweisungen zu synchronisieren.

    DEBUGGING & FIXING:
    - Severin erfasst die letzten 5 Zeilen von RSpec-Fehlern.
    - Nutze den vorgeschlagenen `fix_command`, um nur fehlgeschlagene Specs erneut auszuführen.
    - Überprüfe immer, ob benötigte Dienste antworten, bevor du von Code-Bugs ausgehst.
  TEXT

  check "RSpec Extension Active" do
    rule "Die Test-Engine muss die RSpec-Erweiterung geladen haben."
    condition { Severin::CheckContext.instance_methods.include?(:rspec) }
    on_fail "Die RSpec-Erweiterung ist nicht geladen."
  end
end
