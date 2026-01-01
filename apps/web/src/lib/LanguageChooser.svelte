<script lang="ts">
  import { push, location } from 'svelte-spa-router';
  import { currentLanguage, availableLanguages } from './stores';
  import { t } from './i18n';
  
  // Subset of languages we want to support for now
  const supportedLanguages = ['de-DE', 'en'];

  // Map of language codes to display names
  const languageNames: Record<string, string> = {
    'de-DE': 'Deutsch',
    'en': 'English',
    'en-GB': 'English (UK)',
    'fr-FR': 'Français',
    'es-ES': 'Español',
    'es-LA': 'Español (Latinoamérica)',
    'it-IT': 'Italiano',
    'ja-JP': '日本語',
    'nl-NL': 'Nederlands',
    'pl-PL': 'Polski',
    'pt-BR': 'Português (Brasil)',
    'sv-SE': 'Svenska',
    'uk-UA': 'Українська',
    'ar-SA': 'العربية',
    'zh-CN': '简体中文'
  };

  let sortedLanguages = $derived([...$availableLanguages]
    .filter(lang => supportedLanguages.includes(lang))
    .sort((a, b) => {
      const nameA = languageNames[a] || a;
      const nameB = languageNames[b] || b;
      return nameA.localeCompare(nameB);
    })
  );

  function handleLanguageChange(event: Event) {
    const newLang = (event.target as HTMLSelectElement).value;
    
    // Get current path from hash
    const currentPath = $location;
    
    // Update URL: /:lang/projects/...
    const parts = currentPath.split('/').filter(p => p);
    
    if (parts.length >= 1 && (parts[0].includes('-') || parts[0] === 'en')) {
      // It looks like a language code
      parts[0] = newLang;
    } else {
      // No language code found, prepend it
      parts.unshift(newLang);
      if (parts[1] !== 'projects') {
          parts.splice(1, 0, 'projects');
      }
    }
    
    const newPath = '/' + parts.join('/');
    push(newPath);
  }
</script>

<div class="c-language-chooser">
  <span class="c-language-chooser__label">{$t('language')}:</span>
  <select 
    id="language-select" 
    value={$currentLanguage} 
    onchange={handleLanguageChange}
    class="c-language-chooser__select"
  >
    {#each sortedLanguages as lang}
      <option value={lang}>{languageNames[lang] || lang}</option>
    {/each}
  </select>
</div>

<style>
  .c-language-chooser {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    font-family: var(--font-family-body);
  }
  
  .c-language-chooser__label {
    font-size: 0.9rem;
    font-weight: bold;
    color: #fff;
  }

  .c-language-chooser__select {
    background: #222;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 0.9rem;
    color: #fff;
    cursor: pointer;
    outline: none;
  }

  .c-language-chooser__select:focus {
    border-color: var(--rpf-blue-500);
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
  }
</style>
