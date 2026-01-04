# Brain: Rules Hotfix (Flat Structure & ID Policy) 🔹7KXKw
Status: in-progress

Dieses Dokument beschreibt die Korrekturen an den Severin-Regeln für Brain-Dokumente und die Einführung einer strikten ID-Policy.

## Kontext
Es wurden strukturelle Mängel bei der Erkennung von Unterordnern und bei der Vergabe von Brain-IDs festgestellt.

## Anforderungen
- [x] `🔹BRN-FLAT` von Warning auf Error hochstufen. 🔹rules-severity
- [x] Erkennung von Unterordnern via `Dir.children` statt `Dir.glob` (robuster). 🔹rules-fix
- [x] Agenten-Pflicht: Brain-Dokumente nur via MCP generieren. 🔹mcp-policy
- [x] Verbot von "sprechenden" IDs (z.B. 🔹Rules). 🔹id-policy

## Umsetzung
- `severin/rules/1-process/workflow.rb`: Regeln angepasst und neue Warnung `🔹BRN-DASH` hinzugefügt.
- `severin/rules/1-skills/task_manager.rb`: MCP-Anweisung für Agenten hinzugefügt.

## Status
- [x] Dokumentation auf neue ID 🔹7KXKw umgestellt.
- [ ] Skills & Regeln finalisiert.
