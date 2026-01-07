# 🧠 Workflow-Vokabular: Sprint-Integration 🔹QZd94

Status: in-progress

Dieses Dokument definiert die technische Umsetzung der Begriffe `commit`, `merge` und `ship` im Kontext der Sprint-Branch-Logik.

## 🎯 Ziele
- Sicherung der langlebigen Branches (`main`, `dev`) vor direkten KI-Commits.
- Automatisierung der Dokumentations-Integrität (Summary, Trace).
- Synchronisation zwischen Projekt- und Engine-Repository.

## 🛠 Definitionen & Logik

### 1. `sv commit` (Quick-Save)
- **Logik**:
  - Prüfe aktuellen Branch.
  - Falls Branch `main` oder `dev`:
    - Erstelle neuen Sprint-Branch `sprint/auto-🔹ID`.
    - Übernehme (stash/pop) uncommittete Änderungen.
  - Committe in Projekt UND Engine.
  - Nutze automatische Nachricht mit RID und optionaler Kurzbeschreibung.

### 2. `sv merge` (Sprint-Abschluss)
- **Checks**:
  - Existenz von `docs/chat/{timestamp}_summary.md`.
  - Existenz eines Discourse Trace im Sprint.
- **Aktion**:
  - Finaler Commit auf Sprint-Branch.
  - Merge nach `dev`.
  - Löschen des Sprint-Branches.

### 3. `sv ship` (Release)
- **Aktion**:
  - Sammle alle Summaries seit dem letzten Ship.
  - Erstelle Release-Dokumentation.
  - Merge `dev` nach `main`.
  - Tagging der Version.

## 📋 Tasks
- [ ] Refactoring `severin/actions/commit.rb` für Sprint-Check. 🔹ACT-COMMIT
- [ ] Implementierung `severin/actions/merge.rb`. 🔹ACT-MERGE
- [ ] Erweiterung `severin/actions/ship.rb` um Aggregation. 🔹ACT-SHIP
- [ ] Test der neuen Workflow-Kette via RSpec. 🔹ACT-TEST

