<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from './auth';
  import { t } from './i18n';

  let userId = $state('');
  let password = $state('');
  let showLogin = $state(false);
  let errorMsg = $state('');

  onMount(() => {
    auth.check();
  });

  async function handleLogin() {
    errorMsg = '';
    const success = await auth.login(userId, userId === 'admin' ? password : undefined);
    if (success) {
      showLogin = false;
      userId = '';
      password = '';
    } else {
      errorMsg = 'Login failed';
    }
  }

  async function handleLogout() {
    await auth.logout();
  }
</script>

<div class="login-bar">
  {#if $auth}
    <div class="user-info">
      <span class="user-name">{$auth.id} {#if $auth.is_admin}(Admin){/if}</span>
      <button class="rpf-button rpf-button--tertiary" onclick={handleLogout}>
        Logout
      </button>
    </div>
  {:else if showLogin}
    <div class="login-form">
      <input type="text" bind:value={userId} placeholder="Username" />
      {#if userId === 'admin'}
        <input type="password" bind:value={password} placeholder="Password" />
      {/if}
      <button class="rpf-button rpf-button--primary" onclick={handleLogin}>Login</button>
      <button class="rpf-button rpf-button--tertiary" onclick={() => showLogin = false}>Cancel</button>
      {#if errorMsg}<span class="error">{errorMsg}</span>{/if}
    </div>
  {:else}
    <button class="rpf-button rpf-button--secondary" onclick={() => showLogin = true}>
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

  .login-form {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .login-form input {
    padding: 4px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .error {
    color: red;
    font-size: 0.8rem;
  }

  :global(.login-bar .rpf-button) {
    padding: 4px 12px;
    font-size: 0.9rem;
  }
</style>

