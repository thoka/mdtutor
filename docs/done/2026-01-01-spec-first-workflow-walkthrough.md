# Walkthrough: Spec-First Development Workflow

## Summary
Successfully refactored the database storage architecture and established a strict test-driven development workflow.

## Changes

### 1. Storage Centralization
- Created `db/achievements/` and `db/sso/` in the monorepo root.
- Moved `development.sqlite3` and `test.sqlite3` from packages to root.
- Deleted `packages/backend-ruby/storage` and `packages/sso-server/storage`.
- Updated `config/database.yml` in both packages to use relative paths (`../../db/...`).

### 2. Workflow Enforcement
- Updated `PROJECT_RULES.md` to require:
    - API specification before frontend work.
    - Verified backend tests (RSpec) for all new API endpoints.
    - Use of `RAILS_ENV=test` for isolated testing.

### 3. RSpec Templates
- Added `packages/sso-server/spec/requests/dashboard_spec.rb`.
- Added `GET /api/v1/actions/latest` test to `packages/backend-ruby/spec/requests/api/v1/actions_spec.rb`.

## Verification Results
- `packages/backend-ruby`: `RAILS_ENV=test bundle exec rspec` -> 6 examples, 0 failures.
- `packages/sso-server`: `RAILS_ENV=test bundle exec rspec` -> 14 examples, 0 failures.

