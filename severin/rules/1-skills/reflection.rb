define_skill "Severin Self-Reflexion 🧠" do
  tags :meta, :workflow, :dev
  
  description "Verpflichtet den Agenten zur Analyse seiner eigenen Arbeitsweise nach komplexen Iterationen."

  rule "Post-Iteration Analysis: Lerne aus deinen Fehlern. 🔹REFLECT" do
    condition { true } # Immer aktiv
  end

  guidance :workflow, "Nutze den @reflect Prompt nach jeder größeren Iteration, um Patterns für Fehler zu identifizieren und die Regeln entsprechend zu schärfen."

  prompt_file "reflect", <<~MARKDOWN
    # 🧠 Task-Reflexion: Pattern-Analyse
    Analysiere die abgeschlossene Aufgabe nach folgenden Kriterien:
    
    1. **Iterative Reibung**: Wo musstest du mehr als 2x nachbessern (z.B. Lade-Reihenfolge, Pfade, Typfehler)?
    2. **Pattern-Erkennung**: Welches technische Muster (z.B. "Metadaten erst nach Bootstrapping verfügbar") hätte den Fehler verhindert?
    3. **Skill-Update**: Schlage eine konkrete Ergänzung für `severin/rules/` vor (Rule oder Guidance), die diesen Fall für den nächsten Agenten abdeckt.
    
    *Ziel: Minimiere die 'Trial-and-Error' Phasen durch kodifiziertes Wissen.*
  MARKDOWN
end

