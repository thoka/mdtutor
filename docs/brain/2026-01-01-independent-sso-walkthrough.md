# Walkthrough: Independent JWT SSO System

Wir haben das Authentifizierungssystem auf ein unabhängiges SSO-Modell umgestellt.

## Highlights
- **SSO Server (`packages/sso-server`)**: Ein eigenständiger Rails-Dienst für die Identitätsverwaltung.
- **YAML Config**: Benutzer werden in `config/users.yaml` definiert (Admins vs. normale User).
- **Kachel-UI**: Eine visuelle Auswahlseite für Test-User im Makerspace-Stil.
- **JWT Handshake**: Der SSO-Server signiert Identitäten mit einem Shared Secret und leitet den User mit einem Token zurück zur Web-App.
- **Backend Security**: `packages/backend-ruby` validiert nun alle Tracking-Anfragen via JWT (Bearer Token).
- **Frontend Flow**:
    - Login-Button leitet zum SSO-Server weiter.
    - Web-App extrahiert Token aus der URL und speichert ihn im LocalStorage.
    - Alle API-Anfragen an das Achievement-Backend enthalten automatisch den Authorization-Header.

## Verifizierung
- Request-Specs für das Backend verifizieren die JWT-Pflicht.
- Die visuelle Kachel-Auswahl ist im SSO-Server implementiert.
- `.env` wurde um `SSO_PORT=3103` und `SSO_JWT_SECRET` erweitert.

## Ausblick
- Der SSO-Server kann später um echte Authentifizierung (z.B. GitHub/Discourse) erweitert werden.
- Rollenbasierte Achievements im Backend (nur Admins dürfen bestimmte Dinge).

