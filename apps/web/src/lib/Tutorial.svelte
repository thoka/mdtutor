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
