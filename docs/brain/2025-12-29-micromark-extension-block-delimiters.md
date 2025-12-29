# Micromark-Extension für `--- TYPE ---` Syntax

**Datum:** 2025-12-29  
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

**Vollständige micromark-extension implementiert:**

1. ✅ `micromark-extension-block-delimiters.js` - Tokenizer für `--- TYPE ---` Syntax
2. ✅ `mdast-util-block-delimiters.js` - Handler um Tokens in MDAST-Nodes zu konvertieren
3. ✅ Integration über `unified.data()` in `parse-tutorial.js`
4. ✅ `remark-block-delimiters.js` erweitert um `blockDelimiter` Nodes zu verarbeiten
5. ✅ Preprocessing bleibt als Fallback für Rückwärtskompatibilität

**Architektur:**
```
Markdown → micromark (mit Extension) → Tokens → mdast-util (mit Handler) → MDAST Nodes → remark Plugin → HTML
```

**Vorteile:**
- Direkte Parser-Integration (kein Preprocessing nötig)
- Robuste Token-Erkennung
- Eigene Node-Typen im AST
- Fallback auf HTML-Kommentare für Kompatibilität

**Ergebnisse nach Implementierung:**
- ✅ Unterschiede: 93 → 86 (-7)
- ✅ Tag-Mismatches: 169 → 150 (-19)
- ✅ Task-Struktur korrekt (Tasks und Bodies stimmen überein)

**Nächste Schritte:**
- Preprocessing für Delimiter optional machen (nur für YAML)
- Weitere Verbesserungen der Token-Erkennung (z.B. Edge Cases)
- Performance-Tests durchführen

