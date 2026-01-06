define_skill "Severin Glossar & Semantik" do
  description "Definiert grundlegende Begriffe, um Fehlinterpretationen durch Agenten zu verhindern."

  rule ":tag (Metadaten-Tag): Bezieht sich auf Ruby-Symbole (z. B. :workflow, :ids, :git), " \
       "die in Severin-Regeln (`rule`, `on_fail`, `fix`) verwendet werden. Sie steuern, " \
       "dass Texte kontextbezogen an anderen Stellen (z. B. in Guidance oder .cursorrules) " \
       "automatisch eingeblendet werden."

  rule "RID (Random IDs): Bezieht sich auf die 5-stelligen IDs (z. B. 🔹xxxxx). " \
       "Diese werden AUSSCHLIESSLICH von Severin erzeugt und dienen der eindeutigen " \
       "Referenzierung von Regeln, Plänen und Anforderungen. Agenten dürfen diese NIEMALS selbst erfinden."

  rule "Kodifizieren: Der Prozess, diskursive Erkenntnisse oder Anforderungen " \
       "in eine maschinenlesbare und regelbasierte Form (Ruby-Code in severin/rules/) " \
       "zu überführen. Ziel ist es, Wissen vom flüchtigen Chat-Kontext in das " \
       "dauerhafte 'Agentic Memory' des Frameworks zu transformieren."
end
