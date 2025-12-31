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
      const projectSlug = p.id.includes(':') ? p.id.split(':')[1] : p.id;
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
      <div class="c-pathway-header__content">
        <h1 class="c-pathway-header__title">{pathway.attributes.title}</h1>
        <p class="c-pathway-header__description">{pathway.attributes.description}</p>
        
        <div class="c-pathway-progress">
          <div class="c-pathway-progress__label">
            {completedCount} von {totalCount} Projekten abgeschlossen
          </div>
          <div class="c-pathway-progress__bar">
            <div class="c-pathway-progress__fill" style="width: {progressPercent}%"></div>
          </div>
        </div>
      </div>
    </header>

    <div class="c-pathway-info">
      {#if pathway.attributes.header}
        <div class="c-pathway-info__grid">
          {#each pathway.attributes.header as section}
            <div class="c-pathway-info__section">
              <h2 class="c-pathway-info__section-title">{section.title}</h2>
              <div class="c-pathway-info__section-content">
                {@html section.content}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

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
                {@const displaySlug = project.id.startsWith('rpl:') ? project.id.slice(4) : project.id}
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
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .c-pathway-header {
    margin-bottom: 3rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 2rem;
  }

  .c-pathway-header__title {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #333;
  }

  .c-pathway-header__description {
    font-size: 1.2rem;
    color: #666;
    line-height: 1.6;
    margin-bottom: 2rem;
  }

  .c-pathway-progress {
    max-width: 400px;
  }

  .c-pathway-progress__label {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.5rem;
  }

  .c-pathway-progress__bar {
    height: 8px;
    background: #eee;
    border-radius: 4px;
    overflow: hidden;
  }

  .c-pathway-progress__fill {
    height: 100%;
    background: #4caf50;
    transition: width 0.3s ease;
  }

  .c-pathway-info__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 4rem;
  }

  .c-pathway-info__section {
    background: #f9f9f9;
    padding: 1.5rem;
    border-radius: 8px;
  }

  .c-pathway-info__section-title {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: #444;
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
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
  }

  .c-project-card {
    display: flex;
    flex-direction: column;
    border: 1px solid #eee;
    border-radius: 8px;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s, box-shadow 0.2s;
    background: white;
  }

  .c-project-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .c-project-card__image {
    width: 100%;
    height: 180px;
    object-fit: cover;
  }

  .c-project-card__image-wrapper {
    position: relative;
  }

  .c-project-card__badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background: #4caf50;
    color: white;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .c-project-card.is-completed {
    border-color: #4caf50;
  }

  .c-project-card__content {
    padding: 1.5rem;
    flex-grow: 1;
  }

  .c-project-card__heading {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
    color: #333;
  }

  .c-project-card__description {
    font-size: 0.95rem;
    color: #666;
    line-height: 1.5;
  }
</style>
