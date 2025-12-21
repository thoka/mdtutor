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

<aside class="sidebar">
  <div class="step-list">
    {#each steps as step}
      <button
        class="step-item"
        class:active={step.position === currentStep}
        class:completed={completed.has(step.position)}
        onclick={() => handleStepClick(step.position)}
      >
        <span class="step-number">{step.position + 1}</span>
        <span class="step-title">{step.title}</span>
        {#if completed.has(step.position)}
          <span class="checkmark">✓</span>
        {/if}
      </button>
    {/each}
  </div>
</aside>

<style>
  .sidebar {
    position: fixed;
    left: 0;
    top: 60px;
    width: 250px;
    height: calc(100vh - 60px);
    background: #fff;
    border-right: 1px solid #e0e0e0;
    overflow-y: auto;
  }
  
  .step-list {
    padding: 1rem 0;
  }
  
  .step-item {
    width: 100%;
    padding: 0.75rem 1rem;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: background 0.2s;
    font-size: 0.9rem;
  }
  
  .step-item:hover {
    background: #f5f5f5;
  }
  
  .step-item.active {
    background: #e3f2fd;
    border-left: 3px solid #0faeb0;
  }
  
  .step-number {
    min-width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e0e0e0;
    border-radius: 50%;
    font-size: 0.75rem;
    font-weight: 600;
  }
  
  .step-item.completed .step-number {
    background: #0faeb0;
    color: white;
  }
  
  .step-item.active .step-number {
    background: #0faeb0;
    color: white;
  }
  
  .step-title {
    flex: 1;
    color: #333;
  }
  
  .checkmark {
    color: #0faeb0;
    font-weight: bold;
  }
</style>
