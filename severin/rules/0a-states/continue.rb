Severin.on_state :continue do
  description "Session Onboarding und Kontext-Wiederherstellung."
  entry_point true

  guidance "Willkommen zurück. Nutze @continue, um den Kontext der letzten Session zu laden."

  rule "Agent Primer: Prüfe auf vorhandenen Diskurs-Trace. 🔹TRACE-CHECK" do
    condition { Dir.glob("docs/chat/*_discourse_trace.md").any? }
  end
end
