module Severin
  class Workflow
    include StateMachine

    attr_accessor :last_error
    attr_reader :context

    # States
    state :discussion, initial: true do
      guidance "Konzentriere dich auf die Klärung der Anforderungen. Schreibe KEINEN Code. Nutze Dialektik, um die Vision zu schärfen."
      rule "Reflex-Hemmung: In diesem Status sind Code-Schreibvorgänge untersagt. 🔹BLOCK-CODE"
    end

    state :planning do
      guidance "Erstelle einen detaillierten Implementierungsplan in docs/brain/ oder aktualisiere einen bestehenden Plan. Definiere klare Tasks."
      rule "Planning First: Kein Code ohne committeten Plan. 🔹PLAN-REQUIRED"
    end

    state :implementation do
      guidance "Setze die geplanten Tasks um. Folge dem TDD-Prinzip und nutze die svelte-autofixer Tools nach jeder Änderung."
      rule "TDD Enforcement: Schreibe Tests vor der Logik. 🔹STRICT-TDD"
    end

    state :review do
      guidance "Prüfe die Implementierung gegen die Anforderungen. Führe alle Tests aus (`sv check`)."
      rule "Integrity Check: Alle Tests müssen PASSED sein, bevor der Status auf shipping geht. 🔹REV-INT"
    end

    state :shipping do
      guidance "Bereite den Release vor. Aktualisiere READMEs und erstelle den finalen Discourse Trace."
      rule "Ship Integrity: Nur nach explizitem 'Status: ship-it' im Brain Doc. 🔹SHIP-INT"
    end

    state :archived

    # Events
    event :plan do
      transitions from: :discussion, to: :planning
      transitions from: :implementation, to: :planning
    end

    event :implement do
      transitions from: :planning, to: :implementation
    end

    event :verify do
      transitions from: :implementation, to: :review
    end

    event :ship do
      transitions from: :review, to: :shipping
    end

    event :archive do
      transitions from: :shipping, to: :archived
    end

    event :reset do
      transitions from: [:planning, :implementation, :review, :shipping], to: :discussion
    end

    def initialize(context = {})
      @context = context
      initialize_state
    end

    def self.current
      @current ||= Workflow.new
    end
  end
end
