define_skill "Severin Self-Reflexion 🧠" do
  tags :meta, :workflow, :dev

  description "Verpflichtet den Agenten zur Analyse seiner eigenen Arbeitsweise nach komplexen Iterationen."

  rule "Post-Iteration Analysis: Lerne aus deinen Fehlern. 🔹REFLECT" do
    condition { true } # Immer aktiv
  end

  guidance :workflow, "Nutze den @reflect Prompt nach jeder größeren Iteration, um Patterns für Fehler zu identifizieren und die Regeln entsprechend zu schärfen."

  prompt_file "reflect", <<~MARKDOWN
    # 🧠 Task-Reflexion: Pattern-Analyse
    Dies ist ein automatischer Reflexions-Prompt. Analysiere die abgeschlossene Aufgabe nach folgenden Kriterien:

    1. **Tooling-Integrität (CRITICAL)**: Gab es Momente, in denen das Framework (MCP, CLI) lautlos versagt hat oder Fehler erst viel zu spät bemerkt wurden?
    2. **Iterative Reibung**: Wo musstest du mehr als 2x nachbessern (z.B. Lade-Reihenfolge, Pfade, Typfehler)?
    3. **Pattern-Erkennung**: Welches technische Muster hätte den Fehler (oder das lautlose Versagen des Toolings) verhindert?
    4. **Skill-Update**: Schlage eine konkrete Ergänzung für `severin/rules/` vor (Rule oder Guidance), die diesen Fall für den nächsten Agenten abdeckt.

    *Ziel: Minimiere die 'Trial-and-Error' Phasen durch kodifiziertes Wissen und garantiere Framework-Integrität.*

    **Anweisung**: Antworte direkt mit der Analyse, ohne auf weitere Benutzereingaben zu warten.
  MARKDOWN
end
