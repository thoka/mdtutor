<script lang="ts">
  import { onMount } from 'svelte';
  import { link } from 'svelte-spa-router';
  import { trackAction } from '../lib/achievements';
  import { currentLanguage, completedProjects } from '../lib/stores';
  import { t } from '../lib/i18n';
  import { calculateProgress, type ProjectProgress } from '../lib/progress';

  let { params }: { params: { slug: string; lang: string } } = $props();

  let pathway = $state<any>(null);
  let projects = $state<any[]>([]);
  let userActions = $state<any[]>([]);
  let isLoading = $state(true);
  let errorMsg = $state<string | null>(null);
  
  let lang = $derived(params.lang || 'de-DE');
  let slug = $derived(params.slug || '');

  // Progress logic
  let projectProgresses = $derived(
    projects.map(p => calculateProgress(p, userActions))
  );
  
  let completedCount = $derived(projectProgresses.filter(p => p.isCompleted).length);
  let totalCount = $derived(projects.length);
  let totalPercent = $derived(
    projectProgresses.length > 0 
      ? Math.round(projectProgresses.reduce((sum, p) => sum + p.percent, 0) / projectProgresses.length)
      : 0
  );
  let hasAnyProgress = $derived(projectProgresses.some(p => p.percent > 0));

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

      if (!pathwayRes.ok || !projectsRes.ok) {
        throw new Error(`Failed to fetch pathway data: ${pathwayRes.status} / ${projectsRes.status}`);
      }

      const pathwayData = await pathwayRes.json();
      const projectsData = await projectsRes.json();

      pathway = pathwayData.data;
      projects = projectsData.data;

      // Fetch user actions for this pathway
      const token = localStorage.getItem('sso_token');
      if (token && token.includes('.')) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userId = payload.user_id;
          if (userId) {
            const actionsRes = await fetch(`/api/v1/actions/user/${userId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
        if (actionsRes.ok) {
          userActions = await actionsRes.json();
          console.log('[PathwayView] Loaded user actions:', userActions.length);
        }
          }
        } catch (e) {
          console.warn('Failed to parse token or fetch actions', e);
        }
      }
      
      // Track pathway open
      trackAction('pathway_open', pathway.id, { slug, lang });
    } catch (e) {
      console.error('loadPathway error', e);
      errorMsg = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      isLoading = false;
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
        <div class="c-pathway-header__left-col">
          <div class="c-pathway-header__title-area">
            {#if pathway.attributes.banner}
              <img class="c-pathway-header__icon" src={pathway.attributes.banner} alt="" />
            {/if}
            <h1 class="c-pathway-header__title">{pathway.attributes.title}</h1>
          </div>
          
          <div class="c-pathway-header__description">
            {@html pathway.attributes.description}
          </div>

          {#if hasAnyProgress}
            <div class="c-pathway-progress">
              <div class="c-pathway-progress__label">
                <strong>{completedCount} von {totalCount}</strong> Projekten abgeschlossen
              </div>
              <div class="c-pathway-progress__bar">
                <div class="c-pathway-progress__fill" style="width: {totalPercent}%"></div>
              </div>
            </div>
          {/if}
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
    </header>

    <div class="c-pathway-projects">
      {#each ['explore', 'design', 'invent'] as category}
        {@const categoryProjects = getProjectsByCategory(category)}
        {#if categoryProjects.length > 0}
          <section class="c-pathway-category c-pathway-category--{category}">
            <h2 class="c-pathway-category__title">
              {category === 'explore' ? 'Erkunden' : category === 'design' ? 'Gestalten' : 'Erfinden'}
            </h2>
            <div class="c-projects-list__projects">
              {#each categoryProjects as project}
                {@const parts = project.id.split(':')}
                {@const projectSlug = parts[parts.length - 1]}
                {@const displaySlug = parts.length >= 3 ? `${parts[0]}:${projectSlug}` : project.id}
                {@const progress = calculateProgress(project, userActions)}
                {@const isDone = progress.isCompleted}
                
                <div class="c-project-card-wrapper">
                  <div class="c-project-card {isDone ? 'is-completed' : ''} {progress.percent > 0 ? 'has-progress' : ''}">
                    {#if project.attributes.content.heroImage}
                      <div class="c-project-card__image-wrapper">
                        <img 
                          class="c-project-card__image" 
                          src={project.attributes.content.heroImage} 
                          alt={project.attributes.content.title}
                        />
                      </div>
                    {/if}
                    
                    <div class="c-project-card__body">
                      <div class="c-project-card__sidebar">
                        <div class="c-project-card__badge-container {isDone ? 'is-unlocked' : 'is-locked'}">
                          {#if project.attributes.content.badge}
                            <img 
                              src={project.attributes.content.badge} 
                              alt="Badge" 
                              class="badge-icon-small" 
                              onerror={(e) => (e.currentTarget as HTMLImageElement).style.display='none'} 
                            />
                          {:else}
                            <div class="badge-placeholder"></div>
                          {/if}
                        </div>
                        
                        <div class="c-project-card__steps-count">
                          {progress.completedSteps} / {progress.totalSteps}
                        </div>
                        
                        <a 
                          href={isDone ? `/${lang}/projects/${displaySlug}` : `/${lang}/projects/${displaySlug}/${progress.lastStep}`} 
                          use:link 
                          class="c-project-card__action-btn"
                        >
                          {#if isDone}
                            {$t('finished_project')}
                          {:else if progress.percent > 0}
                            {$t('continue_project')}
                          {:else}
                            {$t('start_project')}
                          {/if}
                        </a>
                      </div>
                      
                      <div class="c-project-card__content">
                        <div class="c-project-card__text">
                          <h3 class="c-project-card__heading">{project.attributes.content.title}</h3>
                          {#if project.attributes.content.description}
                            <p class="c-project-card__description">{project.attributes.content.description}</p>
                          {/if}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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

  .c-pathway-header__left-col {
    flex: 1;
    min-width: 300px;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .c-pathway-header__title-area {
    display: flex;
    align-items: center;
    gap: 1.5rem;
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

  .c-pathway-header__description {
    font-size: 1.1rem;
    color: #555;
    line-height: 1.5;
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
    font-size: 1.5rem;
    margin: 0 auto 2.5rem;
    padding: 0.75rem 2.5rem;
    border-radius: 50px;
    color: white;
    width: fit-content;
    font-weight: 700;
    text-align: center;
    display: block;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .c-pathway-category--explore .c-pathway-category__title {
    background-color: #42b961; /* Green */
  }

  .c-pathway-category--design .c-pathway-category__title {
    background-color: #ff9800; /* Orange */
  }

  .c-pathway-category--invent .c-pathway-category__title {
    background-color: #e91e63; /* Pink/Raspberry */
  }

  .c-projects-list__projects {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 2rem;
  }

  .c-project-card-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
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
    height: 100%;
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

  .c-project-card__body {
    display: flex;
    padding: 1.25rem;
    gap: 1.25rem;
    flex-grow: 1;
  }

  .c-project-card__sidebar {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    width: 90px;
    flex-shrink: 0;
  }

  .c-project-card__badge-container {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .c-project-card__badge-container.is-locked {
    opacity: 0.5;
    filter: grayscale(100%);
    transform: scale(0.85);
  }

  .badge-icon-small {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  }

  .badge-placeholder {
    width: 48px;
    height: 48px;
    background: #f0f0f0;
    border-radius: 50%;
    border: 2px dashed #ccc;
  }

  .c-project-card__steps-count {
    font-size: 0.8rem;
    font-weight: bold;
    color: #888;
    font-family: monospace;
  }

  .c-project-card__action-btn {
    display: inline-block;
    padding: 0.4rem 0.8rem;
    background: #000;
    color: #fff;
    text-decoration: none;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: bold;
    text-align: center;
    width: 100%;
    box-sizing: border-box;
    transition: transform 0.1s;
  }

  .c-project-card__action-btn:hover {
    transform: scale(1.05);
  }

  .c-project-card__content {
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
