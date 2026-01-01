<script lang="ts">
  import { onMount } from 'svelte';
  import { link } from 'svelte-spa-router';
  import { currentLanguage, availableLanguages } from '../lib/stores';
  import { t } from '../lib/i18n';

  let { params = {} }: { params?: { lang?: string } } = $props();

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
      const pathwaysRes = await fetch(`/api/pathways?lang=${lang}`);

      if (!pathwaysRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const pathwaysData = await pathwaysRes.json();
      pathways = pathwaysData.pathways || [];

    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="c-home-view">
  {#if isLoading}
    <div class="loading">{$t('loading')}</div>
  {:else if errorMsg}
    <div class="error">{$t('error')}: {errorMsg}</div>
  {:else if pathways.length > 0}
    <section class="c-pathways-overview">
      <h2 class="c-pathways-overview__title">Lernpfade</h2>
      <div class="c-pathway-list">
        {#each pathways as pathway}
          {@const parts = pathway.slug.split(':')}
          {@const displaySlug = parts.length >= 2 ? `${parts[0]}:${parts[parts.length-1]}` : pathway.slug}
          <a href="/{lang}/pathways/{displaySlug}" use:link class="c-project-card c-pathway-card">
            {#if pathway.banner}
              <div class="c-project-card__image-wrapper">
                <img 
                  class="c-project-card__image" 
                  src={pathway.banner} 
                  alt={pathway.title}
                />
              </div>
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
  {:else}
    <div class="c-projects-list__projects__no-results">
      <p>{$t('no_projects')}</p>
    </div>
  {/if}
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

  .c-pathway-list {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .c-pathway-card {
    display: flex !important;
    flex-direction: column;
    border-left: 4px solid #e91e63;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s, box-shadow 0.2s;
    border: 1px solid #eee;
    border-left: 4px solid #e91e63;
  }

  @media (min-width: 600px) {
    .c-pathway-card {
      flex-direction: row;
      align-items: stretch;
    }

    .c-project-card__image-wrapper {
      width: 300px;
      flex-shrink: 0;
    }

    .c-project-card__image {
      height: 100% !important;
    }
  }

  .c-pathway-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .c-project-card__image-wrapper {
    position: relative;
    background: #f0f0f0;
  }

  .c-project-card__image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    display: block;
  }

  .c-project-card__content {
    padding: 1.5rem;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .c-project-card__heading {
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
    color: #333;
  }

  .c-project-card__description {
    font-size: 1rem;
    color: #666;
    line-height: 1.5;
  }
</style>
