<script lang="ts">
  import { onMount } from 'svelte';
  
  interface Step {
    title: string;
    content: string;
    position: number;
    completion: string[];
  }
  
  interface TutorialData {
    data: {
      attributes: {
        content: {
          title: string;
          description: string;
          heroImage: string;
          steps: Step[];
        }
      }
    }
  }
  
  let {
    slug = 'silly-eyes',
    lang = 'en'
  }: {
    slug: string;
    lang?: string;
  } = $props();
  
  let tutorial = $state<TutorialData | null>(null);
  let currentStep = $state(0);
  let loading = $state(true);
  let error = $state<string | null>(null);
  
  onMount(async () => {
    try {
      const response = await fetch(`/api/projects/${slug}?lang=${lang}`);
      if (!response.ok) {
        throw new Error(`Failed to load tutorial: ${response.statusText}`);
      }
      tutorial = await response.json();
      loading = false;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error';
      loading = false;
    }
  });
  
  function nextStep() {
    if (tutorial && currentStep < tutorial.data.attributes.content.steps.length - 1) {
      currentStep++;
    }
  }
  
  function prevStep() {
    if (currentStep > 0) {
      currentStep--;
    }
  }
</script>

{#if loading}
  <div class="loading">Loading tutorial...</div>
{:else if error}
  <div class="error">Error: {error}</div>
{:else if tutorial}
  <div class="tutorial">
    <header class="tutorial-header">
      <h1>{tutorial.data.attributes.content.title}</h1>
      <p class="description">{tutorial.data.attributes.content.description}</p>
    </header>
    
    <nav class="step-nav">
      <button onclick={prevStep} disabled={currentStep === 0}>← Previous</button>
      <span class="step-indicator">
        Step {currentStep + 1} of {tutorial.data.attributes.content.steps.length}
      </span>
      <button 
        onclick={nextStep} 
        disabled={currentStep === tutorial.data.attributes.content.steps.length - 1}
      >
        Next →
      </button>
    </nav>
    
    {#if tutorial.data.attributes.content.steps[currentStep]}
      {@const step = tutorial.data.attributes.content.steps[currentStep]}
      <article class="step-content">
        <h2>{step.title}</h2>
        <div class="content">
          {@html step.content}
        </div>
      </article>
    {/if}
  </div>
{/if}

<style>
  .loading, .error {
    text-align: center;
    padding: 2rem;
    font-size: 1.2rem;
  }
  
  .error {
    color: #c41e3a;
  }
  
  .tutorial {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
  
  .tutorial-header {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #eee;
  }
  
  .tutorial-header h1 {
    margin: 0 0 0.5rem 0;
    color: #333;
  }
  
  .description {
    color: #666;
    font-size: 1.1rem;
    margin: 0;
  }
  
  .step-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1rem;
    background: #f5f5f5;
    border-radius: 8px;
  }
  
  .step-nav button {
    padding: 0.5rem 1rem;
    background: #0faeb0;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .step-nav button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  .step-nav button:not(:disabled):hover {
    background: #0d8d8f;
  }
  
  .step-indicator {
    font-weight: 600;
    color: #555;
  }
  
  .step-content h2 {
    color: #0faeb0;
    margin-bottom: 1.5rem;
  }
  
  .content :global(h3) {
    color: #555;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
  
  .content :global(.c-project-task) {
    border-left: 4px solid #0faeb0;
    padding: 1rem;
    margin: 1.5rem 0;
    background: #f0f9f9;
  }
  
  .content :global(.c-project-panel--ingredient) {
    border: 1px solid #ddd;
    border-radius: 8px;
    margin: 1.5rem 0;
    overflow: hidden;
  }
  
  .content :global(.c-project-panel__heading) {
    background: #f5f5f5;
    padding: 1rem;
    cursor: pointer;
    font-weight: 600;
    margin: 0;
  }
  
  .content :global(.c-project-panel__content) {
    padding: 1rem;
  }
  
  .content :global(code) {
    background: #f4f4f4;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
  }
  
  .content :global(pre) {
    background: #f4f4f4;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
  }
  
  .content :global(img) {
    max-width: 100%;
    height: auto;
  }
  
  @media print {
    .content :global(.u-no-print) {
      display: none;
    }
    
    .content :global(.u-print-only) {
      display: block;
    }
  }
</style>
