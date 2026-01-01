import { describe, it, expect } from 'vitest';
import { calculateProgress } from './progress';

describe('calculateProgress', () => {
  const mockProject = {
    id: 'RPL:PROJ:catch-the-bus',
    attributes: {
      content: {
        steps: Array(9).fill(null).map((_, i) => ({
          content: '',
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
});
