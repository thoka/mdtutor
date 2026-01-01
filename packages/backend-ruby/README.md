# MDTutor Ruby Backend

Leichtgewichtiges Rails-API für Authentifizierung (Fake SSO) und Achievement-Tracking.

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
- `POST /api/v1/auth/login` - Login (User-ID, optional Passwort für Admin)
- `GET /api/v1/auth/me` - Aktueller Benutzerstatus
- `POST /api/v1/actions` - Tracking von Events (Action, GID, Metadata)

## Telemetrie
Aktionen werden in `log/actions.jsonl` im JSON-Lines-Format protokolliert.

## Testing
```bash
bundle exec rspec
```
