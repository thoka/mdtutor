define_skill "Severin Glossar & Semantik" do
  description "Definiert grundlegende Begriffe, um Fehlinterpretationen durch Agenten zu verhindern."

  rule ":tag (Metadaten-Tag): Bezieht sich auf Ruby-Symbole (z. B. :workflow, :ids, :git), " \
       "die in Severin-Regeln (`rule`, `on_fail`, `fix`) verwendet werden. Sie steuern, " \
       "dass Texte kontextbezogen an anderen Stellen (z. B. in Guidance oder .cursorrules) " \
       "automatisch eingeblendet werden."

  rule "RID (Random IDs): Bezieht sich auf die 5-stelligen IDs (z. B. 🔹xxxxx). " \
       "Diese werden AUSSCHLIESSLICH von Severin erzeugt und dienen der eindeutigen " \
       "Referenzierung von Regeln, Plänen und Anforderungen. Agenten dürfen diese NIEMALS selbst erfinden."

  rule "Skill: Eine thematische Gruppierung von Regeln (z.B. :ruby, :setup). " \
       "Skills werden in der `severin_state.rb` aktiviert und steuern den Fokus des Agenten."

  rule "Regel (Rule): Die kleinste funktionale Einheit in Severin. Besteht aus einer " \
       "Beschreibung, einer Bedingung (`condition`), einer Fehlermeldung (`on_fail`) " \
       "und optional einer Korrektur-Aktion (`fix`)."

  rule "Autofix: Eine programmatische Lösung innerhalb einer Regel (`fix` Block), " \
       "die Fehler automatisch behebt. Autofixes müssen idempotent und sicher sein."
end
