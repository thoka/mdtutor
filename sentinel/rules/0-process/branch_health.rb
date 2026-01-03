define_suite "Branch Gesundheit & Cleanup" do
  check "Fokus & Umfang" do
    rule "Ein Branch sollte nicht zu viele uncommittete Änderungen ansammeln."
    condition do
      changes = `git status --porcelain | wc -l`.to_i
      changes < 20
    end
    on_fail "Zu viele offene Änderungen."
    fix "Bitte committe deine Fortschritte oder nutze 'git stash'."
  end

  check "Keine temporären Dateien" do
    rule "Backup-Dateien (*.bak.md) und temporäre Artefakte dürfen nicht committet werden."
    condition do
      Dir.glob("**/*.bak.md").empty?
    end
    on_fail "Temporäre Backup-Dateien gefunden."
    fix "Entferne die Dateien: 'rm **/*.bak.md'"
  end

  check "Synchronität der Regeln" do
    rule "Die lokalen Projektregeln müssen mit dem Sentinel-Code übereinstimmen."
    condition do
      next false unless File.exist?('PROJECT_RULES.md')
      rules_mtime = File.mtime('PROJECT_RULES.md')
      test_mtimes = Dir.glob('sentinel/rules/**/*.rb').map { |f| File.mtime(f) }
      rules_mtime >= test_mtimes.max
    end
    on_fail "Die Projektregeln sind nicht auf dem neuesten Stand der Sentinel-Tests."
    fix "Führe 'sn gen' aus, um die Dokumentation zu synchronisieren."
  end

  check "Plan-Aktualität" do
    rule "Das Brain-Dokument muss den aktuellen Fortschritt widerspiegeln."
    condition do
      latest_brain = Dir.glob('docs/brain/*.md').max_by { |f| File.mtime(f) }
      next true unless latest_brain
      File.mtime(latest_brain) > (Time.now - 3600*4) # Innerhalb der letzten 4h
    end
    on_fail "Kein Brain-Update in den letzten 4 Stunden."
    fix "Aktualisiere den Plan in docs/brain/."
  end
end
