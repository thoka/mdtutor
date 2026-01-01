# MDTutor SSO Server

Eigenständiger Authentifizierungs-Dienst für das MDTutor-Ökosystem.

## Features
- **YAML-basierte User-Konfiguration** in `config/users.yaml`.
- **Visueller Kachel-Login** (Phlex-Komponenten).
- **JWT-Handshake**: Signiert Identitäten für andere Dienste.

## Setup
```bash
bundle install
bin/rails db:prepare
```

## Running
```bash
bin/rails s -p 3103
```

## Konfiguration
Benutzer und Admins werden in `config/users.yaml` definiert. Logins dienen als Schlüssel.

## Technik
- Ruby on Rails 7
- Phlex (UI Komponenten)
- JWT (JSON Web Tokens)
