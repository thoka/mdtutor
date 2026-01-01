import { test, expect } from '@playwright/test';

test.describe('Alice Achievement Scenario', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Start at the app
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
    await page.waitForURL(/localhost:3103/, { timeout: 10000 });
    await page.locator('button.tile').filter({ hasText: 'Alice' }).click();

    // Handle PIN entry
    await page.waitForSelector('#pin');
    await page.fill('#pin', '1111');
    await page.click('button.submit-button');

    // 4. Should be back at the app, logged in
    await page.waitForURL(/localhost:5201/, { timeout: 10000 });
  });

  test('verifies catch-the-bus checkboxes are correctly synced for Alice', async ({ page }) => {
    // 1. Go to Scratch Intro pathway
    await page.goto('/#/de-DE/pathway/scratch-intro');
    
    // 2. Click "weiter bearbeiten" for Catch the Bus
    // Our seeds have Alice at 67% progress
    const projectCard = page.locator('.c-project-card').filter({ hasText: /Erwische den Bus/i });
    await expect(projectCard).toBeVisible({ timeout: 15000 });
    
    const continueBtn = projectCard.locator('.c-project-card__action-btn');
    await continueBtn.click();

    // 3. Verify we are on a step (likely step 6 since 0-5 are done)
    await page.waitForURL(/projects\/RPL:catch-the-bus\/6/, { timeout: 15000 });

    // 4. Navigate back to Step 4 to check checkboxes
    // We can use the sidebar or navigation
    await page.goto('/#/de-DE/projects/RPL:catch-the-bus/4');
    
    // 5. Check if checkboxes in Step 4 are actually checked
    // Our seeds now check all tasks for steps 0-5
    const checkboxes = page.locator('.c-project-task__checkbox');
    const count = await checkboxes.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).toBeChecked();
    }
  });
});

