# MDTutor Test Suite (Sentinel)

Dieses Verzeichnis enthält die Integritätstests für das MDTutor-Projekt. Wir nutzen das **Sentinel-Framework** (Ruby-basiert), um sicherzustellen, dass die Umgebung, die Daten und die Services korrekt konfiguriert sind.

## Test-Kaskade
Die Tests sind nummeriert und werden in dieser Reihenfolge ausgeführt. Ein Fehlschlag in einer frühen Ebene bricht die Kette ab (Fail-Fast).

0. **`0-process/`**: Git-Regeln, Branch-Check, Vorhandensein von Planungs-Dokumenten (Brain-Docs).
1. **`1-setup/`**: Grundvoraussetzungen (Dateien, Tools, Abhängigkeiten).
2. **`2-data/`**: Content-Integrität (GIDs, Layer-Struktur, Markdown-Validierung).
3. **`3-services/`**: Verfügbarkeit der Backends (Ports, API-Response, DB-Connections).
4. **`4-contracts/`**: Schema-Validierung (Halten sich API und Frontend an die Specs?).
5. **`5-e2e/`**: User Flow Tests (Playwright).

## Nutzung
Führe die Tests aus dem Root-Verzeichnis aus:

### Für Menschen (Übersichtliche Konsole)
```bash
pnpm run test:sentinel
```

### Für AI-Agenten (Markdown & Actionable Fixes)
```bash
pnpm run test:sentinel:agent
```

## Entwicklung
Neue Tests werden als Ruby-Dateien in den entsprechenden Unterordnern angelegt.

**Beispiel:**
```ruby
require_relative '../../tools/sentinel/lib/sentinel'

Sentinel.define_suite "Meine Suite" do
  check "Mein Check" do
    target "pfad/zur/datei"
    condition { File.exist? target }
    on_fail "Erklärung warum es fehlt"
    fix "befehl --zum --fixen"
  end
end
```

