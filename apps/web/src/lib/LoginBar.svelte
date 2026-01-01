<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from './auth';

  onMount(() => {
    auth.check();
  });

  function handleLogin() {
    auth.login();
  }
</script>

<div class="login-bar">
  {#if $auth}
    <button class="user-info-button" onclick={handleLogin}>
      <span class="user-name">{$auth.name} {#if $auth.is_admin}(Admin){/if}</span>
    </button>
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

  .user-info-button {
    background: transparent;
    border: none;
    color: #fff;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background 0.2s;
  }

  .user-info-button:hover {
    background: rgba(255, 255, 255, 0.1);
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
