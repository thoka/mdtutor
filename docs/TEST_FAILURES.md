# Übersicht: Fehlgeschlagene Tests

**Stand:** Nach Cleanup der Build-Artefakte  
**Gesamt:** 60 von 65 Tests bestehen ✅  
**Fehlgeschlagen:** 5 Tests ❌

---

## 1. `compare-quiz-api.test.js:213` - ReferenceError

**Fehler:** `correctFeedbackItems is not defined`

**Datei:** `packages/parser/test/compare-quiz-api.test.js:213`

**Problem:** Variable `correctFeedbackItems` wird verwendet, aber nie definiert.

**Code:**
```javascript
// Zeile 208-213
const feedbackItems = parsed.querySelectorAll('.knowledge-quiz-question__feedback-item');
assert.ok(feedbackItems.length > 0, 'Should have feedback items');

// Original API doesn't use --correct class on feedback items
// Correct answers are identified by checked attribute on radio inputs
assert.ok(correctFeedbackItems.length > 0, 'Should have correct feedback items');
```

**Lösung:** `correctFeedbackItems` muss definiert werden, z.B. durch Filtern der `feedbackItems` basierend auf dem `checked` Attribut der Radio-Buttons.

---

## 2. `compare-quiz-api.test.js:216` - Falsche Erwartung für `name` Attribut

**Fehler:** `Question 1 answer 0 should have name quiz-question-1`  
**Erwartet:** `'quiz-question-1'`  
**Tatsächlich:** `'answer'`

**Datei:** `packages/parser/test/compare-quiz-api.test.js:216`

**Problem:** Der Test erwartet das alte Format (`quiz-question-1`), aber wir haben die Struktur an die originale API angepasst, die `name="answer"` verwendet.

**Lösung:** Test muss aktualisiert werden, um `name="answer"` zu erwarten (wie in der originalen API).

---

## 3. `compare-quiz-api.test.js:273` - Progressive Disclosure

**Fehler:** `Should have same number of questions (expected 1, got 3)`

**Datei:** `packages/parser/test/compare-quiz-api.test.js:273`

**Problem:** Der Test prüft das gerenderte HTML der originalen Website (via Puppeteer). Die originale Website zeigt nur 1 Frage an (progressive disclosure), während unser HTML alle 3 Fragen enthält.

**Hintergrund:** Progressive Disclosure wird im Renderer (`StepContent.svelte`) implementiert, nicht im Parser. Der Parser generiert alle Fragen, der Renderer versteckt die nicht-aktiven.

**Lösung:** Test sollte entweder:
- Den Renderer-Output prüfen (nicht nur den Parser-Output), oder
- Die progressive disclosure Logik im Test berücksichtigen, oder
- Den Test als "Parser-Test" anpassen (Parser gibt alle Fragen aus, Renderer versteckt sie)

---

## 4. `compare-quiz-api-exact.test.js:325` - Korrekte Antwort nicht gefunden

**Fehler:** `Question 1 correct answer index should match`  
**Erwartet:** `0`  
**Tatsächlich:** `-1` (nicht gefunden)

**Datei:** `packages/parser/test/compare-quiz-api-exact.test.js:325`

**Problem:** Der Test findet die korrekte Antwort nicht. Der Code sucht nach dem `checked` Attribut, aber möglicherweise:
- Wird `checked` nicht gesetzt (wir verwenden `data-correct` statt `checked`)?
- Oder die HTML-Struktur stimmt nicht überein?

**Code-Kontext:**
```javascript
// Find correct answer in original (has checked attribute)
const originalCorrectIndex = originalStruct.answers.findIndex(a => a.checked);

// Find correct answer in ours (now also uses checked attribute, matching original API)
// ... sucht nach checked Attribut
```

**Lösung:** Prüfen, ob unser Parser tatsächlich `checked` setzt (laut Spec sollten wir `data-correct` verwenden, aber der Test erwartet `checked`).

---

## 5. `parse-meta.test.js:22` - Falsches Format für `knowledgeQuiz`

**Fehler:** `Expected values to be strictly deep-equal`  
**Erwartet:** Objekt `{path: 'quiz1', version: 1, questions: 3, passing_score: 3}`  
**Tatsächlich:** String `'quiz1'`

**Datei:** `packages/parser/test/parse-meta.test.js:22`

**Problem:** `parseMeta` gibt `knowledgeQuiz` als String zurück (`'quiz1'`), aber der Test erwartet ein Objekt mit `path`, `version`, `questions`, `passing_score`.

**Code in `parse-meta.js:36`:**
```javascript
knowledgeQuiz: step.knowledge_quiz?.path || (step.knowledge_quiz ? step.knowledge_quiz.path || 'quiz1' : null)
```

**Lösung:** `parseMeta` muss das vollständige Objekt zurückgeben, nicht nur den Pfad. Die `meta.yml` Datei enthält vermutlich ein Objekt für `knowledge_quiz`, das vollständig übernommen werden sollte.

---

## Zusammenfassung

| Test | Problem | Priorität | Typ |
|------|---------|-----------|-----|
| 1. `correctFeedbackItems` | Variable nicht definiert | Hoch | Bug |
| 2. `name` Attribut | Test erwartet altes Format | Mittel | Test-Update |
| 3. Progressive Disclosure | Test prüft Parser statt Renderer | Mittel | Test-Update |
| 4. Korrekte Antwort | `checked` Attribut nicht gefunden | Hoch | Bug |
| 5. `knowledgeQuiz` Format | String statt Objekt | Hoch | Bug |

**Nächste Schritte:**
1. Test 1: `correctFeedbackItems` definieren
2. Test 5: `parseMeta` anpassen, um vollständiges Objekt zurückzugeben
3. Test 4: Prüfen, ob `checked` Attribut gesetzt wird
4. Test 2: Test auf `name="answer"` aktualisieren
5. Test 3: Test-Logik anpassen (Parser vs. Renderer)

