Severin.define_suite "Chat-Dokumentation & Branch-Management 🔹CHAT-DOC" do
  description "Regelt die Zusammenfassung von Diskussionen in docs/chat/ und das automatische Branching."

  check "Zusammenfassung nach Freigabe 🔹CD-SUM" do
    rule :workflow, :chat, "Nachdem eine Anforderung diskutiert und vom Nutzer freigegeben wurde (Go), muss der Agent eine Zusammenfassung in `docs/chat/{timestamp}_summary.md` erstellen. 🔹CD-SUM"
    condition { true }
  end

  check "Ergebnis-Dokumentation 🔹CD-RES" do
    rule :workflow, :chat, "Nach Abschluss der Iteration durch den Agenten muss im gleichen Dokument (`docs/chat/{timestamp}_summary.md`) eine Zusammenfassung der Ergebnisse angefügt werden. 🔹CD-RES"
    condition { true }
  end

  check "Scope-Check & Branching 🔹CD-BR" do
    rule :workflow, :branching, "VOR der Implementation muss der Agent prüfen, ob die Arbeit zum aktuellen Task/Branch passt. Falls nicht (neues Thema oder Scope-Sprengung), muss ein neuer Feature-Branch erstellt und darin gearbeitet werden. 🔹CD-BR"
    condition { true }
  end

  check "Chat-Sprache 🔹CD-LANG" do
    rule :workflow, :chat, :language, "Alle Dokumente in `docs/chat/` müssen auf Englisch verfasst sein. 🔹CD-LANG"
    condition { true }
  end
end
