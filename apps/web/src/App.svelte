<script lang="ts">
  import { onMount } from 'svelte';
  import Router from 'svelte-spa-router';
  import HomeView from './routes/HomeView.svelte';
  import TutorialView from './routes/TutorialView.svelte';
  import { checkApiHealth } from './lib/api-config';
  import './styles/rpl-cloned/index.css';
  import './app.css';
  
  const routes = {
    '/': HomeView,
    '/:slug': TutorialView,
    '/:slug/:step': TutorialView,
    '*': HomeView  // Fallback to home
  };

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
      console.error('❌ API Commit Mismatch!');
      console.error(`  Web App Commit: ${apiVersions.web}`);
      console.error(`  API Server Commit: ${apiVersions.api}`);
    } else if (health) {
      console.log(`✓ API connected: ${health.commitHashShort || 'unknown version'}`);
    } else {
      console.warn('⚠ Could not connect to API server');
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
</style>

<div class="c-i18n-root" dir="ltr">
  {#if apiMismatch}
    <div class="api-mismatch-banner">
      ⚠ API Version Mismatch! Web: {apiVersions.web} | API: {apiVersions.api}
    </div>
  {/if}
  <div class="no-print">
    <div class="global-nav-bar">
      <!-- Global navigation placeholder -->
    </div>
  </div>
  <div class="no-print">
    <header class="c-site-header" id="c-site-header">
      <!-- Site header placeholder -->
    </header>
  </div>
  <main class="c-layout">
    <Router {routes} />
  </main>
</div>
