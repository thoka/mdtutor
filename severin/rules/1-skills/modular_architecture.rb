define_skill "Severin Modular Architecture" do
  tag :severin, :dev, :architect

  description <<~TEXT
    Prinzipien für die Modularisierung der Severin-Engine:

    1. ACTION OBJECTS (ACT-OBJ):
       - CLI-Befehle werden als eigenständige Klassen unter `Severin::Actions` implementiert.
       - Jede Action definiert ihre eigenen CLI-Optionen und Validierungen.
       - Die CLI delegiert die Ausführung vollständig an diese Objekte.

    2. LIBRARY FIRST (LIB-LOGIC):
       - Die Geschäftslogik (z.B. Skill-Filterung, Check-Ausführung) liegt in `lib/severin/`.
       - CLI und MCP nutzen dieselben Library-Klassen, um identisches Verhalten zu garantieren.
       - UI-Code (Printer, Formatter) ist strikt von der Logik getrennt.

    3. DYNAMIC REGISTRY (DYN-CLI):
       - Actions registrieren sich selbstständig.
       - Die Hilfe-Ausgabe (`sv help`) wird dynamisch aus den Metadaten der Actions generiert.
  TEXT

  rule :severin, "Befehle müssen als Action-Objekte realisiert werden, um die CLI wartbar zu halten. 🔹ACT-OBJ"
  rule :severin, "Geschäftslogik darf nicht in der CLI stehen, sondern muss in Libraries gekapselt sein. 🔹LIB-LOGIC"
end
