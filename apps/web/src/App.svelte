<script lang="ts">
  import { onMount } from 'svelte';
  import Router from 'svelte-spa-router';
  import HomeView from './routes/HomeView.svelte';
  import TutorialView from './routes/TutorialView.svelte';
  import './styles/rpl-cloned/index.css';
  import './app.css';
  
  const routes = {
    '/': HomeView,
    '/:slug': TutorialView,
    '/:slug/:step': TutorialView,
    '*': HomeView  // Fallback to home
  };
</script>

<div class="c-i18n-root" dir="ltr">
  <div class="no-print">
    <div class="global-nav-bar">
      <!-- Global navigation placeholder -->
    </div>
  </div>
  <div class="no-print">
    <header class="c-site-header" id="c-site-header" role="banner">
      <!-- Site header placeholder -->
    </header>
  </div>
  <main class="c-layout">
    <Router {routes} />
  </main>
</div>
