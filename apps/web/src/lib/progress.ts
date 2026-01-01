export interface ProjectProgress {
  projectId: string;
  totalSteps: number;
  completedSteps: number;
  stepInteractions: Record<number, {
    total: number;
    completed: number;
  }>;
  lastStep: number;
  percent: number;
  isCompleted: boolean;
}

export function calculateProgress(project: any, actions: any[]): ProjectProgress {
  const steps = project.attributes.content.steps || [];
  const totalSteps = steps.length;
  if (totalSteps === 0) return emptyProgress(project.id);

  let lastStep = 0;
  const stepInteractions: Record<number, { total: number; completed: number }> = {};

  // Analyze project structure to find total interactions per step
  steps.forEach((stepData: any, index: number) => {
    const content = stepData.content || '';
    
    // Count checkboxes (tasks)
    const taskCount = (content.match(/class="c-project-task__checkbox"/g) || []).length;
    
    // Count quizzes
    const quizCount = (content.match(/class="knowledge-quiz-question"/g) || []).length;

    stepInteractions[index] = {
      total: taskCount + quizCount,
      completed: 0
    };
  });

  // Filter actions for this specific project
  const projectActions = actions.filter(a => a.gid === project.id);
  
  // Track unique completed interactions
  const completedTasks = new Set<string>();
  const completedQuizzes = new Set<number>();
  const completedSteps = new Set<number>();

  projectActions.forEach(action => {
    const meta = action.metadata || {};
    const stepIdx = meta.step !== undefined ? parseInt(meta.step) : -1;

    if (stepIdx >= 0) {
      lastStep = Math.max(lastStep, stepIdx);
    }

    switch (action.action_type) {
      case 'step_complete':
        if (stepIdx >= 0) completedSteps.add(stepIdx);
        break;
      case 'task_check':
        if (stepIdx >= 0 && meta.task_index !== undefined) {
          completedTasks.add(`${stepIdx}_${meta.task_index}`);
        }
        break;
      case 'quiz_success':
        if (stepIdx >= 0) completedQuizzes.add(stepIdx);
        break;
    }
  });

  // Calculate scores
  let totalScore = 0;
  Object.entries(stepInteractions).forEach(([idxStr, interactions]) => {
    const idx = parseInt(idxStr);
    let stepScore = 0;

    if (interactions.total > 0) {
      // Step with interactions: calculate based on tasks/quizzes
      const doneTasks = Array.from(completedTasks).filter(t => t.startsWith(`${idx}_`)).length;
      const doneQuizzes = completedQuizzes.has(idx) ? 1 : 0;
      interactions.completed = doneTasks + doneQuizzes;
      
      // A step is also fully completed if 'step_complete' was logged
      if (completedSteps.has(idx)) {
        stepScore = 1;
        interactions.completed = interactions.total;
      } else {
        stepScore = interactions.completed / interactions.total;
      }
    } else {
      // Step without interactions: counts as 1 if visited or completed
      stepScore = completedSteps.has(idx) || projectActions.some(a => a.metadata?.step === idx) ? 1 : 0;
    }
    
    totalScore += stepScore;
  });

  const percent = Math.round((totalScore / totalSteps) * 100);

  return {
    projectId: project.id,
    totalSteps,
    completedSteps: completedSteps.size,
    stepInteractions,
    lastStep,
    percent,
    isCompleted: percent >= 100
  };
}

function emptyProgress(projectId: string): ProjectProgress {
  return {
    projectId,
    totalSteps: 0,
    completedSteps: 0,
    stepInteractions: {},
    lastStep: 0,
    percent: 0,
    isCompleted: false
  };
}

