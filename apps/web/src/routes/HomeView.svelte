<script lang="ts">
  import { onMount } from 'svelte';
  import { link } from 'svelte-spa-router';
  import { currentLanguage, availableLanguages } from '../lib/stores';
  import { t } from '../lib/i18n';

  let { params = {} }: { params?: { lang?: string } } = $props();

  let projects = $state<any[]>([]);
  let isLoading = $state(true);
  let errorMsg = $state<string | null>(null);
  let lang = $derived(params.lang || 'de-DE');

  $effect(() => {
    currentLanguage.set(lang);
    loadProjects();
  });

  async function loadProjects() {
    isLoading = true;
    try {
      const response = await fetch(`/api/projects?lang=${lang}`);
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      projects = data.projects || [];
      if (data.languages) {
        availableLanguages.set(data.languages);
      }
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="c-projects-list">
  {#if isLoading}
    <div class="c-projects-list__projects__no-results">
      <p>{$t('loading')}</p>
    </div>
  {:else if errorMsg}
    <div class="c-projects-list__projects__no-results">
      <p>{$t('error')}: {errorMsg}</p>
    </div>
  {:else if projects.length === 0}
    <div class="c-projects-list__projects__no-results">
      <p>{$t('no_projects')}</p>
    </div>
  {:else}
    <div class="c-projects-list__projects">
      {#each projects as project}
        {@const displaySlug = project.slug.startsWith('rpl:') ? project.slug.slice(4) : project.slug}
        <a href="/{lang}/projects/{displaySlug}" use:link class="c-project-card">
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
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>
