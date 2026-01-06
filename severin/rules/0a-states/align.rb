Severin.on_state :align do
  description "Synchronisation der technischen Realität mit der öffentlichen Dokumentation."

  guidance "Aktualisiere betroffene READMEs und Dokumente. Nutze @align."

  on_enter do
    Severin.log_debug "Entering Alignment: Sync READMEs with code."
  end

  prompt_file "align", File.read(".cursor/prompts/align.md") if File.exist?(".cursor/prompts/align.md")
end
