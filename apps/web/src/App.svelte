<script lang="ts">
  import { onMount } from 'svelte';
  import Router from 'svelte-spa-router';
  import TutorialView from './routes/TutorialView.svelte';
  import './styles/rpl.css';
  
  const routes = {
    '/:slug': TutorialView,
    '/:slug/:step': TutorialView,
    '*': TutorialView  // Fallback
  };
</script>

<main>
  <Router {routes} />
</main>

<style>
  :global(*) {
    box-sizing: border-box;
  }
  
  main {
    min-height: 100vh;
  }
</style>
