import { test, expect } from '@playwright/test';

test.describe('Tutorial Interactions (E2E)', () => {
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

    await page.waitForURL(/localhost:3103/, { timeout: 10000 });
    await page.locator('button.tile').filter({ hasText: 'Alice' }).click();
    
    // Handle PIN entry
    await page.waitForSelector('#pin');
    await page.fill('#pin', '1111');
    await page.click('button.submit-button');

    await page.waitForURL(/localhost:5201/, { timeout: 10000 });
  });

  test('handles task checking and unchecking with backend sync', async ({ page }) => {
    // 1. Open a project that Alice hasn't finished yet
    await page.goto('/#/de-DE/projects/RPL:find-the-bug/1');
    await expect(page.locator('h1')).toContainText('Finde den Bug');

    // 2. Find a checkbox.
    const checkboxes = page.locator('.c-project-task__checkbox');
    await expect(checkboxes.first()).toBeVisible();
    
    // In our seeds, step 1 of find-the-bug has 10 tasks, 5 checked.
    const unchecked = checkboxes.filter({ hasNot: page.locator(':checked') }).first();
    const checked = checkboxes.filter({ has: page.locator(':checked') }).first();

    // 3. Check an unchecked one
    await unchecked.check();
    await expect(unchecked).toBeChecked();

    // 4. Uncheck a checked one
    await checked.uncheck();
    await expect(checked).not.toBeChecked();

    // 5. Reload and verify state persists (Backend Sync)
    await page.reload();
    await expect(page.locator('.c-project-task__checkbox').nth(5)).toBeChecked(); // The one we checked
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
    await page.goto('http://localhost:3103/dashboard');
    
    // Alice should be there, and her latest action should be "Liest Schritt" (step_view)
    const aliceCard = page.locator('.user-card').filter({ hasText: 'Alice' });
    await expect(aliceCard.locator('.action-type')).toHaveText('Liest Schritt');
    await expect(aliceCard.locator('.action-gid')).toContainText(/RPL:(PROJ:)?catch-the-bus/);
  });
});

