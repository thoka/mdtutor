# Brain Document: Severin Framework Migration & Rebranding
**Datum:** 2026-01-03
**Status:** In Progress (Rebranding abgeschlossen, Reboot erforderlich)

## 🎯 Zielsetzung
Vollständige Globalisierung des ehemals "Sentinel" genannten Frameworks unter dem neuen Namen **Severin**. Trennung von Engine (global) und Regeln (lokal).

## 🏗️ Aktueller Stand (Zusammenfassung)

### 1. Rebranding (Sentinel ➔ Severin)
- Alle Referenzen im Code (Ruby Module `Sentinel` ➔ `Severin`) wurden angepasst.
- Verzeichnisse wurden umbenannt: `sentinel/` ➔ `severin/`.
- Globales Verzeichnis: `~/.sentinel` ➔ `~/.severin`.

### 2. Architektur & Engine
- **Globale Engine:** Die gesamte Logik (CLI, Git-Orchestrierung, MCP-Client) lebt nun in `~/.severin/lib/severin/`.
- **Globales Binary:** `sv` (Severin) ist das neue Haupt-Kommando.
- **Projekt-Stub:** Die Datei `severin/runner.rb` dient nur noch als Delegator zur globalen Engine.
- **MCP-Server:** Der MCP-Server wurde auf Severin rebranded und ist für parallele Sitzungen (PID-Logging) optimiert.

### 3. Orchestrierung & Features
- `sv check`: Führt Integritätstests in Stages (0-5) aus.
- `sv gen`: Synchronisiert `PROJECT_RULES.md` und `.cursorrules` mit dem Code.
- `sv commit "msg"`: Erzwingt Integrität vor dem Commit.
- `sv ship`: Vollautomatischer Shipping-Prozess von Feature-Branches nach `main`.
- **MCP-Client:** Severin kann nun andere MCPs (z.B. Svelte via `npx`) als "Skills" einbinden.

## 🚧 Nächste Schritte (nach Reboot)
1. **Verifizierung:** Testlauf von `sv check` und `sv gen` im neuen Environment.
2. **Path-Fix:** Sicherstellen, dass `~/.local/bin/sv` korrekt verlinkt ist.
3. **MCP-Check:** Prüfung, ob der Severin MCP-Server von Cursor korrekt geladen wird (Status Grün).
4. **Publishing:** GitHub Repository `thoka/severin` finalisieren und pushen.

## ⚠️ Bekannte Probleme
- Terminal-Session in Cursor war korrupt (`ENOENT`), daher war ein Neustart der IDE/Shell notwendig, um Git-Operationen abzuschließen.


