Severin.on_state :task_end do
  description "Abschluss der Iteration und Übergabe."

  guidance "Die Session ist beendet. Erstelle den finalen Agent Primer für die nächste Session."

  on_enter do
    Severin.log_debug "Task completed. Ready for handoff."
  end
end
