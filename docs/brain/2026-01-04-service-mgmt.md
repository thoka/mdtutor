# Implementation Plan: Severin Service Management (Systemd-Light)

Severin currently lacks the ability to manage process states. This plan introduces a robust, declarative service management layer inspired by `systemd` and `aasm`.

Status: ship-it

## Goals
- [x] Define services in YAML (`severin/services/*.yml`).
- [x] Manage states (`stopped`, `starting`, `running`, `error`) with a custom state machine.
- [x] Implement health probes (Port, HTTP).
- [x] Support service dependencies (`depends_on`).
- [x] Persistent state in `severin/state/services.yml` with file locking.
- [x] CLI commands: `sv start`, `sv stop`, `sv status`, `sv logs`.
- [x] DSL integration: `check "API" { requires :api }`.

## Architecture

### 1. State Machine (Core Engine)
- Zero-dependency implementation of states and transitions.
- Support for `after_transition` callbacks.

### 2. Service Model
- Properties: `name`, `command`, `port`, `pid`, `state`, `last_error`.
- Probes: Methods to verify if the process is alive and the port/URL is responsive.

### 3. Persistence (The Store)
- File: `severin/state/services.yml`.
- Format: YAML for human readability.
- Safety: `File.flock(File::LOCK_EX)` for concurrent access.

### 4. Process Orchestration
- `spawn` for background execution.
- Log redirection to `severin/log/[service].log`.
- `Process.detach` to avoid zombies.

## Roadmap

### Phase 1: Test Setup & Model
- [x] Create `severin/engine/spec/` for engine-specific tests.
- [x] Implement `Severin::Service` and its state machine logic.

### Phase 2: Persistence & Manager
- [x] Implement `Severin::ServiceManager` with file locking.
- [x] Test concurrent writes to the state file.

### Phase 3: Process & Probes
- [x] Implement process spawning and PID tracking.
- [x] Implement Health Probes (TCP/HTTP).
- [x] Add watchdog logic (`refresh!`).

### Phase 4: CLI & Integration
- [x] Add `start`, `stop`, `status` to `Severin::CLI`.
- [x] Update `Severin::CheckContext` to support `requires`.

## Verification
- `rspec severin/engine/spec`
- `sv status` shows live service states.
- `sv start api` starts the server and moves it to `running` once health check passes.

