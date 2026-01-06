Severin.on_state :implement do
  guidance "Setze die geplanten Tasks um. Folge dem TDD-Prinzip und nutze die svelte-autofixer Tools."

  rule "TDD Enforcement: Schreibe Tests vor der Logik. 🔹STRICT-TDD" do
    condition do
      # Wir prüfen, ob im aktuellen Git-Status (oder Workspace)
      # Test-Dateien (*_spec.rb, *.spec.ts, *.test.ts) vor oder zeitgleich mit Logik-Dateien geändert wurden.
      # Da wir im Agent-Kontext sind, ist dies eine heuristische Prüfung.
      changed_files = `git diff --name-only`.split("\n")
      # Wenn keine Änderungen da sind, ist alles okay (wir fangen gerade an)
      next true if changed_files.empty?

      has_tests = changed_files.any? { |f| f.match?(/spec|test/i) }
      has_logic = changed_files.any? { |f| !f.match?(/spec|test|docs|severin\/rules/i) }

      # Wenn wir Logik ändern, MÜSSEN Tests dabei sein oder bereits existieren
      !has_logic || has_tests
    end
  end

  prompt_file "implement", File.read(".cursor/prompts/implement.md") if File.exist?(".cursor/prompts/implement.md")
end
