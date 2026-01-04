# Brain: CLI Severity & Interactive Commit 🔹VwX9Z
Status: in-progress

Dieses Dokument beschreibt die Einführung eines Severity-Systems in der Severin-Engine und die Implementierung eines interaktiven Commit-Schutzes.

## Kontext
Um zu verhindern, dass unvollständige Arbeiten (z.B. offene Brain-Tasks) versehentlich committet werden, ohne den Workflow für "Meta-Änderungen" (Regeln, Engine) zu blockieren, wurde ein zweistufiges Validierungssystem eingeführt.

## Anforderungen
- [x] Einführung von `severity :error` (blockierend) und `severity :warning` (hinweisend). 🔹engine-core
- [x] CLI muss bei Warnungen mit Exit-Code 2 abbrechen. 🔹cli-safety
- [x] Einführung eines `--force` Flags zum Übersteuern von Warnungen. 🔹cli-force
- [x] Agent-spezifische Anweisungen bei Warnungen ausgeben. 🔹ai-ux
- [x] Bestehende Regeln (Brain Tasks, Status) auf `:warning` herabstufen. 🔹rules-adjust

## Umsetzung
- `severin/engine/lib/severin.rb`: `CheckContext` und `Result` erweitert.
- `severin/engine/lib/severin/cli.rb`: Logik für `--force` und Exit-Codes implementiert.
- `severin/rules/1-process/workflow.rb`: Severities für Brain-Dokumente gesetzt.

## Status
- [x] Engine-Änderungen implementiert.
- [x] CLI-Logik getestet.
- [x] Regeln angepasst.
- [ ] Finaler Commit im neuen Branch.

