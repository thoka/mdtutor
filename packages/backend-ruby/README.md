# MDTutor Ruby Backend

Leichtgewichtiges Rails-API für Achievement-Tracking und JWT-Validierung.

## Features
- **JWT Authentifizierung**: Validiert Tokens vom unabhängigen SSO-Server.
- **Action Tracking**: Protokolliert Benutzerinteraktionen (Projekte, Tasks, Quizzes).
- **JSONL Logging**: Schreibt Aktionen in `log/actions.jsonl` für spätere Analyse.

## Setup
```bash
bundle install
bin/rails db:prepare
```

## Running
```bash
bin/rails s -p 3102
```

## API Endpoints
- `GET /api/v1/auth/me` - Aktueller Benutzerstatus (Extrahiert aus JWT)
- `POST /api/v1/actions` - Tracking von Events (Erfordert JWT Authorization Header)

## Telemetrie
Aktionen werden in `log/actions.jsonl` protokolliert. Beispiel Payload:
```json
{"user_id":"student_a","action":"step_complete","gid":"RPL:PROJ:space-talk","metadata":{"step":2},"timestamp":"2026-01-01T15:00:00Z"}
```

## Testing
```bash
bundle exec rspec
```
