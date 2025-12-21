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

<aside class="c-project__sidebar">
  <nav class="c-project__steps">
    {#each steps as step}
      <button
        class="c-project__step-link"
        class:c-project__step-link--active={step.position === currentStep}
        class:c-project__step-link--completed={completed.has(step.position)}
        onclick={() => handleStepClick(step.position)}
      >
        <span class="c-project__step-number">{step.position + 1}</span>
        <span class="c-project__step-name">{step.title}</span>
        {#if completed.has(step.position)}
          <span class="c-project__step-check">✓</span>
        {/if}
      </button>
    {/each}
  </nav>
</aside>

<style>
  .c-project__sidebar {
    position: fixed;
    left: 0;
    top: 80px;
    width: 280px;
    height: calc(100vh - 80px);
    background: #fff;
    border-right: 1px solid #e0e0e0;
    overflow-y: auto;
  }
  
  .c-project__steps {
    padding: 1rem 0;
  }
  
  .c-project__step-link {
    width: 100%;
    padding: 1rem 1.5rem;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: background 0.2s;
    font-size: 0.95rem;
    border-left: 3px solid transparent;
  }
  
  .c-project__step-link:hover {
    background: #f5f5f5;
  }
  
  .c-project__step-link--active {
    background: #e3f2fd;
    border-left-color: #0faeb0;
  }
  
  .c-project__step-number {
    min-width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e0e0e0;
    border-radius: 50%;
    font-size: 0.85rem;
    font-weight: 600;
    flex-shrink: 0;
  }
  
  .c-project__step-link--completed .c-project__step-number {
    background: #0faeb0;
    color: white;
  }
  
  .c-project__step-link--active .c-project__step-number {
    background: #0faeb0;
    color: white;
  }
  
  .c-project__step-name {
    flex: 1;
    color: #333;
    line-height: 1.3;
  }
  
  .c-project__step-check {
    color: #0faeb0;
    font-weight: bold;
    font-size: 1.2rem;
  }
</style>
