# Implementation Plan: Test Data Infrastructure with YAML Integration 🔹eH86E

Establish a data generation strategy that combines the existing YAML-based user configuration with FactoryBot for specs and Rails seeds for development scenarios.

## 1. Data Strategy Overview

- **Source of Truth**: `packages/sso-server/config/users.yaml` defines all static test users (Alice, Bob, Mentor).
- **Factories (`factory_bot_rails`)**: Used in **Specs** to create transient, isolated data. Factories will allow overriding `user_id` to match YAML users when needed.
- **Seeds (`db/seeds.rb`)**: Used in **Development** to set up "The Alice Scenario" (completed projects, presence) using IDs from the YAML.

## 2. Implementation: SSO Server (`packages/sso-server`)

### Automated Tests (Specs)
- Add `factory_bot_rails` gem.
- Define `RoomFactory` and `PresenceFactory`.
- Update `Presence` and `UserLoader` specs to use these factories.

### Development Data (Seeds)
- `db/seeds.rb` will:
    1. Create default `Room` ("Main Hall").
    2. Ensure `Presence` records exist for all users in `users.yaml`.
    3. Create some sample `Visit` history.

## 3. Implementation: Achievements Backend (`packages/backend-ruby`)

### Automated Tests (Specs)
- Add `factory_bot_rails` gem.
- Define `ActionFactory`.
- Update `ActionsController` and `TrackActionService` specs to use the factory.

### Development Data (Seeds)
- `db/seeds.rb` will set up the **"Alice Activity Case"**:
    - Use `user_id: "student_a"` (Alice from YAML).
    - Seed `project_open`, `step_complete`, and `task_check` actions to achieve:
        - `space-talk`: 100% completion.
        - `catch-the-bus`: 50% completion.

## 4. Workflow Integration

### Root-level Utility
- Create `bin/seed` script:
  ```bash
  cd packages/sso-server && bin/rails db:seed
  cd ../backend-ruby && bin/rails db:seed
  ```

### Rules Update (`PROJECT_RULES.md`)
- Add requirement: "Use FactoryBot for spec data. Maintain the link to YAML users in development seeds."

## 5. Verification
- Running `bin/seed` followed by viewing the Dashboard should show:
    - Alice (student_a) as "Present".
    - Alice's latest activity ("Task completed in Space Talk").
    - Alice's progress in the Svelte Web App showing 100% / 50%.

