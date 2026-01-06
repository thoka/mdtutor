define_skill "Path & Root Integrity 🗺️" do
  tags :core, :workflow, :infra

  description "Sicherstellung der Pfad-Konsistenz über den gesamten Workspace mittels $R Abstraktion."

  rule "Workspace Root Reference: Nutze absolute Pfade oder $R. 🔹ROOT-REF" do
    condition { true }

    guidance :all, <<~MARKDOWN
      - Der Workspace-Root ist: `/home/toka/dv/mdtutor/cursor`
      - Nutze die Abstraktion `$R` für alle Pfadangaben (z.B. `$R/src/main.ts`).
      - In Tool-Aufrufen (sv_read_file, sv_write_file) wird `$R` automatisch aufgelöst.
      - Vermeide relative Navigation mit `../` unter allen Umständen.
      - Durch die Nutzung von `$R` stellst du sicher, dass deine Aktionen geloggt und Pfade korrekt aufgelöst werden.
    MARKDOWN
  end

  rule "Filesystem Tooling: Bevorzuge sv_* Tools. 🔹FS-STRICT" do
    condition { true }

    guidance :all, <<~MARKDOWN
      - Nutze für Dateizugriffe bevorzugt die Severin-Tools:
        * `sv_read_file` (statt standard read_file)
        * `sv_write_file` (statt standard write_file)
        * `sv_list_dir` (statt standard list_dir)
      - Dies garantiert, dass deine Zugriffe im Severin-Audit-Log erscheinen und Pfadvariablen wie `$R` unterstützt werden.
    MARKDOWN
  end
end
