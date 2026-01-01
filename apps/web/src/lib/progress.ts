export interface ProjectProgress {
  projectId: string;
  totalSteps: number;
  taskStepsCount: number;
  completedSteps: number;
  stepInteractions: Record<number, {
    total: number;
    completed: number;
  }>;
  lastStep: number;
  lastViewedStep: number;
  percent: number;
  isCompleted: boolean;
}

export function calculateProgress(project: any, actions: any[]): ProjectProgress {
  try {
    const steps = project.attributes?.content?.steps || [];
    const totalSteps = steps.length;
    if (totalSteps === 0) return emptyProgress(project.id);

    let lastViewedStep = 0;
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
    
    // Track state of each task (latest action wins)
    const taskStates = new Map<string, boolean>();
    const completedQuizzes = new Set<number>();

    // Sort actions by timestamp to process in order
    const sortedActions = [...projectActions].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    sortedActions.forEach(action => {
      const meta = typeof action.metadata === 'string' ? JSON.parse(action.metadata) : (action.metadata || {});
      const stepIdx = meta.step !== undefined ? parseInt(meta.step) : -1;

      if (action.action_type === 'step_view' && stepIdx >= 0) {
        lastViewedStep = stepIdx;
      }

      switch (action.action_type) {
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
    let taskStepsCount = 0;
    let fullStepsCount = 0;

    Object.entries(stepInteractions).forEach(([idxStr, interactions]) => {
      const idx = parseInt(idxStr);
      
      if (interactions.total > 0) {
        taskStepsCount++;
        const doneTasks = Array.from(taskStates.entries())
          .filter(([key, val]) => key.startsWith(`${idx}_`) && val === true).length;
        const doneQuizzes = completedQuizzes.has(idx) ? 1 : 0;
        interactions.completed = Math.min(interactions.total, doneTasks + doneQuizzes);
        
        const stepScore = interactions.completed / interactions.total;
        totalScore += stepScore;
        if (stepScore >= 1) fullStepsCount++;
      }
    });
    
    // Percentage is based ONLY on steps that have tasks/quizzes
    // If a project has NO tasks at all, it's 100% if it was viewed at least once
    let percent = 0;
    if (taskStepsCount > 0) {
      percent = Math.round((totalScore / taskStepsCount) * 100);
    } else if (projectActions.length > 0) {
      percent = 100;
    }

    const lastStep = lastViewedStep;

    return {
      projectId: project.id,
      totalSteps,
      taskStepsCount,
      completedSteps: fullStepsCount, // This still tracks "full" steps for UI markers
      stepInteractions,
      lastStep,
      lastViewedStep,
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
    taskStepsCount: 0,
    completedSteps: 0,
    stepInteractions: {},
    lastStep: 0,
    lastViewedStep: 0,
    percent: 0,
    isCompleted: false
  };
}

