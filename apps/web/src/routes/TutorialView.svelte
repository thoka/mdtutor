<script lang="ts">
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import Sidebar from '../lib/Sidebar.svelte';
  import StepContent from '../lib/StepContent.svelte';
  import { tutorial, loading, error, currentStep, completedSteps } from '../lib/stores';
  
  let { params = {} }: { params?: { slug?: string; step?: string } } = $props();
  
  let tutorialData = $state<any>(null);
  let isLoading = $state(true);
  let errorMsg = $state<string | null>(null);
  let step = $state(0);
  let slug = $state('silly-eyes');
  
  $effect(() => {
    slug = params.slug || 'silly-eyes';
    step = params.step ? parseInt(params.step) : 0;
    currentStep.set(step);
  });
  
  onMount(async () => {
    await loadTutorial();
  });
  
  async function loadTutorial() {
    isLoading = true;
    errorMsg = null;
    
    try {
      const response = await fetch(`/api/projects/${slug}?lang=en`);
      if (!response.ok) {
        throw new Error(`Failed to load tutorial: ${response.statusText}`);
      }
      tutorialData = await response.json();
      tutorial.set(tutorialData);
      completedSteps.load(slug);
      
      // Validate step number
      if (tutorialData && step >= tutorialData.data.attributes.content.steps.length) {
        step = 0;
        push(`/${slug}/0`);
      }
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Unknown error';
      error.set(errorMsg);
    } finally {
      isLoading = false;
      loading.set(false);
    }
  }
  
  function handleNavigate(newStep: number) {
    push(`/${slug}/${newStep}`);
  }
  
  function handlePrevious() {
    if (step > 0) {
      push(`/${slug}/${step - 1}`);
    }
  }
  
  function handleNext() {
    if (tutorialData && step < tutorialData.data.attributes.content.steps.length - 1) {
      completedSteps.complete(slug, step);
      push(`/${slug}/${step + 1}`);
    }
  }
</script>

{#if isLoading}
  <div class="loading">Loading tutorial...</div>
{:else if errorMsg}
  <div class="error">Error: {errorMsg}</div>
{:else if tutorialData}
  <div class="tutorial-view">
    <header class="header">
      <h1>{tutorialData.data.attributes.content.title}</h1>
      <p class="description">{tutorialData.data.attributes.content.description}</p>
    </header>
    
    <Sidebar 
      steps={tutorialData.data.attributes.content.steps}
      currentStep={step}
      {slug}
      onNavigate={handleNavigate}
    />
    
    <div class="content-wrapper">
      {#if tutorialData.data.attributes.content.steps[step]}
        {@const currentStepData = tutorialData.data.attributes.content.steps[step]}
        
        <StepContent 
          content={currentStepData.content}
          {slug}
          {step}
        />
        
        <nav class="step-navigation">
          <button 
            class="nav-btn prev" 
            onclick={handlePrevious}
            disabled={step === 0}
          >
            ← Previous
          </button>
          
          <span class="step-indicator">
            Step {step + 1} of {tutorialData.data.attributes.content.steps.length}
          </span>
          
          <button 
            class="nav-btn next"
            onclick={handleNext}
            disabled={step === tutorialData.data.attributes.content.steps.length - 1}
          >
            Next →
          </button>
        </nav>
      {/if}
    </div>
  </div>
{/if}

<style>
  .loading, .error {
    text-align: center;
    padding: 3rem 2rem;
    font-size: 1.2rem;
  }
  
  .error {
    color: #c41e3a;
  }
  
  .tutorial-view {
    min-height: 100vh;
  }
  
  .header {
    background: white;
    border-bottom: 1px solid #e0e0e0;
    padding: 1.5rem 2rem;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    height: 60px;
  }
  
  .header h1 {
    margin: 0;
    font-size: 1.5rem;
    color: #0faeb0;
  }
  
  .description {
    display: none;
  }
  
  .content-wrapper {
    margin-left: 250px;
    margin-top: 60px;
    min-height: calc(100vh - 60px);
    background: white;
  }
  
  .step-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 800px;
    margin: 3rem auto 2rem;
    padding: 0 2rem 2rem;
    border-top: 1px solid #e0e0e0;
    padding-top: 2rem;
  }
  
  .nav-btn {
    padding: 0.75rem 1.5rem;
    background: #0faeb0;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: background 0.2s;
  }
  
  .nav-btn:hover:not(:disabled) {
    background: #0d8d8f;
  }
  
  .nav-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  .step-indicator {
    font-weight: 600;
    color: #555;
  }
</style>
