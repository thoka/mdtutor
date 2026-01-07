define_skill "Ruby Expert 💎" do
  tags :ruby

  description "Setzt Standards für Ruby-Entwicklung basierend auf Discourse-Patterns (Clean Code, Performance, Kapselung)."

  rule "Strict Output Architecture: No 'puts' / Standardized UI & Logging. 🔹NO-PUTS" do
    condition { true }
    guidance :implementation, <<~MARKDOWN
      ### 🚫 Verbot von `puts`
      Die Nutzung von `puts`, `print`, `p` oder `pp` ist im gesamten `severin/` Verzeichnis untersagt. Das Framework blockiert diesen Aufruf zur Laufzeit (Kernel-Patching), was bei Nutzung zu einem sofortigen Programmabbruch führt.

      ### ✅ Korrekte Implementation von Output
      Nutze je nach Kontext die folgenden Methoden:

      1. **User Interface (CLI-Ausgabe)**:
         Wenn du Informationen für den Nutzer im Terminal ausgeben möchtest (z. B. in Actions), nutze das `Severin.ui` Interface:
         - `Severin.ui_info("Nachricht")` - Neutrale Informationen (Blau).
         - `Severin.ui_success("Nachricht")` - Erfolgsmeldungen (Grün).
         - `Severin.ui_warn("Nachricht")` - Warnungen (Gelb).
         - `Severin.ui_error("Nachricht")` - Fehlermeldungen (Rot).

      2. **Debugging & Tracing**:
         Wenn du Informationen nur für die Fehlersuche loggen möchtest, ohne die CLI-Ausgabe zu verschmutzen:
         - `Severin.log_debug("Context", key: value)` - Nutze strukturierte Hashes für Metadaten.

      3. **Engine-Infrastruktur (Low-Level)**:
         Nur innerhalb von `Severin::Formatter` oder `Severin::Output` darf das interne `__severin_raw_puts__` genutzt werden, um die finale Formatierung an `$stdout` zu übergeben.

      ### 💡 Warum?
      Dies stellt sicher, dass alle Ausgaben (Logs vs. UI) sauber getrennt sind, die CLI-Formatierung konsistent bleibt und Ausgaben in Tests zuverlässig abgefangen werden können. Statische Prüfungen (Grep) entfallen zugunsten von Fail-Fast zur Laufzeit.
    MARKDOWN
  end

  rule "Keyword Arguments for Complexity: Nutze für komplexe Methoden Keyword-Arguments statt Positions-Parameter. 🔹RUBY-KW" do
    condition { true }
  end

  rule "Lazy Resource Initialization: Nutze ||= zur Initialisierung von Datei-Handles, Datenbank-Verbindungen oder teuren Objekten. 🔹RUBY-LAZY" do
    condition { true }
  end

  rule "UTC Integrity: Alle Zeitstempel in Logs und Datenbanken müssen UTC entsprechen. 🔹RUBY-UTC" do
    condition { true }
  end

  rule "Structured Logging: Übergiebe Metadaten immer als Hash (Keyword-Splat), niemals als formatierte Strings. 🔹RUBY-LOG" do
    condition { true }
  end

  guidance :ruby, <<~TEXT
    Folge beim Schreiben von Ruby-Code diesen Prinzipien:
    1. Kapselung: Logik gehört in Klassen/Module, nicht in Scripte.
    2. Kein Print-Debugging: Nutze 'Severin.log_debug' für temporäre Ausgaben.
    3. Performance: Nutze `f.sync = true` für Log-Dateien in Multi-Prozess-Umgebungen.
    4. Lesbarkeit: Bevorzuge prägnante Keys in JSON-Payloads (z.B. `ts` statt `timestamp`).
  TEXT
end
