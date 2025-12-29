
import { parseQuestion } from './packages/parser/src/parse-question.js';
import { parseTutorial } from './packages/parser/src/parse-tutorial.js';
import { readFileSync } from 'fs';

async function test() {
  const markdown = readFileSync('test/snapshots/silly-eyes/repo/en/quiz1/question_1.md', 'utf-8');
  
  console.log('--- Testing parseQuestion ---');
  const questionMatch = markdown.match(/--- question ---\s*(.*?)\s*--- \/question ---/s);
  const questionContent = questionMatch[1];
  const frontmatterMatch = questionContent.match(/^---\s*\n(.*?)\n---\s*\n(.*)$/s);
  const questionBody = frontmatterMatch ? frontmatterMatch[2] : questionContent;
  const questionText = questionBody.substring(0, questionBody.indexOf('--- choices ---')).trim();
  
  console.log('Question Text (Markdown):');
  console.log('"' + questionText + '"');

  const result = await parseQuestion(markdown, { basePath: 'test/snapshots/silly-eyes/repo/en' });
  console.log('\nHTML Output:');
  console.log(result.html);
}

test().catch(console.error);
