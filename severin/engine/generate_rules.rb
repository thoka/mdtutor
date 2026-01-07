require 'fileutils'
require 'optparse'
require_relative 'lib/severin'

require_relative 'lib/severin/generator'

# Argument parsing for root directory
options = { root: Dir.pwd }
OptionParser.new do |opts|
  opts.on("--root ROOT", "Project root directory") { |r| options[:root] = r }
end.parse!

Dir.chdir(options[:root]) do
  # Wir laden alle Projekt-Regeln, um sie zu dokumentieren
  RULES_ROOT = File.expand_path("severin/rules", options[:root])

  # 1.1 State-Konfiguration laden (severin_state.rb)
  state_path = File.join(options[:root], "severin_state.rb")
  # Wir laden erst einmal alle Regeln, um die Tags zu registrieren
  Severin.reset!
  config_path = File.join(options[:root], "severin/environments.rb")
  load config_path if File.exist?(config_path)
  stages = Dir.glob(File.join(RULES_ROOT, "*")).select { |d| File.directory?(d) }.sort
  stages.each { |d| Dir.glob("#{d}/*.rb").each { |f| load f } }

  # Nun laden wir den State (der nun gegen die registrierten Tags prüfen kann)
  state_path = File.join(options[:root], "severin_state.rb")
  if File.exist?(state_path)
    load state_path
    Severin.eval_state!
    Severin.log_debug "Evaluated state", active_tags: Severin.active_tags
  end

  # Check: Existieren alle im State geforderten Skill-Tags?
  Severin.active_skills.keys.each do |tag|
    unless Severin.registered_tags.include?(tag)
      Severin.ui_error "🔹STATE-VAL: Tag '#{tag}' (in ./severin_state.rb genutzt) ist in keiner Regel definiert!"
      exit 1
    end
  end

  # 3. Alle Actions laden (Engine + Projekt)
  Severin.load_all_plugins

  # 4. Generierung ausführen
  Severin::Generator.new(options[:root]).generate_all
end
