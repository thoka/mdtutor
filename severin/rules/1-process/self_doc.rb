suite = Severin.define_suite "Self-Documentation Workflow 🔹aOgCE" do
  description "Stellt sicher, dass die Regeln erklären, wie sie aktualisiert werden."

  check "Dokumentation der Generierung 🔹3097t" do
    rule "Jede registrierte Umgebung (via define_environment) muss den Befehl 'sv' zur Neu-Generierung erwähnen. 🔹HSpv4"
    condition do
      return false if Severin.environments.empty?

      Severin.environments.all? do |env|
        next true unless File.exist?(env.path)
        content = File.read(env.path)
        content.include?("sv")
      end
    end
    on_fail "In mindestens einer Umgebung fehlt der Hinweis auf den 'sv' Befehl."
    fix "Führe 'sv' aus."
  end
end
