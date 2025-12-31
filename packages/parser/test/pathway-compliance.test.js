/**
 * Pathway Compliance Test
 * Compares parser output with API snapshots for all projects in a pathway
 * Focuses on structural compliance and handles multiple languages.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import yaml from 'js-yaml';
import { parseProject } from '../src/parse-project.js';
import { parseQuiz } from '../src/parse-quiz.js';
import { 
  compareHtmlContent, 
  loadApiData, 
  loadQuizApiData,
  compareStepAttributes,
  normalizeText,
  extractQuizStructures
} from './test-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../..');
const snapshotsDir = join(projectRoot, 'content/RPL/projects');

async function getPathwayProjects(pathwayName) {
  const pathwaysPath = join(projectRoot, 'content/RPL/pathways/rpl-pathways.yaml');
  const content = await readFile(pathwaysPath, 'utf8');
  const pathways = yaml.load(content);
  return pathways[pathwayName] || [];
}

const projects = await getPathwayProjects('scratch-intro');
const languages = ['en', 'de-DE'];

for (const projectId of projects) {
  for (const lang of languages) {
    const projectPath = join(snapshotsDir, projectId, 'repo', lang);
    const apiPath = join(snapshotsDir, projectId, `api-project-${lang}.json`);

    if (!existsSync(projectPath) || !existsSync(apiPath)) {
      continue;
    }

    test(`Compliance: ${projectId} [${lang}] matches API snapshot structure`, async () => {
      // Parse local version
      const parsed = await parseProject(projectPath, { languages: [lang] });
      
      // Load API snapshot
      const apiData = loadApiData(snapshotsDir, projectId, lang);
      
      const ourContent = parsed.data.attributes.content;
      const apiContent = apiData.data.attributes.content;
      
      // Compare top-level attributes
      assert.strictEqual(parsed.data.type, apiData.data.type, `${projectId} [${lang}]: Type mismatch`);
      assert.strictEqual(normalizeText(ourContent.title), normalizeText(apiContent.title), `${projectId} [${lang}]: Title mismatch`);
      assert.strictEqual(normalizeText(ourContent.description), normalizeText(apiContent.description), `${projectId} [${lang}]: Description mismatch`);
      
      const apiSteps = apiContent.steps || [];
      const ourSteps = ourContent.steps || [];

      // Compare steps count
      assert.strictEqual(
        ourSteps.length, 
        apiSteps.length, 
        `${projectId} [${lang}]: Steps count mismatch (expected ${apiSteps.length}, got ${ourSteps.length})`
      );
      
      const differences = [];

      // Compare each step
      for (let i = 0; i < apiSteps.length; i++) {
        const apiStep = apiSteps[i];
        const ourStep = ourSteps[i];

        // Compare non-content attributes
        const attributeDiffs = compareStepAttributes(apiStep, ourStep, i);
        if (attributeDiffs.length > 0) {
          differences.push({
            stepIndex: i,
            type: 'attribute_mismatch',
            details: attributeDiffs
          });
        }

        // Compare content (HTML) - Focus on structure
        // Skip for quiz steps as we generate HTML but API might be different/empty
        if (!apiStep.knowledgeQuiz) {
          const htmlAnalysis = compareHtmlContent(apiStep.content, ourStep.content);
          if (htmlAnalysis.structuralDifferences.length > 0) {
            differences.push({
              stepIndex: i,
              stepTitle: apiStep.title,
              type: 'html_structural_mismatch',
              structuralDifferences: htmlAnalysis.structuralDifferences
            });
          }
        } else if (typeof apiStep.knowledgeQuiz === 'string') {
          // Test quiz structure against cached quiz API response
          const quizSlug = apiStep.knowledgeQuiz;
          const quizApiData = loadQuizApiData(snapshotsDir, projectId, quizSlug, lang);
          
          if (quizApiData) {
            const quizPath = join(projectPath, quizSlug);
            const ourQuiz = await parseQuiz(quizPath, {
              languages: [lang],
              basePath: join(snapshotsDir, projectId)
            });
            
            const apiQuestions = quizApiData.data.attributes.content.questions || [];
            const ourQuizStructures = extractQuizStructures(ourQuiz.html);
            
            if (apiQuestions.length !== ourQuizStructures.length) {
              differences.push({
                stepIndex: i,
                type: 'quiz_question_count_mismatch',
                expected: apiQuestions.length,
                actual: ourQuizStructures.length
              });
            } else {
              for (let qIdx = 0; qIdx < apiQuestions.length; qIdx++) {
                const apiStruct = extractQuizStructures(apiQuestions[qIdx])[0];
                const ourStruct = ourQuizStructures[qIdx];

                if (ourStruct.legend !== apiStruct.legend) {
                  differences.push({
                    stepIndex: i,
                    questionIndex: qIdx,
                    type: 'quiz_legend_mismatch',
                    expected: apiStruct.legend,
                    actual: ourStruct.legend
                  });
                }
                
                if (ourStruct.answersCount !== apiStruct.answersCount) {
                  differences.push({
                    stepIndex: i,
                    questionIndex: qIdx,
                    type: 'quiz_answers_count_mismatch',
                    expected: apiStruct.answersCount,
                    actual: ourStruct.answersCount
                  });
                } else {
                  // Compare each answer text (normalized)
                  for (let aIdx = 0; aIdx < apiStruct.answersCount; aIdx++) {
                    const apiAnswer = apiStruct.answers[aIdx];
                    const ourAnswer = ourStruct.answers[aIdx];
                    if (ourAnswer.labelText !== apiAnswer.labelText) {
                      differences.push({
                        stepIndex: i,
                        questionIndex: qIdx,
                        answerIndex: aIdx,
                        type: 'quiz_answer_text_mismatch',
                        expected: apiAnswer.labelText,
                        actual: ourAnswer.labelText
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }

      if (differences.length > 0) {
        console.error(`❌ Found ${differences.length} structural difference(s) in ${projectId} [${lang}]`);
        // Log first difference for debugging
        console.error(JSON.stringify(differences[0], null, 2));
        assert.fail(`${projectId} [${lang}] has structural differences`);
      }
    });
  }
}
