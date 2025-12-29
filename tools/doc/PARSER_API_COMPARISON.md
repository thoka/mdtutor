# Parser API Comparison

## Tool: `compare-json.js`

Ein generisches Tool zum Vergleich von JSON-Strukturen, speziell für den Vergleich zwischen der originalen RPL API und unserem Parser-Output.

### Verwendung

```bash
# Basis-Vergleich (aus tools/ Verzeichnis)
node compare-json.js api-file.json parsed-file.json

# Mit HTML-Normalisierung (für content-Felder)
node compare-json.js --api api-file.json --parsed parsed-file.json --normalize-html

# Bestimmte Pfade ignorieren
node compare-json.js file1.json file2.json --ignore "data.id" --ignore "data.attributes.masterLastCommit"

# Maximale Anzahl Unterschiede anzeigen
node compare-json.js file1.json file2.json --max-diffs 100
```

### Optionen

- `--normalize-html`: Normalisiert HTML-Inhalte vor dem Vergleich (entfernt Whitespace-Unterschiede)
- `--ignore <path>`: Ignoriert spezifische Pfade (kann mehrfach verwendet werden)
- `--max-diffs <n>`: Maximale Anzahl anzuzeigender Unterschiede (Standard: 50)

## Aktuelle Unterschiede

Siehe `docs/brain/2025-12-29-parser-api-differences.md` für eine detaillierte Auflistung der offenen Probleme und Unterschiede zwischen der originalen RPL API und unserem Parser-Output.

### Behobene Probleme

1. ✅ **Struktur**: `version`, `listed`, `copyedit`, `lastTested` sind jetzt in `data.attributes.content` statt `data.attributes`
2. ✅ **Tool erstellt**: Generisches JSON-Vergleichstool ist verfügbar
3. ✅ **Block-Delimiter**: `--- collapse ---` Blöcke werden jetzt korrekt zu Panel-Struktur konvertiert
4. ✅ **YAML Duplikate**: Doppelte `completion:` Schlüssel in meta.yml werden korrekt behandelt (letzter überschreibt ersten, wie in Standard-YAML)

