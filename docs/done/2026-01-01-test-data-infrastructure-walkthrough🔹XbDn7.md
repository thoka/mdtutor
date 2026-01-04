# Walkthrough: Test Data Infrastructure 🔹XbDn7

## Summary
Established a robust test data generation strategy using FactoryBot for automated tests and Rails Seeds for development scenarios. Identity remains linked to the central `users.yaml` configuration.

## Changes

### 1. FactoryBot Integration
- Added `factory_bot_rails` to both `backend-ruby` and `sso-server`.
- Configured RSpec to include FactoryBot methods.
- Created factories:
    - `sso-server`: `room`, `presence`, `visit`.
    - `backend-ruby`: `action`.

### 2. Development Seeds
- **SSO Server**: `db/seeds.rb` now ensures a "Main Hall" exists and syncs presences for all users in `users.yaml`.
- **Achievements Backend**: `db/seeds.rb` sets up the "Alice Scenario" with specific project progress (Space Talk 100%, Catch the Bus 50%).

### 3. Tooling
- Created a root-level `bin/seed` script to synchronize seeding across both Rails applications.

### 4. Project Rules
- Updated `PROJECT_RULES.md` to mandate the use of FactoryBot for specs and maintenance of development seeds.

## Verification
- Ran `./bin/seed` successfully.
- Verified all RSpec tests pass in both packages using `RAILS_ENV=test`.
- Alice (student_a) now has reliable activity data for dashboard and progress testing.

