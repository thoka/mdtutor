import { test } from 'node:test';
import assert from 'node:assert';

const PORT = process.env.API_PORT;
const BASE_URL = `http://localhost:${PORT}`;

test('API Server - Language Fallback', async () => {
  // Test German project (silly-eyes has api-project-de-DE.json)
  const resDe = await fetch(`${BASE_URL}/api/projects/silly-eyes`);
  const dataDe = await resDe.json();
  assert.strictEqual(dataDe.data.attributes.content.title, 'Alberne Augen');

  // Test English fallback (scratchpc-interactive-book only has api-project-en.json)
  const resEn = await fetch(`${BASE_URL}/api/projects/scratchpc-interactive-book`);
  const dataEn = await resEn.json();
  assert.strictEqual(dataEn.data.attributes.content.title, 'Make an interactive book');
  
  // Test explicit language request
  const resExplicit = await fetch(`${BASE_URL}/api/projects/silly-eyes?lang=en`);
  const dataExplicit = await resExplicit.json();
  assert.strictEqual(dataExplicit.data.attributes.content.title, 'Silly eyes');
});

test('API Server - Project List Fallback', async () => {
  const res = await fetch(`${BASE_URL}/api/projects`);
  const data = await res.json();
  
  const sillyEyes = data.projects.find(p => p.slug === 'silly-eyes');
  assert.strictEqual(sillyEyes.title, 'Alberne Augen');
  
  const interactiveBook = data.projects.find(p => p.slug === 'scratchpc-interactive-book');
  assert.strictEqual(interactiveBook.title, 'Make an interactive book');
});
