export interface ProjectProgress {
  projectId: string;
  totalSteps: number;
  taskStepsCount: number;
  completedSteps: number;
  stepInteractions: Record<number, {
    total: number;
    completed: number;
    tasks: number;
    quizzes: number;
  }>;
  lastStep: number;
  lastViewedStep: number;
  percent: number;
  isCompleted: boolean;
  debug?: {
    rawTasks: Record<string, boolean>;
    rawQuizzes: number[];
    calculationLog: string[];
  };
}

export interface ProjectState {
  tasks: Record<string, boolean>;
  quizzes: number[];
  last_step: number;
  last_timestamp: string | null;
}

export interface UserState {
  user_id: string;
  projects: Record<string, ProjectState>;
}

export function calculateProgress(project: any, actionsOrState: any[] | UserState): ProjectProgress {
  try {
    const steps = project.attributes?.content?.steps || [];
    const totalSteps = steps.length;
    if (totalSteps === 0) return emptyProgress(project.id);

    const debug: NonNullable<ProjectProgress['debug']> = {
      rawTasks: {},
      rawQuizzes: [],
      calculationLog: []
    };

    let lastViewedStep = 0;
    const stepInteractions: Record<number, { total: number; completed: number }> = {};

    // Analyze project structure to find total interactions per step
    steps.forEach((stepData: any, index: number) => {
      const content = stepData.content || '';
      
      // Count checkboxes (tasks)
      const taskCount = (content.match(/class="c-project-task__checkbox"/g) || []).length;
      
      // Count quizzes
      let quizCount = (content.match(/class="knowledge-quiz-question"/g) || []).length;
      
      // If quiz count is 0 but knowledgeQuiz is a non-empty string, count it as 1 quiz
      if (quizCount === 0 && typeof stepData.knowledgeQuiz === 'string' && stepData.knowledgeQuiz.trim() !== '') {
        quizCount = 1;
      }

      stepInteractions[index] = {
        total: taskCount + quizCount,
        completed: 0,
        tasks: taskCount,
        quizzes: quizCount
      };
    });

    const taskStates = new Map<string, boolean>();
    const completedQuizzes = new Set<number>();
    let hasAnyActions = false;

    if (Array.isArray(actionsOrState)) {
      // Legacy path: Handle array of raw actions
      const projectActions = actionsOrState.filter(a => a.gid === project.id);
      hasAnyActions = projectActions.length > 0;
      
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
      debug.calculationLog.push(`Processed ${projectActions.length} raw actions from legacy format`);
    } else if (actionsOrState && actionsOrState.projects) {
      // New path: Handle aggregated state
      const projectState = actionsOrState.projects[project.id];
      if (projectState) {
        hasAnyActions = true;
        lastViewedStep = projectState.last_step || 0;
        
        Object.entries(projectState.tasks).forEach(([key, val]) => {
          taskStates.set(key, val);
        });
        
        (projectState.quizzes || []).forEach(q => completedQuizzes.add(q));
        debug.calculationLog.push(`Processed aggregated state for ${project.id}`);
      } else {
        debug.calculationLog.push(`No state found for project ${project.id}`);
      }
    }

    // Fill debug data
    taskStates.forEach((val, key) => { debug.rawTasks[key] = val; });
    debug.rawQuizzes = Array.from(completedQuizzes);

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
        
        // If the step has any quizzes and we have a quiz_success for this step,
        // count ALL quizzes in this step as completed (backend tracks per-step).
        const doneQuizzes = (interactions.quizzes > 0 && completedQuizzes.has(idx)) ? interactions.quizzes : 0;
        
        interactions.completed = Math.min(interactions.total, doneTasks + doneQuizzes);
        
        const stepScore = interactions.completed / interactions.total;
        totalScore += stepScore;
        if (stepScore >= 1) fullStepsCount++;
        
        debug.calculationLog.push(`Step ${idx}: ${interactions.completed}/${interactions.total} items done (score: ${stepScore.toFixed(2)})`);
      } else {
        debug.calculationLog.push(`Step ${idx}: No tasks or quizzes (ignored)`);
      }
    });
    
    let percent = 0;
    if (taskStepsCount > 0) {
      percent = Math.round((totalScore / taskStepsCount) * 100);
    } else if (hasAnyActions) {
      percent = 100;
    }

    debug.calculationLog.push(`Final Calculation: totalScore=${totalScore}, taskStepsCount=${taskStepsCount}, percent=${percent}`);

    const lastStep = lastViewedStep;

    return {
      projectId: project.id,
      totalSteps,
      taskStepsCount,
      completedSteps: fullStepsCount,
      stepInteractions,
      lastStep,
      lastViewedStep,
      percent,
      isCompleted: percent >= 100,
      debug
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
    isCompleted: false,
    debug: {
      rawTasks: {},
      rawQuizzes: [],
      calculationLog: ['Empty progress initialized']
    }
  };
}

