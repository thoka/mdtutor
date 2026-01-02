<script lang="ts">
  import { onMount } from 'svelte';
  import Router, { link, location } from 'svelte-spa-router';
  import HomeView from './routes/HomeView.svelte';
  import TutorialView from './routes/TutorialView.svelte';
  import { userPreferences, toggleAutoAdvance } from './lib/preferences';
  import PathwayView from './routes/PathwayView.svelte';
  import LanguageChooser from './lib/LanguageChooser.svelte';
  import LoginBar from './lib/LoginBar.svelte';
  import { t } from './lib/i18n';
  import { currentLanguage } from './lib/stores';
  import { checkApiHealth } from './lib/api-config';
  import './styles/rpl-cloned/index.css';
  import './app.css';
  
  const routes = {
    '/': HomeView,
    '/:lang/projects': HomeView,
    '/:lang/pathways/:slug': PathwayView,
    '/:lang/projects/:slug': TutorialView,
    '/:lang/projects/:slug/:step': TutorialView,
    '/:slug': TutorialView,
    '/:slug/:step': TutorialView,
    '*': HomeView
  };

  const showBackButton = $derived(
    $location !== '/' && 
    $location !== `/${$currentLanguage}` && 
    $location !== `/${$currentLanguage}/projects` &&
    $location !== `/${$currentLanguage}/projects/`
  );

  let apiMismatch = $state(false);
  let apiVersions = $state({ web: '', api: '' });

  onMount(async () => {
    const health = await checkApiHealth();
    const expectedCommit = import.meta.env.VITE_COMMIT_HASH;
    
    if (health && expectedCommit && health.commitHash !== expectedCommit) {
      apiMismatch = true;
      apiVersions = {
        web: expectedCommit.substring(0, 7),
        api: health.commitHashShort || health.commitHash?.substring(0, 7) || 'unknown'
      };
    }
  });
</script>

<style>
  .api-mismatch-banner {
    background-color: #d0021b;
    color: white;
    padding: 8px 16px;
    text-align: center;
    font-weight: bold;
    font-family: sans-serif;
    position: sticky;
    top: 0;
    z-index: 9999;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .global-nav-bar {
    background-color: #000;
    color: #fff;
    border-bottom: 1px solid #333;
  }

  .global-nav-bar .text {
    color: #fff;
  }

  .global-nav-bar__content {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1rem;
  }

  .c-global-nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    text-decoration: none;
    font-weight: bold;
    font-family: var(--font-family-body);
  }

  .global-nav-bar .rpf-button--tertiary {
    --rpf-button-background-color: transparent !important;
    color: var(--rpf-text-primary);
    border: none;
    box-shadow: none;
    padding-inline: 0.5rem;
  }

  :global(.c-global-nav-back .rpf-button__icon.material-symbols-sharp::before) {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z' fill='%23FFFFFF'/%3E%3C/svg%3E") !important;
  }

  .global-nav-bar__right {
    display: flex;
    align-items: center;
  }

  .c-nav-preference-toggle {
    margin-right: 1.5rem;
    color: #fff;
    font-size: 0.85rem;
  }

  .c-preference-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
  }

  .c-preference-toggle input {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: #42B961;
  }
</style>

<div class="c-i18n-root" dir="ltr">
  {#if apiMismatch}
    <div class="api-mismatch-banner">
      ⚠ {$t('api_mismatch')} Web: {apiVersions.web} | API: {apiVersions.api}
    </div>
  {/if}
  <div class="no-print">
    <div class="global-nav-bar">
      <div class="global-nav-bar__content">
        <div class="global-nav-bar__left">
          {#if showBackButton}
            <a href="/{$currentLanguage}/projects" use:link class="rpf-button rpf-button--tertiary c-global-nav-back">
              <span class="rpf-button__icon material-symbols-sharp" aria-hidden="true">chevron_left</span>
              <span class="text">{$t('back_to_overview')}</span>
            </a>
          {:else}
            <div></div>
          {/if}
        </div>
        <div class="global-nav-bar__right">
          <div class="c-nav-preference-toggle">
            <label class="c-preference-toggle">
              <input type="checkbox" checked={$userPreferences.autoAdvance} onchange={toggleAutoAdvance}>
              <span class="c-preference-toggle__label">Auto-Scroll</span>
            </label>
          </div>
          <LanguageChooser />
          <LoginBar />
        </div>
      </div>
    </div>
  </div>
  <div class="no-print">
    <header class="c-site-header" id="c-site-header">
    </header>
  </div>
  <main class="c-layout">
    <Router {routes} />
  </main>
</div>
