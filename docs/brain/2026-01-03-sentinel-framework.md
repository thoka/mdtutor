# Implementation Plan - Sentinel Test Framework

A semantic, AI-native test framework for system integrity and environment validation.

## Phase 1: Tests First
- **Self-Test**: Sentinel should be able to test its own DSL and reporting logic.
- **Verification**: Run the first "Sanity Checks" to verify the environment.

## Phase 2: Core Implementation (Ruby)
- `Sentinel` module: DSL for defining suites and checks.
- `Result` object: Semantic data structure (internal state).
- `Formatters`:
    - `AgentFormatter`: Markdown-optimized for AI agents.
    - `HumanFormatter`: Colorized console output for developers.
    - `JsonFormatter`: Pure semantic data for tool integration.

## Phase 3: Integration
- Create `test/0-setup/environment.sentinel.rb`
- Update root `package.json` to include `pnpm run sentinel`.

## Phase 4: Migration
- Port `test/structure-compliance.test.js` logic to Sentinel (optional/future).

## Architecture
- **DSL Example**:
  ```ruby
  Sentinel.suite "Basic Setup" do
    check "Env File" do
      target ".env"
      condition { File.exist? target }
      fix "cp .env.example .env"
    end
  end
  ```

