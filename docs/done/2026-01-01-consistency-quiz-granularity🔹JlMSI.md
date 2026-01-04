# Walkthrough: Achievement Consistency & Quiz Granularity 🔹JlMSI

This document details the implementation of consistency checks and improved quiz tracking.

## 1. Achievement Consistency Check
**Goal**: Verify that actions stored in the database are consistent with the JSONL master log.
**Implementation**:
- Created `ConsistencyCheckService` in the Ruby backend.
- It compares counts between the `actions` table and `log/actions.{environment}.jsonl`.
- Created a CLI utility: `packages/backend-ruby/bin/check_consistency`.
- **Finding**: Discrepancies are currently expected after running seeds, as `db/seeds.rb` clears the database but the JSONL log is append-only.

## 2. Quiz Granularity
**Requirement**: Track quiz progress at the individual question level.
**Implementation**:
- Updated `StepContent.svelte` to include `question_index` in `quiz_attempt` and `quiz_success` metadata.
- Added scopes to the `Action` model in Ruby to allow filtering by question index:
  ```ruby
  Action.where(user_id: 'student_a').quizzes.for_question(2)
  ```
- Verified via `bin/check_consistency`.

## 3. Quiz Count Verification (Catch the Bus)
**Requirement**: Verify that `catch-the-bus` step 7 has 3 quiz questions.
**Implementation**:
- Added a unit test in `apps/web/src/lib/progress.test.ts`.
- **Test**: `correctly identifies 3 quiz questions for catch-the-bus step 7`.
- **Status**: Passed.

## Summary of New Tools
- **CLI**: `packages/backend-ruby/bin/check_consistency`
- **Ruby Scopes**: `Action.quizzes`, `Action.for_question(index)`
- **Frontend Tracking**: Now includes `question_index` for all quiz actions.

