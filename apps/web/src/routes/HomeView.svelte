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
            {#if project.heroImage}
              <div class="project-card__image" style="background-image: url({project.heroImage})"></div>
            {:else}
              <div class="project-card__image project-card__image--placeholder"></div>
            {/if}
            <div class="project-card__content">
              <h3>{project.title || project.slug}</h3>
              {#if project.description}
                <p class="project-card__description">{project.description}</p>
              {/if}
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
    max-width: 100%;
    margin: 0;
    padding: 0 3rem;
    width: 100%;
  }

  .home-header {
    background: #fff;
    border-bottom: 1px solid #e0e0e0;
    padding: 4rem 3rem;
    margin-bottom: 3rem;
  }

  .home-header .container {
    padding: 0;
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
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2.5rem;
    padding-bottom: 4rem;
  }

  .project-card {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 16px;
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100%;
  }

  .project-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 30px rgba(0,0,0,0.1);
  }

  .project-card__image {
    height: 180px;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-bottom: 1px solid #eee;
  }

  .project-card__image--placeholder {
    background-color: #f5f5f5;
    background-image: linear-gradient(45deg, #f5f5f5 25%, #fafafa 25%, #fafafa 50%, #f5f5f5 50%, #f5f5f5 75%, #fafafa 75%, #fafafa 100%);
    background-size: 40px 40px;
  }

  .project-card__content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  .project-card__content h3 {
    margin: 0 0 0.75rem;
    font-size: 1.25rem;
    color: #333;
    line-height: 1.4;
    font-weight: 700;
  }

  .project-card__description {
    margin: 0 0 1.5rem;
    font-size: 0.95rem;
    color: #666;
    line-height: 1.5;
    display: -webkit-box;
    line-clamp: 3;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
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
