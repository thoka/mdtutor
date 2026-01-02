import { test, expect } from '@playwright/test';
import { checkSystemHealth } from './utils/health';

test.describe('Alice Achievement Scenario', () => {
  test.beforeAll(async ({ request }) => {
    await checkSystemHealth(request);
  });

  test.beforeEach(async ({ page }) => {
    // 1. Start at the app
    await page.goto('/');
    await page.goto('/');
    
    // 2. Click login if visible
    const loginBtn = page.getByRole('button', { name: 'Login' });
    try {
      await loginBtn.waitFor({ state: 'visible', timeout: 5000 });
      await loginBtn.click();
    } catch (e) {
      // Maybe already redirected or button not found
    }

    // 3. On SSO Login Page, click Alice (student_a)
    await page.waitForURL(url => url.hostname.includes('mdtutor.localhost') || url.port === '3103' || url.hostname.includes('sso.'), { timeout: 15000 });
    await page.locator('button.tile').filter({ hasText: 'Alice' }).click();

    // Handle PIN entry
    await page.waitForSelector('#pin');
    await page.fill('#pin', '1111');
    await page.click('button.submit-button');

    // 4. Should be back at the app, logged in
    await page.waitForURL(url => url.hostname.includes('mdtutor.localhost') || url.port === '5201', { timeout: 15000 });
    
    // Wait for auth to be reflected in UI
    await expect(page.locator('.user-info-button')).toContainText('Alice', { timeout: 15000 });
  });

  test('verifies catch-the-bus checkboxes are correctly synced for Alice', async ({ page }) => {
    // 1. Go to Scratch Intro pathway
    await page.goto('/#/de-DE/pathways/RPL:scratch-intro');
    
    // 2. Click "weiter bearbeiten" for Catch the Bus
    // Our seeds have Alice at 67% progress
    const projectCard = page.locator('.c-project-card').filter({ hasText: /Erwische den Bus/i });
    await expect(projectCard).toBeVisible({ timeout: 15000 });
    
    const continueBtn = projectCard.locator('.c-project-card__action-btn');
    await expect(continueBtn).toBeVisible();
    await continueBtn.click();

    // 3. Verify we are on a step (likely step 5 or 6)
    await page.waitForURL(url => url.toString().includes('catch-the-bus'), { timeout: 15000 });
    console.log(`[E2E] Navigated to: ${page.url()}`);

    // 4. Navigate back to Step 4 to check checkboxes
    await page.goto('/#/de-DE/projects/RPL:catch-the-bus/4');
    
    // 5. Check if checkboxes in Step 4 are actually checked
    const checkbox = page.locator('.c-project-task__checkbox').first();
    await expect(checkbox).toBeVisible({ timeout: 10000 });
    await expect(checkbox).toBeChecked();
  });

  test('verifies space-talk is shown as completed for Alice in pathway view', async ({ page }) => {
    // 1. Go to Scratch Intro pathway
    await page.goto('/#/de-DE/pathways/RPL:scratch-intro');
    
    // 2. Locate the "Weltraumgespräch" project card
    // Note: The text in the card is "Weltraumgespräch"
    const projectCard = page.locator('.c-project-card').filter({ hasText: /Weltraumgespräch/i });
    await expect(projectCard).toBeVisible({ timeout: 15000 });
    
    // 3. Verify it shows completion
    // The button should say "Fertig :-)" for completed projects in de-DE
    const actionBtn = projectCard.locator('.c-project-card__action-btn');
    await expect(actionBtn).toContainText('Fertig :-)', { timeout: 10000 });
    
    // 4. Verify the badge is unlocked (not locked class)
    const badgeContainer = projectCard.locator('.c-project-card__badge-container');
    await expect(badgeContainer).toHaveClass(/is-unlocked/);
    await expect(badgeContainer).not.toHaveClass(/is-locked/);
    
    // 5. Verify progress indicator shows all items completed
    const stepsCount = projectCard.locator('.c-project-card__steps-count');
    // For space-talk, we expect 2 / 2 (step 2, 5 have tasks, step 6 is quiz)
    // Actually, let's just check it contains ' / ' and the numbers match
    const text = await stepsCount.innerText();
    const [completed, total] = text.split('/').map(s => s.trim());
    expect(completed).toBe(total);
    expect(parseInt(total)).toBeGreaterThan(0);
  });
});

