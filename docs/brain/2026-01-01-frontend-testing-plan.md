# Implementation Plan: Frontend Testing (Vitest & Playwright)

Establish a dual-layer testing strategy for the Svelte 5 frontend: Unit/Component tests with Vitest and End-to-End (E2E) tests with Playwright.

## 1. Testing Strategy

- **Layer 1: Unit & Component Tests (Vitest + Testing Library)**
    - Target: Shared logic (`lib/`), Svelte stores, and individual components.
    - Focus: Fast feedback, edge cases in progress calculation, i18n logic.
- **Layer 2: End-to-End Tests (Playwright)**
    - Target: Full user flows (Login -> Pathway -> Project -> Dashboard).
    - Focus: Integration between Web App, SSO, and Achievements server.
    - Data: Runs against the `test` environment initialized by `npm run seed:test`.

## 2. Setup Vitest (`apps/web`)

### Actions:
- Install dependencies: `vitest`, `@testing-library/svelte`, `jsdom`, `@vitest/browser`.
- Create `vitest.config.ts`.
- Add `npm run test:unit` script.
- **First Spec**: `src/lib/progress.test.ts` to verify the complex "Alice" progress logic.

## 3. Setup Playwright (`apps/web`)

### Actions:
- Install dependencies: `@playwright/test`.
- Create `playwright.config.ts`.
- Add `npm run test:e2e` script.
- **E2E Scenario**: 
    1. Reset state: `npm run seed:test`.
    2. Login via SSO as student_a.
    3. Verify progress display in Pathway.
    4. Complete a task and verify dashboard update.

## 4. Integration into Workflow

Update `package.json` at root to include:
- `npm run test:frontend`: Runs both unit and e2e tests.

Update `PROJECT_RULES.md`:
- "Frontend logic (stores, progress calculation) must have unit tests."
- "Critical user flows must be covered by Playwright specs."

## 5. Verification
- All tests green in `npm run test:frontend`.
- Alice scenario verified automatically.

