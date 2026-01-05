define_skill "Severin Engine Development 🐺" do
  tags :severin, :dev
  guidance :engine_dev, "Alle Definitionen in Severin MÜSSEN additiv sein. Vermeide Überschreibungen."

  description <<~TEXT
    Prinzipien für die Arbeit an der Severin-Engine (severin/engine/):

    1. ADDITIVE DEFINITIONEN:
       - Nutze Arrays für Registries (Guidance, Tags, Hooks).
       - Mehrere Skills dürfen Guidance zum gleichen Tag beisteuern.
       - Doppelte Einträge sollten durch `uniq` oder Checks verhindert werden.

    2. DSL-KONSISTENZ:
       - Methoden wie `rule`, `fix`, `on_fail` sollten Metadaten (Tags) unterstützen.
       - Der letzte Parameter ist in der Regel der primäre Inhalt (String/Block).

    3. FEHLER-TOLERANZ:
       - Die Engine sollte bei doppelten Definitionen von Actions/Tools mindestens eine Warnung ausgeben, anstatt stillschweigend zu überschreiben.
  TEXT

  rule :engine_dev, "Definitionen in der Engine dürfen bestehende Daten nicht ohne explizite Absicht löschen."
end
