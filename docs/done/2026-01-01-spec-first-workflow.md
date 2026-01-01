# Implementation Plan: Spec-First Development Workflow

Established a rigorous, test-driven development environment by centralizing database storage and mandating pre-verified API specifications before frontend implementation.

## 1. Centralized Storage Architecture

Moved all SQLite databases to a central `db/` directory in the monorepo root to improve manageability and cleanup package-specific `storage/` folders.

### New Directory Structure
```
db/
  achievements/
    development.sqlite3
    test.sqlite3
  sso/
    development.sqlite3
    test.sqlite3
```

### Configuration Changes
- Updated `packages/backend-ruby/config/database.yml` to point to `../../db/achievements/`.
- Updated `packages/sso-server/config/database.yml` to point to `../../db/sso/`.

## 2. Updated Project Rules (`PROJECT_RULES.md`)

Formalized strict workflow requirements:

### **API-First / Spec-First Requirement**
- **Mandatory**: No frontend implementation (Svelte components, stores, or logic) may begin until the required API endpoints are:
  1. **Spezifiziert**: Documented in the implementation plan (request/response format).
  2. **Getestet**: Fully implemented and verified by RSpec `request specs` in the backend.

### **Discourse-Inspired Testing**
- **Request Specs**: Every API endpoint must have a spec verifying success, error cases, and JSON schema.
- **Environment Separation**: Development and Test environments use separate databases.

## 3. Implementation Steps

- [x] Create root `db/` structure.
- [x] Move existing databases and cleanup `storage/` folders.
- [x] Update `database.yml` in both Rails packages.
- [x] Update `PROJECT_RULES.md` with API-First mandates.
- [x] Add template request specs for both SSO and Achievements server.
- [x] Update `.gitignore` files.

