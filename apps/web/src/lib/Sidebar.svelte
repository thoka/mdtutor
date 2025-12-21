<script lang="ts">
  import { onMount } from 'svelte';
  import { completedSteps } from './stores';
  
  interface Step {
    title: string;
    position: number;
  }
  
  let {
    steps = [],
    currentStep = 0,
    slug = '',
    onNavigate = (step: number) => {}
  }: {
    steps: Step[];
    currentStep: number;
    slug: string;
    onNavigate: (step: number) => void;
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
            class:c-project-navigation__link--is-done={completed.has(step.position)}
            href="#"
            onclick={(e) => { e.preventDefault(); handleStepClick(step.position); }}
          >
            {step.title}
          </a>
        </li>
      {/each}
    </ul>
  </div>
</menu>
