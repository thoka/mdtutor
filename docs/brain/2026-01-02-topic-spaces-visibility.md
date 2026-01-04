# Brain: Topic Spaces Visibility
Status: in-progress
# Specification: Topic Spaces & Visibility Logic (RPL Parity)

## Phase 1: Tests First

### Playwright E2E Tests (`apps/web/tests/topic-spaces.spec.ts`)
- **Initial Load**: Verify that "Themenräume" section exists and shows both "Technologien" and "Interessen".
- **Filter by Technology**: Clicking "Scratch" tile should filter the list to only show Scratch-related pathways.
- **Filter by Interest**: Clicking "Space" tag should filter the list to only show pathways with the space interest label.
- **Reset Filter**: Clicking "Alle" should show all pathways again.
- **Navigation**: Clicking a pathway card should navigate to the correct `#/de-DE/pathways/...` URL.

### Vitest Unit Tests (`apps/web/src/routes/HomeView.test.ts`)
- Test the `$derived` filter logic to ensure `filteredPathways` correctly reacts to `selectedTopic` changes.
- Verify that the data fetching from `/api/v1/:lang/topics` and `/api/v1/:lang/pathways` is handled correctly.

## Phase 2: API Specification & Implementation

### Endpoints
- `GET /api/v1/:lang/topics`: Returns the interest and technology hierarchy from `topics.yaml`.
- `GET /api/v1/:lang/pathways`: Returns pathways including `technologyTheme`, `interestLabels`, and `difficultyLevel`.

## Phase 3: Frontend Implementation (Svelte 5)
- [x] Update `HomeView.svelte` with Topic Space categories.
- [x] Implement reactive filtering using `$derived`.
- [ ] Add transitions/animations for a smoother UI.

## Phase 4: Verification
- Run `pnpm run dev:test` and execute `npx playwright test`.
- Verify with "Alice" scenario seeds.
