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

    ITERATION CYCLE:
    - Jede Iteration (ein Durchlauf im Agent-Modus) MUSS mit einer Aktualisierung des Brain-Dokuments enden.
    - Erledigte Tasks müssen als `[x]` markiert werden.
    - Neue Erkenntnisse oder Planänderungen müssen sofort im Dokument festgehalten werden.

    TOOLS & IDENTIFIERS (Req-IDs):
    - Jedes Brain-Dokument benötigt eine eindeutige Requirement-ID (🔹xxxxx) im Titel und Dateinamen.
    - Nutze `sv_next_id`, um eine neue, freie ID zu generieren.
    - Nutze `sv_fix_brain_id`, um bestehende Dokumente zu korrigieren.
    - Referenziere Regeln und Anforderungen immer mit ihrer ID (z.B. `🔹35SbY`).
  TEXT

  rule "Setze IMMER eine Status-Zeile (z.B. 'Status: in-progress') direkt unter die H1-Überschrift im Brain-Dokument. 🔹35SbY"
  rule "Agenten dürfen den Status eines Brain-Dokuments NIEMALS eigenmächtig auf 'ship-it' setzen. 🔹nM2p1"
  rule "Ein Task gilt erst als gestartet, wenn der Plan committet wurde. 🔹2Gtf3"
  rule "Das Brain-Dokument muss den aktuellen Fortschritt widerspiegeln. 🔹35SbY"
  rule "Nutze `sv_next_id` für neue Dokumente und `sv_fix_brain_id` zur Korrektur. 🔹idG3n"
  rule "Agenten dürfen Brain-Dokumente NIEMALS manuell erstellen. Nutze IMMER das MCP-Tool `sv_next_id`, um Konsistenz sicherzustellen. 🔹BRN-GEN"
end
