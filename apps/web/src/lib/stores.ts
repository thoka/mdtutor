import { writable, derived } from 'svelte/store';

// Tutorial data store
export const tutorial = writable<any>(null);
export const loading = writable(true);
export const error = writable<string | null>(null);

// Current step
export const currentStep = writable(0);

// Language stores
export const currentLanguage = writable('de-DE');
export const availableLanguages = writable<string[]>(['de-DE', 'en']);

// Progress tracking
function createProgressStore() {
  const { subscribe, set, update } = writable<Set<number>>(new Set());
  
  return {
    subscribe,
    load: (slug: string) => {
      const stored = localStorage.getItem(`progress_${slug}`);
      const progress = stored ? new Set<number>(JSON.parse(stored)) : new Set<number>();
      set(progress);
    },
    complete: (slug: string, step: number) => {
      update(steps => {
        steps.add(step);
        localStorage.setItem(`progress_${slug}`, JSON.stringify([...steps]));
        return steps;
      });
    },
    isCompleted: (step: number) => {
      let completed = false;
      subscribe(steps => { completed = steps.has(step); })();
      return completed;
    }
  };
}

export const completedSteps = createProgressStore();

// Task completion per step
export function createTaskStore(slug: string, step: number) {
  const key = `tasks_${slug}_${step}`;
  const stored = localStorage.getItem(key);
  const initial = stored ? new Set<number>(JSON.parse(stored)) : new Set<number>();
  
  const { subscribe, set, update } = writable<Set<number>>(initial);
  
  return {
    subscribe,
    toggle: (taskIndex: number) => {
      update(tasks => {
        if (tasks.has(taskIndex)) {
          tasks.delete(taskIndex);
        } else {
          tasks.add(taskIndex);
        }
        localStorage.setItem(key, JSON.stringify([...tasks]));
        return tasks;
      });
    }
  };
}
