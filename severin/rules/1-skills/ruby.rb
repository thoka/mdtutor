define_skill "Ruby Expert 💎" do
  tags :ruby, :backend, :dev

  description "Setzt Standards für Ruby-Entwicklung basierend auf Discourse-Patterns (Clean Code, Performance, Kapselung)."

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
    2. Performance: Nutze `f.sync = true` für Log-Dateien in Multi-Prozess-Umgebungen.
    3. Lesbarkeit: Bevorzuge prägnante Keys in JSON-Payloads (z.B. `ts` statt `timestamp`).
  TEXT
end
