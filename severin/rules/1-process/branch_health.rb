define_suite "Branch Gesundheit & Cleanup 🔹NUSqE" do
  check "Fokus & Umfang 🔹gBN5w" do
    rule "Ein Branch sollte nicht zu viele uncommittete Änderungen ansammeln. 🔹7cPiz"
    condition do
      changes = `git status --porcelain | wc -l`.to_i
      changes < 20
    end
    on_fail "Zu viele offene Änderungen."
    fix "Bitte committe deine Fortschritte oder nutze 'git stash'."
  end

  check "Keine temporären Dateien 🔹gURed" do
    rule "Alle temporären Dateien müssen mit 'tmp_' beginnen und dürfen nicht committet werden. 🔹Bqgcu"
    condition do
      relics = Dir.glob("**/tmp_*")
      untracked = `git ls-files --others --exclude-standard`.split("\n")
      # Wir failen nur, wenn eine tmp-Datei getrackt wird oder andere Artefakte existieren
      tracked_relics = `git ls-files | grep '^tmp_\\|/tmp_'`.split("\n")
      tracked_relics.empty? && Dir.glob("**/*.bak.md").empty?
    end
    on_fail "Temporäre Dateien oder Backups gefunden, die getrackt werden."
    fix "Nutze 'git rm --cached' für getrackte tmp-Dateien oder lösche sie."
  end

  check "Synchronität der Regeln 🔹J4Jp0" do
    rule "Die lokalen Projektregeln müssen mit dem Severin-Code übereinstimmen. 🔹eSgd3"
    condition do
      next false unless File.exist?('PROJECT_RULES.md')
      rules_mtime = File.mtime('PROJECT_RULES.md')
      test_mtimes = Dir.glob('severin/rules/**/*.rb').map { |f| File.mtime(f) }
      rules_mtime >= test_mtimes.max
    end
    on_fail "Die Projektregeln sind nicht auf dem neuesten Stand der Severin-Tests."
    fix "Führe 'sv gen' aus, um die Dokumentation zu synchronisieren."
  end

  check "Plan-Aktualität 🔹9VGZq" do
    rule "Das Brain-Dokument muss den aktuellen Fortschritt widerspiegeln. 🔹35SbY"
    condition do
      latest_brain = Dir.glob('docs/brain/*.md').max_by { |f| File.mtime(f) }
      next true unless latest_brain
      File.mtime(latest_brain) > (Time.now - 3600*4) # Innerhalb der letzten 4h
    end
    on_fail "Kein Brain-Update in den letzten 4 Stunden."
    fix "Aktualisiere den Plan in docs/brain/."
  end
end

