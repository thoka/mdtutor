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
  import scratchblocks from 'scratchblocks';
  
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
  
  function highlightCode() {
    if (!contentDiv) return;
    // Find all code blocks within the content div and highlight them
    // Exclude blocks3 as they are rendered by scratchblocks
    const codeBlocks = contentDiv.querySelectorAll('pre code[class*="language-"]:not([class*="language-blocks3"])');
    codeBlocks.forEach((block) => {
      Prism.highlightElement(block as HTMLElement);
    });
  }
  
  function renderScratchBlocks() {
    if (!contentDiv) return;
    
    // Find all pre elements with language-blocks3 class (on pre or code inside)
    const blocks3Pre = contentDiv.querySelectorAll('pre.language-blocks3, pre code.language-blocks3');
    
    // Use parse() and render() directly to have full control over whitespace preservation
    // Process each element individually
    blocks3Pre.forEach((element) => {
      const preElement = element.tagName === 'CODE' ? element.closest('pre') : element;
      
      if (!preElement) return;
      
      // Skip if already rendered
      if (preElement.querySelector('svg') !== null) return;
      
      try {
        // Get text content directly, preserving all whitespace
        const codeElement = preElement.querySelector('code');
        const codeText = codeElement ? codeElement.textContent : preElement.textContent;
        
        if (!codeText || !codeText.trim()) return;
        
        // Parse the text into a Document object
        const doc = scratchblocks.parse(codeText, {
          languages: ['en']
        });
        
        // Clear the pre element and ensure className is clean
        preElement.innerHTML = '';
        
        // Clean up className - remove any whitespace-only or empty class names
        const currentClasses = (preElement.className || '')
          .split(/\s+/)
          .filter(c => c && c.trim() && !c.includes(' '))
          .filter(c => c !== 'scratchblocks');
        
        // Add scratchblocks class and set clean className
        preElement.className = [...currentClasses, 'scratchblocks'].filter(Boolean).join(' ').trim();
        
        // Double-check className is clean before render
        const finalClassName = preElement.className
          .split(/\s+/)
          .filter(c => c && c.trim() && !c.includes(' ') && !c.includes('\n') && !c.includes('\t'))
          .filter(c => c !== 'scratchblocks');
        preElement.className = [...finalClassName, 'scratchblocks'].filter(Boolean).join(' ').trim();
        
        // Patch classList.add globally to sanitize class names before adding them
        // This prevents errors when scratchblocks tries to add classes with whitespace
        const originalAdd = DOMTokenList.prototype.add;
        const patchApplied = Symbol('patchApplied');
        
        if (!(DOMTokenList.prototype as any)[patchApplied]) {
          DOMTokenList.prototype.add = function(...tokens) {
            // Sanitize tokens - replace whitespace with hyphens and remove invalid characters
            const sanitized = tokens.map(token => {
              if (typeof token !== 'string') return token;
              // Replace whitespace with hyphens, remove other invalid characters
              const cleaned = token.replace(/\s+/g, '-').replace(/[^\w-]/g, '');
              // Remove leading/trailing hyphens and collapse multiple hyphens
              return cleaned.replace(/^-+|-+$/g, '').replace(/-+/g, '-');
            }).filter(t => t && typeof t === 'string' && t.length > 0);
            
            if (sanitized.length > 0) {
              return originalAdd.apply(this, sanitized);
            }
          };
          (DOMTokenList.prototype as any)[patchApplied] = true;
        }
        
        // render() returns an SVG element - we need to append it to the preElement
        const svg = scratchblocks.render(doc, {
          style: 'scratch3',
          scale: 0.675
        });
        preElement.appendChild(svg);
      } catch (error) {
        // Silently fail - don't break the page if scratchblocks rendering fails
      }
    });
  }
  
  $effect(() => {
    // Re-highlight and re-render when content changes
    content;
    step;
    if (contentDiv) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        highlightCode();
        renderScratchBlocks();
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
