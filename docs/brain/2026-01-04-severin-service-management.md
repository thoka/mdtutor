# Implementation Plan: Severin Service Management (Systemd-Light)

Severin currently lacks the ability to manage process states. This plan introduces a robust, declarative service management layer inspired by `systemd` and `aasm`.

## Status: in-progress

## Goals
- [ ] Define services in YAML (`severin/services/*.yml`).
- [ ] Manage states (`stopped`, `starting`, `running`, `error`) with a custom state machine.
- [ ] Implement health probes (Port, HTTP).
- [ ] Support service dependencies (`depends_on`).
- [ ] Persistent state in `severin/state/services.yml` with file locking.
- [ ] CLI commands: `sv start`, `sv stop`, `sv status`, `sv logs`.
- [ ] DSL integration: `check "API" { requires :api }`.

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
- [ ] Create `severin/engine/spec/` for engine-specific tests.
- [ ] Implement `Severin::Service` and its state machine logic.

### Phase 2: Persistence & Manager
- [ ] Implement `Severin::ServiceManager` with file locking.
- [ ] Test concurrent writes to the state file.

### Phase 3: Process & Probes
- [ ] Implement process spawning and PID tracking.
- [ ] Implement Health Probes (TCP/HTTP).
- [ ] Add watchdog logic (`refresh!`).

### Phase 4: CLI & Integration
- [ ] Add `start`, `stop`, `status` to `Severin::CLI`.
- [ ] Update `Severin::CheckContext` to support `requires`.

## Verification
- `rspec severin/engine/spec`
- `sv status` shows live service states.
- `sv start api` starts the server and moves it to `running` once health check passes.

