define_skill "Discourse Trace 🎭" do
  tags :meta, :workflow, :dev

  description "Verpflichtet den Agenten zur Erstellung eines Sitzungs-Narrativs (Discourse Trace), das den Gedankenfluss und die Argumentation dokumentiert. 🔹T6Av2"

  rule "Narrative Summary: Erstelle einen Discourse Trace am Ende jeder Sitzung. 🔹DT-RES" do
    condition { true }
  end

  rule "Discourse Language: Der Trace wird in der Konversationssprache (Deutsch) verfasst. 🔹DT-LANG" do
    condition { true }
  end

  rule "Documentation Alignment: Aktualisiere alle betroffenen READMEs nach der Session. 🔹DOC-ALIGN" do
    condition { true }
  end

  rule "Meta-Reflexion: Evaluiere und verfeinere den Workflow nach jeder Session. 🔹META-REFLECT" do
    condition { true }
  end

  rule "Meta-Alignment: Synchronisiere Workflow-Erkenntnisse mit dem Regelwerk und docs/CONVARC_WORKFLOW.md. 🔹META-ALIGN" do
    condition { true }
  end

  prompt_file "align", <<~MARKDOWN
    # 📚 Documentation Alignment Check

    Analysiere die technischen Änderungen dieser Sitzung und gleiche sie mit der bestehenden Dokumentation (READMEs) ab.

    ## 🔍 Impact Analyse
    *Welche Verzeichnisse und Module wurden technisch verändert oder neu eingeführt?*

    ## 📑 README Audit
    *Prüfe die README.md Dateien in den betroffenen Pfaden. Was ist veraltet oder fehlt?*

    ## ✍️ Update Vorschläge
    *Führe notwendige Updates an READMEs durch, um die neuen Features (z.B. neue CLI-Befehle, Logging-Strukturen, Patterns) zu dokumentieren.*
  MARKDOWN

  prompt_file "meta", <<~MARKDOWN
    # 🌀 Meta-Alignment & Workflow Evolution

    Analysiere den heutigen Workflow und die Effizienz unserer "Conversational Architecture".

    ## ⚙️ Prozess-Audit
    *Gab es Reibungspunkte in der Kommunikation oder im Workflow (z.B. Namensgebung, Unklarheiten bei Phasen)?*

    ## 🧩 Skill-Gaps & Patterns
    *Welche Erkenntnisse sollten als neue Regeln oder Guidance in `severin/rules/` kodifiziert werden?*

    ## 🔄 Workflow-Update
    *Schlage konkrete Änderungen am Meta-README (`docs/CONVARC_WORKFLOW.md`) oder an den Severin-Rules vor.*

    **Anweisung**: Führe das Meta-Alignment durch (Updates an Rules/Doku) und bereite den Task für das finale Resümee-Update vor.
  MARKDOWN

  prompt_file "resumee", <<~MARKDOWN
    # 🎭 Discourse Trace: Sitzungs-Narrativ

    Analysiere die gesamte Session als einen zusammenhängenden Diskurs. Schreibe kein technisches Log, sondern eine erzählende Zusammenfassung (Narrativ) in der **Originalsprache des Gesprächs (Deutsch)**.

    ## 🌊 Der rote Faden (Der Diskurs-Fluss)
    *Wie sind wir eingestiegen? Welche Impulse haben die Richtung bestimmt? Beschreibe die Dynamik des Gesprächs.*

    ## 💡 Gedankenwelt & Argumente des Nutzers
    *Was waren die zentralen Anliegen und Visionen? Welche Konzepte (z.B. Discourse-Patterns, Tagging-Kultur) wurden wie begründet? Halte die Intention fest.*

    ## 🧠 Emergenz: Was ist währenddessen entstanden?
    *Welche Muster oder Erkenntnisse sind erst durch das Gespräch sichtbar geworden (z.B. die Notwendigkeit von Fail-Fast bei MCP oder die Sprache der Dokumentation)?*

    ## 🛠 Das Resultat im Kontext
    *Was wurde umgesetzt und wie bettet es sich in die diskutierte Vision ein?*

    ## 🎯 Ausblick & Mentale Modelle
    *Welche Begriffe oder Konzepte nehmen wir als festen Bestandteil für die Zukunft mit?*

    **Anweisung**: Speichere diesen Discourse Trace in `docs/chat/{timestamp}_discourse_trace.md` und gib eine kurze Zusammenfassung im Chat.
  MARKDOWN
end
