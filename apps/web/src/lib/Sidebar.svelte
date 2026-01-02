<script lang="ts">
  import { onMount } from 'svelte';
  import { completedSteps } from './stores';
  import { userPreferences, toggleAutoAdvance } from './preferences';
  
  interface Step {
    title: string;
    position: number;
  }
  
  let {
    steps = [],
    currentStep = 0,
    slug = '',
    onNavigate = (step: number) => {},
    stepInteractions = {}
  }: {
    steps: Step[];
    currentStep: number;
    slug: string;
    onNavigate: (step: number) => void;
    stepInteractions?: Record<number, { total: number; completed: number; tasks: number; quizzes: number }>;
  } = $props();
  
  let completed = $state<Set<number>>(new Set());
  
  onMount(() => {
    completedSteps.load(slug);
    const unsubscribe = completedSteps.subscribe(value => {
      completed = value;
    });
    return unsubscribe;
  });
  
  function handleStepClick(step: number) {
    onNavigate(step);
    setTimeout(() => {
      const layout = document.getElementById('c-project__layout');
      if (layout) layout.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }
</script>

<menu class="c-sidebar">
  <div class="c-project-navigation">
    <input type="checkbox" class="c-project-navigation__toggle-checkbox" id="c-project-navigation__toggle-checkbox">
    <label for="c-project-navigation__toggle-checkbox" class="c-project-navigation__toggle-label">
      <span class="c-project-navigation__toggle-icon"></span>
    </label>
    <ul class="c-project-navigation__list">
      {#each steps as step, index}
        <li class="c-project-navigation__item">
          <a
            class="c-project-navigation__link"
            class:c-project-navigation__link--is-first={index === 0}
            class:c-project-navigation__link--is-current={step.position === currentStep}
            class:c-project-navigation__link--is-last={index === steps.length - 1}
            class:c-project-navigation__link--is-done={completed.has(step.position) || (stepInteractions[step.position] && stepInteractions[step.position].completed === stepInteractions[step.position].total && stepInteractions[step.position].total > 0)}
            href="#"
            onclick={(e) => { e.preventDefault(); handleStepClick(step.position); }}
          >
            <span class="c-project-navigation__title">{step.title}</span>
            
            {#if stepInteractions[step.position] && stepInteractions[step.position].total > 0}
              {@const interaction = stepInteractions[step.position]}
              <div 
                class="c-step-progress-circle"
                class:c-step-progress-circle--done={interaction.completed === interaction.total}
                class:c-step-progress-circle--in-progress={interaction.completed > 0 && interaction.completed < interaction.total}
                class:c-step-progress-circle--quiz={interaction.quizzes > 0 && interaction.completed < interaction.total}
              >
                {#if interaction.completed !== interaction.total}
                  <div class="c-step-progress-fraction">
                    <span class="c-step-progress-fraction__num">{interaction.completed}</span>
                    <span class="c-step-progress-fraction__sep">/</span>
                    <span class="c-step-progress-fraction__den">{interaction.total}</span>
                  </div>
                {/if}
              </div>
            {/if}
          </a>
        </li>
      {/each}
    </ul>

    <div class="c-sidebar-preferences">
      <label class="c-preference-toggle">
        <input type="checkbox" checked={$userPreferences.autoAdvance} onchange={toggleAutoAdvance}>
        <span class="c-preference-toggle__label">Auto-Scroll / Weiter</span>
      </label>
    </div>
  </div>
</menu>

<style>
  .c-project-navigation__link {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }
  
  .c-project-navigation__title {
    flex: 1;
  }

  .c-sidebar-preferences {
    padding: 1rem;
    margin-top: 1rem;
    border-top: 1px solid #ddd;
    background: #f9f9f9;
  }

  .c-preference-toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.9rem;
    cursor: pointer;
    user-select: none;
  }

  .c-preference-toggle input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
</style>
