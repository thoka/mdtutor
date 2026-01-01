import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import StepContent from './StepContent.svelte';
import { tick } from 'svelte';
import { trackAction } from './achievements';

// Mock achievements
vi.mock('./achievements', () => ({
  trackAction: vi.fn()
}));

describe('StepContent Checkboxes', () => {
  it('correctly initializes checkboxes from userActions (Alice Case)', async () => {
    const userActions = [
      { action_type: 'task_check', gid: 'RPL:PROJ:123', metadata: { step: 4, task_index: 0 }, timestamp: '2026-01-01T10:00:00Z' }
    ];

    const { container } = render(StepContent, {
      content: '<input class="c-project-task__checkbox" type="checkbox" />',
      slug: 'catch-the-bus',
      gid: 'RPL:PROJ:123',
      step: 4,
      userActions
    });

    await tick();
    const checkbox = container.querySelector('input') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('correctly handles unchecking a task (Action tracking)', async () => {
    const { container } = render(StepContent, {
      content: '<input class="c-project-task__checkbox" type="checkbox" />',
      slug: 'catch-the-bus',
      gid: 'RPL:PROJ:123',
      step: 4,
      userActions: [{ action_type: 'task_check', gid: 'RPL:PROJ:123', metadata: { step: 4, task_index: 0 }, timestamp: '2026-01-01T10:00:00Z' }]
    });

    await tick();
    const checkbox = container.querySelector('input') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);

    // Uncheck it
    await fireEvent.click(checkbox);
    await tick();
    
    expect(trackAction).toHaveBeenCalledWith('task_uncheck', 'RPL:PROJ:123', expect.objectContaining({ step: 4, task_index: 0 }));
  });

  it('adds a play overlay to Scratch iframes and tracks scratch_start', async () => {
    const { container } = render(StepContent, {
      content: '<div class="scratch-preview"><iframe src="https://scratch.mit.edu/projects/embed/724160134/?autostart=false"></iframe></div>',
      slug: 'catch-the-bus',
      gid: 'RPL:PROJ:123',
      step: 0
    });

    await tick();
    const overlay = container.querySelector('.scratch-play-overlay') as HTMLElement;
    expect(overlay).not.toBeNull();

    await fireEvent.click(overlay);
    await tick();

    expect(trackAction).toHaveBeenCalledWith('scratch_start', 'RPL:PROJ:123', expect.objectContaining({ scratch_id: '724160134' }));
    expect(container.querySelector('.scratch-play-overlay')).toBeNull();
  });
});

