define_skill "Severin Task-Manager 🔹TskMgr" do
  description <<~TEXT
    Dieser Skill regelt das Onboarding und Management von neuen Aufgaben/Features.
    
    ONBOARDING FLOW:
    1. Feature-Branch erstellen (`feature/name`).
    2. Brain-Dokument anlegen (`docs/brain/YYYY-MM-DD-name.md`).
    3. Status-Zeile direkt unter der H1-Überschrift setzen.
    4. Tasks als Checkliste definieren.

    STATUS-MANAGEMENT:
    - Gültige Status: `in-progress`, `paused`, `review-needed`, `ship-it`.
    - Der Status `ship-it` darf NIEMALS von einem KI-Agenten selbst gesetzt werden. Dieser Status ist ausschließlich dem menschlichen Nutzer vorbehalten, um die Freigabe für `sv_ship` zu erteilen.
  TEXT

  rule "Setze IMMER eine Status-Zeile (z.B. 'Status: in-progress') direkt unter die H1-Überschrift im Brain-Dokument. 🔹35SbY"
  rule "Agenten dürfen den Status eines Brain-Dokuments NIEMALS eigenmächtig auf 'ship-it' setzen. 🔹nM2p1"
  rule "Ein Task gilt erst als gestartet, wenn der Plan committet wurde. 🔹2Gtf3"
end

