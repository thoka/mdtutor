<script lang="ts">
  import { onMount } from 'svelte';
  import { derived } from 'svelte/store';
  import { createTaskStore } from './stores';
  
  let {
    content = '',
    slug = '',
    step = 0
  }: {
    content: string;
    slug: string;
    step: number;
  } = $props();
  
  let contentDiv: HTMLDivElement;
  let taskStore = $derived(createTaskStore(slug, step));
  
  onMount(() => {
    attachEventHandlers();
  });
  
  $effect(() => {
    // Re-attach handlers when content or step changes
    content;
    step;
    attachEventHandlers();
  });
  
  function attachEventHandlers() {
    if (!contentDiv) return;
    
    // Remove old event listeners by cloning and replacing the contentDiv
    const newContentDiv = contentDiv.cloneNode(true) as HTMLDivElement;
    contentDiv.parentNode?.replaceChild(newContentDiv, contentDiv);
    contentDiv = newContentDiv;
    
    // Handle task checkboxes
    const checkboxes = contentDiv.querySelectorAll('.c-project-task__checkbox');
    checkboxes.forEach((checkbox, index) => {
      const input = checkbox as HTMLInputElement;
      
      // Restore state
      const unsubscribe = taskStore.subscribe(tasks => {
        input.checked = tasks.has(index);
      });
      
      // Save on change
      input.addEventListener('change', () => {
        taskStore.toggle(index);
      });
    });
    
    // Handle collapsible panels
    const panelToggles = contentDiv.querySelectorAll('.js-project-panel__toggle');
    panelToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const panel = (e.target as HTMLElement).closest('.c-project-panel');
        const content = panel?.querySelector('.c-project-panel__content');
        if (content) {
          content.classList.toggle('u-hidden');
        }
      });
    });
  }
</script>

<div class="step-content" bind:this={contentDiv}>
  {@html content}
</div>

<style>
  .step-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
</style>
