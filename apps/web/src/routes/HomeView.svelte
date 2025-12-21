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

<div class="c-projects-list">
  {#if isLoading}
    <div class="c-projects-list__projects__no-results">
      <p>Loading tutorials...</p>
    </div>
  {:else if errorMsg}
    <div class="c-projects-list__projects__no-results">
      <p>Error: {errorMsg}</p>
    </div>
  {:else if projects.length === 0}
    <div class="c-projects-list__projects__no-results">
      <p>No tutorials found.</p>
    </div>
  {:else}
    <div class="c-projects-list__projects">
      {#each projects as project}
        <a href="/{project.slug}" use:link class="c-project-card">
          {#if project.heroImage}
            <img 
              class="c-project-card__image" 
              src={project.heroImage} 
              alt={project.title || project.slug}
            />
          {/if}
          <div class="c-project-card__content">
            <div class="c-project-card__text">
              <h3 class="c-project-card__heading">{project.title || project.slug}</h3>
              {#if project.description}
                <p class="c-project-card__description">{project.description}</p>
              {/if}
            </div>
            {#if project.languages && project.languages.length > 0}
              <div class="c-project-card__tags">
                {#each project.languages as lang}
                  <span class="rpf-tag">{lang}</span>
                {/each}
              </div>
            {/if}
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>
