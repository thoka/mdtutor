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
  <div class="c-project">
    <div class="c-project__header">
      <div class="c-project__header-content">
        <h1 class="c-project__title">{tutorialData.data.attributes.content.title}</h1>
        <p class="c-project__description">{tutorialData.data.attributes.content.description}</p>
      </div>
    </div>
    
    <Sidebar 
      steps={tutorialData.data.attributes.content.steps}
      currentStep={step}
      {slug}
      onNavigate={handleNavigate}
    />
    
    <div class="c-project__main">
      <div class="c-project__content">
        {#if tutorialData.data.attributes.content.steps[step]}
          {@const currentStepData = tutorialData.data.attributes.content.steps[step]}
          
          <article class="c-project__step">
            <h2 class="c-project__step-title">{currentStepData.title}</h2>
            
            <StepContent
              content={currentStepData.content}
              {slug}
              {step}
            />
          </article>
          
          <nav class="c-project__navigation">
            <button 
              class="c-button c-button--secondary" 
              onclick={handlePrevious}
              disabled={step === 0}
            >
              ← Previous
            </button>
            
            <span class="c-project__step-indicator">
              Step {step + 1} of {tutorialData.data.attributes.content.steps.length}
            </span>
            
            <button 
              class="c-button c-button--primary"
              onclick={handleNext}
              disabled={step === tutorialData.data.attributes.content.steps.length - 1}
            >
              Next →
            </button>
          </nav>
        {/if}
      </div>
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
  
  .c-project {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .c-project__header {
    background: white;
    border-bottom: 1px solid #e0e0e0;
    padding: 1.5rem 2rem;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    height: 80px;
  }
  
  .c-project__title {
    margin: 0;
    font-size: 1.75rem;
    color: #0faeb0;
    font-weight: 600;
  }
  
  .c-project__description {
    margin: 0.5rem 0 0;
    color: #666;
    font-size: 0.95rem;
  }
  
  .c-project__main {
    margin-left: 280px;
    margin-top: 80px;
    min-height: calc(100vh - 80px);
    background: white;
    padding: 2rem;
  }
  
  .c-project__content {
    max-width: 900px;
    margin: 0 auto;
  }
  
  .c-project__step {
    margin-bottom: 3rem;
  }
  
  .c-project__step-title {
    color: #0faeb0;
    font-size: 2rem;
    margin: 0 0 2rem;
    font-weight: 600;
  }
  
  .c-project__step-content {
    /* Content styles from rpl.css */
  }
  
  .c-project__navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid #e0e0e0;
  }
  
  .c-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.2s;
  }
  
  .c-button--primary {
    background: #0faeb0;
    color: white;
  }
  
  .c-button--primary:hover:not(:disabled) {
    background: #0d8d8f;
  }
  
  .c-button--secondary {
    background: #f5f5f5;
    color: #333;
  }
  
  .c-button--secondary:hover:not(:disabled) {
    background: #e0e0e0;
  }
  
  .c-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .c-project__step-indicator {
    font-weight: 600;
    color: #555;
  }
</style>
