define_skill "Severin Engine Development 🐺" do
  tags :severin, :dev, :ruby
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

  rule :engine_dev, "Definitionen in der Engine dürfen bestehende Daten nicht ohne explizite Absicht löschen.",
       spec: "severin/engine/spec/integration_spec.rb"
  rule :engine_dev, "Nutze `Severin.log_debug` für alle nicht-kritischen Systemmeldungen. 🔹DBG-LOG",
       spec: "severin/engine/lib/severin.rb"

  rule :engine_dev, "Engine Direct Access: Nutze Ruby-Einzeiler bei Tooling-Problemen. 🔹ENG-DIR"

  rule :engine_dev, "Log Persistence: Engine-Logs müssen ohne ENV-Variablen persistiert werden. 🔹ENG-LOG-ALWAYS"

  rule :engine_dev, "MCP Availability: Alle registrierten MCP-Server müssen online sein (STRICT-FAIL). 🔹MCP-S"
  rule :engine_dev, "Versionierung: Major-Version auf 0 belassen bis zur vollen Stabilität. 🔹BETA-VER",
       spec: "severin/engine/spec/integration_spec.rb"

  rule :engine_dev, "Self-Documentation: Nutze die `spec` DSL für alle neuen Actions und Tools. 🔹SELF-DOC",
       spec: "severin/engine/lib/severin/documentable.rb"

  rule :engine_dev, "Bootstrapping Integrity: Lade-Reihenfolge beachten. 🔹LOAD-SEQ",
       spec: "severin/engine/lib/severin/cli.rb"

  guidance :engine_dev, "Wenn du eine neue Action oder ein Tool in Ruby definierst, nutze IMMER den `spec`-Block für Beschreibung und Parameter. Dies speist automatisch `sv --help` und die MCP-Tool-Definitionen."
  guidance :engine_dev, "Bei Änderungen an der CLI-Infrastruktur oder MCP-Metadaten: Stelle sicher, dass Plugins geladen sind, BEVOR der OptionParser oder die Tool-Registry initialisiert wird (Late-Binding vermeiden)."
end
