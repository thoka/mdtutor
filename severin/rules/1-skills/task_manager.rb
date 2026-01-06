define_skill "Severin Task-Manager 🔹TskMgr" do
  guidance :workflow, "Befolge strikt den Severin-Workflow (Planung vor Implementierung, Conventional Commits)."
  guidance :brain_status, "Änderungen am Brain-Status 'ship-it' sind dem Nutzer vorbehalten. Nutze 'sv_update_status' für den Fortschritt."
  guidance :git, "Nutze für Git-Operationen IMMER die entsprechenden MCP-Tools (sv_commit, sv_ship). Vermeide manuelle Git-Befehle."

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

    TOOLS & IDENTIFIERS (RIDs):
    - Jedes Brain-Dokument benötigt eine eindeutige RID (🔹xxxxx) im Titel und Dateinamen.
    - Nutze `sv_next_id`, um eine neue, freie RID zu generieren.
    - Nutze `sv_fix_brain_id`, um bestehende Dokumente zu korrigieren.
    - Referenziere Regeln und Anforderungen immer mit ihrer RID (z.B. `🔹35SbY`).
  TEXT

  rule "Setze IMMER eine Status-Zeile (z.B. 'Status: in-progress') direkt unter die H1-Überschrift im Brain-Dokument. 🔹35SbY"
  rule "Agenten dürfen den Status eines Brain-Dokuments NIEMALS eigenmächtig auf 'ship-it' setzen. 🔹nM2p1"
  rule "Ein Task gilt erst als gestartet, wenn der Plan committet wurde. 🔹2Gtf3"
  rule "Das Brain-Dokument muss den aktuellen Fortschritt widerspiegeln. 🔹35SbY"
  rule "Nutze `sv_next_id` für neue Dokumente und `sv_fix_brain_id` zur Korrektur. 🔹idG3n"
  rule "Agenten dürfen Brain-Dokumente NIEMALS manuell erstellen. Nutze IMMER das MCP-Tool `sv_next_id`, um Konsistenz sicherzustellen. 🔹BRN-GEN"
  rule "Agenten dürfen NIEMALS eigenständig RIDs (🔹xxxxx) erfinden. Dies erledigt Severin via `sv_next_id`. 🔹RID-GEN"
  rule "Prüfe VOR der Implementation, ob die Anforderung zum aktuellen Branch/Task passt. Erstelle bei Scope-Abweichungen einen neuen Feature-Branch. 🔹CD-BR"

  prompt_file "plan", <<~MARKDOWN
    # 📝 ConvArc Phase: Planung (Brain Doc)
    Der Nutzer hat eine Idee oder ein Ziel freigegeben. Deine Aufgabe ist es nun, den technischen Pfad zu fixieren.

    1. **ID Generierung**: Nutze `sv_next_id`, um eine neue RID (🔹xxxxx) zu erhalten.
    2. **Dokument erstellen**: Lege ein neues Brain-Dokument unter `docs/brain/YYYY-MM-DD-title🔹ID.md` an.
    3. **Struktur**:
       - H1 Titel inkl. RID.
       - Status-Zeile: `Status: in-progress` (direkt unter H1).
       - Kurze Zielbeschreibung (Goals).
       - Aufgabenliste (Tasks) als Markdown-Checkliste.
    4. **Commit**: Committe das Brain-Dokument sofort, um die Phase abzuschließen.

    *Ziel: Ein klarer, nachvollziehbarer Bauplan vor der ersten Code-Zeile.*
  MARKDOWN
end
