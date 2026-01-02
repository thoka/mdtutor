# MDTutor Deployment Guide

This guide explains how to deploy the MDTutor monorepo using Docker and Traefik. The setup is designed for quick test deployments and demos.

## Architecture
The deployment uses **Traefik** as a reverse proxy to route traffic to the following services:
- **Web App**: `http://${DOMAIN}:${TRAEFIK_PORT}`
- **API Server**: `http://${DOMAIN}:${TRAEFIK_PORT}/api`
- **Achievement Server**: `http://${DOMAIN}:${TRAEFIK_PORT}/api/v1/actions`
- **SSO Server**: `http://sso.${DOMAIN}:${TRAEFIK_PORT}`

## Prerequisites
- Docker & Docker Compose
- Git
- Access to the `feature/deployment-docker` branch (until merged to main)

## Fresh Deployment (Step-by-Step)

### 1. Clone the Repository
```bash
git clone <repository-url> mdtutor
cd mdtutor
git checkout feature/deployment-docker
```

### 2. Configure Environment
The deployment requires a `docker.env` file. You can create it from the template:
```bash
cp docker.env.example docker.env
```

Open `docker.env` and ensure the following variables are set:
- `DOMAIN`: Your target domain (e.g., `mdtutor.3oe.de` or `mdtutor.test` for local testing).
- `SSO_JWT_SECRET`: A secure random string for JWT token signing.
- `ACHIEVEMENTS_MASTER_KEY`: Found in `packages/backend-ruby/config/master.key`.
- `SSO_MASTER_KEY`: Found in `packages/sso-server/config/master.key`.

### 3. Local Testing (Optional)
If you are testing on your local machine, add the domains to your `/etc/hosts` file:
```text
127.0.0.1  mdtutor.3oe.de
127.0.0.1  sso.mdtutor.3oe.de
```

### 4. Start the Demo
Run the automated launcher:
```bash
./bin/demo-start
```

**What happens automatically:**
- **Content Initialization**: The `setup` service clones the RPL reference tutorials into `content/`.
- **Database Seeding**: Both Rails backends (SSO and Achievements) initialize their SQLite databases and load test data (e.g., the "Alice" scenario).
- **Service Orchestration**: All services are built and started in the background.

## Management Commands

### View Logs
```bash
docker-compose logs -f
```

### Stop Services
```bash
docker-compose down
```

### Reset Everything (Delete Databases & Content)
```bash
docker-compose down -v
rm -rf content/RPL/layers/official/projects/*
```

## Adding Custom Content Layers
To add your own tutorials or overlays during deployment, edit `docker.env` and add the `ADDITIONAL_OVERLAYS` variable:
```env
ADDITIONAL_OVERLAYS=ecosystem:layer:https://github.com/your-org/your-repo.git
```
The setup script will automatically clone these during the next start.

