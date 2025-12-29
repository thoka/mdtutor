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

### Offene Probleme

1. ❌ **Block-Delimiter**: `--- collapse ---` Blöcke werden nicht korrekt zu Panel-Struktur konvertiert
   - Aktuell: `<h2>--- collapse ---</h2>`
   - Erwartet: `<div class="c-project-panel c-project-panel--ingredient">...`
   - Problem: Frontmatter innerhalb von `collapse`-Blöcken wird nicht erkannt
   - Beispiel:
     ```markdown
     --- collapse ---
     ---
     title: What you should already know
     ---
     Content...
     --- /collapse ---
     ```

2. ❌ **Fehlende Felder** (können ignoriert werden, da nicht aus Markdown geparst):
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

3. ❌ **HTML-Inhalte**: Unterschiede in den HTML-Inhalten der Steps (wahrscheinlich aufgrund von Problem #1)

## Nächste Schritte

1. ✅ Block-Delimiter-Parser erweitert, um Frontmatter in `collapse`-Blöcken zu erkennen
2. ✅ Korrekte Panel-Struktur wird generiert (`c-project-panel`, `c-project-panel--ingredient`, etc.)
3. Tests mit `compare-json.js` durchführen, um alle Unterschiede zu identifizieren
4. Schrittweise alle Unterschiede beheben

