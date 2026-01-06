Severin.on_state :plan do
  guidance "Erstelle einen detaillierten Implementierungsplan in docs/brain/ oder aktualisiere einen bestehenden Plan."

  rule "Planning First: Kein Code ohne committeten Plan. 🔹PLAN-REQUIRED" do
    condition { Dir.glob("docs/brain/*.md").any? }
  end

  prompt_file "plan", File.read(".cursor/prompts/plan.md") if File.exist?(".cursor/prompts/plan.md")
end
