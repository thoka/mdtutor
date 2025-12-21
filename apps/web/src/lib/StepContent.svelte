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
        initializeQuiz();
      }, 0);
    }
  });
  
  function initializeQuiz() {
    if (!contentDiv) return;
    
    // Find all quiz questions
    const quizQuestions = contentDiv.querySelectorAll('.knowledge-quiz-question');
    
    quizQuestions.forEach((question, index) => {
      // Mark as unanswered initially
      question.classList.add('knowledge-quiz-question--unanswered');
      
      const inputs = question.querySelectorAll('input[type="radio"]');
      const feedbacks = question.querySelectorAll('.knowledge-quiz-question__feedback');
      const checkButton = question.querySelector('input[type="button"]') as HTMLInputElement;
      
      // Hide all feedback items initially (CSS handles this via --unanswered class)
      const allFeedbackItems = question.querySelectorAll('.knowledge-quiz-question__feedback-item');
      allFeedbackItems.forEach((item) => {
        item.classList.remove('knowledge-quiz-question__feedback-item--show');
      });
      
      // Initially disable check button
      if (checkButton) {
        checkButton.disabled = true;
      }
      
      // Add change listeners to radio inputs (allow changing selection)
      inputs.forEach((input) => {
        const radioInput = input as HTMLInputElement;
        
        // Remove old listener if exists
        const oldListener = (radioInput as any)._quizChangeListener;
        if (oldListener) {
          radioInput.removeEventListener('change', oldListener);
        }
        
        // Add new listener - just enable check button, don't show feedback yet
        const newListener = () => {
          // Enable check button when an answer is selected
          // Support both button values: "Check my answer" (ours) and "submit" (original API)
          if (checkButton) {
            checkButton.disabled = false;
          }
          // Don't disable inputs yet - allow changing selection
        };
        (radioInput as any)._quizChangeListener = newListener;
        radioInput.addEventListener('change', newListener);
      });
      
      // Add click listener to check button
      if (checkButton) {
        const oldButtonListener = (checkButton as any)._quizButtonListener;
        if (oldButtonListener) {
          checkButton.removeEventListener('click', oldButtonListener);
        }
        
        const newButtonListener = () => {
          handleQuizCheck(question, inputs, feedbacks, checkButton);
        };
        (checkButton as any)._quizButtonListener = newButtonListener;
        checkButton.addEventListener('click', newButtonListener);
      }
    });
  }
  
  function handleQuizCheck(question: Element, inputs: NodeListOf<Element>, feedbacks: NodeListOf<Element>, checkButton: HTMLInputElement) {
    // Find selected input
    const selectedInput = Array.from(inputs).find((input) => {
      return (input as HTMLInputElement).checked;
    }) as HTMLInputElement;
    
    if (!selectedInput) {
      return; // No answer selected
    }
    
    // Hide all feedback items first
    const allFeedbackItems = question.querySelectorAll('.knowledge-quiz-question__feedback-item');
    allFeedbackItems.forEach((item) => {
      item.classList.remove('knowledge-quiz-question__feedback-item--show');
    });
    
    // Disable all inputs in this question (after check)
    inputs.forEach((input) => {
      (input as HTMLInputElement).disabled = true;
    });
    
    // Disable check button
    checkButton.disabled = true;
    
    // Show feedback for selected answer
    // Original API structure: feedback-for-choice-X ID on feedback item
    // The value is 1-based (matches choice number)
    const selectedValue = selectedInput.value;
    const selectedId = selectedInput.id;
    
    let feedbackItem: Element | null = null;
    
    // Extract choice number from ID (e.g., "choice-1" -> "1")
    // The value should match the choice number (1-based)
    const choiceMatch = selectedId.match(/choice-(\d+)/);
    if (choiceMatch) {
      const choiceNum = choiceMatch[1];
      const feedbackId = `feedback-for-choice-${choiceNum}`;
      feedbackItem = question.querySelector(`#${feedbackId}`);
    }
    
    // Fallback: try to find by value if ID matching fails
    if (!feedbackItem) {
      const feedbackId = `feedback-for-choice-${selectedValue}`;
      feedbackItem = question.querySelector(`#${feedbackId}`);
    }
    
    if (feedbackItem) {
      feedbackItem.classList.add('knowledge-quiz-question__feedback-item--show');
      
      // Add correct/incorrect styling based on checked attribute (original API)
      // In original API, correct answer has checked attribute
      const isCorrect = selectedInput.hasAttribute('checked');
      if (isCorrect) {
        feedbackItem.classList.add('knowledge-quiz-question__feedback-item--correct');
      } else {
        feedbackItem.classList.add('knowledge-quiz-question__feedback-item--incorrect');
      }
    }
    
    // Mark question as answered (remove unanswered class)
    question.classList.remove('knowledge-quiz-question--unanswered');
    question.classList.add('knowledge-quiz-question--answered');
  }
  
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
