Severin.on_state :clarify do
  guidance "Konzentriere dich auf die Klärung der Anforderungen. Schreibe KEINEN Code. Nutze Dialektik, um die Vision zu schärfen."

  rule "Reflex-Hemmung: In diesem Status sind Code-Schreibvorgänge untersagt. 🔹BLOCK-CODE" do
    # Placeholder for file-system watcher integration
    condition { true }
  end

  prompt_file "clarify", File.read(".cursor/prompts/clarify.md") if File.exist?(".cursor/prompts/clarify.md")
end
