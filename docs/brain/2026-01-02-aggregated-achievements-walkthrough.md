# Walkthrough: Aggregated Achievement State & Debug View

Wir haben die Achievements-Logik umgestellt, um die Performance zu verbessern und die Fehleranalyse zu erleichtern.

## Änderungen

### 1. Backend (Ruby)
- **Neuer Endpoint**: `GET /api/v1/actions/user/:user_id/state` liefert nun einen aggregierten Status statt der gesamten Historie.
- **Aggregation**:
    - **Tasks**: Nur der jeweils letzte Status (`check` vs `uncheck`) pro Task wird gespeichert.
    - **Quizzes**: Es wird nur gespeichert, ob ein Quiz jemals erfolgreich absolviert wurde.
    - **Views**: Nur der Zeitstempel und die Index-Nummer des letzten betrachteten Schritts werden geliefert.
- **Limit entfernt**: Das Limit von 200 Aktionen in `user_history` wurde aufgehoben, um bei Bedarf die volle Historie laden zu können.

### 2. Frontend (Svelte 5)
- **Progress-Logic**: `calculateProgress` in `apps/web/src/lib/progress.ts` unterstützt nun das neue `UserState`-Format. Es reichert das Ergebnis zudem mit einem `debug`-Objekt an, das den Berechnungsweg protokolliert.
- **Debug-Overlay**: Die neue Komponente `AchievementDebugOverlay.svelte` erlaubt es Admins und Entwicklern, die Rohdaten und die Berechnungsschritte pro Projekt im Detail einzusehen.
- **Integration**: In der `PathwayView` kann die Fortschrittsanzeige nun angeklickt werden (nur im Dev-Modus oder als Admin), um das Debug-Overlay zu öffnen.

## Verifizierung
- **Backend**: Ein neuer Request-Spec `spec/requests/api/v1/user_state_spec.rb` prüft die korrekte Aggregation von Task-Checks, Unchecks und Quiz-Erfolgen.
- **Frontend**: Vitest-Tests in `progress.test.ts` wurden erweitert, um das neue Datenformat und die Debug-Metadaten zu validieren.

## Benutzung
1. Stelle sicher, dass du als Admin eingeloggt bist oder sich die App im Dev-Modus befindet.
2. Navigiere zu einem Lernpfad (Pathway).
3. Klicke auf die Fortschrittsanzeige (z.B. "1 von 7 Projekten abgeschlossen").
4. Das Debug-Overlay öffnet sich und zeigt alle Details zur Berechnung.

