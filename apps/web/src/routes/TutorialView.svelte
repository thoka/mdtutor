<script lang="ts">
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import Sidebar from '../lib/Sidebar.svelte';
  import StepContent from '../lib/StepContent.svelte';
  import { trackAction } from '../lib/achievements';
  import { calculateProgress } from '../lib/progress';
  import { auth } from '../lib/auth';
  import { tutorial, loading, error, currentStep, completedSteps, completedProjects, currentLanguage, availableLanguages } from '../lib/stores';
  import { t } from '../lib/i18n';
  
  let { params = {} }: { params?: { slug?: string; step?: string; lang?: string } } = $props();
  
  let tutorialData = $state<any>(null);
  let userState = $state<UserState | null>(null);
  let isLoading = $state(true);
  let errorMsg = $state<string | null>(null);
  let step = $state(0);
  let slug = $state('silly-eyes');
  // Default to German (de-DE) to match API server default
  let lang = $state('de-DE');
  
  $effect(() => {
    slug = params.slug || 'silly-eyes';
    step = params.step ? parseInt(params.step) : 0;
    lang = params.lang || 'de-DE';
    currentStep.set(step);
    currentLanguage.set(lang);
    
    // We also want to re-load if the user logs in/out
    const user = $auth;
    
    // Reload tutorial when slug, step or lang changes
    loadTutorial();
  });
  
  async function loadTutorial() {
    isLoading = true;
    errorMsg = null;
    
    try {
      const response = await fetch(`/api/projects/${slug}?lang=${lang}`);
      if (!response.ok) {
        throw new Error(`Failed to load tutorial: ${response.statusText}`);
      }
      tutorialData = await response.json();
      
      // Load user state (aggregated achievements) if logged in
      const token = localStorage.getItem('sso_token');
      console.log('[TutorialView] Checking for token...', token ? 'Found' : 'Missing');
      
      if (token && token.includes('.')) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userId = payload.user_id;
          console.log('[TutorialView] Token user_id:', userId);
          
          if (userId) {
            const stateRes = await fetch(`/api/v1/actions/user/${userId}/state`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (stateRes.ok) {
              userState = await stateRes.json();
              console.log('[TutorialView] Loaded aggregated user state for', userId);
              
              // If no step index was provided in URL, jump to last viewed step
              if (params.step === undefined && tutorialData && userState) {
                const progress = calculateProgress(tutorialData, userState);
                if (progress.lastStep > 0) {
                  step = progress.lastStep;
                  currentStep.set(step);
                  push(`/${lang}/projects/${slug}/${step}`);
                }
              }
            }
          }
        } catch (e) {
          console.warn('Failed to fetch user state', e);
        }
      }

      // Track project open
      trackAction('project_open', tutorialData.data.id, { slug, lang });
      // Track initial step view
      trackAction('step_view', tutorialData.data.id, { step, slug, lang });

      tutorial.set(tutorialData);
      if (tutorialData.languages) {
        availableLanguages.set(tutorialData.languages);
      }
      completedSteps.load(slug);
      completedProjects.load();
      
      // Validate step number
      if (tutorialData && step >= tutorialData.data.attributes.content.steps.length) {
        step = 0;
        push(`/${lang}/projects/${slug}/0`);
      }
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Unknown error';
      error.set(errorMsg);
    } finally {
      isLoading = false;
      loading.set(false);
    }
  }
  
  function handleNavigate(newStep: number) {
    trackAction('step_view', tutorialData.data.id, { step: newStep, slug, lang });
    push(`/${lang}/projects/${slug}/${newStep}`);
  }
  
  function handlePrevious() {
    if (step > 0) {
      trackAction('step_view', tutorialData.data.id, { step: step - 1, slug, lang });
      push(`/${lang}/projects/${slug}/${step - 1}`);
    }
  }
  
  function handleNext() {
    if (tutorialData && step < tutorialData.data.attributes.content.steps.length - 1) {
      completedSteps.complete(slug, step);
      trackAction('step_complete', tutorialData.data.id, { step, slug, lang });
      trackAction('step_view', tutorialData.data.id, { step: step + 1, slug, lang });
      push(`/${lang}/projects/${slug}/${step + 1}`);
    } else if (tutorialData && step === tutorialData.data.attributes.content.steps.length - 1) {
      // Last step completed
      completedSteps.complete(slug, step);
      completedProjects.complete(tutorialData.data.id);
      trackAction('step_complete', tutorialData.data.id, { step, slug, lang });
      trackAction('project_complete', tutorialData.data.id, { slug, lang });
      // Optionally redirect to pathway or home
    }
  }
</script>

{#if isLoading}
  <div class="loading">{$t('loading')}</div>
{:else if errorMsg}
  <div class="error">{$t('error')}: {errorMsg}</div>
{:else if tutorialData}
  <div class="c-project theme-blue">
      <div class="no-print">
        <header>
          <div class="c-project-header">
            <div class="c-project-header__content">
              <div class="c-project-header__text">
                <h1 class="c-project-header__title">{tutorialData.data.attributes.content.title}</h1>
              </div>
              {#if tutorialData.data.attributes.content.heroImage}
                <figure>
                  <img alt="" class="c-project-header__image" src={tutorialData.data.attributes.content.heroImage} />
                </figure>
              {/if}
            </div>
          </div>
        </header>
      </div>
      
      <div class="no-print">
        <main class="c-project__layout u-clearfix" id="c-project__layout">
          <div class="c-project__container">
            <Sidebar 
              steps={tutorialData.data.attributes.content.steps}
              currentStep={step}
              {slug}
              onNavigate={handleNavigate}
            />
            
            <section class="c-project__content">
              <div class="c-project-steps">
                <div>
                  <div>
                    <div class="c-project-steps__wrapper" id="skiptocontent">
                      <div class="c-wysiwyg-new">
                        <div class="c-project-steps__content">
                          {#if tutorialData.data.attributes.content.steps[step]}
                            {@const currentStepData = tutorialData.data.attributes.content.steps[step]}
                            
                            <StepContent
                              content={currentStepData.content}
                              {slug}
                              gid={tutorialData.data.id}
                              {step}
                              userActionsOrState={userState || []}
                            />
                          {/if}
                        </div>
                      </div>
                    </div>
                    
                    <nav class="c-project-step-navigation" dir="ltr">
                      {#if step > 0}
                        {@const prevStepData = tutorialData.data.attributes.content.steps[step - 1]}
                        <a 
                          class="rpf-button rpf-button--primary rpf-button c-project-step-navigation__link--previous" 
                          href="/{lang}/projects/{slug}/{step - 1}"
                          onclick={(e) => { e.preventDefault(); handlePrevious(); }}
                        >
                          <span class="rpf-button__icon material-symbols-sharp" aria-hidden="true" aria-label="chevron_left">chevron_left</span>
                          <span class="text">{prevStepData.title}</span>
                        </a>
                      {/if}
                      
                      {#if step < tutorialData.data.attributes.content.steps.length - 1}
                        {@const nextStepData = tutorialData.data.attributes.content.steps[step + 1]}
                        <a 
                          class="rpf-button rpf-button--primary rpf-button rpf-button--right c-project-step-navigation__link--next"
                          href="/{lang}/projects/{slug}/{step + 1}"
                          onclick={(e) => { e.preventDefault(); handleNext(); }}
                        >
                          <span class="text">{nextStepData.title}</span>
                          <span class="rpf-button__icon material-symbols-sharp" aria-hidden="true" aria-label="chevron_right">chevron_right</span>
                        </a>
                      {/if}
                    </nav>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
      
      <div class="c-printout-images-preloader">
        <!-- Preloaded images for print -->
      </div>
      <div class="print-only">
        <!-- Print-only content (hidden on screen) -->
        <svg class="c-scratchblock-svg-filters">
          <defs>
            <!-- SVG filters for Scratch blocks -->
          </defs>
      </svg>
    </div>
  </div>
{/if}
