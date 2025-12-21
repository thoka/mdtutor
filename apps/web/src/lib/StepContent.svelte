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
    if (!contentDiv) return;
    
    contentDiv.addEventListener('click', handleClick);
    
    return () => {
      if (contentDiv) {
        contentDiv.removeEventListener('click', handleClick);
      }
    };
  });
  
  function handleClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    const toggle = target.closest('.js-project-panel__toggle');
    
    if (toggle) {
      e.preventDefault();
      const panel = toggle.closest('.c-project-panel');
      const content = panel?.querySelector('.c-project-panel__content');
      if (content) {
        content.classList.toggle('u-hidden');
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

<div class="c-project__step-content" bind:this={contentDiv}>
  {@html content}
</div>
