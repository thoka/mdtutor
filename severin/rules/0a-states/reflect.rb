Severin.on_state :reflect do
  description "Analytische Reflexion über Prozessreibung und Framework-Lücken."

  guidance "Nutze @reflect, um über die Session nachzudenken und Verbesserungen für Severin zu identifizieren."

  on_enter do
    Severin.log_debug "Entering Reflection: Analyze process friction."
  end

  prompt_file "reflect", File.read(".cursor/prompts/reflect.md") if File.exist?(".cursor/prompts/reflect.md")
end
