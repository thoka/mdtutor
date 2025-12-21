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
    console.log('[StepContent] onMount - attaching event delegation');
    // Use event delegation for panel toggles
    contentDiv.addEventListener('click', handleClick);
    
    return () => {
      console.log('[StepContent] cleanup - removing event listener');
      contentDiv.removeEventListener('click', handleClick);
    };
  });
  
  function handleClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    console.log('[StepContent] click detected on:', target.tagName, target.className);
    
    // Check if clicked element or its parent has the toggle class
    const toggle = target.closest('.js-project-panel__toggle');
    console.log('[StepContent] closest toggle element:', toggle);
    
    if (toggle) {
      console.log('[StepContent] panel toggle clicked!');
      e.preventDefault();
      const panel = toggle.closest('.c-project-panel');
      const content = panel?.querySelector('.c-project-panel__content');
      console.log('[StepContent] panel:', panel, 'content:', content);
      if (content) {
        const wasHidden = content.classList.contains('u-hidden');
        content.classList.toggle('u-hidden');
        console.log('[StepContent] toggled u-hidden:', wasHidden, '->', !wasHidden);
      }
    }
  }
  
  $effect(() => {
    // Re-attach task checkbox handlers when content or step changes
    content;
    step;
    attachTaskHandlers();
  });
  
  function attachTaskHandlers() {
    if (!contentDiv) return;
    
    // Handle task checkboxes
    const checkboxes = contentDiv.querySelectorAll('.c-project-task__checkbox');
    checkboxes.forEach((checkbox, index) => {
      const input = checkbox as HTMLInputElement;
      
      // Restore state
      taskStore.subscribe(tasks => {
        input.checked = tasks.has(index);
      });
      
      // Remove old listener if exists
      const oldListener = (input as any)._changeListener;
      if (oldListener) {
        input.removeEventListener('change', oldListener);
      }
      
      // Add new listener
      const newListener = () => {
        taskStore.toggle(index);
      };
      (input as any)._changeListener = newListener;
      input.addEventListener('change', newListener);
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
