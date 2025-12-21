<script lang="ts">
  import { onMount } from 'svelte';
  import Router from 'svelte-spa-router';
  import HomeView from './routes/HomeView.svelte';
  import TutorialView from './routes/TutorialView.svelte';
  import './styles/rpl-cloned/index.css';
  
  const routes = {
    '/': HomeView,
    '/:slug': TutorialView,
    '/:slug/:step': TutorialView,
    '*': HomeView  // Fallback to home
  };
</script>

<main>
  <Router {routes} />
</main>
