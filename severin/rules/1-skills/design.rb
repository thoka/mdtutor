define_skill "Discursive Design 🗣️" do
  tags :meta, :workflow, :dev

  description "Regelt die frühen Phasen des ConvArc Cycles: Inspiration, Klärung und Dialektik. 🔹y2IWC"

  rule "Clarification First: Springe niemals direkt in den Code, ohne die Vision geklärt zu haben. 🔹CLARIFY-1" do
    condition { true }
  end

  prompt_file "clarify", <<~MARKDOWN
    # 🗣️ ConvArc Phase: Klärung & Dialektik (Clarification)
    Wir befinden uns in der Phase der Ideenfindung. Deine Aufgabe ist es, die Vision des Nutzers präzise zu erfassen.

    1. **Intent-Audit**: Was ist das eigentliche Ziel hinter der Anfrage?
    2. **Pattern-Exploration**: Gibt es bestehende Muster (Engine, Skills), die wir nutzen oder erweitern können?
    3. **Trade-offs**: Welche Vor- und Nachteile haben verschiedene Lösungsansätze?
    4. **Confirmation**: Fasse dein Verständnis zusammen und warte auf das "Go" für die Planung.

    *Ziel: Ein gemeinsames mentales Modell vor der technischen Manifestation.*
  MARKDOWN
end

