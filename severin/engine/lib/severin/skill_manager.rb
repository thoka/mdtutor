module Severin
  class SkillManager
    def initialize(root_path)
      @root = root_path
    end

    def active_skills(full: false)
      # Rules laden
      rules_root = File.expand_path("severin/rules", @root)

      # 1. Framework-Konfiguration laden
      config_path = File.join(@root, "severin/environments.rb")
      load config_path if File.exist?(config_path)

      # 2. Alle Regeln laden (Stages)
      stages = Dir.glob(File.join(rules_root, "*")).select { |d| File.directory?(d) }.sort
      stages.each { |d| Dir.glob("#{d}/*.rb").each { |f| load f } }

      # 3. State laden & evaluieren
      state_path = File.join(@root, "severin_state.rb")
      load state_path if File.exist?(state_path)
      Severin.eval_state!

      # Filter logic (identisch mit CLI/Generator)
      Severin.all_results.select do |r|
        is_skill = r.suite_name =~ /Skill:/
        is_core = r.tags.include?(:core)
        is_active_tag = (r.tags & Severin.active_tags).any?
        matching_tags = r.tags & Severin.active_skills.keys
        is_active_by_tag = matching_tags.any?

        is_core || is_active_tag || is_active_by_tag || (!is_skill && Severin.active_tags.empty?)
      end
    end
  end
end
