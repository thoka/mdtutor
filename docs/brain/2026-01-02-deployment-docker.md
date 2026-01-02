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

## Implementation Plan
1. Create Dockerfiles for `api-server` and `web`.
2. Configure `docker-compose.yml` with Traefik labels.
3. Use shared volumes for SQLite databases in `db/`.

