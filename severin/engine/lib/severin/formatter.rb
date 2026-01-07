module Severin
  class Formatter
    def initialize(result, output: nil, verbose: false)
      @result = result
      @output = output || $stdout
      @verbose = verbose
    end
  end

  class HumanFormatter < Formatter
    def display
      icon = case @result.suite_name
             when /Skill:/ then "🧠 "
             when /Git|Workcycle|Branch/ then "⚖️  "
             when /Umgebung|Integrität/ then "🏗️  "
             when /Code|Port/ then "🔧 "
             else "📁 "
             end

      suite_status = @result.success? ? "\e[32m[PASSED]\e[0m" : "\e[31m[FAILED]\e[0m"

      # Suite-Header nur anzeigen, wenn sie fehlschlägt oder verbose aktiv ist
      if !@result.success? || @verbose
        @output.puts "\n#{icon}\e[1m#{dim_ids(@result.suite_name)}\e[0m #{suite_status}"
      end

      @result.checks.each do |c|
        name = dim_ids(c[:name])
        if c[:passed]
          next unless @verbose || c[:autofixed] # Erfolgreiche Checks nur in verbose oder wenn autofixed
          if c[:autofixed]
            @output.puts "  \e[32m✨\e[0m #{name} \e[32m(GEFIXT)\e[0m"
          else
            @output.puts "  \e[32m✔\e[0m #{name}"
          end
        else
          color = c[:severity] == :warning ? "33" : "31"
          symbol = c[:severity] == :warning ? "⚠" : "✘"
          label = c[:severity] == :warning ? "WARNUNG" : "FEHLER"

          @output.puts "  \e[#{color}m#{symbol}\e[0m #{name} (\e[#{color}m#{label}\e[0m)"
          @output.puts "    \e[33m💡 #{c[:message]}\e[0m" if c[:message]

          if c[:exception] && @verbose
            @output.puts "    \e[31m💥 Stacktrace:\e[0m"
            c[:exception].backtrace[0..5].each { |line| @output.puts "      \e[90m#{line}\e[0m" }
          end

          guidance_list = resolve_guidance(c)
          unless guidance_list.empty?
            @output.puts "    \e[35m🤖 AGENT:\e[0m"
            guidance_list.each { |text| @output.puts "      \e[35m• #{text}\e[0m" }
          end

          if c[:source]
            rel_path = c[:source].sub("#{Dir.pwd}/", "")
            @output.puts "    \e[90m📍 Check definiert in: #{rel_path}\e[0m"
          end
          @output.puts "    \e[36m👉 Fix: #{c[:fix_command]}\e[0m" if c[:fix_command]
        end
      end
    end

    private

    def resolve_guidance(c)
      list = []
      list << c[:guidance][:ai] if c[:guidance]&.[](:ai)
      [:message_tags, :fix_tags, :tags].each do |tag_group|
        next unless c[tag_group]
        c[tag_group].each { |tag| list += Severin.guidance_for(tag) }
      end
      list.uniq
    end

    def dim_ids(text)
      text.gsub(/(🔹[a-zA-Z0-9]{5})/, "\e[90m\\1\e[0m")
    end
  end

  class AgentFormatter < Formatter
    def display
      return if @result.success?

      failed_checks = @result.checks.reject { |c| c[:passed] }

      failed_checks.each do |c|
        # Extrahiere RID (🔹xxxxx) falls vorhanden, sonst nimm den vollen Namen
        rid_match = c[:name].match(/🔹[a-zA-Z0-9]{5}/)
        label = rid_match ? rid_match[0] : c[:name]

        @output.puts "❌ #{label}: #{c[:message]}"
        if c[:exception]
          @output.puts "💥 Exception: #{c[:exception].class} - #{c[:exception].message}"
          @output.puts "📍 Location: #{c[:exception].backtrace.first}" if c[:exception].backtrace
        end
        @output.puts "👉 Fix: #{c[:fix_command]}" if c[:fix_command]

        guidance_list = resolve_guidance(c)
        guidance_list.each { |text| @output.puts "💡 #{text}" }
        @output.puts ""
      end
    end

    private

    def resolve_guidance(c)
      list = []
      list << c[:guidance][:ai] if c[:guidance]&.[](:ai)
      [:message_tags, :fix_tags, :tags].each do |tag_group|
        next unless c[tag_group]
        c[tag_group].each { |tag| list += Severin.guidance_for(tag) }
      end
      list.uniq
    end
  end
end
