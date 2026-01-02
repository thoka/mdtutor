import { test, expect } from '@playwright/test';
import { checkSystemHealth } from './utils/health';

test.describe('Sidebar Progress Indicators (E2E)', () => {
  test.beforeAll(async ({ request }) => {
    await checkSystemHealth(request);
  });

  test.beforeEach(async ({ page }) => {
    // Login as Alice
    await page.goto('/');
    const loginBtn = page.getByRole('button', { name: 'Login' });
    try {
      await loginBtn.waitFor({ state: 'visible', timeout: 5000 });
      await loginBtn.click();
    } catch (e) {}

    await page.waitForURL(url => url.hostname.includes('mdtutor.localhost') || url.port === '3103' || url.hostname.includes('sso.'), { timeout: 15000 });
    await page.locator('button.tile').filter({ hasText: 'Alice' }).click();
    await page.waitForSelector('#pin');
    await page.fill('#pin', '1111');
    await page.click('button.submit-button');
    await page.waitForURL(url => url.hostname.includes('mdtutor.localhost') || url.port === '5201', { timeout: 15000 });
    await expect(page.locator('.user-info-button')).toContainText('Alice', { timeout: 15000 });
  });

  test('updates sidebar indicator when checking a task', async ({ page }) => {
    // 1. Go to step 2 (known to have tasks)
    await page.goto('/#/de-DE/projects/RPL:catch-the-bus/2');
    
    // 2. Identify the sidebar indicator for Step 2
    const sidebarItem = page.locator('.c-project-navigation__item').nth(2);
    const indicator = sidebarItem.locator('.c-step-progress-circle');
    
    // Ensure it's visible
    await expect(indicator).toBeVisible({ timeout: 10000 });
    
    // 3. Find checkboxes
    const checkboxes = page.locator('.c-project-task__checkbox');
    await expect(checkboxes.first()).toBeVisible();
    
    // Uncheck first if checked
    if (await checkboxes.first().isChecked()) {
      await checkboxes.first().uncheck();
      await expect(indicator).not.toHaveClass(/--done/);
    }
    
    const initialText = await indicator.innerText();
    console.log('[E2E] Initial sidebar text for step 2:', initialText);

    // 4. Check it
    await checkboxes.first().check();

    // 5. Verify sidebar text updated
    await expect(async () => {
      const newText = await indicator.innerText();
      expect(newText).not.toBe(initialText);
    }).toPass();
  });

  test('shows green checkmark when all tasks in a step are completed', async ({ page }) => {
    await page.goto('/#/de-DE/projects/RPL:catch-the-bus/2');
    
    const checkboxes = page.locator('.c-project-task__checkbox');
    await expect(checkboxes.first()).toBeVisible();
    
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      const cb = checkboxes.nth(i);
      if (!(await cb.isChecked())) {
        await cb.check();
      }
    }

    // Verify sidebar shows green checkmark
    const sidebarItem = page.locator('.c-project-navigation__item').nth(2);
    const indicator = sidebarItem.locator('.c-step-progress-circle--done');
    await expect(indicator).toBeVisible({ timeout: 10000 });
    await expect(indicator.locator('.material-symbols-sharp')).toHaveText('check');
  });
});
