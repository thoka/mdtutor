# Implementation Plan: README Update 🔹Azee1

Dieses Dokument beschreibt die Überarbeitung der Haupt-README.md, um den aktuellen Stand des Projekts (Architektur, Workflows, Features) korrekt abzubilden.

## Ziele
- **Aktualisierung der Architektur**: Ecosystems, Layering und GIDs hervorheben.
- **Workflow-Anpassung**: `npm run sync:pathways` als primäres Setup-Tool etablieren.
- **Status-Update**: Achievements, SSO Kiosk Mode und Backend-Integration als "implemented" oder "stable" markieren.
- **Alice-Case**: Die Synchronisation des User-States erwähnen.
- **Struktur-Bereinigung**: Veraltete Verweise auf `test/snapshots` (für Content) entfernen/korrigieren.

## Änderungen in README.md

### 1. Project Goal & Status
- Achievements & Badges: ✅
- Learning Paths: ✅
- SSO Server & Kiosk Mode: ✅
- Help Desk: 🚧

### 2. Project Structure
- `content/`: Ecosystems & Layers hinzufügen.
- `packages/backend-ruby` & `packages/sso-server`: Als Kernkomponenten beschreiben.

### 3. Setup & Workflow
- `npm install` -> `npm run sync:pathways` -> `npm run seed`.
- Erwähnung der `PROJECT_RULES.md` als Source of Truth für Agenten/Entwickler.

### 4. Features
- **SSO**: Kiosk-Modus mit PIN-Schutz und Super-Mode.
- **Achievements**: Aggregierter State, Alice-Case (Device Sync).
- **Parser**: RPL-Markdown Extensions, GID Extraction.

## Zeitplan
1. Entwurf der neuen README (basierend auf docs und PROJECT_RULES).
2. Abgleich mit bestehenden bin/ Skripten.
3. Review & Commit.

