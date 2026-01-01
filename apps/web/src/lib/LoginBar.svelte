<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from './auth';

  onMount(() => {
    auth.check();
  });

  function handleLogin() {
    auth.login();
  }

  function handleLogout() {
    auth.logout();
  }
</script>

<div class="login-bar">
  {#if $auth}
    <div class="user-info">
      <span class="user-name">{$auth.name} {#if $auth.is_admin}(Admin){/if}</span>
      <button class="rpf-button rpf-button--tertiary" onclick={handleLogout}>
        Logout
      </button>
    </div>
  {:else}
    <button class="rpf-button rpf-button--secondary" onclick={handleLogin}>
      Login
    </button>
  {/if}
</div>

<style>
  .login-bar {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-family: var(--font-family-body);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .user-name {
    font-weight: bold;
    font-size: 0.9rem;
  }

  :global(.login-bar .rpf-button) {
    padding: 4px 12px;
    font-size: 0.9rem;
  }
</style>
