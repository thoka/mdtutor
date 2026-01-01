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
  try {
    const steps = project.attributes?.content?.steps || [];
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
    console.log(`[progress] Project: ${project.id}, total actions: ${projectActions.length}`);
    
    // Track state of each task (latest action wins)
    const taskStates = new Map<string, boolean>();
    const completedQuizzes = new Set<number>();
    const completedSteps = new Set<number>();

    // Sort actions by timestamp to process in order
    const sortedActions = [...projectActions].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    sortedActions.forEach(action => {
      const meta = typeof action.metadata === 'string' ? JSON.parse(action.metadata) : (action.metadata || {});
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
            taskStates.set(`${stepIdx}_${meta.task_index}`, true);
          }
          break;
        case 'task_uncheck':
          if (stepIdx >= 0 && meta.task_index !== undefined) {
            taskStates.set(`${stepIdx}_${meta.task_index}`, false);
          }
          break;
        case 'quiz_success':
          if (stepIdx >= 0) completedQuizzes.add(stepIdx);
          break;
      }
    });

    // Calculate scores
    let totalScore = 0;
    let fullStepsCount = 0;
    Object.entries(stepInteractions).forEach(([idxStr, interactions]) => {
      const idx = parseInt(idxStr);
      let stepScore = 0;

      if (interactions.total > 0) {
        // Step with interactions: calculate based on tasks/quizzes
        const doneTasks = Array.from(taskStates.entries())
          .filter(([key, val]) => key.startsWith(`${idx}_`) && val === true).length;
        const doneQuizzes = completedQuizzes.has(idx) ? 1 : 0;
        interactions.completed = doneTasks + doneQuizzes;
        
        // A step is also fully completed if 'step_complete' was logged
        if (completedSteps.has(idx)) {
          stepScore = 1;
          interactions.completed = interactions.total;
        } else {
          stepScore = Math.min(1, interactions.completed / interactions.total);
        }
      } else {
        // Step without interactions: counts as 1 if visited or completed
        // For 'visited', we look for step_view or step_complete or task_check
        const hasActions = completedSteps.has(idx) || projectActions.some(a => {
          const m = typeof a.metadata === 'string' ? JSON.parse(a.metadata) : (a.metadata || {});
          const stepVal = m.step !== undefined ? parseInt(m.step) : -1;
          return stepVal === idx && (a.action_type === 'step_view' || a.action_type === 'step_complete' || a.action_type === 'task_check' || a.action_type === 'quiz_attempt');
        });
        stepScore = hasActions ? 1 : 0;
      }
      
      if (stepScore >= 1) fullStepsCount++;
      totalScore += stepScore;
    });
    
    const percent = Math.round((totalScore / totalSteps) * 100);

    return {
      projectId: project.id,
      totalSteps,
      completedSteps: fullStepsCount,
      stepInteractions,
      lastStep,
      percent,
      isCompleted: percent >= 100
    };
  } catch (e) {
    console.error('[progress] Error calculating progress', e);
    return emptyProgress(project.id);
  }
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

