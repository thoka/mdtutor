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

  it('calculates 100% progress for Alice if all tasks are checked', () => {
    const actions = [
      { action_type: 'step_view', gid: 'RPL:PROJ:catch-the-bus', metadata: { step: 0 }, timestamp: '2026-01-01T10:00:00Z' },
      { action_type: 'task_check', gid: 'RPL:PROJ:catch-the-bus', metadata: { step: 4, task_index: 0 }, timestamp: '2026-01-01T10:01:00Z' },
    ];

    const progress = calculateProgress(mockProject, actions);
    // All steps without tasks are 100%. Step 4 has 1 task and it is checked.
    // Result: 100%
    expect(progress.percent).toBe(100);
    expect(progress.isCompleted).toBe(true);
  });

  it('calculates < 100% progress if some tasks are missing', () => {
    const progress = calculateProgress(mockProject, []);
    // Step 4 has a task but it's not checked. Other 8 steps are "empty" and thus 100%.
    // Score: (1+1+1+1 + 0 + 1+1+1+1) / 9 = 8/9 = 89%
    expect(progress.percent).toBe(89);
    expect(progress.isCompleted).toBe(false);
  });

  it('correctly handles task unchecking in progress calculation', () => {
    const actions = [
      { action_type: 'task_check', gid: 'RPL:PROJ:catch-the-bus', metadata: { step: 4, task_index: 0 }, timestamp: '2026-01-01T10:01:00Z' },
      { action_type: 'task_uncheck', gid: 'RPL:PROJ:catch-the-bus', metadata: { step: 4, task_index: 0 }, timestamp: '2026-01-01T10:02:00Z' },
    ];

    const progress = calculateProgress(mockProject, actions);
    // Step 4 is 0% because the check was undone.
    expect(progress.percent).toBe(89);
    expect(progress.stepInteractions[4].completed).toBe(0);
  });

  it('tracks lastViewedStep correctly', () => {
    const actions = [
      { action_type: 'step_view', gid: 'RPL:PROJ:catch-the-bus', metadata: { step: 0 }, timestamp: '2026-01-01T10:00:00Z' },
      { action_type: 'step_view', gid: 'RPL:PROJ:catch-the-bus', metadata: { step: 2 }, timestamp: '2026-01-01T10:05:00Z' },
      { action_type: 'step_view', gid: 'RPL:PROJ:catch-the-bus', metadata: { step: 1 }, timestamp: '2026-01-01T10:10:00Z' },
    ];

    const progress = calculateProgress(mockProject, actions);
    expect(progress.lastViewedStep).toBe(1);
    expect(progress.lastStep).toBe(1);
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
