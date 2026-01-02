import { test, expect } from '@playwright/test';
import { checkSystemHealth } from './utils/health';

test.describe('Tutorial Interactions (E2E)', () => {
  test.beforeAll(async ({ request }) => {
    await checkSystemHealth(request);
  });

  test.beforeEach(async ({ page }) => {
    // Standard login as Alice
    await page.goto('/');
    
    // Check if we are already logged in or need to click login
    const loginBtn = page.getByRole('button', { name: 'Login' });
    try {
      await loginBtn.waitFor({ state: 'visible', timeout: 5000 });
      await loginBtn.click();
    } catch (e) {
      // Maybe already redirected or button not found
    }

    await page.waitForURL(url => url.hostname.includes('mdtutor.localhost') || url.port === '3103' || url.hostname.includes('sso.'), { timeout: 15000 });
    await page.locator('button.tile').filter({ hasText: 'Alice' }).click();
    
    // Handle PIN entry
    await page.waitForSelector('#pin');
    await page.fill('#pin', '1111');
    await page.click('button.submit-button');

    await page.waitForURL(url => url.hostname.includes('mdtutor.localhost') || url.port === '5201', { timeout: 15000 });
    // Wait for auth to be reflected in UI
    await expect(page.locator('.user-info-button')).toContainText('Alice', { timeout: 15000 });
  });

  test('handles task checking and unchecking with backend sync', async ({ page }) => {
    // 1. Open a project that Alice hasn't finished yet
    await page.goto('/#/de-DE/projects/RPL:find-the-bug/1');
    await expect(page.locator('h1')).toContainText('Finde den Bug');

    // 2. Find a checkbox.
    const checkbox = page.locator('.c-project-task__checkbox').first();
    await expect(checkbox).toBeVisible({ timeout: 15000 });
    
    // We expect some to be checked from seeds (Alice has actions for find-the-bug)
    // If none are checked, something is wrong with sync
    await expect(checkbox).toBeChecked();

    // 3. Uncheck it
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();

    // 4. Reload and verify state persists (Backend Sync)
    await page.reload();
    const checkboxAfterReload = page.locator('.c-project-task__checkbox').first();
    await expect(checkboxAfterReload).toBeVisible();
    await expect(checkboxAfterReload).not.toBeChecked();
  });

  test('shows play overlay for Scratch and tracks start', async ({ page }) => {
    await page.goto('/#/de-DE/projects/RPL:catch-the-bus/0');
    
    const overlay = page.locator('.scratch-play-overlay');
    await overlay.waitFor({ state: 'visible', timeout: 10000 });
    await expect(overlay.locator('.material-symbols-sharp')).toHaveText('play_circle');

    // Click overlay
    await overlay.click();
    
    // Overlay should disappear and iframe should stay
    await expect(overlay).not.toBeAttached();
    const iframe = page.locator('.scratch-preview iframe');
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute('src', /autostart=true/);
  });

  test('handles quiz interaction: selection, checking, and feedback', async ({ page }) => {
    // Step 7 of catch-the-bus is a quiz
    await page.goto('/#/de-DE/projects/RPL:catch-the-bus/7');
    
    const quizForm = page.locator('form.knowledge-quiz-question').first();
    await expect(quizForm).toBeVisible();

    // 1. Verify no answer is selected initially
    const checkedRadios = quizForm.locator('input[type="radio"]:checked');
    await expect(checkedRadios).toHaveCount(0);

    // 2. Select an answer (click label to be safe)
    const firstLabel = quizForm.locator('label').first();
    await firstLabel.click();
    
    // 3. Click Check
    const checkBtn = quizForm.locator('input[type="button"]');
    await expect(checkBtn).toBeEnabled();
    await checkBtn.click();

    // 4. Verify feedback appears
    const feedback = quizForm.locator('.knowledge-quiz-question__feedback-item--show');
    await expect(feedback).toBeVisible({ timeout: 10000 });
  });

  test('verifies navigation stability (no unintended actions)', async ({ page }) => {
    // Open Project
    await page.goto('/#/de-DE/projects/RPL:catch-the-bus/0');
    
    // Navigate steps
    const nextBtn = page.locator('.c-project-step-navigation__link--next');
    await nextBtn.click();
    await expect(page).toHaveURL(/projects\/RPL:catch-the-bus\/1/);
    
    // Go to dashboard to see latest activity
    const ssoBase = process.env.SSO_URL || 'http://localhost:3103';
    await page.goto(`${ssoBase}/dashboard`);
    
    // Alice should be there, and her latest action should be "Liest Schritt" (step_view) or "Schritt abgeschlossen"
    const aliceCard = page.locator('.user-card').filter({ hasText: 'Alice' });
    await expect(aliceCard.locator('.action-type')).toHaveText(/Liest Schritt|Schritt abgeschlossen/);
    await expect(aliceCard.locator('.action-gid')).toContainText(/RPL:(PROJ:)?catch-the-bus/);
  });
});

