import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareHtmlContent } from './test-utils.js';

test('Structural Comparison: detects missing p-tag around text', () => {
  const expectedHtml = `
<div style="display: flex;">
  <div>
    <p>Klicke auf jede Figur, um zu sehen, was sie tut.</p>
    <p>Zweite Zeile.</p>
  </div>
</div>`;

  const actualHtml = `
<div style="display: flex;">
  <div>
    Klicke auf jede Figur, um zu sehen, was sie tut.
    <p>Zweite Zeile.</p>
  </div>
</div>`;

  const result = compareHtmlContent(expectedHtml, actualHtml);
  
  console.log('Structural differences found:', JSON.stringify(result.structuralDifferences, null, 2));
  
  // It should find at least one structural difference: missing <p>
  const missingP = result.structuralDifferences.find(d => d.type === 'missing_element' && d.expectedElement.tag === 'p');
  
  assert.ok(missingP, 'Should detect missing <p> tag');
});

test('Structural Comparison: detects missing p-tag around text at top level', () => {
  const expectedHtml = '<p>Klicke auf jede Figur, um zu sehen, was sie tut.</p><p>Zweite Zeile.</p>';
  const actualHtml = 'Klicke auf jede Figur, um zu sehen, was sie tut. <p>Zweite Zeile.</p>';

  const result = compareHtmlContent(expectedHtml, actualHtml);
  
  assert.ok(result.structuralDifferences.length > 0, 'Should find differences when top-level text is missing its <p> wrapper');
  assert.ok(result.structuralDifferences.some(d => d.type === 'text_content_mismatch'), 'Should report text mismatch on root or parent');
});

test('Structural Comparison: detects class mismatches', () => {
  const expectedHtml = '<div class="c-project-panel--ingredient">Text</div>';
  const actualHtml = '<div class="c-project-panel">Text</div>';

  const result = compareHtmlContent(expectedHtml, actualHtml);
  
  const classMismatch = result.structuralDifferences.find(d => d.type === 'class_mismatch');
  assert.ok(classMismatch, 'Should detect missing class');
  assert.deepStrictEqual(classMismatch.missingClasses, ['c-project-panel--ingredient']);
});

test('Structural Comparison: detects extra elements', () => {
  const expectedHtml = '<div><p>Text</p></div>';
  const actualHtml = '<div><p>Text</p><span>Extra</span></div>';

  const result = compareHtmlContent(expectedHtml, actualHtml);
  
  const extraElement = result.structuralDifferences.find(d => d.type === 'extra_element');
  assert.ok(extraElement, 'Should detect extra span element');
  assert.strictEqual(extraElement.actualElement.tag, 'span');
});

test('Structural Comparison: ignores whitespace differences', () => {
  const expectedHtml = '<p>Text with  lots of   spaces</p>';
  const actualHtml = '<p>Text with lots of spaces</p>';

  const result = compareHtmlContent(expectedHtml, actualHtml);
  
  assert.strictEqual(result.structuralDifferences.length, 0, 'Should ignore whitespace normalization differences');
});

test('Structural Comparison: detects ID mismatch with special characters', () => {
  // Scenario: API has "spielen-️" (U+FE0F at end), we have "spielen"
  const expectedHtml = '<h3 id="spielen-️">Spielen ▶️</h3>';
  const actualHtml = '<h3 id="spielen">Spielen ▶️</h3>';

  const result = compareHtmlContent(expectedHtml, actualHtml);
  
  const idMismatch = result.structuralDifferences.find(d => d.type === 'id_mismatch');
  assert.ok(idMismatch, 'Should detect ID mismatch when special characters are missing');
  assert.strictEqual(idMismatch.expectedElement.id, 'spielen-️');
  assert.strictEqual(idMismatch.actualElement.id, 'spielen');
});

test('Structural Comparison: detects missing p-wrapper inside complex HTML', () => {
  const expectedHtml = `
<div style="display: flex; flex-wrap: wrap">
<div style="flex-basis: 175px; flex-grow: 1">
<p>Klicke auf jede Figur, um zu sehen, was sie tut.</p>
<p>Zweite Zeile.</p>
</div>
</div>`;

  const actualHtml = `
<div style="display: flex; flex-wrap: wrap">
<div style="flex-basis: 175px; flex-grow: 1">
Klicke auf jede Figur, um zu sehen, was sie tut.
<p>Zweite Zeile.</p>
</div>
</div>`;

  const result = compareHtmlContent(expectedHtml, actualHtml);
  
  // The current comparison logic should find a text_content_mismatch on the inner div
  // because it collects direct text children.
  const textMismatch = result.structuralDifferences.find(d => 
    d.type === 'text_content_mismatch' && 
    d.path.includes('div')
  );
  
  assert.ok(textMismatch, 'Should detect text mismatch when text is not wrapped in <p>');
});

