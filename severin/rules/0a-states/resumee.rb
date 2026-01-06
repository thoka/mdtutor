Severin.on_state :resumee do
  description "Erstellung des Session-Narrativs (Discourse Trace)."

  guidance "Fasse die Session in einem Discourse Trace zusammen (Deutsch). Nutze @resumee."

  rule "Narrative Integrity: Discourse Trace muss erstellt werden. 🔹DT-RES" do
    condition { Dir.glob("docs/chat/#{Time.now.strftime('%Y%m%d')}_discourse_trace.md").any? }
  end

  prompt_file "resumee", File.read(".cursor/prompts/resumee.md") if File.exist?(".cursor/prompts/resumee.md")
end
