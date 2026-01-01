<script lang="ts">
  import type { ProjectProgress, UserState } from './progress';
  
  let { 
    progresses, 
    userState, 
    onClose 
  }: { 
    progresses: ProjectProgress[]; 
    userState: UserState | null;
    onClose: () => void;
  } = $props();

  let selectedProjectId = $state<string | null>(null);

  $effect(() => {
    if (!selectedProjectId && progresses.length > 0) {
      selectedProjectId = progresses[0].projectId;
    }
  });

  let selectedProgress = $derived(progresses.find(p => p.projectId === selectedProjectId));
  let selectedState = $derived(userState?.projects[selectedProjectId || '']);

  function formatTimestamp(ts: string | null) {
    if (!ts) return '-';
    return new Date(ts).toLocaleString();
  }
</script>

<div class="debug-overlay" onclick={onClose} role="button" tabindex="0" onkeydown={(e) => e.key === 'Escape' && onClose()}>
  <div class="debug-content" onclick={(e) => e.stopPropagation()} role="presentation">
    <header class="debug-header">
      <h2>Achievement Debug View</h2>
      <button class="close-btn" onclick={onClose}>&times;</button>
    </header>

    <div class="debug-body">
      <aside class="debug-sidebar">
        <h3>Projects</h3>
        <ul class="project-list">
          {#each progresses as p}
            <li class={selectedProjectId === p.projectId ? 'active' : ''}>
              <button onclick={() => selectedProjectId = p.projectId}>
                <span class="p-percent">{p.percent}%</span>
                <span class="p-id">{p.projectId.split(':').pop()}</span>
              </button>
            </li>
          {/each}
        </ul>
      </aside>

      <main class="debug-main">
        {#if selectedProgress}
          <section class="debug-section">
            <h3>Overview: {selectedProjectId}</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Progress:</span>
                <span class="stat-value">{selectedProgress.percent}% ({selectedProgress.isCompleted ? 'Completed' : 'In Progress'})</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Steps:</span>
                <span class="stat-value">{selectedProgress.completedSteps} / {selectedProgress.taskStepsCount} (task steps)</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Last Viewed:</span>
                <span class="stat-value">Step {selectedProgress.lastViewedStep}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Last Sync:</span>
                <span class="stat-value">{formatTimestamp(selectedState?.last_timestamp || null)}</span>
              </div>
            </div>
          </section>

          <section class="debug-section">
            <h3>Calculation Log</h3>
            <div class="log-container">
              {#each selectedProgress.debug?.calculationLog || [] as log}
                <div class="log-entry">{log}</div>
              {/each}
            </div>
          </section>

          <section class="debug-section">
            <h3>Aggregated State (from Backend)</h3>
            <div class="state-details">
              <h4>Tasks</h4>
              {#if Object.keys(selectedProgress.debug?.rawTasks || {}).length > 0}
                <table class="debug-table">
                  <thead>
                    <tr>
                      <th>Key (Step_Task)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each Object.entries(selectedProgress.debug?.rawTasks || {}) as [key, val]}
                      <tr>
                        <td><code>{key}</code></td>
                        <td class={val ? 'status-done' : 'status-pending'}>{val ? 'CHECKED' : 'UNCHECKED'}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              {:else}
                <p class="empty-msg">No task actions found.</p>
              {/if}

              <h4>Quizzes</h4>
              {#if selectedProgress.debug?.rawQuizzes && selectedProgress.debug.rawQuizzes.length > 0}
                <div class="quiz-tags">
                  {#each selectedProgress.debug.rawQuizzes as q}
                    <span class="quiz-tag">Step {q}</span>
                  {/each}
                </div>
              {:else}
                <p class="empty-msg">No quiz successes found.</p>
              {/if}
            </div>
          </section>
        {:else}
          <div class="no-selection">Select a project to see details</div>
        {/if}
      </main>
    </div>
  </div>
</div>

<style>
  .debug-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.7);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: sans-serif;
    color: #333;
  }

  .debug-content {
    background: #f5f5f5;
    width: 90%;
    max-width: 1200px;
    height: 85%;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
  }

  .debug-header {
    background: #222;
    color: white;
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .debug-header h2 {
    margin: 0;
    font-size: 1.2rem;
  }

  .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 2rem;
    cursor: pointer;
    line-height: 1;
  }

  .debug-body {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .debug-sidebar {
    width: 250px;
    background: #e0e0e0;
    border-right: 1px solid #ccc;
    padding: 1rem;
    overflow-y: auto;
  }

  .debug-sidebar h3 {
    font-size: 0.9rem;
    text-transform: uppercase;
    color: #666;
    margin-bottom: 1rem;
  }

  .project-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .project-list li {
    margin-bottom: 0.5rem;
  }

  .project-list button {
    width: 100%;
    text-align: left;
    padding: 0.75rem;
    background: white;
    border: 1px solid #ccc;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
  }

  .project-list li.active button {
    background: #e91e63;
    color: white;
    border-color: #c2185b;
  }

  .p-percent {
    font-weight: bold;
    font-family: monospace;
    font-size: 0.9rem;
    min-width: 40px;
  }

  .p-id {
    font-size: 0.85rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .debug-main {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
    background: white;
  }

  .debug-section {
    margin-bottom: 2.5rem;
  }

  .debug-section h3 {
    border-bottom: 2px solid #eee;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
    color: #444;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .stat-item {
    background: #f9f9f9;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #eee;
  }

  .stat-label {
    display: block;
    font-size: 0.8rem;
    color: #888;
    margin-bottom: 0.25rem;
  }

  .stat-value {
    font-weight: bold;
    font-size: 1rem;
  }

  .log-container {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 6px;
    font-family: monospace;
    font-size: 0.85rem;
    max-height: 200px;
    overflow-y: auto;
  }

  .log-entry {
    margin-bottom: 0.25rem;
    border-bottom: 1px solid #333;
    padding-bottom: 0.25rem;
  }

  .debug-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  .debug-table th, .debug-table td {
    text-align: left;
    padding: 0.75rem;
    border-bottom: 1px solid #eee;
  }

  .debug-table th {
    background: #f0f0f0;
    color: #666;
    font-weight: 600;
  }

  .status-done {
    color: #4caf50;
    font-weight: bold;
  }

  .status-pending {
    color: #f44336;
  }

  .quiz-tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .quiz-tag {
    background: #e3f2fd;
    color: #1976d2;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: bold;
    border: 1px solid #bbdefb;
  }

  .empty-msg {
    color: #888;
    font-style: italic;
  }

  .no-selection {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 1.2rem;
  }
</style>

