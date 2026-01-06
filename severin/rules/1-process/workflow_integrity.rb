# Diese Datei stellt die Anforderungen für die zustandsbasierte Workflow-Logik sicher.
# Sie dient als Platzhalter für die dynamischen Statusdefinitionen.

define_skill "Workflow Integrität 🔹WF-INT" do
  tags :workflow, :meta, :dev
  description "Sicherstellung der Prozess-Qualität durch den ConvArc-Zyklus."

  # Hook für den Implementierungs-Status
  on_state :implement do
    rule "TDD-Erzwingung: Schreibe Tests vor der Logik. 🔹STRICT-TDD" do
      # In Zukunft wird dies ein echter Check sein
      condition { true }
    end
  end

  # Hook für den Meta-Align-Status
  on_state :meta_align do
    rule "Meta-Dokumentations-Sync: Führe 'sv gen' aus. 🔹META-SYNC" do
      condition { true }
    end
  end
end
