# Brain: Deployment Strategy & Research (2026-01-02)

## Overview
We are implementing a simple test deployment for the MDTutor ecosystem. The goal is to provide a Docker-based setup that can be easily deployed to a test server (e.g., `mdtutor.3oe.de`).

## Research: Reverse Proxy Standards
- **Traefik**: The current industry standard for Docker environments. It uses Docker Labels for dynamic configuration, which keeps the setup clean and versioned within `docker-compose.yml`.
- **Nginx Proxy Manager (NPM)**: Good for manual UI-based management, but harder to version-control and automate in a Git-first workflow.
- **Caddy**: Modern alternative, but Traefik's native label support is slightly more convenient for this specific monorepo structure.

**Decision**: Use **Traefik** for routing.

## Database Strategy
- **SQLite**: We will stick with SQLite for the initial demo to minimize architectural changes and complexity.
- **PostgreSQL**: Planned for future production-ready iterations if performance or concurrency issues arise.

## Routing Mapping
| Service | Domain / Path | Target Port |
| :--- | :--- | :--- |
| Web App | `mdtutor.3oe.de` | 5173 (Dev) / 80 (Prod) |
| API Server | `mdtutor.3oe.de/api` | 3101 |
| Achievement Server | `mdtutor.3oe.de/api/v1/actions` | 3102 |
| SSO Server | `sso.mdtutor.3oe.de` | 3103 |

## Deployment & Start
Um das Deployment zu starten, wurde ein Hilfsskript erstellt: `bin/demo-start`.

### Voraussetzungen
1. **Umgebungsvariablen**: Eine `docker.env` Datei muss im Root-Verzeichnis existieren. Das Skript prüft dies und gibt bei Fehlern eine Vorlage aus.
2. **Local DNS**: Für lokale Tests müssen die Domains in der `/etc/hosts` (oder `C:\Windows\System32\drivers\etc\hosts`) eingetragen sein:
   ```text
   127.0.0.1  mdtutor.3oe.de
   127.0.0.1  sso.mdtutor.3oe.de
   ```

### Befehle
- **Starten**: `./bin/demo-start` (Baut Images, führt Setup aus, startet Services)
- **Stoppen**: `docker-compose down`
- **Zurücksetzen**: `docker-compose down -v` (Löscht auch die Datenbank-Volumes)

