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
       - Die Engine sollte bei doppelten Definitionen von Actions/Tools im Debug-Modus informieren, anstatt den Standard-Output mit Warnungen zu fluten.

    4. DEBUG-STANDARD:
       - Nutze für Debug-Informationen NIEMALS 'puts'. Verwende ausschließlich 'Severin.log_debug', um die Ausgabe über SEVERIN_DEBUG steuerbar zu machen.

    5. VERSIONIERUNG (BETA):
       - Behalte die Major-Version auf 0 (z.B. 0.x.x) bei, solange sich das Framework in der Beta-Phase befindet.
       - Erhöhung der Minor-Version (0.x.0) bei neuen Features.
       - Erhöhung der Patch-Version (0.0.x) bei Bugfixes und kleinen Optimierungen.
  TEXT

  rule :engine_dev, "Definitionen in der Engine dürfen bestehende Daten nicht ohne explizite Absicht löschen."
  rule :engine_dev, "Nutze `Severin.log_debug` für alle nicht-kritischen Systemmeldungen. 🔹DBG-LOG"
  rule :engine_dev, "Versionierung: Major-Version auf 0 belassen bis zur vollen Stabilität. 🔹BETA-VER"
end
