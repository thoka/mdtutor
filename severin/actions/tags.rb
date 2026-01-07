Severin.define_action "tags" do
  description "Zeigt alle verfügbaren Tags, Skills und deren aktuellen Aktivierungsstatus an."

  guide <<~MARKDOWN
    1. Nutze dieses Tool, um einen Überblick über das 'Agentic Memory' (Tags/Skills) zu erhalten.
    2. Es zeigt an, welche Tags in der `severin_state.rb` aktiv sind.
    3. Es listet alle in den Regeln definierten Tags auf (Struktur-Audit).
  MARKDOWN

  execute do
    # Lade State und Regeln explizit
    root = Severin.project_root
    state_path = File.join(root, "severin_state.rb")
    load state_path if File.exist?(state_path)
    Severin.eval_state!

    # Lade alle Regeln/Skills, damit sie in der Registry erscheinen
    rules_root = File.join(root, "severin/rules")
    if Dir.exist?(rules_root)
      Dir.glob(File.join(rules_root, "**/*.rb")).each { |f| load f }
    end

    Severin.ui.puts "\n\e[1;35m🏷️  AGENTIC MEMORY: TAG & SKILL AUDIT\e[0m"

    # 1. Aktive Konfiguration (aus severin_state.rb)
    Severin.ui.puts "\n\e[1mAKTIVE KONFIGURATION (severin_state.rb):\e[0m"
    if Severin.active_tags.empty? && Severin.active_skills.empty?
      Severin.ui.puts "  \e[90m(Keine Tags oder Skills aktiv)\e[0m"
    else
      Severin.active_tags.each do |tag|
        Severin.ui.puts "  \e[32m●\e[0m :#{tag} \e[90m(Tag)\e[0m"
      end
      Severin.active_skills.each do |skill, sub_tags|
        sub_info = sub_tags.empty? ? "" : " \e[90m-> #{sub_tags.map{|t| ":#{t}"}.join(', ')}\e[0m"
        Severin.ui.puts "  \e[36m●\e[0m :#{skill}#{sub_info} \e[90m(Skill)\e[0m"
      end
    end

    # 2. Verfügbare Skills (aus rules/)
    Severin.ui.puts "\n\e[1mVERFÜGBARE SKILLS (in rules/ definiert):\e[0m"
    # Wir müssen die Regeln laden, um die Skills zu sehen
    Severin.load_all_plugins
    # Wir laden die Regeln kurz in ein temporäres Resultat
    # Da Severin.skills ein Hash von Resultaten ist:
    if Severin.skills.empty?
       # Falls noch nicht geladen, erzwinge check-lauf im Trockenmodus?
       # Nein, wir nutzen die Registry, die beim Laden der Dateien befüllt wird.
    end

    Severin.skills.each do |name, result|
      is_active = Severin.active_skills.key?(name.to_sym) || Severin.active_tags.include?(name.to_sym)
      status_icon = is_active ? "\e[32m[AKTIV]\e[0m" : "\e[90m[bereit]\e[0m"
      Severin.ui.puts "  #{status_icon} :#{name.to_s.ljust(15)} \e[90m(#{result.tags.map{|t| ":#{t}"}.join(', ')})\e[0m"
    end

    # 3. Alle registrierten Tags (Struktur-Check)
    Severin.ui.puts "\n\e[1mALLE REGISTRIERTEN TAGS (Synapsen):\e[0m"
    all_tags = Severin.registered_tags.sort
    all_tags.each do |tag|
      is_active = Severin.active_tags.include?(tag) || Severin.active_skills.key?(tag)
      color = is_active ? "\e[32m" : "\e[90m"
      Severin.ui.puts "  #{color}:#{tag}\e[0m"
    end

    Severin.ui.puts "\n\e[1mAKTUELLES ZIEL (Objective):\e[0m"
    Severin.ui.puts "  \e[35m\"#{Severin.current_objective}\"\e[0m"
    Severin.ui.puts ""
  end
end
