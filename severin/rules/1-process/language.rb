suite = Severin.define_suite "Sprach-Integrität" do
  description "Stellt sicher, dass die AI-Instruktionen eine klare Sprachvorgabe enthalten."

  check "Sprachanweisung in AI-Umgebungen" do
    rule "Jede AI-Umgebung (.cursorrules) muss die konfigurierte Sprache explizit als Arbeitsanweisung enthalten."
    condition do
      ai_envs = Severin.environments.select { |e| e.format == :ai }
      return true if ai_envs.empty?

      ai_envs.all? do |env|
        next true unless File.exist?(env.path)
        content = File.read(env.path)
        content.include?("Sprache") && content.include?(env.language)
      end
    end
    on_fail "Die Sprachvorgabe fehlt oder ist falsch in den AI-Instruktionen."
    fix "Überprüfe die environments.rb und führe 'sv' aus."
  end
end
