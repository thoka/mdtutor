<script lang="ts">
  import { onMount } from 'svelte';
  import { link } from 'svelte-spa-router';
  import { currentLanguage, availableLanguages } from '../lib/stores';
  import { t } from '../lib/i18n';

  let { params = {} }: { params?: { lang?: string } } = $props();

  let pathways = $state<any[]>([]);
  let topics = $state<any>({ interests: {}, technologies: {} });
  let selectedTopic = $state<string | null>(null);
  let isLoading = $state(true);
  let errorMsg = $state<string | null>(null);
  let lang = $derived(params.lang || 'de-DE');

  const filteredPathways = $derived(() => {
    if (!selectedTopic) return pathways;
    return pathways.filter(p => {
      const attrs = p.attributes;
      return attrs.technologyTheme === selectedTopic || 
             (attrs.interestLabels && attrs.interestLabels.includes(selectedTopic));
    });
  });

  async function loadData() {
    isLoading = true;
    errorMsg = null;
    try {
      const [pathwaysRes, topicsRes] = await Promise.all([
        fetch(`/api/v1/${lang}/pathways`),
        fetch(`/api/v1/${lang}/topics`)
      ]);

      if (!pathwaysRes.ok || !topicsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [pathwaysData, topicsData] = await Promise.all([
        pathwaysRes.json(),
        topicsRes.json()
      ]);
      
      pathways = pathwaysData.data || [];
      topics = topicsData || { interests: {}, technologies: {} };

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
  {:else}
    <section class="c-topics-overview">
      <h2 class="c-pathways-overview__title">Themenräume</h2>
      
      <div class="c-topic-section">
        <h3 class="c-topic-section__title">Technologien</h3>
        <div class="c-topic-grid">
          <button 
            class="c-topic-card" 
            class:is-active={selectedTopic === null}
            onclick={() => { selectedTopic = null; }}
            style="--topic-color: #666"
          >
            <div class="c-topic-card__icon">
              <span class="material-symbols-sharp">apps</span>
            </div>
            <h3 class="c-topic-card__title">Alle</h3>
          </button>

          {#each Object.entries(topics.technologies) as [id, topic]}
            {#if !topic.up}
              <button 
                class="c-topic-card" 
                class:is-active={selectedTopic === id}
                onclick={() => { selectedTopic = id; }}
                style="--topic-color: {topic.color || '#666'}"
              >
                <div class="c-topic-card__icon">
                  <img src="/icons/{id}.svg" alt="" onerror={(e) => (e.currentTarget.style.display='none')} />
                </div>
                <h3 class="c-topic-card__title">{topic['-de'] || id}</h3>
              </button>
            {/if}
          {/each}
        </div>
      </div>

      <div class="c-topic-section">
        <h3 class="c-topic-section__title">Interessen</h3>
        <div class="c-interest-list">
          {#each Object.entries(topics.interests) as [id, topic]}
            <button 
              class="c-interest-tag" 
              class:is-active={selectedTopic === id}
              onclick={() => { selectedTopic = id; }}
              style="--topic-color: {topic.color || '#666'}"
            >
              {topic['-de'] || id}
            </button>
          {/each}
        </div>
      </div>
    </section>

    {#if filteredPathways().length > 0}
      <section class="c-pathways-overview">
        <h2 class="c-pathways-overview__title">
          {#if selectedTopic}
            Lernpfade für "{topics.technologies[selectedTopic]?.['-de'] || topics.interests[selectedTopic]?.['-de'] || selectedTopic}"
          {:else}
            Alle Lernpfade
          {/if}
        </h2>
        <div class="c-pathway-list">
          {#each filteredPathways() as pathway}
            {@const parts = pathway.attributes.slug.split(':')}
            {@const displaySlug = parts.length >= 2 ? `${parts[0]}:${parts[parts.length-1]}` : pathway.attributes.slug}
            <a 
              href="/{lang}/pathways/{displaySlug}" 
              use:link 
              class="c-project-card c-pathway-card"
              class:is-locked={pathway.attributes.locked}
            >
              {#if pathway.attributes.banner}
                <div class="c-project-card__image-wrapper">
                  <img 
                    class="c-project-card__image" 
                    src={pathway.attributes.banner} 
                    alt={pathway.attributes.title}
                  />
                  {#if pathway.attributes.locked}
                    <div class="c-project-card__lock-overlay">
                      <span class="material-symbols-sharp">lock</span>
                    </div>
                  {/if}
                </div>
              {/if}
              <div class="c-project-card__content">
                <h3 class="c-project-card__heading">
                  {pathway.attributes.title}
                </h3>
                {#if pathway.attributes.description}
                  <div class="c-project-card__description">
                    {@html pathway.attributes.description}
                  </div>
                {/if}
                <div class="c-pathway-tags">
                   {#if pathway.attributes.technologyTheme}
                     <span class="c-pathway-tag c-pathway-tag--tech">
                       {topics.technologies[pathway.attributes.technologyTheme]?.['-de'] || pathway.attributes.technologyTheme}
                     </span>
                   {/if}
                   {#each pathway.attributes.interestLabels || [] as interest}
                     <span class="c-pathway-tag c-pathway-tag--interest">
                       {topics.interests[interest]?.['-de'] || interest}
                     </span>
                   {/each}
                </div>
              </div>
            </a>
          {/each}
        </div>
      </section>
    {:else}
      <div class="c-projects-list__projects__no-results">
        <p>{$t('no_projects')}</p>
        <button onclick={() => { selectedTopic = null; }} class="c-button">Alle anzeigen</button>
      </div>
    {/if}
  {/if}
</div>

<style>
  .c-home-view {
    width: 100%;
    margin: 0;
    padding: 2rem;
    box-sizing: border-box;
  }

  .c-pathways-overview {
    margin-bottom: 3rem;
    width: 100%;
  }

  .c-pathways-overview__title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 2rem;
    color: #222;
  }

  .c-pathway-list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    width: 100%;
  }

  .c-topics-overview {
    margin-bottom: 3rem;
  }

  .c-topic-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .c-topic-section {
    margin-bottom: 2rem;
  }

  .c-topic-section__title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #666;
  }

  .c-interest-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .c-interest-tag {
    background: white;
    border: 1px solid #e0e0e0;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .c-interest-tag:hover {
    border-color: var(--topic-color);
    color: var(--topic-color);
  }

  .c-interest-tag.is-active {
    background: var(--topic-color);
    color: white;
    border-color: var(--topic-color);
  }

  .c-topic-card {
    background: white;
    border-radius: 12px;
    padding: 1.25rem;
    text-align: center;
    border: 1px solid #e0e0e0;
    border-top: 6px solid var(--topic-color);
    transition: all 0.2s;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .c-topic-card.is-active {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transform: translateY(-2px);
    border-color: var(--topic-color);
  }

  .c-topic-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  }

  .c-pathway-tags {
    margin-top: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .c-pathway-tag {
    font-size: 0.75rem;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .c-pathway-tag--tech {
    background: #f0f0f0;
    color: #444;
  }

  .c-pathway-tag--interest {
    background: #e3f2fd;
    color: #1976d2;
  }

  .c-topic-card__icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 1rem;
  }

  .c-topic-card__icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .c-topic-card__title {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0;
    color: #333;
  }

  .c-pathway-card.is-locked {
    opacity: 0.7;
    filter: grayscale(0.5);
    cursor: not-allowed;
    pointer-events: none;
  }

  .c-project-card__lock-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .c-lock-icon {
    font-size: 1rem;
    margin-left: 0.5rem;
    vertical-align: middle;
  }

  @media (min-width: 960px) {
    .c-pathway-list {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .c-pathway-card {
    display: flex !important;
    flex-direction: column;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s, box-shadow 0.2s;
    border: 1px solid #e0e0e0;
    border-left: 6px solid #e91e63;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    width: 100%;
  }

  .c-project-card__image-wrapper {
    width: 100%;
    height: 160px;
    background: #f0f0f0;
    position: relative;
    flex-shrink: 0;
  }

  @media (min-width: 600px) {
    .c-pathway-card {
      flex-direction: row;
    }

    .c-project-card__image-wrapper {
      width: 160px;
      height: auto;
    }
  }

  .c-project-card__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .c-project-card__content {
    padding: 1rem 1.25rem;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .c-project-card__heading {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
    color: #222;
    line-height: 1.2;
    font-weight: 700;
  }

  .c-project-card__description {
    font-size: 0.95rem;
    color: #555;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .c-pathway-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    border-color: #d0d0d0;
    border-left-color: #ff4081;
  }
</style>
