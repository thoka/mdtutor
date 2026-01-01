<script lang="ts">
  import { onMount } from 'svelte';
  import { link } from 'svelte-spa-router';
  import { currentLanguage, completedProjects } from '../lib/stores';
  import { t } from '../lib/i18n';

  let { params }: { params: { slug: string; lang: string } } = $props();

  let pathway = $state<any>(null);
  let projects = $state<any[]>([]);
  let isLoading = $state(true);
  let errorMsg = $state<string | null>(null);
  
  let lang = $derived(params.lang || 'de-DE');
  let slug = $derived(params.slug || '');

  // Use $completedProjects for reactivity in Svelte 5
  let completedCount = $derived(projects.filter(p => $completedProjects.has(p.id)).length);
  let totalCount = $derived(projects.length);
  let progressPercent = $derived(totalCount > 0 ? (completedCount / totalCount) * 100 : 0);

  $effect(() => {
    console.log('PathwayView effect', { lang, slug });
    currentLanguage.set(lang);
    completedProjects.load();
    if (slug) {
      loadPathway();
    }
  });

  async function loadPathway() {
    console.log('loadPathway starting', slug);
    isLoading = true;
    errorMsg = null;
    try {
      const [pathwayRes, projectsRes] = await Promise.all([
        fetch(`/api/v1/${lang}/pathways/${slug}`),
        fetch(`/api/v1/${lang}/pathways/${slug}/projects`)
      ]);

      console.log('fetch results', { pathwayOk: pathwayRes.ok, projectsOk: projectsRes.ok });

      if (!pathwayRes.ok || !projectsRes.ok) {
        throw new Error(`Failed to fetch pathway data: ${pathwayRes.status} / ${projectsRes.status}`);
      }

      const pathwayData = await pathwayRes.json();
      const projectsData = await projectsRes.json();

      console.log('data loaded', { 
        hasPathway: !!pathwayData.data, 
        projectsCount: projectsData.data?.length 
      });

      pathway = pathwayData.data;
      projects = projectsData.data;
    } catch (e) {
      console.error('loadPathway error', e);
      errorMsg = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      isLoading = false;
      console.log('loadPathway finished', { isLoading, hasPathway: !!pathway });
    }
  }

  function getProjectsByCategory(category: string) {
    if (!pathway || !projects) return [];
    
    // The pathway attributes contain the original YAML structure including categories
    const categorySlugs = pathway.attributes.projects
      .filter((p: any) => p.category === category)
      .map((p: any) => p.slug);
      
    return projects.filter(p => {
      // Extract the slug part from GID (e.g., RPL:PROJ:space-talk -> space-talk)
      const parts = p.id.split(':');
      const projectSlug = parts[parts.length - 1];
      return categorySlugs.includes(projectSlug);
    });
  }
</script>

<div class="c-pathway">
  {#if isLoading}
    <div class="loading">{$t('loading')}</div>
  {:else if errorMsg}
    <div class="error">{$t('error')}: {errorMsg}</div>
  {:else if pathway}
    <header class="c-pathway-header">
      <div class="c-pathway-header__top-row">
        <div class="c-pathway-header__title-area">
          {#if pathway.attributes.banner}
            <img class="c-pathway-header__icon" src={pathway.attributes.banner} alt="" />
          {/if}
          <h1 class="c-pathway-header__title">{pathway.attributes.title}</h1>
        </div>

        {#if pathway.attributes.header}
          <div class="c-pathway-header__details">
            <div class="c-pathway-accordions">
              {#each pathway.attributes.header.filter(s => s.key !== 'mentor') as section}
                <details class="c-pathway-accordion">
                  <summary class="c-pathway-accordion__summary">
                    <span class="c-pathway-accordion__title">{section.title}</span>
                    <span class="material-symbols-sharp c-pathway-accordion__icon">expand_more</span>
                  </summary>
                  <div class="c-pathway-accordion__content">
                    {@html section.content}
                  </div>
                </details>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <div class="c-pathway-header__meta">
        <div class="c-pathway-header__description">
          {@html pathway.attributes.description}
        </div>
        
        <div class="c-pathway-progress">
          <div class="c-pathway-progress__label">
            <strong>{completedCount} von {totalCount}</strong> Projekten abgeschlossen
          </div>
          <div class="c-pathway-progress__bar">
            <div class="c-pathway-progress__fill" style="width: {progressPercent}%"></div>
          </div>
        </div>
      </div>
    </header>

    <div class="c-pathway-projects">
      {#each ['explore', 'design', 'invent'] as category}
        {@const categoryProjects = getProjectsByCategory(category)}
        {#if categoryProjects.length > 0}
          <section class="c-pathway-category">
            <h2 class="c-pathway-category__title">
              {category === 'explore' ? 'Erkunden' : category === 'design' ? 'Gestalten' : 'Erfinden'}
            </h2>
            <div class="c-projects-list__projects">
              {#each categoryProjects as project}
                {@const parts = project.id.split(':')}
                {@const displaySlug = parts.length >= 3 ? `${parts[0]}:${parts[parts.length-1]}` : project.id}
                {@const isDone = $completedProjects.has(project.id)}
                <a href="/{lang}/projects/{displaySlug}" use:link class="c-project-card {isDone ? 'is-completed' : ''}">
                  {#if project.attributes.content.heroImage}
                    <div class="c-project-card__image-wrapper">
                      <img 
                        class="c-project-card__image" 
                        src={project.attributes.content.heroImage} 
                        alt={project.attributes.content.title}
                      />
                      {#if isDone}
                        <div class="c-project-card__badge">✓</div>
                      {/if}
                    </div>
                  {/if}
                  <div class="c-project-card__content">
                    <div class="c-project-card__text">
                      <h3 class="c-project-card__heading">{project.attributes.content.title}</h3>
                      {#if project.attributes.content.description}
                        <p class="c-project-card__description">{project.attributes.content.description}</p>
                      {/if}
                    </div>
                  </div>
                </a>
              {/each}
            </div>
          </section>
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  .c-pathway {
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;
    padding: 2rem;
    box-sizing: border-box;
  }

  .c-pathway-header {
    margin-bottom: 3rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .c-pathway-header__top-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 2rem;
  }

  .c-pathway-header__title-area {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex: 1;
    min-width: 300px;
  }

  .c-pathway-header__icon {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 12px;
    background: #eee;
    flex-shrink: 0;
  }

  .c-pathway-header__title {
    font-size: 2.5rem;
    margin: 0;
    color: #222;
    line-height: 1.1;
  }

  .c-pathway-header__details {
    width: 100%;
    max-width: 400px;
  }

  .c-pathway-header__meta {
    max-width: 800px;
  }

  .c-pathway-header__description {
    font-size: 1.1rem;
    color: #555;
    line-height: 1.5;
    margin-bottom: 1rem;
  }

  .c-pathway-accordions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .c-pathway-accordion {
    border: 1px solid #eee;
    border-radius: 8px;
    background: white;
    overflow: hidden;
  }

  .c-pathway-accordion__summary {
    padding: 0.75rem 1rem;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    list-style: none;
    font-weight: bold;
    color: #444;
    user-select: none;
    font-size: 0.9rem;
  }

  .c-pathway-accordion__summary::-webkit-details-marker {
    display: none;
  }

  .c-pathway-accordion[open] .c-pathway-accordion__summary {
    border-bottom: 1px solid #eee;
    background: #f9f9f9;
  }

  .c-pathway-accordion[open] .c-pathway-accordion__icon {
    transform: rotate(180deg);
  }

  .c-pathway-accordion__icon {
    transition: transform 0.2s;
    color: #e91e63;
  }

  .c-pathway-accordion__content {
    padding: 1rem;
    font-size: 0.9rem;
    line-height: 1.5;
    color: #666;
  }

  .c-pathway-accordion__content :global(p) {
    margin-bottom: 0.75rem;
  }

  .c-pathway-accordion__content :global(p:last-child) {
    margin-bottom: 0;
  }

  .c-pathway-accordion__content :global(ul) {
    padding-left: 1.25rem;
    margin-bottom: 0.75rem;
  }

  .c-pathway-progress {
    width: 100%;
    max-width: 400px;
    background: white;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #eee;
  }

  .c-pathway-progress__label {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    color: #444;
  }

  .c-pathway-progress__bar {
    height: 8px;
    background: #f0f0f0;
    border-radius: 4px;
    overflow: hidden;
  }

  .c-pathway-progress__fill {
    height: 100%;
    background: #4caf50;
    transition: width 0.3s ease;
  }

  .c-pathway-category {
    margin-bottom: 4rem;
  }

  .c-pathway-category__title {
    font-size: 1.75rem;
    margin-bottom: 2rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e91e63;
    display: inline-block;
  }

  .c-projects-list__projects {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 2rem;
  }

  .c-project-card {
    display: flex;
    flex-direction: column;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s, box-shadow 0.2s;
    background: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }

  .c-project-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  }

  .c-project-card__image-wrapper {
    position: relative;
    height: 180px;
    background: #f0f0f0;
  }

  .c-project-card__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .c-project-card__badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: #4caf50;
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    font-size: 14px;
  }

  .c-project-card.is-completed {
    border-color: #4caf50;
  }

  .c-project-card__content {
    padding: 1.25rem;
    flex-grow: 1;
  }

  .c-project-card__heading {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    color: #222;
    line-height: 1.3;
    font-weight: 600;
  }

  .c-project-card__description {
    font-size: 0.9rem;
    color: #666;
    line-height: 1.4;
  }
</style>
