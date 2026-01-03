require 'sentinel'

suite = Sentinel.define_suite "Branch Gesundheit & Cleanup" do
  description "Stellt sicher, dass der Branch sauber, fokussiert und bereit für die Zusammenarbeit ist."

  current_branch = `git rev-parse --abbrev-ref HEAD`.strip

  check "Fokus & Umfang" do
    rule "Ein Branch sollte nicht zu viele uncommittete Änderungen ansammeln, um den Fokus zu behalten."
    changed_files = `git status --porcelain | wc -l`.to_i
    condition { changed_files < 15 }
    on_fail "Zu viele uncommittete Änderungen (#{changed_files}). Gefahr von unübersichtlichen Commits."
    fix "Bitte schaue die Änderungen durch. Wenn sie logisch zusammengehören, committe sie. Wenn nicht, frage den User, ob ein Teil gestasht werden soll."
  end

  check "Keine temporären Dateien" do
    rule "Backup-Dateien (*.bak.md) und temporäre Artefakte dürfen nicht committet werden."
    backups = Dir.glob("**/*.bak.md")
    condition { backups.empty? }
    on_fail "Backup-Dateien gefunden: #{backups.join(', ')}."
    fix "Frage den User, ob diese Backups noch benötigt werden, oder lösche sie mit 'rm'."
  end

  check "Synchronität der Regeln" do
    rule "Die PROJECT_RULES.md muss aktuell sein, wenn Sentinel-Tests geändert wurden."
    condition do
      return true unless File.exist?('PROJECT_RULES.md')
      rules_mtime = File.mtime('PROJECT_RULES.md')
      test_mtimes = Dir.glob('sentinel/rules/**/*.rb').map { |f| File.mtime(f) }
      rules_mtime >= (test_mtimes.max || Time.at(0))
    end
    on_fail "Die Projektregeln sind nicht auf dem neuesten Stand der Sentinel-Tests."
    fix "Führe 'ruby tools/generate_rules.rb' aus, um die Dokumentation zu synchronisieren."
  end

  check "Plan-Aktualität" do
    rule "Das Brain-Dokument muss den aktuellen Fortschritt widerspiegeln."
    branch_slug = current_branch.split('/').last
    plan_file = Dir.glob("docs/brain/*#{branch_slug}*").first

    condition do
      # Plan muss existieren und innerhalb der letzten 24h angefasst worden sein
      plan_file && (Time.now - File.mtime(plan_file)) < 86400
    end

    on_fail "Der Implementierungsplan ist entweder nicht vorhanden oder veraltet (älter als 24h)."
    fix "Bitte aktualisiere das Brain-Dokument #{plan_file || '(fehlt)'} mit dem aktuellen Status, bevor du weitermachst. Frage den User nach dem aktuellen Fortschritt, falls unsicher."
  end
end

