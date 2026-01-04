# Brain: Unified Testing & State Management (RSpec Integration)

Status: in-progress
Date: 2026-01-04
Author: AI Assistant
Context: [2026-01-04-service-mgmt.md](2026-01-04-service-mgmt.md)

## Problem Statement
We need a lightweight but powerful testing structure for MDTutor. While Severin already handles high-level rules and basic checks, it lacks the depth of a full testing framework like RSpec for complex logic and integration testing. We want to unify Severin's "Rules" with RSpec's "Tests" and improve environment awareness (State Management) inspired by Serverspec.

## Proposed Solution
Extend the Severin Engine to natively support RSpec as a "Check Provider". This allows us to define architectural rules that are validated by deep RSpec tests, while still benefiting from Severin's AI instruction generation and state management.

### 1. RSpec as a Check Provider
Introduce a `rspec` helper within Severin's `check` block.
- **Goal**: Run specific specs or tags and fail the Severin check if RSpec fails.
- **AI Integration**: RSpec failures are formatted for the `AgentFormatter` so the AI knows exactly what to fix.

### 2. Enhanced State Management (Serverspec-style)
Upgrade `Severin::ServiceManager` and `Service` classes.
- **Resource Checks**: Instead of just "Is the process running?", allow checks like "Is the port responding?", "Is the database reachable?".
- **Dependency Chains**: Ensure services are started in the correct order before running tests.

### 3. Unified Rule DSL
Example of how a rule will look:
```ruby
define_suite "API Integrity 🔹57DXq" do
  rule "All API endpoints must have matching RSpec tests."
  
  check "Core API Specs" do
    requires :backend
    rspec "spec/api", tags: :integrity
    on_fail "API integrity check failed. Check RSpec output for details."
  end
end
```

## Implementation Plan

- [ ] **Phase 1: Engine Extension**
    - [ ] Add `rspec` helper to `Severin::CheckContext`.
    - [ ] Update `Severin::ServiceManager` to support simple resource probes (TCP ping).
- [ ] **Phase 2: Project Integration**
    - [ ] Initialize RSpec in the project (if not already present).
    - [ ] Create `spec/spec_helper.rb` with Severin integrations.
- [ ] **Phase 3: Migration**
    - [ ] Convert one existing rule to use the new RSpec-backed check.

## Success Criteria
- `sv check` can trigger RSpec tests.
- Services are automatically checked/started before tests run.
- The AI receives clear, actionable fix instructions on test failure.

