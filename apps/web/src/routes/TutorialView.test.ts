import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import TutorialView from './TutorialView.svelte';
import { tick } from 'svelte';
import { trackAction } from '../lib/achievements';

// Mock achievements
vi.mock('../lib/achievements', () => ({
  trackAction: vi.fn()
}));

// Mock svelte-spa-router
vi.mock('svelte-spa-router', () => ({
  link: vi.fn(),
  push: vi.fn()
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('TutorialView Navigation Stability', () => {
  const mockProject = {
    data: {
      id: 'RPL:PROJ:catch-the-bus',
      attributes: {
        content: {
          title: 'Catch the Bus',
          steps: [
            { title: 'Step 0', content: 'Step 0 Content' },
            { title: 'Step 1', content: 'Step 1 Content' }
          ]
        }
      }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockImplementation((url) => {
      if (url.includes('/api/projects/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProject)
        });
      }
      if (url.includes('/api/v1/actions/user/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      }
      return Promise.resolve({ ok: false });
    });
    
    // Mock localStorage for token
    localStorage.setItem('sso_token', 'fake.eyJ1c2VyX2lkIjoic3R1ZGVudF9hIn0.token');
  });

  it('does not trigger achievement changes when opening or navigating', async () => {
    const { container } = render(TutorialView, {
      params: { slug: 'catch-the-bus', step: '0', lang: 'de-DE' }
    });

    await tick();
    await new Promise(r => setTimeout(r, 50)); // Wait for internal effects

    // 1. Project Open and Step View should be logged
    expect(trackAction).toHaveBeenCalledWith('project_open', 'RPL:PROJ:catch-the-bus', expect.any(Object));
    expect(trackAction).toHaveBeenCalledWith('step_view', 'RPL:PROJ:catch-the-bus', expect.objectContaining({ step: 0 }));

    // Count calls so far
    const callsBeforeNav = (trackAction as any).mock.calls.length;

    // 2. Navigate to Step 1
    const nextBtn = container.querySelector('.c-project-step-navigation__link--next');
    if (nextBtn) {
      await fireEvent.click(nextBtn);
      await tick();
    }

    // Step View should be logged for step 1, and step_complete for step 0
    expect(trackAction).toHaveBeenCalledWith('step_complete', 'RPL:PROJ:catch-the-bus', expect.objectContaining({ step: 0 }));
    expect(trackAction).toHaveBeenCalledWith('step_view', 'RPL:PROJ:catch-the-bus', expect.objectContaining({ step: 1 }));

    // IMPORTANT: No OTHER actions (like task_check) should have been triggered
    const allActions = (trackAction as any).mock.calls.map((c: any) => c[0]);
    const unexpectedActions = allActions.filter((a: string) => !['project_open', 'step_view', 'step_complete'].includes(a));
    expect(unexpectedActions).toEqual([]);
  });
});

