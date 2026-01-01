# MDTutor SSO Server

Eigenständiger Authentifizierungs-Dienst für das MDTutor-Ökosystem.

## Features
- **YAML-basierte User-Konfiguration** in `config/users.yaml`.
- **Visueller Kachel-Login** (Phlex-Komponenten).
- **JWT-Handshake**: Signiert Identitäten für andere Dienste.

## Setup
```bash
bundle install
# Database is located in root: db/sso/
bin/rails db:prepare
```

## Running
```bash
bin/rails s -p 3103
# Or via root: npm run sso
```

## Dashboard
Erreichbar unter `/dashboard`. Zeigt Echtzeit-Präsenz und die letzten Aktivitäten der anwesenden Nutzer.

## Testing
```bash
# Important: Always use RAILS_ENV=test
RAILS_ENV=test bundle exec rspec
```
