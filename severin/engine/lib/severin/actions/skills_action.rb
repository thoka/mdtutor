require_relative 'base'
require_relative '../skill_manager'
require_relative '../documentable'

module Severin
  module Actions
    class SkillsAction < Base
      extend Severin::Documentable

      spec :call, "Zeigt alle aktiven Skills für das aktuelle Projekt an." do
        param :full, type: :boolean, desc: "Zeigt alle Details inkl. Guidance und Regeln."
        satisfies "🔹uVr0W"
      end

      def self.register_options(parser, options)
        parser.on("--full", "Zeige alle Details zu den Skills (inkl. Guidance).") do
          options[:full] = true
        end
      end

      def call(args = [])
        root = find_root
        unless root
          $stderr.puts "❌ Kein Severin-Projekt gefunden." # SEVERIN_ALLOW_PUTS
          return
        end

        manager = Severin::SkillManager.new(root)
        results = manager.active_skills

        # Setup Output Multi-Stream
        log_dir = File.expand_path("severin/log", root)
        FileUtils.mkdir_p(log_dir)
        human_log = File.open(File.join(log_dir, "human.log"), "a").tap { |f| f.sync = true }

        output = Severin::Output.new
        output.add_stream($stdout)
        output.add_stream(human_log)

        output.puts "\n\e[1;35m🧠 AKTIVE SKILLS FÜR DIESEN TASK\e[0m"
        output.puts "\e[35m" + "━" * 40 + "\e[0m"

        results.select { |r| r.suite_name =~ /Skill:/ }.each do |s|
          name = s.suite_name.gsub("Skill: ", "")
          tags = s.tags.empty? ? "" : " \e[90m[#{s.tags.join(', ')}]\e[0m"
          output.puts "  ● \e[1m#{name}\e[0m#{tags}"

          if @options[:full]
            # Description anzeigen
            unless s.description.nil? || s.description.empty?
              output.puts "\n    \e[1mBeschreibung:\e[0m"
              s.description.split("\n").each do |line|
                output.puts "      #{line}"
              end
            end

            # Guidance anzeigen
            unless s.checks.empty?
              has_guidance = s.checks.any? { |c| c[:guidance] && !c[:guidance].empty? }
              if has_guidance
                output.puts "\n    \e[1mGuidance:\e[0m"
                s.checks.each do |check|
                  next unless check[:guidance] && !check[:guidance].empty?
                  check[:guidance].each do |scenario, text|
                    output.puts "      \e[35m#{scenario}:\e[0m #{text}"
                  end
                end
              end
            end

            # Rules anzeigen
            unless s.rules.empty?
              output.puts "\n    \e[1mRules:\e[0m"
              s.rules.each do |rule|
                output.puts "      • #{rule}"
              end
            end
          end

          s.references.each do |ref|
            output.puts "    \e[34m📄 Referenz: #{ref}\e[0m"
          end
          output.puts "\n" if @options[:full]
        end

        unless Severin.current_objective.empty?
          output.puts "\n\e[1;32m🎯 ZIEL:\e[0m #{Severin.current_objective}"
        end
        output.puts "\n"
        human_log.close
      end
    end
  end
end
