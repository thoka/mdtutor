# HTML-Fehler Analyse

**Datum:** 2025-12-29  
**Status:** Analyse der verbleibenden HTML-Fehler

## Zusammenfassung

Nach Implementierung der micromark-extension für Block-Delimiter gibt es noch **85 HTML-Fehler** in **30 Projekten**.

## Fehler-Statistik

### Gesamt
- **Total HTML errors:** 85
- **Projekte betroffen:** 30
- **Structural differences:** 1,841
  - **Tag mismatches:** 88
  - **Missing elements:** 745
  - **Extra elements:** 652
- **Text content differences:** 0

### Top Projekte mit Fehlern
1. `getting-started-with-minecraft-pi/de-DE`: 9 steps, 18 errors
2. `silly-eyes/de-DE`: 7 steps, 7 errors
3. `cats-vs-dogs/en`: 6 steps, 6 errors
4. `scratchpc-interactive-book/en`: 6 steps, 6 errors

## Tag-Mismatch Analyse

### Top 15 Tag-Mismatch Patterns
1. `div -> p`: 16 Fälle
2. `p -> div`: 6 Fälle
3. `h3 -> p`: 5 Fälle
4. `div -> code`: 5 Fälle
5. `br -> img`: 4 Fälle
6. `input -> strong`: 4 Fälle
7. `br -> kbd`: 3 Fälle
8. `input -> img`: 3 Fälle
9. `h3 -> div`: 3 Fälle
10. `table -> p`: 2 Fälle
11. `p -> table`: 2 Fälle
12. `a -> thead`: 2 Fälle
13. `code -> strong`: 2 Fälle
14. `span -> h3`: 2 Fälle
15. `input -> span`: 2 Fälle

### Klassen in Tag-Mismatches
- **Keine Klasse (plain elements):** 41 Fälle
- `.c-project-task`: 15 Fälle
- `.c-project-task__checkbox`: 14 Fälle
- `.c-project-task__body`: 6 Fälle
- `.block3motion`: 3 Fälle
- Panel-Klassen: 6 Fälle

## Hauptprobleme

### 1. div -> p Mismatches (16 Fälle)
- **Problem:** Erwartete `<div>` werden als `<p>` geparst
- **Häufigste Klassen:** Plain elements (keine spezifische Klasse)
- **Ursache:** Vermutlich Block-Delimiter oder andere Block-Strukturen werden als Paragraphs interpretiert

### 2. Task-Struktur Probleme
- **Missing c-project-task__body:** Noch zu analysieren
- **Task-Checkbox Mismatches:** 14 Fälle
- **Task-Body Mismatches:** 6 Fälle

### 3. Block vs. Inline Elemente
- **h3 -> p:** 5 Fälle (Überschriften werden als Paragraphs geparst)
- **div -> code:** 5 Fälle (Code-Blöcke werden falsch geparst)
- **br -> img/kbd:** 7 Fälle (Line breaks werden als andere Elemente interpretiert)

### 4. Input-Elemente
- **input -> strong/img/span:** 9 Fälle
- **Problem:** Task-Checkboxes werden manchmal falsch geparst

## Iteration 1: blockDelimiter Node Handling

**Änderung:** 
- `remark-block-delimiters.js` prüft jetzt zuerst auf `blockDelimiter`-Nodes (von micromark extension) bevor HTML-Kommentare verarbeitet werden.
- Preprocessing für Block-Delimiter entfernt (sollte Extension überlassen werden)
- Extension verbessert: Bessere Whitespace- und Newline-Behandlung

**Ergebnis:** 
- ✅ **Tag-Mismatches: 88 → 8 (-80, -91%)** - Massive Verbesserung!
- ✅ **HTML-Fehler: 85 → 61 (-24, -28%)**
- ⚠️ Extension verursacht noch Fehler: "Cannot read properties of undefined (reading 'length')"
- ⚠️ Fehler tritt nur in bestimmten Fällen auf, Extension funktioniert größtenteils
- ⚠️ Extension aktiviert, da sie die Tag-Mismatches deutlich reduziert

**Status:** Extension funktioniert größtenteils und reduziert Tag-Mismatches deutlich. Fehler muss noch behoben werden, blockiert aber nicht die Hauptfunktionalität.

## Nächste Schritte

1. **blockDelimiter-Nodes Debugging:**
   - Prüfen, ob Nodes im AST ankommen
   - Prüfen, ob Metadaten korrekt übertragen werden
   - Prüfen, ob Handler korrekt funktioniert

2. **div -> p Mismatches analysieren:**
   - Prüfen, ob Block-Delimiter korrekt erkannt werden
   - Prüfen, ob YAML-Blöcke korrekt verarbeitet werden
   - Prüfen, ob es Edge Cases gibt, wo Delimiter als Paragraphs enden

3. **Task-Struktur verbessern:**
   - Prüfen, ob `c-project-task__body` korrekt hinzugefügt wird (24 fehlende Fälle)
   - Prüfen, ob Checkbox-Struktur korrekt ist

4. **Block-Elemente vs. Paragraphs:**
   - Prüfen, warum Überschriften als Paragraphs geparst werden
   - Prüfen, warum Code-Blöcke falsch geparst werden

## Pipeline Error Hints

**Keine Pipeline-Error-Hints gefunden** - Das ist gut! Die Extension funktioniert grundsätzlich.

