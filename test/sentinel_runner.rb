# MDTutor Sentinel Test Runner
# Lädt und führt alle Sentinel-Suiten in der korrekten Reihenfolge aus.

# Sicherstellen, dass die globale Lib gefunden wird
lib_path = File.expand_path("~/.sentinel/lib")
$LOAD_PATH.unshift(lib_path) unless $LOAD_PATH.include?(lib_path)

require 'sentinel'

# Konfiguration
STAGES = [
  "test/0-process",
  "test/0-skills",
  "test/1-setup",
  "test/2-data",
  "test/3-services",
  "test/4-contracts",
  "test/5-e2e"
]

format = ENV['SENTINEL_FORMAT'] == 'agent' ? :agent : :human
success = true

STAGES.each do |stage|
  next unless Dir.exist?(stage)
  
  # Dateien alphabetisch sortiert laden
  Dir.glob("#{stage}/*.rb").sort.each do |file|
    # Die Datei laden (Sentinel.define_suite registriert das Ergebnis automatisch)
    load file
    
    # Sofort prüfen, ob die letzte Suite fehlgeschlagen ist (Fail-Fast)
    last_suite_result = Sentinel.all_results.last
    if last_suite_result && !last_suite_result.success?
      success = false
      break
    end
  end
  
  break unless success # Stoppe bei Fehlern in einer Stage
end

# Bericht ausgeben
Sentinel.all_results.each do |res|
  Sentinel::Suite.new(res.suite_name) {} # Dummy-Suite für den Report-Aufruf
  # Da wir die report Methode am Suite Objekt haben, nutzen wir einen Formatter direkt
  if format == :agent
    Sentinel::AgentFormatter.new(res).display
  else
    Sentinel::HumanFormatter.new(res).display
  end
end

if format == :human
  puts "\nOverall Status: #{success ? "\e[32mPASSED\e[0m" : "\e[31mFAILED\e[0m"}"
end

exit(success ? 0 : 1)
