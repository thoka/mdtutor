# HTML-Unterschiede Übersicht

**Datum:** 2025-12-29  
**Status:** Analyse der verbleibenden Unterschiede

## Zusammenfassung

- **92 Steps** mit HTML-Unterschieden
- **Hauptprobleme:**
  - Missing elements: **1974**
  - Extra elements: **1683**
  - Class mismatches: **303**
  - Tag mismatches: **278**
  - Text content mismatches: **182**
  - ID mismatches: **40**
  - Extra structure: **2**

## Unterschiede nach Projekt

### Top-Probleme (nach Gesamtanzahl)

1. **cats-vs-dogs/en**: 6 Steps betroffen
2. **silly-eyes/en**: 7 Steps betroffen
3. **silly-eyes/de-DE**: 7 Steps betroffen
4. **getting-started-with-minecraft-pi/en**: 9 Steps betroffen
5. **getting-started-with-minecraft-pi/de-DE**: 9 Steps betroffen
6. **scratchpc-interactive-book/en**: 6 Steps betroffen

### Alle Projekte mit Unterschieden

- **cats-vs-dogs**: en (6 Steps)
- **silly-eyes**: en (7 Steps), de-DE (7 Steps)
- **getting-started-with-minecraft-pi**: en (9 Steps), de-DE (9 Steps)
- **scratchpc-interactive-book**: en (6 Steps)
- **Viele "generic-" und "scratch3-" Projekte**: jeweils 1 Step (Step 0) - meist Transclusions

## Strukturelle Unterschiede

### 1. Missing Elements (1974)
**Beschreibung:** Elemente, die in der erwarteten API vorhanden sind, aber im Parser-Output fehlen.

**Beispiele:**
- `cats-vs-dogs Step 1`: Missing element: `<a>`
- `cats-vs-dogs Step 1`: Missing element: `<code>`
- `cats-vs-dogs Step 1`: Missing element: `<p>`

**Mögliche Ursachen:**
- Block-Delimiter werden nicht korrekt verarbeitet
- Transclusions werden nicht vollständig eingebettet
- YAML-Blöcke werden nicht korrekt konvertiert
- Links/Images werden nicht korrekt geparst

### 2. Extra Elements (1683)
**Beschreibung:** Elemente, die im Parser-Output vorhanden sind, aber in der erwarteten API fehlen.

**Beispiele:**
- `cats-vs-dogs Step 1`: Extra element: `<p>`
- `cats-vs-dogs Step 1`: Extra element: `<img>`
- `cats-vs-dogs Step 1`: Extra element: `<p>`

**Mögliche Ursachen:**
- Zusätzliche Wrapper-Elemente
- Leere Paragraphs werden nicht entfernt
- Whitespace-Handling
- Zusätzliche Elemente durch Transclusions

### 3. Class Mismatches (303)
**Beschreibung:** Elemente haben unterschiedliche CSS-Klassen.

**Häufigstes Problem:** `c-project-task__body` fehlt

**Beispiele:**
- `cats-vs-dogs Step 1`: Class mismatch on `<div>`: missing [c-project-task__body], extra []
- Mehrfach in verschiedenen Steps

**Mögliche Ursachen:**
- Task-Blöcke werden nicht korrekt strukturiert
- `c-project-task__body` wird nicht hinzugefügt
- Panel-Klassen werden nicht korrekt gesetzt
- Block-Delimiter generieren falsche Klassen

### 4. Tag Mismatches (278)
**Beschreibung:** Elemente haben unterschiedliche HTML-Tags.

**Beispiele:**
- `cats-vs-dogs Step 1`: Tag mismatch: expected `<div>`, found `<p>`
- `cats-vs-dogs Step 1`: Tag mismatch: expected `<p>`, found `<a>`
- `cats-vs-dogs Step 1`: Tag mismatch: expected `<div>`, found `<p>`

**Mögliche Ursachen:**
- Block-Delimiter generieren `<p>` statt `<div>`
- Heading-Level werden falsch konvertiert
- Links werden als Paragraphs geparst

### 5. Text Content Mismatches (182)
**Beschreibung:** Text-Inhalte unterscheiden sich.

**Beispiele:**
- `cats-vs-dogs Step 0`: Text content mismatch on `<p>`
- `cats-vs-dogs Step 0`: Text content mismatch on `<a>`

**Mögliche Ursachen:**
- Whitespace-Normalisierung
- Text-Extraktion aus verschachtelten Elementen
- Unterschiedliche Behandlung von Leerzeichen

### 6. ID Mismatches (40)
**Beschreibung:** Elemente haben unterschiedliche IDs.

**Beispiele:**
- `getting-started-with-minecraft-pi Step 4`: ID mismatch: expected `#spezielle-blöcke`, found `#spezielle-blcke`
- `getting-started-with-minecraft-pi Step 4`: ID mismatch: expected `#mehrere-blöcke-setzen`, found `#mehrere-blcke-setzen`
- `getting-started-with-minecraft-pi Step 5`: ID mismatch: expected `#blöcke-beim-gehen-fallen-lassen`, found `#blcke-beim-gehen-`

**Mögliche Ursachen:**
- Umlaute (ä, ö, ü) werden unterschiedlich behandelt
- Slugification entfernt Umlaute, API behält sie
- Heading-IDs werden nicht korrekt generiert

## Priorisierte Probleme

### Hochpriorität (häufigste Probleme)

1. **Missing/Extra Elements (3657 total)**
   - Größtes Problem: ~1974 missing + ~1683 extra
   - Betrifft fast alle Projekte
   - Vermutlich strukturelle Probleme mit Block-Delimitern

2. **Class Mismatch: c-project-task__body (303)**
   - Sehr spezifisches Problem
   - Betrifft Task-Blöcke
   - Relativ einfach zu beheben

3. **Tag Mismatches (278)**
   - `<div>` vs `<p>` Probleme
   - Vermutlich Block-Delimiter generieren falsche Tags

### Mittelpriorität

4. **Text Content Mismatches (182)**
   - Whitespace/Formatierung
   - Weniger kritisch

5. **ID Mismatches (40)**
   - Umlaute-Problem
   - Betrifft hauptsächlich deutsche Übersetzungen
   - Relativ einfach zu beheben

## Nächste Schritte

1. **Priorisierung:** 
   - ✅ Fokus auf `c-project-task__body` (schneller Fix)
   - ✅ Fokus auf Tag Mismatches (div vs p)
   - ✅ Fokus auf Missing/Extra Elements (strukturelle Analyse)

2. **Analyse:** 
   - Detaillierte Analyse von Task-Blöcken
   - Prüfung der Block-Delimiter-Verarbeitung
   - Vergleich von Beispiel-HTML

3. **Fixes:** 
   - Systematische Behebung der identifizierten Probleme
   - Test nach jedem Fix

4. **Validierung:** 
   - Test nach jedem Fix
   - Monitoring der Unterschiede

