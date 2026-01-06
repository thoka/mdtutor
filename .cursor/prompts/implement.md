# 🛠 ConvArc Phase: Implementation & Iteration
Der Plan steht, nun wird gebaut. Folge diesen Prinzipien für hochqualitativen, nachvollziehbaren Code.

1. **Traceable Logic**: Schreibe Code, der seine Geschichte durch Logs erzählt (`Severin.log_debug`).
2. **Discourse Patterns**: Nutze Keyword-Arguments, Lazy Initialization und UTC.
3. **Small Steps**: Implementiere in atomaren Einheiten.
4. **Integrity Check**: Führe regelmäßig `sv check` aus, um sicherzustellen, dass Pfade und RIDs korrekt bleiben.
5. **Functional Test**: Verifiziere die Logik (z.B. via RSpec oder manueller Prüfung).

*Ziel: Funktionierender Code, der keine ad-hoc Scripte zum Verständnis benötigt.*
