import { describe, it, expect } from 'vitest';
import { calculateProgress } from './progress';

describe('calculateProgress', () => {
  const mockProject = {
    id: 'RPL:PROJ:catch-the-bus',
    attributes: {
      content: {
        steps: Array(9).fill(null).map((_, i) => ({
          content: i === 4 ? '<input class="c-project-task__checkbox" />' : '',
          position: i
        }))
      }
    }
  };

  it('calculates > 60% progress for Alice after updated seeding', () => {
    const actions = [
      { action_type: 'step_complete', gid: 'RPL:PROJ:catch-the-bus', metadata: { step: 0 } },
      { action_type: 'step_complete', gid: 'RPL:PROJ:catch-the-bus', metadata: { step: 1 } },
      { action_type: 'step_complete', gid: 'RPL:PROJ:catch-the-bus', metadata: { step: 2 } },
      { action_type: 'step_complete', gid: 'RPL:PROJ:catch-the-bus', metadata: { step: 3 } },
      { action_type: 'step_complete', gid: 'RPL:PROJ:catch-the-bus', metadata: { step: 4 } },
      { action_type: 'step_complete', gid: 'RPL:PROJ:catch-the-bus', metadata: { step: 5 } },
    ];

    const progress = calculateProgress(mockProject, actions);
    // 6 / 9 = 0.666 -> 67%
    expect(progress.percent).toBeGreaterThanOrEqual(60);
    expect(progress.percent).toBe(67);
  });

  it('correctly handles task unchecking in progress calculation', () => {
    const actions = [
      { action_type: 'step_complete', gid: 'RPL:PROJ:catch-the-bus', metadata: { step: 0 }, timestamp: '2026-01-01T10:00:00Z' },
      { action_type: 'task_check', gid: 'RPL:PROJ:catch-the-bus', metadata: { step: 4, task_index: 0 }, timestamp: '2026-01-01T10:01:00Z' },
      { action_type: 'task_uncheck', gid: 'RPL:PROJ:catch-the-bus', metadata: { step: 4, task_index: 0 }, timestamp: '2026-01-01T10:02:00Z' },
    ];

    const progress = calculateProgress(mockProject, actions);
    // Only step 0 is complete. Step 4 is 0% because the check was undone.
    // 1 / 9 = 11%
    expect(progress.percent).toBe(11);
    expect(progress.stepInteractions[4].completed).toBe(0);
  });

  it('recognizes scratch_start and step_view actions without breaking progress', () => {
    const actions = [
      { action_type: 'step_view', gid: 'RPL:PROJ:catch-the-bus', metadata: { step: 0 }, timestamp: '2026-01-01T10:00:00Z' },
      { action_type: 'scratch_start', gid: 'RPL:PROJ:catch-the-bus', metadata: { step: 0, scratch_id: '123' }, timestamp: '2026-01-01T10:01:00Z' },
    ];

    const progress = calculateProgress(mockProject, actions);
    // Step 0 viewed = 1 step. 1/9 = 11%
    expect(progress.percent).toBe(11);
  });

  it('correctly identifies 3 quiz questions for catch-the-bus step 7', () => {
    // We need to simulate the project structure for step 7
    const catchTheBusStep7 = {
      id: 'RPL:PROJ:catch-the-bus',
      attributes: {
        content: {
          steps: [
            ...Array(7).fill({ content: '', position: 0 }),
            { 
              content: '<form class="knowledge-quiz-question">Q1</form><form class="knowledge-quiz-question">Q2</form><form class="knowledge-quiz-question">Q3</form>',
              position: 7 
            }
          ]
        }
      }
    };

    const progress = calculateProgress(catchTheBusStep7, []);
    expect(progress.stepInteractions[7].total).toBe(3);
  });
});
