# Quiz Parser Refactor - Use Same Parser Stack

**Date:** 2025-12-30  
**Status:** Proposed

## Problem

Aktuell verwendet `parse-question.js` Regex-Matching, um Block-Delimiter (`--- question ---`, `--- choices ---`, `--- feedback ---`) zu extrahieren, BEVOR sie durch den Parser-Stack laufen. Das ist:

1. **Inkonsistent** - Andere Block-Delimiter werden durch die micromark extension verarbeitet
2. **Fehleranfällig** - Regex-Matching ist weniger robust als AST-basierte Parsing
3. **Wartungsaufwändig** - Zwei verschiedene Parsing-Strategien im System

## Lösung

Den gleichen Parser-Stack wie der Rest verwenden:

1. **AST-Analyse statt Regex**: Den gesamten Quiz-Markdown durch `parseTutorial` laufen lassen (bis zum AST, nicht bis HTML)
2. **Block-Delimiter Nodes finden**: Die `blockDelimiter` Nodes im AST finden (erstellt von micromark extension)
3. **Inhalte extrahieren**: Die Inhalte zwischen den Block-Delimitern aus dem AST extrahieren
4. **Einzelne Teile parsen**: Question text, choices, feedback einzeln durch `parseTutorial` laufen lassen (zu HTML)

## Implementation Plan

### Schritt 1: AST-Parsing Funktion erstellen
- Neue Funktion `parseTutorialToAST()` die den AST zurückgibt (ohne HTML-Konvertierung)
- Oder: Option in `parseTutorial()` um nur den AST zu bekommen

### Schritt 2: Quiz-Parser umschreiben
- `parse-question.js` umschreiben, um AST-Analyse zu verwenden
- `blockDelimiter` Nodes im AST finden
- Inhalte zwischen Delimitern extrahieren

### Schritt 3: Tests anpassen
- Bestehende Tests sollten weiterhin funktionieren
- Möglicherweise neue Tests für AST-basierte Parsing

## Vorteile

- ✅ Konsistenz mit dem Rest des Systems
- ✅ Nutzt die gleiche micromark extension
- ✅ Robuster (AST statt Regex)
- ✅ Wartbarer (eine Parsing-Strategie)

## Nachteile

- ⚠️ Größere Refaktorierung
- ⚠️ Möglicherweise Performance-Impact (mehrfaches Parsing)

## Alternative: Quiz-spezifischer Plugin

Stattdessen könnten wir einen `remark-quiz` Plugin erstellen, der:
- Quiz Block-Delimiter erkennt
- Sie in strukturierte Daten umwandelt
- Vor der HTML-Konvertierung arbeitet

Das wäre konsistenter mit der Plugin-Architektur.

