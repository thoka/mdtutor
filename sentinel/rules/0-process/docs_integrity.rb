require 'sentinel'

suite = Sentinel.define_suite "Dokumentations-Integrität" do
  description "Stellt sicher, dass die generierten Projekt-Regeln und Cursor-Instruktionen korrekt formatiert sind."

  check "Cursorrules Platzhalter-Freiheit" do
    rule "Die .cursorrules dürfen keine unersetzten Ruby-Platzhalter wie #\{name\} enthalten."
    target ".cursorrules"
    condition do
      return false unless File.exist?(target)
      content = File.read(target)
      # Wir zählen, wie oft #{ vorkommt.
      # Es darf nur genau 1x vorkommen (in der Regel-Beschreibung selbst).
      # Wenn es öfter vorkommt, sind echte Platzhalter unersetzt.
      content.scan(/#\{/).size <= 1
    end
    on_fail "Die .cursorrules enthalten unersetzte Platzhalter. Der Generator ist fehlerhaft."
    fix "Korrigiere die String-Interpolation in ~/.sentinel/generate_rules.rb."
  end

  check "Projekt-Regeln Formatierung" do
    rule "Die PROJECT_RULES.md muss eine gültige Markdown-Struktur haben."
    target "PROJECT_RULES.md"
    condition do
      return false unless File.exist?(target)
      content = File.read(target)
      content.include?("# Project Rules") && content.count("#") > 3
    end
    on_fail "PROJECT_RULES.md scheint korrupt oder leer zu sein."
    fix "Führe 'pnpm run sentinel:gen' aus."
  end

  check "Keine veralteten Pfade in Regeln" do
    rule "Die PROJECT_RULES.md darf keine Verweise auf das alte 'test/' Verzeichnis für Sentinel-Checks enthalten."
    target "PROJECT_RULES.md"
    condition do
      return false unless File.exist?(target)
      content = File.read(target)
      # Prüfen ob irgendwo noch test/0-process oder test/1-setup steht (was in den Cursorrules oft vorkam)
      !content.match?(/test\/0-process|test\/0-skills|test\/1-setup/)
    end
    on_fail "Veraltete Pfade in PROJECT_RULES.md gefunden."
    fix "Führe 'pnpm run sentinel:gen' aus."
  end
end
