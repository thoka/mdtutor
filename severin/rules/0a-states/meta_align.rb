Severin.on_state :meta_align do
  description "Synchronisation der Meta-Dokumentation mit der Architektur."

  guidance "Die Architektur wurde geändert. Führe sv gen aus, um PROJECT_RULES.md zu aktualisieren."

  on_enter do
    # Here we could trigger sv gen automatically in the future
    Severin.log_debug "Entering Meta-Align: Architectural documentation needs sync."
  end

  rule "Meta-Documentation Sync: Synchronisiere Regeln mit .cursorrules. 🔹META-SYNC" do
    condition { true } # To be codified by checking file timestamps
  end

  prompt_file "meta-align", <<~MD
    # ⚙️ ConvArc Phase: Meta-Alignment (Doku-Sync)

    Die Architektur hat sich weiterentwickelt (z.B. neue Registry-Patterns, Hook-System). Jetzt müssen wir sicherstellen, dass die übergeordnete Meta-Dokumentation diese Realität noch korrekt beschreibt.

    ## 🎯 Fokus: Dokumentation der Patterns
    In dieser Phase geht es darum, die abstrakten Modelle (Meta) mit der technischen Manifestation zu synchronisieren.

    ## 🛠 Kern-Aktionen
    1. **Doku-Check**: Prüfe `docs/CONVARC_WORKFLOW.md` und andere Meta-READMEs. Beschreiben sie noch korrekt, wie das System funktioniert (z.B. die neue Identität von States und Prompts)?
    2. **Pattern-Synchronisation**: Falls wir während der Implementierung neue übergeordnete Muster (wie das Rails/Discourse Registry-Pattern) etabliert haben, müssen diese jetzt in die Meta-Dokumentation einfließen.
    3. **Wahrheitsgehalt**: Stelle sicher, dass die "Versprechen" in der Meta-Doku (wie TDD-Strenge oder Workflow-Phasen) mit der tatsächlichen Implementierung in der Severin-Engine übereinstimmen.

    ## 🧠 Mentales Modell
    `meta-align` stellt sicher, dass unser "Gesetzbuch" (`docs/`) und unsere "Exekutive" (Engine/Code) nicht auseinanderlaufen. Es ist die Qualitätssicherung der architektonischen Wahrheit.

    **Anweisung**: Aktualisiere die Meta-Dokumente bei Bedarf und bereite den finalen Übergang zum `@task_end` vor.
  MD
end
