Severin.on_state :meta do
  description "Meta-Alignment: Feedback von Workflow-Erkenntnissen in das Regelwerk."

  guidance "Überprüfe, ob neue Regeln oder Anpassungen an Severin nötig sind. Nutze @meta."

  on_enter do
    Severin.log_debug "Entering Meta: Feedback loop for rules."
  end

  prompt_file "meta", File.read(".cursor/prompts/meta.md") if File.exist?(".cursor/prompts/meta.md")
end
