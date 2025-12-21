<script lang="ts">
  import { onMount } from 'svelte';
  import { derived } from 'svelte/store';
  import { createTaskStore } from './stores';
  import Prism from 'prismjs';
  import 'prismjs/themes/prism-tomorrow.css';
  import 'prismjs/components/prism-python.js';
  import 'prismjs/components/prism-bash.js';
  import 'prismjs/components/prism-javascript.js';
  import 'prismjs/components/prism-json.js';
  import 'prismjs/components/prism-markdown.js';
  
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
    highlightCode();
    
    return () => {
      if (contentDiv) {
        contentDiv.removeEventListener('click', handleClick);
      }
    };
  });
  
  function highlightCode() {
    if (!contentDiv) return;
    // Find all code blocks within the content div and highlight them
    const codeBlocks = contentDiv.querySelectorAll('pre code[class*="language-"]');
    codeBlocks.forEach((block) => {
      Prism.highlightElement(block as HTMLElement);
    });
  }
  
  $effect(() => {
    // Re-highlight when content changes
    content;
    step;
    if (contentDiv) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        highlightCode();
      }, 0);
    }
  });
  
  function handleClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    const toggle = target.closest('.js-project-panel__toggle');
    
    if (toggle) {
      e.preventDefault();
      const panel = toggle.closest('.c-project-panel');
      const content = panel?.querySelector('.c-project-panel__content');
      const heading = toggle as HTMLElement;
      
      if (content) {
        const isHidden = content.classList.contains('u-hidden');
        content.classList.toggle('u-hidden');
        
        // Toggle the close icon class on the heading
        // When panel is open (not hidden), show minus (-), otherwise show plus (+)
        if (isHidden) {
          // Opening: add the close icon class to show minus
          heading.classList.add('c-project-panel__heading--has-close-icon');
        } else {
          // Closing: remove the close icon class to show plus
          heading.classList.remove('c-project-panel__heading--has-close-icon');
        }
      }
    }
  }
  
  $effect(() => {
    // Re-attach task checkbox handlers when content or step changes
    content;
    step;
    attachTaskHandlers();
    initializePanelStates();
  });
  
  function initializePanelStates() {
    if (!contentDiv) return;
    
    // Initialize panel heading states based on content visibility
    const panels = contentDiv.querySelectorAll('.c-project-panel');
    panels.forEach((panel) => {
      const heading = panel.querySelector('.c-project-panel__heading.js-project-panel__toggle') as HTMLElement;
      const content = panel.querySelector('.c-project-panel__content');
      
      if (heading && content) {
        const isHidden = content.classList.contains('u-hidden');
        // If panel is open (not hidden), add the close icon class
        if (!isHidden) {
          heading.classList.add('c-project-panel__heading--has-close-icon');
        } else {
          heading.classList.remove('c-project-panel__heading--has-close-icon');
        }
      }
    });
  }
  
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
