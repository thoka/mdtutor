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
