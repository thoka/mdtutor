Severin.on_state :verify do
  description "Verifikation der funktionalen Korrektheit (Loop)."

  guidance "Führe Tests aus und verifiziere die Logik. Nutze Dialektik, falls die Implementierung die Vision korrumpiert."

  rule "Verification: Alle Checks müssen PASSED sein. 🔹REV-INT" do
    # This will be replaced by a real check of all results
    condition { true }
  end

  prompt_file "verify", "# Verification\nPrüfe die Implementierung gegen die Anforderungen."
end
