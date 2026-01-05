define_skill "Severin Test-Driven Quality" do
  tag :severin, :dev, :testing

  description <<~TEXT
    Prinzipien für die Qualitätssicherung der Severin-Engine:

    1. SPEC-MANDATORY (SPEC-REQ):
       - Jede neue Funktion oder Fehlerbehebung in der Engine MUSS durch eine RSpec-Spec in `severin/engine/spec/` abgesichert werden.
       - Ad-hoc Tests im Terminal oder temporäre Skripte sind nur zur Exploration erlaubt, nicht als Ersatz für Specs.

    2. INTEGRATION-TESTING (INT-TEST):
       - Neben Unit-Tests für einzelne Klassen müssen kritische Pfade (wie CLI-Befehle oder Plugin-Laden) durch Integration-Tests abgedeckt werden.

    3. REGRESSION-PREVENTION (NO-REGRESS):
       - Bei jedem Bugfix muss eine Spec hinzugefügt werden, die genau diesen Case abdeckt, um zukünftige Regressionen zu verhindern.
  TEXT

  rule :severin, "Neue Engine-Features müssen eine entsprechende Spec in `severin/engine/spec/` besitzen. 🔹SPEC-REQ"
  rule :severin, "Nutze `bundle exec rspec` zur Verifizierung der Engine-Integrität. 🔹VERIFY-SPEC"
end
