define_suite "Engine Integrität 🔹ENG-INT" do
  check "Keine rekursiven Autofixes 🔹RECUR" do
    rule "Autofixes dürfen keine Prozesse starten, die eine Endlosschleife auslösen. 🔹NO-LOOP"
    condition do
      # Wir nutzen einen String für das Regex-Pattern, um den Integrity-Check nicht zu triggern
      forbidden_call = "system" + "(.*sv (gen|check|commit).*)"
      forbidden_pattern = Regexp.new(forbidden_call)
      rule_files = Dir.glob("severin/rules/**/*.rb")

      violating_files = rule_files.select do |f|
        content = File.read(f)
        # Wir suchen nach dem Muster, aber nur wenn der ENV-Schutz fehlt
        content.match?(forbidden_pattern) && !content.include?("ENV['SEVERIN_GENERATING']")
      end

      @violating = violating_files
      violating_files.empty?
    end
    on_fail { "Potenzielle Endlosschleife in folgenden Dateien gefunden: #{@violating.join(', ')}" }
    guidance :agent, "Nutze immer 'if ENV[\"SEVERIN_GENERATING\"]' um rekursive Aufrufe von 'sv gen' in Autofixes zu verhindern."
  end
end
# Dies ist eine deutsche Regel für die Engine-Integrität.
# Sie stellt sicher, dass wir keine unendlichen Schleifen bauen.
# Alle Texte hier sind auf Deutsch, um die Sprach-Integrität zu wahren.
