<script lang="ts">
  import { onMount } from 'svelte';
  import { derived } from 'svelte/store';
  import { trackAction } from './achievements';
  import { createTaskStore } from './stores';
  import { userPreferences } from './preferences';
  import type { UserState } from './progress';
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
    gid = '',
    step = 0,
    userActionsOrState = [],
    onCompleteStep = () => {}
  }: {
    content: string;
    slug: string;
    gid?: string;
    step: number;
    userActionsOrState?: any[] | UserState;
    onCompleteStep?: () => void;
  } = $props();
  
  let contentDiv: HTMLDivElement;
  let taskStore = $derived(createTaskStore(slug, step, gid, userActionsOrState));
  
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
    const codeBlocks = contentDiv.querySelectorAll('pre code[class*="language-"]:not([class*="language-blocks3"])');
    codeBlocks.forEach((block) => {
      Prism.highlightElement(block as HTMLElement);
    });
  }
  
  function renderScratchBlocks() {
    if (!contentDiv) return;
    const blocks3Pre = contentDiv.querySelectorAll('pre.language-blocks3, pre code.language-blocks3');
    blocks3Pre.forEach((element) => {
      const preElement = element.tagName === 'CODE' ? element.closest('pre') : element;
      if (!preElement) return;
      if (preElement.querySelector('svg') !== null) return;
      try {
        const codeElement = preElement.querySelector('code');
        const codeText = codeElement ? codeElement.textContent : preElement.textContent;
        if (!codeText || !codeText.trim()) return;
        const doc = scratchblocks.parse(codeText, { languages: ['en'] });
        preElement.innerHTML = '';
        const currentClasses = (preElement.className || '').split(/\s+/).filter(c => c && c.trim() && !c.includes(' ')).filter(c => c !== 'scratchblocks');
        preElement.className = [...currentClasses, 'scratchblocks'].filter(Boolean).join(' ').trim();
        const svg = scratchblocks.render(doc, { style: 'scratch3', scale: 0.675 });
        preElement.appendChild(svg);
      } catch (error) {}
    });
  }
  
  $effect(() => {
    content;
    step;
    if (contentDiv) {
      setTimeout(() => {
        if (!contentDiv) return;
        highlightCode();
        renderScratchBlocks();
        const existingQuestions = contentDiv.querySelectorAll('form.knowledge-quiz-question');
        if (existingQuestions.length > 0) {
          const firstQuestion = existingQuestions[0] as HTMLElement;
          const firstCheckButton = firstQuestion.querySelector('input[type="button"]') as HTMLInputElement;
          const isInitialized = firstCheckButton && (firstCheckButton as any)._quizButtonListener;
          if (!isInitialized) initializeQuiz();
        } else initializeQuiz();
      }, 10);
    }
  });
  
  function initializeQuiz() {
    if (!contentDiv) return;
    const quizQuestions = Array.from(contentDiv.querySelectorAll('form.knowledge-quiz-question')) as HTMLElement[];
    if (quizQuestions.length === 0) return;
    quizQuestions.forEach((question, index) => {
      if (!question.classList.contains('knowledge-quiz-question--answered')) {
        question.classList.add('knowledge-quiz-question--unanswered');
        const inputs = question.querySelectorAll('input[type="radio"]');
        inputs.forEach(input => { (input as HTMLInputElement).checked = false; });
      }
      const isAnswered = question.classList.contains('knowledge-quiz-question--answered');
      if (index > 0 && !isAnswered) {
        question.classList.add('knowledge-quiz-question--hidden');
        question.style.display = 'none';
      } else {
        question.classList.remove('knowledge-quiz-question--hidden');
        question.style.display = '';
      }
      const inputs = question.querySelectorAll('input[type="radio"]');
      const feedbacks = question.querySelectorAll('.knowledge-quiz-question__feedback');
      const checkButton = question.querySelector('input[type="button"]') as HTMLInputElement;
      if (checkButton) {
        const anyChecked = Array.from(inputs).some(input => (input as HTMLInputElement).checked);
        checkButton.disabled = !anyChecked;
      }
      inputs.forEach((input) => {
        const radioInput = input as HTMLInputElement;
        radioInput.addEventListener('change', () => {
          if (checkButton) checkButton.disabled = false;
        });
      });
      if (checkButton) {
        checkButton.addEventListener('click', () => handleQuizCheck(question, inputs, feedbacks, checkButton));
      }
    });
  }
  
  function handleQuizCheck(question: Element, inputs: NodeListOf<Element>, feedbacks: NodeListOf<Element>, checkButton: HTMLInputElement) {
    const selectedInput = Array.from(inputs).find((input) => (input as HTMLInputElement).checked) as HTMLInputElement;
    if (!selectedInput) return;
    const isCorrect = selectedInput.getAttribute('data-correct') === 'true';
    const quizQuestions = Array.from(contentDiv.querySelectorAll('form.knowledge-quiz-question'));
    const questionIndex = quizQuestions.indexOf(question as HTMLFormElement);
    trackAction('quiz_attempt', gid || slug, { step, question_index: questionIndex, is_correct: isCorrect, selected_value: selectedInput.value });
    if (isCorrect) {
      trackAction('quiz_success', gid || slug, { step, question_index: questionIndex });
      inputs.forEach((input) => { (input as HTMLInputElement).disabled = true; });
      checkButton.disabled = true;
      const selectedIndex = Array.from(inputs).indexOf(selectedInput);
      const feedbackItem = question.querySelectorAll('.knowledge-quiz-question__feedback-item')[selectedIndex];
      if (feedbackItem) {
        (feedbackItem as HTMLElement).classList.add('knowledge-quiz-question__feedback-item--show', 'knowledge-quiz-question__feedback-item--correct');
        (feedbackItem as HTMLElement).style.setProperty('display', 'list-item', 'important');
      }
      question.classList.remove('knowledge-quiz-question--unanswered');
      question.classList.add('knowledge-quiz-question--answered');
      const allQuestions = contentDiv.querySelectorAll('form.knowledge-quiz-question');
      const currentIndex = Array.from(allQuestions).indexOf(question);
      for (let i = currentIndex + 1; i < allQuestions.length; i++) {
        const nextQuestion = allQuestions[i] as HTMLElement;
        if (!nextQuestion.classList.contains('knowledge-quiz-question--answered')) {
          nextQuestion.classList.remove('knowledge-quiz-question--hidden');
          nextQuestion.style.removeProperty('display');
          break;
        }
      }
    } else {
      const selectedIndex = Array.from(inputs).indexOf(selectedInput);
      const feedbackItem = question.querySelectorAll('.knowledge-quiz-question__feedback-item')[selectedIndex];
      if (feedbackItem) {
        (feedbackItem as HTMLElement).classList.add('knowledge-quiz-question__feedback-item--show', 'knowledge-quiz-question__feedback-item--incorrect');
        (feedbackItem as HTMLElement).style.setProperty('display', 'list-item', 'important');
      }
    }
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
        if (isHidden) heading.classList.add('c-project-panel__heading--has-close-icon');
        else heading.classList.remove('c-project-panel__heading--has-close-icon');
      }
    }
  }
  
  function attachScratchHandlers() {
    if (!contentDiv) return;
    const previews = contentDiv.querySelectorAll('.scratch-preview');
    previews.forEach(preview => {
      const iframe = preview.querySelector('iframe');
      if (iframe) {
        if (preview.querySelector('.scratch-play-overlay')) return;
        const overlay = document.createElement('div');
        overlay.className = 'scratch-play-overlay';
        overlay.innerHTML = '<span class="material-symbols-sharp">play_circle</span>';
        overlay.style.cssText = `position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; color: white; font-size: 80px;`;
        preview.style.position = 'relative';
        preview.appendChild(overlay);
        overlay.addEventListener('click', () => {
          const scratchId = iframe.src.match(/projects\/embed\/(\d+)/)?.[1] || 'unknown';
          trackAction('scratch_start', gid || slug, { step, scratch_id: scratchId });
          overlay.remove();
          if (iframe.src.includes('autostart=false')) iframe.src = iframe.src.replace('autostart=false', 'autostart=true');
        });
      }
    });
  }

  function handleAutoAdvance(currentIndex: number) {
    if (!$userPreferences.autoAdvance) return;
    
    const checkboxes = Array.from(contentDiv.querySelectorAll('.c-project-task__checkbox')) as HTMLInputElement[];
    const nextUncheckedIndex = checkboxes.findIndex((cb, idx) => idx > currentIndex && !cb.checked);
    
    if (nextUncheckedIndex !== -1) {
      // Scroll to the next task
      const nextTask = checkboxes[nextUncheckedIndex].closest('.c-project-task');
      if (nextTask) {
        nextTask.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      // No more unchecked tasks in this step
      onCompleteStep();
    }
  }

  $effect(() => {
    content; step; userActionsOrState;
    attachTaskHandlers();
    attachScratchHandlers();
    initializePanelStates();
    return () => {
      if (contentDiv) {
        const checkboxes = contentDiv.querySelectorAll('.c-project-task__checkbox');
        checkboxes.forEach(input => { if ((input as any)._unsubscribe) (input as any)._unsubscribe(); });
      }
    };
  });
  
  function initializePanelStates() {
    if (!contentDiv) return;
    const panels = contentDiv.querySelectorAll('.c-project-panel');
    panels.forEach((panel) => {
      const heading = panel.querySelector('.c-project-panel__heading.js-project-panel__toggle') as HTMLElement;
      const content = panel.querySelector('.c-project-panel__content');
      if (heading && content) {
        const isHidden = content.classList.contains('u-hidden');
        if (!isHidden) heading.classList.add('c-project-panel__heading--has-close-icon');
        else heading.classList.remove('c-project-panel__heading--has-close-icon');
      }
    });
  }
  
  function attachTaskHandlers() {
    if (!contentDiv) return;
    const checkboxes = contentDiv.querySelectorAll('.c-project-task__checkbox');
    checkboxes.forEach((checkbox, index) => {
      const input = checkbox as HTMLInputElement;
      const unsubscribe = taskStore.subscribe(tasks => {
        input.checked = tasks.has(index);
      });
      if ((input as any)._changeListener) input.removeEventListener('change', (input as any)._changeListener);
      const newListener = () => {
        taskStore.toggle(index);
        trackAction(input.checked ? 'task_check' : 'task_uncheck', gid || slug, { step, task_index: index });
        if (input.checked) {
          setTimeout(() => handleAutoAdvance(index), 300);
        }
      };
      (input as any)._changeListener = newListener;
      input.addEventListener('change', newListener);
      (input as any)._unsubscribe = unsubscribe;
    });
  }
</script>

<div class="c-project__step-content" bind:this={contentDiv}>
  {@html content}
</div>
