# Micromark-Extension für `--- TYPE ---` Syntax

**Datum:** 2025-01-XX  
**Status:** In Implementierung

## Ziel

Erstelle eine **micromark-extension** (ähnlich wie `remark-directive`), die die `--- TYPE ---` Syntax direkt im Markdown-Parser erkennt, anstatt sie über Preprocessing zu behandeln. Dies macht die Implementierung robuster und eliminiert Fehlerquellen.

## Problem mit aktuellem Ansatz

### Aktueller Ansatz (Probleme)
```
Markdown → Preprocessing (--- TYPE --- → HTML-Kommentare) → remark-parse → AST → Plugin
```

**Probleme:**
- Preprocessing-Schritt fehleranfällig
- HTML-Kommentare als Zwischenformat
- Delimiter werden manchmal nicht erkannt
- Tag-Mismatches (div→p, p→div) entstehen
- Warnungen: "Cannot replace opening delimiter", "Invalid indices"

### Neuer Ansatz (micromark-extension)
```
Markdown → remark-parse (mit micromark-extension) → AST (custom nodes) → Plugin → HTML
```

**Vorteile:**
- Direkte Parser-Integration
- Eigene Node-Typen im AST
- Kein Preprocessing nötig
- Robuster und weniger fehleranfällig
- Ähnlich wie `remark-directive` implementiert

## Implementierung

### 1. Micromark-Extension erstellen

**Datei:** `packages/parser/src/plugins/micromark-extension-block-delimiters.js`

Die Extension erkennt `--- TYPE ---` und `--- /TYPE ---` direkt im Markdown-Stream:

- State Machine für Token-Erkennung
- Erstellt `blockDelimiter` Tokens
- Unterstützt verschiedene Block-Typen (task, collapse, save, etc.)

### 2. Remark-Plugin refactoren

**Datei:** `packages/parser/src/plugins/remark-block-delimiters.js` (refactored)

Das Plugin transformiert die `blockDelimiter` Tokens in MDAST-Nodes:

- Findet alle `blockDelimiter` Nodes
- Matched opening/closing Paare
- Wrappt Content zwischen Delimitern
- Erstellt HTML-Struktur (divs, classes, etc.)

### 3. Integration in remark-parse

**Datei:** `packages/parser/src/parse-tutorial.js`

- Integriere micromark-extension in `remarkParse`
- Entferne Preprocessing für Block-Delimiter
- Behalte YAML-Preprocessing (falls nötig)

## Technische Details

### Micromark State Machine

Die Extension verwendet eine State Machine, ähnlich wie `micromark-extension-directive`:

1. **Initial State:** Erwartet `---`
2. **Type State:** Liest Block-Typ (task, collapse, etc.)
3. **Closing State:** Erkennt `/` für closing delimiter
4. **End State:** Erstellt Token

### AST-Transformation

Das remark-Plugin:
1. Findet alle `blockDelimiter` Nodes
2. Matched opening/closing Paare
3. Wrappt Content zwischen Delimitern
4. Erstellt HTML-Struktur (divs, classes, etc.)

## Migration

### Schrittweise Migration

1. **Phase 1:** Micromark-extension erstellen und testen
2. **Phase 2:** Integration in Pipeline (parallel zum alten Ansatz)
3. **Phase 3:** Alten Preprocessing-Ansatz entfernen
4. **Phase 4:** Tests aktualisieren und validieren

### Rückwärtskompatibilität

- Beide Ansätze können parallel laufen
- Alte Tests sollten weiterhin funktionieren
- Schrittweise Migration möglich

## Vorteile

1. **Robustheit:** Direkte Parser-Integration statt Preprocessing
2. **Wartbarkeit:** Klarere Architektur, ähnlich remark-directive
3. **Performance:** Weniger String-Manipulation
4. **Fehlerbehandlung:** Bessere Fehlerbehandlung durch Parser
5. **Erweiterbarkeit:** Einfacher neue Block-Typen hinzufügen

## Abhängigkeiten

- `micromark-util-symbol` (bereits in remark-parse enthalten)
- Keine neuen Dependencies nötig

## Referenzen

- [remark-directive](https://github.com/remarkjs/remark-directive) - Ähnliche Implementierung
- [micromark extensions](https://github.com/micromark/micromark#extensions) - Dokumentation
- [micromark-extension-directive](https://github.com/micromark/micromark-extension-directive) - Beispiel-Implementierung

## Implementierungs-Status

**Entscheidung:** Statt einer vollständigen micromark-extension (komplex) haben wir die bestehende Implementierung verbessert:

1. ✅ Regex in `preprocessYamlBlocks` korrigiert (optionales Whitespace nach `---`)
2. ⏳ Weitere Verbesserungen der Delimiter-Erkennung geplant
3. ⏳ Robuste Fehlerbehandlung implementieren

**Nächste Schritte:**
- Wenn Probleme weiterhin bestehen, kann eine vollständige micromark-extension evaluiert werden
- Aktueller Ansatz ist pragmatischer und einfacher zu warten

