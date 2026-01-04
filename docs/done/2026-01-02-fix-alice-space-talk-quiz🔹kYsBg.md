# Implementation Plan - Alice space-talk quiz fix 🔹kYsBg

Alice's `space-talk` project progress is seeded in `db/seeds.rb` but lacks the quiz actions. This task adds the missing quiz entries to ensure the project is fully completed according to the API state.

## Proposed Changes

### 1. API Tests (`packages/backend-ruby/spec/requests/api/v1/alice_progress_spec.rb`)
- Add a test case for `space-talk` progress.
- Verify that `quiz_success` exists for step 6 (the quiz step).
- Verify that the project is 100% completed in the aggregated state.

### 2. Backend Seeds (`packages/backend-ruby/db/seeds.rb`)
- Update Alice's `space-talk` seeding.
- Add `quiz_attempt` and `quiz_success` actions for step 6.
- The quiz `quiz1` has 3 questions, so we should add success actions for all of them if we want to be thorough, although the current backend only tracks success per step.
  - *Correction*: The backend `user_state` logic tracks `quizzes` as an array of step indices: `project_state[:quizzes] << step if step && !project_state[:quizzes].include?(step)`.
  - So one `quiz_success` for step 6 is enough for the `quizzes` array, but we should probably add `quiz_attempt` for each question for completeness if the frontend uses them.

### 3. E2E Test (`apps/web/e2e/alice-scenario.spec.ts`)
- Add a test case to verify Alice's completion of `space-talk` in the pathway view.
- Navigate to the pathway page.
- Verify the project card for "Weltraumgespräch" shows completion ("Fertig :-)").

## Verification Plan

### Automated Tests
- Run `RAILS_ENV=test bundle exec rspec spec/requests/api/v1/alice_progress_spec.rb` in `packages/backend-ruby`.
- Run `npm run seed:test` and check the Alice dashboard in the web app (manual verification).

### Manual Verification
- Check the `/api/v1/actions/user/student_a/state` endpoint to see if `space-talk` has step 6 in the `quizzes` array.

