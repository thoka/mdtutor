# Implementation Plan: System Health & Stats API 🔹zCt9I

## Problem
E2E tests are brittle because they rely on specific backend states (Seeds, presence, GIDs) without verifying them first. If the servers run in the wrong environment (Dev instead of Test) or seeds are missing, tests fail with confusing UI errors.

## Solution
Implement a `/api/system/stats` endpoint in both Rails applications to provide a "Self-Disclosure" (Selbstauskunft).

## 1. Achievements Server (`packages/backend-ruby`)

### Endpoint: `GET /api/system/stats`
**Response:**
```json
{
  "status": "ok",
  "rails_env": "test",
  "version": "1.0.0",
  "counts": {
    "actions": 1250,
    "users": 5
  },
  "user_stats": {
    "student_a": { "actions": 77, "projects": ["RPL:PROJ:catch-the-bus", "..."] }
  },
  "consistency": {
    "db_jsonl_match": true
  }
}
```

## 2. SSO Server (`packages/sso-server`)

### Endpoint: `GET /api/system/stats`
**Response:**
```json
{
  "status": "ok",
  "rails_env": "test",
  "config": {
    "users_loaded": ["student_a", "student_b", "mentor_1"]
  },
  "stats": {
    "presences_active": 2,
    "visits_total": 45
  }
}
```

## 3. E2E Integration (`apps/web/e2e`)

### Health Check Utility
- **Standalone Check**: `node tools/check-test-data.js` runs before E2E tests to fail fast.
- **Playwright Integration**: `apps/web/e2e/utils/health.ts` provides runtime checks during test execution.

### Implementation Steps

1. **Achievements Server**:
   - Create `app/controllers/api/v1/system_controller.rb`.
   - Add route in `config/routes.rb`.
   - Implement `stats` action.

2. **SSO Server**:
   - Create `app/controllers/system_controller.rb`.
   - Add route in `config/routes.rb`.
   - Implement `stats` action (minimal Phlex or pure JSON).

3. **Frontend Tests**:
   - Add a `test.beforeAll` or global setup that calls this health check.
   - Fail fast with clear instructions (e.g., "Run npm run seed:test").

