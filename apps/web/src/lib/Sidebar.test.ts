import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import Sidebar from './Sidebar.svelte';
import { tick } from 'svelte';

describe('Sidebar Progress Indicators', () => {
  const mockSteps = [
    { title: 'Step 0', position: 0 },
    { title: 'Step 1', position: 1 },
    { title: 'Step 2', position: 2 }
  ];

  it('renders step titles correctly', async () => {
    const { getByText } = render(Sidebar, {
      steps: mockSteps,
      currentStep: 0,
      slug: 'test-slug'
    });

    await tick();
    expect(getByText('Step 0')).toBeInTheDocument();
    expect(getByText('Step 1')).toBeInTheDocument();
    expect(getByText('Step 2')).toBeInTheDocument();
  });

  it('shows individual progress (completed/total) for steps with tasks', async () => {
    const stepInteractions = {
      0: { total: 4, completed: 2, tasks: 4, quizzes: 0 }
    };

    const { container } = render(Sidebar, {
      steps: mockSteps,
      currentStep: 0,
      slug: 'test-slug',
      stepInteractions
    });

    await tick();
    
    // Find the progress indicator for Step 0
    const indicator = container.querySelector('.c-project-navigation__item:nth-child(1) .c-step-progress-circle');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveTextContent('2/4');
    expect(indicator).toHaveClass('c-step-progress-circle--in-progress');
  });

  it('shows a green checkmark when a step is fully completed', async () => {
    const stepInteractions = {
      0: { total: 4, completed: 4, tasks: 4, quizzes: 0 }
    };

    const { container } = render(Sidebar, {
      steps: mockSteps,
      currentStep: 0,
      slug: 'test-slug',
      stepInteractions
    });

    await tick();
    
    const indicator = container.querySelector('.c-project-navigation__item:nth-child(1) .c-step-progress-circle');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('c-step-progress-circle--done');
    // Check for the checkmark icon (assuming it's a span or similar with a specific class or text)
    expect(indicator.querySelector('.material-symbols-sharp')).toHaveTextContent('check');
  });

  it('uses a blue theme for steps containing quizzes', async () => {
    const stepInteractions = {
      1: { total: 2, completed: 1, tasks: 1, quizzes: 1 }
    };

    const { container } = render(Sidebar, {
      steps: mockSteps,
      currentStep: 0,
      slug: 'test-slug',
      stepInteractions
    });

    await tick();
    
    const indicator = container.querySelector('.c-project-navigation__item:nth-child(2) .c-step-progress-circle');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('c-step-progress-circle--quiz');
    expect(indicator).toHaveTextContent('1/2');
  });
});
