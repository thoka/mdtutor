require 'spec_helper'

RSpec.describe "Engine Integrity: No Raw Output" do
  forbidden_patterns = [
    /\bputs\b/,
    /\bprint\b/,
    /\bp\s+/,
    /\bpp\b/
  ]

  # Wir scannen alle lib Dateien der Engine
  engine_files = Dir.glob(File.expand_path("../lib/**/*.rb", __dir__))

  engine_files.each do |file|
    it "does not contain raw output in #{file.sub(Dir.pwd + '/', '')}" do
      violations = []
      File.readlines(file).each_with_index do |line, idx|
        # Ignoriere Kommentare und Erlaubnis-Tags
        next if line.strip.start_with?('#')
        next if line.include?("# SEVERIN_ALLOW_PUTS")

        # Ignoriere Aufrufe auf anderen Objekten (z.B. @output.puts, f.puts, human_log_file.puts)
        # Wir suchen nur nach puts, print, p, pp als eigenständige Befehle (raw)
        # Regex: Muss am Zeilenanfang stehen (mit Whitespace) oder nach einem Semikolon/Operator
        raw_pattern = /^\s*(puts|print|pp|p\s+)\b|([;({]\s*(puts|print|pp|p\s+)\b)/

        if line.match?(raw_pattern)
          violations << "Line #{idx + 1}: #{line.strip}"
        end
      end

      expect(violations).to be_empty, "Raw output (puts/print/p/pp) found. Use 'Severin.log_debug' or a dedicated Output object.\nFile: #{file}\nViolations:\n#{violations.join("\n")}"
    end
  end
end
