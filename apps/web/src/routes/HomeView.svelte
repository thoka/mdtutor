<script lang="ts">
  import { onMount } from 'svelte';
  import { link } from 'svelte-spa-router';
  import { currentLanguage, availableLanguages } from '../lib/stores';
  import { t } from '../lib/i18n';

  let { params = {} }: { params?: { lang?: string } } = $props();

  let projects = $state<any[]>([]);
  let pathways = $state<any[]>([]);
  let isLoading = $state(true);
  let errorMsg = $state<string | null>(null);
  let lang = $derived(params.lang || 'de-DE');

  $effect(() => {
    currentLanguage.set(lang);
    loadData();
  });

  async function loadData() {
    isLoading = true;
    errorMsg = null;
    try {
      const [projectsRes, pathwaysRes] = await Promise.all([
        fetch(`/api/projects?lang=${lang}`),
        fetch(`/api/pathways?lang=${lang}`)
      ]);

      if (!projectsRes.ok || !pathwaysRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const projectsData = await projectsRes.json();
      const pathwaysData = await pathwaysRes.json();

      projects = projectsData.projects || [];
      pathways = pathwaysData.pathways || [];

      if (projectsData.languages) {
        availableLanguages.set(projectsData.languages);
      }
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="c-home-view">
  {#if pathways.length > 0}
    <section class="c-pathways-overview">
      <h2 class="c-pathways-overview__title">Lernpfade</h2>
      <div class="c-projects-list__projects">
        {#each pathways as pathway}
          {@const parts = pathway.slug.split(':')}
          {@const displaySlug = parts.length >= 2 ? `${parts[0]}:${parts[parts.length-1]}` : pathway.slug}
          <a href="/{lang}/pathways/{displaySlug}" use:link class="c-project-card c-pathway-card">
            {#if pathway.banner}
              <img 
                class="c-project-card__image" 
                src={pathway.banner} 
                alt={pathway.title}
              />
            {/if}
            <div class="c-project-card__content">
              <h3 class="c-project-card__heading">{pathway.title}</h3>
              {#if pathway.description}
                <p class="c-project-card__description">{pathway.description}</p>
              {/if}
            </div>
          </a>
        {/each}
      </div>
    </section>

    <hr class="c-home-divider" />
  {/if}

  <div class="c-projects-list">
    <h2 class="c-pathways-overview__title">Alle Projekte</h2>
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
        {@const parts = project.slug.split(':')}
        {@const displaySlug = parts.length >= 2 ? `${parts[0]}:${parts[parts.length-1]}` : project.slug}
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
</div>

<style>
  .c-home-view {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .c-pathways-overview {
    margin-bottom: 3rem;
  }

  .c-pathways-overview__title {
    font-size: 1.75rem;
    margin-bottom: 1.5rem;
    color: #333;
  }

  .c-home-divider {
    border: 0;
    border-top: 1px solid #eee;
    margin: 3rem 0;
  }

  .c-pathway-card {
    border-left: 4px solid #e91e63;
  }
</style>
