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

## Aktuelle Unterschiede (cats-vs-dogs)

### Behobene Probleme

1. ✅ **Struktur**: `version`, `listed`, `copyedit`, `lastTested` sind jetzt in `data.attributes.content` statt `data.attributes`
2. ✅ **Tool erstellt**: Generisches JSON-Vergleichstool ist verfügbar
3. ✅ **Block-Delimiter**: `--- collapse ---` Blöcke werden jetzt korrekt zu Panel-Struktur konvertiert

### Offene Probleme

1. ❌ **Fehlende Felder** (können ignoriert werden, da nicht aus Markdown geparst):
   - `data.id`
   - `data.attributes.id`
   - `data.attributes.repositoryName`
   - `data.attributes.masterLastCommit`
   - `data.attributes.archived`
   - `data.attributes.unskippable`
   - `data.attributes.template`
   - `data.attributes.pathwayStep`
   - `data.attributes.editorStarterProject`
   - `data.attributes.directToEditor`
   - `data.attributes.locale`
   - `data.attributes.recommendedProjects`
   - `data.attributes.nextPathway`
   - `data.attributes.recommendedPathways`
   - `data.attributes.nextProject`
   - `data.attributes.nextPathwayProject`
   - `data.relationships`
   - `included` (Pathways)

2. ❌ **HTML-Inhalte**: Unterschiede in den HTML-Inhalten der Steps (weitere Analyse erforderlich)

## Nächste Schritte

1. Tests mit `compare-json.js` durchführen, um alle verbleibenden Unterschiede zu identifizieren
2. Schrittweise alle Unterschiede beheben
3. HTML-Inhalte analysieren und Unterschiede beheben

