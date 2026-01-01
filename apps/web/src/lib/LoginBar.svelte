<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from './auth';

  onMount(() => {
    auth.check();
  });

  function handleLogin() {
    auth.login();
  }

  const ssoUrl = import.meta.env.VITE_SSO_URL;
</script>

<div class="login-bar">
  {#if $auth}
    <button class="user-info-button" onclick={handleLogin}>
      <div class="avatar-container">
        {#if $auth.avatar && $auth.avatar.startsWith('/')}
          <img src={ssoUrl + $auth.avatar} alt="Avatar" class="user-avatar-img" />
        {:else if $auth.avatar}
          <span class="user-icon">{$auth.avatar}</span>
        {:else}
          <span class="material-symbols-sharp user-icon" aria-hidden="true">person</span>
        {/if}
        {#if $auth.is_present}
          <span class="presence-dot" title="Präsent im Makerspace"></span>
        {/if}
      </div>
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
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .user-icon {
    font-size: 1.2rem;
    vertical-align: middle;
  }

  .user-avatar-img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
  }

  .avatar-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .presence-dot {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 8px;
    height: 8px;
    background: #4caf50;
    border-radius: 50%;
    border: 1.5px solid #000;
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
