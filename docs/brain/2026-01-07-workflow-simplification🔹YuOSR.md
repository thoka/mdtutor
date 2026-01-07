# Workflow Vereinfachung: Commits & Branches 🔹YuOSR

Status: in-progress

Dieses Dokument beschreibt die Entschlackung des Workflows durch Vereinfachung der Commit-Action und den Verzicht auf kurzlebige Feature-Branches zugunsten eines permanenten `dev`-Branches.

## Ziele
- [x] RSpec-Tests für neue synchronisierte Commit-Action (TDD)
- [x] Implementierung der neuen `sv commit` Action (Synchronität, tmp-Cleanup, Chat-Referenz)
- [x] Entfernen der veralteten Actions `commit-engine` und `branch`
- [x] Anpassung der Severin-Rules (Entfernen von Branch-Zwang und atomaren Commits)
- [x] Anpassung der `sv ship` Action für den Merge von dev nach main
- [x] Aktualisierung der Dokumentation (PROJECT_RULES.md)
- [ ] Finaler Projektsync und Commit

## Tasks
- [x] Engine-Bugfixes (sh, ui_info, current_options in Engine verfügbar machen)
- [x] Archivierung alter Brain-Dokumente
- [ ] Erster erfolgreicher Commit mit der neuen Infrastruktur

