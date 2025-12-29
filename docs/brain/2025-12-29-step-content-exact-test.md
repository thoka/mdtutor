# Step Content-Attribute Exaktvergleichstest mit vollständiger HTML-Struktur-Analyse

**Datum:** 2025-12-29  
**Status:** Implementiert - Iteration läuft

## Ziel
Test, der alle content-attribute der **Steps** (`data.attributes.content.steps[]`) im Parser-Output gegen die gecachten Original-API-Dateien (`api-project-*.json`) auf exakte Übereinstimmung prüft. **Besonderer Fokus:** Vollständige HTML-Struktur-Analyse für `steps[].content`, die beide HTML-Strukturen und deren Unterschiede enthält.

## Fokus: Step-Attribute
Der Test konzentriert sich auf die Attribute jedes Steps in `data.attributes.content.steps[]`:
- `title` - Step-Titel
- `content` - HTML-Content des Steps (**vollständige Struktur-Analyse erforderlich**)
- `position` - Position im Array
- `quiz` - Boolean
- `challenge` - Boolean
- `completion` - Array
- `ingredients` - Array
- `knowledgeQuiz` - Object oder String

## Vollständige HTML-Struktur-Analyse

### Strukturextraktion
- Parse beide HTML-Strings mit `node-html-parser`
- Extrahiere hierarchische Struktur für beide Versionen:
  - Vollständiger Baum: Jedes Element mit Tag, Klassen, ID, Attributen, Tiefe, Pfad
  - Text-Inhalte: Text-Knoten mit Position im Baum
  - Element-Hierarchie: Parent-Child-Beziehungen

### Strukturvergleich
- Vergleiche beide Strukturen Element für Element
- Identifiziere fehlende/extra/geänderte Elemente mit vollständiger Struktur-Info

### Diff-Format
Das Diff-Format enthält:
- `expectedStructure` und `actualStructure`: Vollständige hierarchische Struktur beider HTML-Versionen
- `structuralDifferences`: Alle Unterschiede mit vollständiger Struktur-Info
- `textContentDifferences`: Text-Inhalts-Unterschiede
- `lineBasedDiff`: Unified-Diff-Format
- `pipelineErrorHints`: Spezifische Hinweise auf Pipeline-Fehler

## Implementierung

**Datei:** `packages/parser/test/step-content-exact.test.js`

**Funktionen:**
- `extractHtmlStructure(html)` - Extrahiert vollständige hierarchische HTML-Struktur
- `compareHtmlStructures(expectedStructure, actualStructure)` - Vergleicht beide Strukturen
- `compareHtmlContent(expectedHtml, actualHtml, options)` - Haupt-Vergleichsfunktion

## Test-Ablauf

1. Finde alle Projekte in `test/snapshots/` mit `repo/` Verzeichnis
2. Für jedes Projekt und jede verfügbare Sprache:
   - Parse Projekt mit `parseProject(repo/{lang}/)`
   - Lade Original API: `api-project-{lang}.json`
   - Extrahiere `data.attributes.content.steps[]` aus beiden
   - Für jeden Step: Vollständige HTML-Struktur-Analyse für `content` Feld
3. Ausgabe: Detaillierte Abweichungen mit vollständiger Struktur-Analyse

## Iterations-Status

**Ursprünglich:** 184 Unterschiede  
**Aktuell:** 122 Unterschiede  
**Behoben:** 62 Unterschiede (34% Verbesserung)

### Durchgeführte Fixes

1. ✅ **knowledgeQuiz**: `null` → `{}` (behebt 62 Unterschiede)
2. ✅ **Heading IDs**: Rehype-Plugin `rehype-heading-ids.js` hinzugefügt
3. ✅ **Panel-Struktur**: Verbesserte Behandlung von collapse-Blocks ohne Frontmatter
4. ✅ **Test-Fix**: HTML-Struktur-Extraktion korrigiert für node-html-parser

### Verbleibende Probleme

- Panel-Struktur: Frontmatter wird nicht immer korrekt erkannt
- Strukturelle HTML-Unterschiede (198, 87, 64 Unterschiede pro Step)
- 1 raw block delimiter Problem
- ingredients Array-Mismatches (29 Fälle)

### Nächste Schritte

- Panel-Struktur vollständig korrigieren (Frontmatter-Erkennung)
- Block-Delimiter-Probleme beheben
- Ingredients-Extraktion implementieren

