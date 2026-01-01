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

  it('ensures no quiz answer is selected on open and UI content is correct', async () => {
    const quizHtml = `
      <form class="knowledge-quiz-question">
        <fieldset>
          <legend>Test Question</legend>
          <div class="knowledge-quiz-question__answers">
            <div class="knowledge-quiz-question__answer">
              <input type="radio" name="q1" value="1" id="c1" />
              <label for="c1">Answer 1</label>
            </div>
            <div class="knowledge-quiz-question__answer">
              <input type="radio" name="q1" value="2" id="c2" checked />
              <label for="c2">Answer 2</label>
            </div>
          </div>
        </fieldset>
        <ul class="knowledge-quiz-question__feedback">
          <li class="knowledge-quiz-question__feedback-item" id="f1">Feedback 1</li>
        </ul>
        <input type="button" value="Check" />
      </form>
    `;

    const { container, getByText } = render(StepContent, {
      content: quizHtml,
      slug: 'test-project',
      step: 0
    });

    await tick();
    // Wait for the setTimeout in StepContent.svelte
    await new Promise(r => setTimeout(r, 20));

    // 1. Content check
    expect(getByText('Test Question')).toBeInTheDocument();
    expect(getByText('Answer 1')).toBeInTheDocument();
    expect(getByText('Answer 2')).toBeInTheDocument();
    expect(container.querySelector('input[value="Check"]')).toBeInTheDocument();

    // 2. Initial state check: No radio should be selected (expected to fail currently)
    const checkedInput = container.querySelector('input[type="radio"]:checked');
    expect(checkedInput).toBeNull();

    // 3. Feedback check: Should be present but initially hidden (via CSS/classes)
    const feedbackItem = container.querySelector('#f1');
    expect(feedbackItem).toBeInTheDocument();
    expect(feedbackItem).toHaveTextContent('Feedback 1');
  });
});

