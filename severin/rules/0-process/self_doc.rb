suite = Severin.define_suite "Self-Documentation Workflow" do
  description "Stellt sicher, dass die Regeln erklären, wie sie aktualisiert werden."

  check "Dokumentation der Generierung" do
    rule "Die PROJECT_RULES.md muss den Befehl 'sv' zur Neu-Generierung erwähnen, damit der Workflow klar ist."
    target "PROJECT_RULES.md"
    condition do
      return false unless File.exist?(target)
      content = File.read(target)
      content.include?("sv")
    end
    on_fail "In den PROJECT_RULES.md fehlt der Hinweis auf den 'sv' Befehl."
    fix "Füge eine Regel hinzu, die den 'sv' Befehl für die Dokumentations-Generierung beschreibt, und führe 'sv' aus."
  end
end
