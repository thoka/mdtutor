suite = Severin.define_suite "📜kcvzQ Sprach-Integrität" do
  description "Stellt sicher, dass die AI-Instruktionen zwischen Chat- und Dokumentationssprache unterscheiden."

  check "📜dTyEL Sprachanweisung in AI-Umgebungen" do
    rule "📜Ynyhp Jede AI-Umgebung (.cursorrules) muss explizit zwischen Konversations- und Dokumentationssprache unterscheiden."
    condition do
      ai_envs = Severin.environments.select { |e| e.format == :ai }
      return true if ai_envs.empty?

      ai_envs.all? do |env|
        next true unless File.exist?(env.path)
        content = File.read(env.path)
        content.include?("Konversation") && content.include?(env.chat_language) &&
        content.include?("Dokumentation") && content.include?(env.doc_language)
      end
    end
    on_fail "Die differenzierte Sprachvorgabe fehlt oder ist falsch in den AI-Instruktionen."
    fix "Überprüfe die environments.rb und führe 'sv' aus."
  end
end
