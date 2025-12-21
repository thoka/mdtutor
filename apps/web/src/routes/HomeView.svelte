<script lang="ts">
  import { onMount } from 'svelte';
  import { link } from 'svelte-spa-router';

  let projects = $state<any[]>([]);
  let isLoading = $state(true);
  let errorMsg = $state<string | null>(null);

  onMount(async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      projects = data.projects || [];
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      isLoading = false;
    }
  });
</script>

<div class="home-view">
  <header class="home-header">
    <div class="container">
      <h1>MDTutor - Tutorial Library</h1>
      <p>Select a tutorial to start learning.</p>
    </div>
  </header>

  <main class="container">
    {#if isLoading}
      <div class="loading">Loading tutorials...</div>
    {:else if errorMsg}
      <div class="error">Error: {errorMsg}</div>
    {:else}
      <div class="project-grid">
        {#each projects as project}
          <a href="/{project.slug}" use:link class="project-card">
            <div class="project-card__content">
              <h3>{project.title || project.slug}</h3>
              <div class="project-card__meta">
                <span class="badge">{project.languages?.join(', ') || 'en'}</span>
              </div>
            </div>
          </a>
        {/each}
      </div>
    {/if}
  </main>
</div>

<style>
  .container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .home-header {
    background: #fff;
    border-bottom: 1px solid #e0e0e0;
    padding: 3rem 0;
    margin-bottom: 3rem;
  }

  .home-header h1 {
    margin: 0;
    font-size: 2.5rem;
    color: #0faeb0;
  }

  .home-header p {
    margin: 0.5rem 0 0;
    color: #555;
    font-size: 1.2rem;
  }

  .project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    padding-bottom: 4rem;
  }

  .project-card {
    background: #fff;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .project-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    border-color: #0faeb0;
  }

  .project-card__content {
    padding: 2rem;
  }

  .project-card__content h3 {
    margin: 0 0 1rem;
    font-size: 1.4rem;
    color: #333;
    line-height: 1.3;
  }

  .project-card__meta {
    display: flex;
    gap: 0.5rem;
    margin-top: auto;
  }

  .badge {
    background: #e6f7f7;
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-size: 0.85rem;
    color: #0faeb0;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .loading, .error {
    text-align: center;
    padding: 3rem;
    font-size: 1.2rem;
  }

  .error {
    color: #c41e3a;
  }
</style>
