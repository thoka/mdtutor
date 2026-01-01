# MDTutor Ruby Backend

Leichtgewichtiges Rails-API für Achievement-Tracking und JWT-Validierung.

## Features
- **JWT Authentifizierung**: Validiert Tokens vom unabhängigen SSO-Server.
- **Action Tracking**: Protokolliert Benutzerinteraktionen (Projekte, Tasks, Quizzes).
- **JSONL Logging**: Schreibt Aktionen in `log/actions.jsonl` für spätere Analyse.

## Setup
```bash
bundle install
# Database is located in root: db/achievements/
bin/rails db:prepare
```

## Running
```bash
bin/rails s -p 3102
# Or via root: npm run achievements
```

## API Endpoints
- `GET /api/v1/auth/me` - Aktueller Benutzerstatus (Extrahiert aus JWT)
- `POST /api/v1/actions` - Tracking von Events (Erfordert JWT Authorization Header)
- `GET /api/v1/actions/latest` - Letzte Aktionen für eine Liste von User-IDs
- `GET /api/v1/actions/user/:user_id` - Alle Aktionen eines Benutzers

## Testing
```bash
# Important: Always use RAILS_ENV=test
RAILS_ENV=test bundle exec rspec
```
