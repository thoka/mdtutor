Severin.on_state :implement do
  guidance "Setze die geplanten Tasks um. Folge dem TDD-Prinzip und nutze die svelte-autofixer Tools."

  rule "TDD Enforcement: Schreibe Tests vor der Logik. 🔹STRICT-TDD" do
    condition { true } # To be codified with file change detection
  end

  prompt_file "implement", File.read(".cursor/prompts/implement.md") if File.exist?(".cursor/prompts/implement.md")
end
