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
      console.log('[quiz] Setting timeout to initialize quiz');
      setTimeout(() => {
        console.log('[quiz] Timeout fired, calling initializeQuiz');
        highlightCode();
        renderScratchBlocks();
        initializeQuiz();
      }, 10); // Small delay to ensure DOM is fully rendered
    }
  });
  
  function initializeQuiz() {
    console.log('[quiz] initializeQuiz called');
    if (!contentDiv) {
      console.log('[quiz] No contentDiv, returning');
      return;
    }
    
    // Find all quiz questions (forms with knowledge-quiz-question class)
    const quizQuestions = Array.from(contentDiv.querySelectorAll('form.knowledge-quiz-question')) as HTMLElement[];
    console.log(`[quiz] Found ${quizQuestions.length} quiz questions`);
    
    if (quizQuestions.length === 0) {
      console.log('[quiz] No quiz questions found, returning');
      return; // No quiz questions found
    }
    
    // Hide all questions initially, show only the first unanswered one
    quizQuestions.forEach((question, index) => {
      console.log(`[quiz] Initializing question ${index + 1}`);
      // Mark as unanswered initially
      question.classList.add('knowledge-quiz-question--unanswered');
      
      // Hide all questions except the first one
      if (index > 0) {
        question.classList.add('knowledge-quiz-question--hidden');
        // Also set inline style as fallback
        question.style.display = 'none';
      } else {
        // Ensure first question is visible
        question.classList.remove('knowledge-quiz-question--hidden');
        question.style.display = '';
      }
      
      const inputs = question.querySelectorAll('input[type="radio"]');
      const feedbacks = question.querySelectorAll('.knowledge-quiz-question__feedback');
      const checkButton = question.querySelector('input[type="button"]') as HTMLInputElement;
      
      console.log(`[quiz] Question ${index + 1}: ${inputs.length} inputs, ${feedbacks.length} feedback containers, checkButton:`, checkButton ? 'found' : 'not found');
      
      // Hide all feedback items initially (CSS handles this via --unanswered class)
      const allFeedbackItems = question.querySelectorAll('.knowledge-quiz-question__feedback-item');
      allFeedbackItems.forEach((item) => {
        item.classList.remove('knowledge-quiz-question__feedback-item--show');
      });
      
      // Initially disable check button
      if (checkButton) {
        checkButton.disabled = true;
        console.log(`[quiz] Question ${index + 1}: Check button disabled initially`);
      }
      
      // Add change listeners to radio inputs (allow changing selection)
      inputs.forEach((input, inputIndex) => {
        const radioInput = input as HTMLInputElement;
        
        // Remove old listener if exists
        const oldListener = (radioInput as any)._quizChangeListener;
        if (oldListener) {
          radioInput.removeEventListener('change', oldListener);
        }
        
        // Add new listener - just enable check button, don't show feedback yet
        const newListener = () => {
          console.log(`[quiz] Question ${index + 1}, Input ${inputIndex + 1}: Selection changed`);
          // Enable check button when an answer is selected
          // Support both button values: "Check my answer" (ours) and "submit" (original API)
          if (checkButton) {
            checkButton.disabled = false;
            console.log(`[quiz] Question ${index + 1}: Check button enabled`);
          }
          // Don't disable inputs yet - allow changing selection
          // If feedback is showing (from incorrect answer), hide it
          const allFeedbackItems = question.querySelectorAll('.knowledge-quiz-question__feedback-item');
          let hiddenCount = 0;
          allFeedbackItems.forEach((item) => {
            if (item.classList.contains('knowledge-quiz-question__feedback-item--show')) {
              item.classList.remove('knowledge-quiz-question__feedback-item--show');
              item.classList.remove('knowledge-quiz-question__feedback-item--correct');
              item.classList.remove('knowledge-quiz-question__feedback-item--incorrect');
              hiddenCount++;
            }
          });
          if (hiddenCount > 0) {
            console.log(`[quiz] Question ${index + 1}: Hid ${hiddenCount} feedback items`);
          }
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
          console.log(`[quiz] Question ${index + 1}: Check button clicked`);
          handleQuizCheck(question, inputs, feedbacks, checkButton);
        };
        (checkButton as any)._quizButtonListener = newButtonListener;
        checkButton.addEventListener('click', newButtonListener);
      }
    });
    console.log('[quiz] initializeQuiz completed');
  }
  
  function handleQuizCheck(question: Element, inputs: NodeListOf<Element>, feedbacks: NodeListOf<Element>, checkButton: HTMLInputElement) {
    console.log('[quiz] handleQuizCheck called');
    
    // Find selected input
    const selectedInput = Array.from(inputs).find((input) => {
      return (input as HTMLInputElement).checked;
    }) as HTMLInputElement;
    
    if (!selectedInput) {
      console.log('[quiz] No answer selected, returning');
      return; // No answer selected
    }
    
    console.log('[quiz] Selected input:', {
      id: selectedInput.id,
      value: selectedInput.value,
      dataCorrect: selectedInput.getAttribute('data-correct'),
      checked: selectedInput.checked
    });
    
    // Check if answer is correct
    const isCorrect = selectedInput.getAttribute('data-correct') === 'true';
    console.log('[quiz] Answer is correct:', isCorrect);
    
    // Hide all feedback items first
    const allFeedbackItems = question.querySelectorAll('.knowledge-quiz-question__feedback-item');
    console.log(`[quiz] Found ${allFeedbackItems.length} feedback items`);
    allFeedbackItems.forEach((item) => {
      item.classList.remove('knowledge-quiz-question__feedback-item--show');
      item.classList.remove('knowledge-quiz-question__feedback-item--correct');
      item.classList.remove('knowledge-quiz-question__feedback-item--incorrect');
    });
    
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
      console.log(`[quiz] Looking for feedback with ID: ${feedbackId}`);
      feedbackItem = question.querySelector(`#${feedbackId}`);
    }
    
    // Fallback: try to find by value if ID matching fails
    if (!feedbackItem) {
      const feedbackId = `feedback-for-choice-${selectedValue}`;
      console.log(`[quiz] Fallback: Looking for feedback with ID: ${feedbackId}`);
      feedbackItem = question.querySelector(`#${feedbackId}`);
    }
    
    console.log('[quiz] Feedback item found:', feedbackItem ? 'yes' : 'no');
    if (feedbackItem) {
      console.log('[quiz] Feedback item ID:', feedbackItem.id);
    }
    
    if (isCorrect) {
      console.log('[quiz] Processing correct answer');
      console.log('[quiz] Processing correct answer');
      // Correct answer: disable inputs, show feedback, mark as answered, show next question
      inputs.forEach((input) => {
        (input as HTMLInputElement).disabled = true;
      });
      checkButton.disabled = true;
      console.log('[quiz] Disabled all inputs and check button');
      
      if (feedbackItem) {
        feedbackItem.classList.add('knowledge-quiz-question__feedback-item--show');
        feedbackItem.classList.add('knowledge-quiz-question__feedback-item--correct');
        console.log('[quiz] Added show and correct classes to feedback');
        
        // Make feedback container visible (should already be visible after removing --unanswered, but ensure it)
        const feedbackContainer = question.querySelector('ul.knowledge-quiz-question__feedback');
        if (feedbackContainer) {
          (feedbackContainer as HTMLElement).style.display = 'block';
          console.log('[quiz] Made feedback container visible via inline style');
        }
      }
      
      // Mark question as answered (remove unanswered class)
      question.classList.remove('knowledge-quiz-question--unanswered');
      question.classList.add('knowledge-quiz-question--answered');
      console.log('[quiz] Marked question as answered');
      
      // Show next unanswered question
      if (!contentDiv) {
        console.log('[quiz] No contentDiv, cannot show next question');
        return;
      }
      const allQuestions = contentDiv.querySelectorAll('.knowledge-quiz-question');
      const currentIndex = Array.from(allQuestions).indexOf(question);
      console.log(`[quiz] Current question index: ${currentIndex}, total questions: ${allQuestions.length}`);
      
      // Find next unanswered question
      let nextQuestionFound = false;
      for (let i = currentIndex + 1; i < allQuestions.length; i++) {
        const nextQuestion = allQuestions[i] as HTMLElement;
        const isUnanswered = nextQuestion.classList.contains('knowledge-quiz-question--unanswered');
        const isHidden = nextQuestion.classList.contains('knowledge-quiz-question--hidden');
        console.log(`[quiz] Question ${i}: unanswered=${isUnanswered}, hidden=${isHidden}`);
        if (isUnanswered) {
          nextQuestion.classList.remove('knowledge-quiz-question--hidden');
          nextQuestion.style.display = ''; // Remove inline style
          console.log(`[quiz] Revealed next question at index ${i}`);
          nextQuestionFound = true;
          break;
        }
      }
      if (!nextQuestionFound) {
        console.log('[quiz] No next unanswered question found');
      }
    } else {
      console.log('[quiz] Processing incorrect answer');
      // Incorrect answer: show feedback, keep inputs enabled, allow changing selection
      if (feedbackItem) {
        feedbackItem.classList.add('knowledge-quiz-question__feedback-item--show');
        feedbackItem.classList.add('knowledge-quiz-question__feedback-item--incorrect');
        console.log('[quiz] Added show and incorrect classes to feedback');
        
        // Make feedback container visible (override --unanswered rule)
        // The container is a <ul> with class "knowledge-quiz-question__feedback"
        const feedbackContainer = question.querySelector('ul.knowledge-quiz-question__feedback');
        if (feedbackContainer) {
          (feedbackContainer as HTMLElement).style.display = 'block';
          console.log('[quiz] Made feedback container visible via inline style');
        } else {
          console.log('[quiz] WARNING: Feedback container not found!');
        }
      }
      
      // Keep inputs enabled so user can change selection
      // Keep check button enabled
      console.log('[quiz] Keeping inputs and check button enabled');
      
      // Add listener to hide feedback when selection changes
      inputs.forEach((input, inputIndex) => {
        const radioInput = input as HTMLInputElement;
        
        // Remove old change listener if exists
        const oldFeedbackListener = (radioInput as any)._quizFeedbackListener;
        if (oldFeedbackListener) {
          radioInput.removeEventListener('change', oldFeedbackListener);
        }
        
        // Add new listener to hide feedback when selection changes
        const newFeedbackListener = () => {
          console.log(`[quiz] Input ${inputIndex + 1} changed after incorrect answer, hiding feedback`);
          // Hide all feedback items
          allFeedbackItems.forEach((item) => {
            item.classList.remove('knowledge-quiz-question__feedback-item--show');
            item.classList.remove('knowledge-quiz-question__feedback-item--correct');
            item.classList.remove('knowledge-quiz-question__feedback-item--incorrect');
          });
          
          // Hide feedback container again (since question is still --unanswered)
          const feedbackContainer = question.querySelector('ul.knowledge-quiz-question__feedback');
          if (feedbackContainer) {
            (feedbackContainer as HTMLElement).style.display = '';
            console.log('[quiz] Hid feedback container again');
          }
          
          // Ensure check button is enabled
          checkButton.disabled = false;
          console.log('[quiz] Feedback hidden, check button enabled');
        };
        (radioInput as any)._quizFeedbackListener = newFeedbackListener;
        radioInput.addEventListener('change', newFeedbackListener);
        console.log(`[quiz] Added feedback listener to input ${inputIndex + 1}`);
      });
    }
    console.log('[quiz] handleQuizCheck completed');
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
