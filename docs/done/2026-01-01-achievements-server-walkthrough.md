# Walkthrough: Achievements & Auth Server (Rails API)

Wir haben ein rudimentäres Achievement- und Authentifizierungssystem auf Basis von Rails API aufgebaut.

## Highlights
- **Backend-Ruby**: Ein neues Rails 7 API-Package (`packages/backend-ruby`) mit SQLite (vorerst) und JSONL-Logging.
- **Fake SSO**: Session-basiertes Login-System mit Admin-Support (Passwort: `password123`).
- **Telemetrie**: Der `TrackActionService` loggt Aktionen in `log/actions.{environment}.jsonl`.
- **Frontend-Integration**:
    - `auth` Store für Benutzerstatus.
    - `trackAction` Utility zum Senden von Events.
    - `LoginBar` Komponente im Header.
    - Automatisches Tracking von Projekt-Opens, Step-Views, Task-Checks und Quiz-Erfolgen.

## Struktur
- `packages/backend-ruby/app/services/track_action_service.rb`: Kernlogik für das Logging.
- `packages/backend-ruby/app/controllers/api/v1/actions_controller.rb`: API für Tracking.
- `packages/backend-ruby/app/controllers/api/v1/sessions_controller.rb`: API für Auth.
- `apps/web/src/lib/auth.ts` & `achievements.ts`: Frontend-Services.

## Verifizierung
- Tests für `TrackActionService` und API-Endpoints (`rspec`) sind erfolgreich durchgelaufen.
- Vite-Proxy wurde konfiguriert, um `/api/v1/auth` und `/api/v1/actions` an Rails weiterzuleiten.

## Nächste Schritte
- Anbindung an PostgreSQL für permanente Achievement-Speicherung.
- Ausbau des Achievement-Dashboards im Frontend.

