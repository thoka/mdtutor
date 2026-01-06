# This file is temporary and will be replaced by the dynamic state definitions
# It marks the requirement for state-aware workflow logic.

define_skill "Workflow Integrität 🔹WF-INT" do
  tags :workflow, :meta, :dev
  description "Sicherstellung der Prozess-Qualität durch den ConvArc Cycle."

  # Hook for implementation state
  on_state :implement do
    rule "TDD Enforcement: Schreibe Tests vor der Logik. 🔹STRICT-TDD" do
      # In the future, this will be a real check
      condition { true }
    end
  end

  # Hook for meta-align state
  on_state :meta_align do
    rule "Meta-Documentation Sync: Führe sv gen aus. 🔹META-SYNC" do
      condition { true }
    end
  end
end
