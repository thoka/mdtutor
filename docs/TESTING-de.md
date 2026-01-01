# Test-Strategie & Dokumentation

Dieses Dokument beschreibt die Test-Infrastruktur für das MDTutor Projekt, insbesondere für die Ruby-basierten Backend-Dienste.

## Übersicht der Test-Suites

### 1. Achievements Backend (packages/backend-ruby)
Dieses Backend nutzt **RSpec** für Unit- und Integrationstests.

- **Request Specs** (`spec/requests/api/v1/`): Testen die API-Endpunkte, JWT-Authentifizierung und die korrekte Rückgabe von JSON-Daten.
- **Service Specs** (`spec/services/`): Testen die Geschäftslogik, insbesondere den `TrackActionService`, der duales Logging (JSONL + DB) implementiert.
- **Model Specs** (`spec/models/`): Validieren die Datenbank-Modelle und UUID-Generierung.

**Ausführung:**
```bash
cd packages/backend-ruby
bundle exec rspec
```

### 2. SSO-Server (packages/sso-server)
Auch der SSO-Server nutzt **RSpec**, um die kritische Authentifizierungs-Infrastruktur abzusichern.

- **Service Specs** (`spec/services/`): Testen den `UserLoader` (YAML-Konfiguration, PIN/Passwort-Verifizierung).
- **Model Specs** (`spec/models/`): Testen die Presence-Logik, Besuchs-Historie (`Visits`) und das Raum-Management.

**Ausführung:**
```bash
cd packages/sso-server
bundle exec rspec
```

## Test-Konventionen

- **Datenbank**: Wir nutzen SQLite3 für die Entwicklung und Tests. Vor den Tests sollte `bin/rails db:test:prepare` ausgeführt werden, um das Schema zu synchronisieren.
- **UUIDs**: Da SQLite keine nativen UUIDs unterstützt, nutzen wir `id: :string` in den Migrationen und das `Uuidable` Concern in den Modellen zur Generierung.
- **Mocks/Stubs**: Externe API-Aufrufe (z.B. zwischen SSO und Backend) werden in Unit-Tests gemockt, um Unabhängigkeit zu gewährleisten.

## Frontend (Work in Progress)
Die Svelte 5 Komponenten werden perspektivisch mit Vitest und Playwright/Puppeteer getestet. Aktuell liegt der Fokus auf der Absicherung der Backend-Logik.
