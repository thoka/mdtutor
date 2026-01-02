import { test, expect } from '@playwright/test';
import { checkSystemHealth } from './utils/health';

test.describe('Auto-Advance (Scroll & Navigate)', () => {
  test.beforeAll(async ({ request }) => {
    await checkSystemHealth(request);
  });

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER:', msg.text()));
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
  });

  test('with autoAdvance ENABLED: scrolls to next task or navigates to next step', async ({ page }) => {
    // Navigate to step 4 first to be on the correct origin
    await page.goto('/#/de-DE/projects/RPL:catch-the-bus/4');
    
    // NOW enable it
    await page.evaluate(() => {
      localStorage.setItem('user_preferences', JSON.stringify({ autoAdvance: true }));
      // Trigger a reload or wait for store to pick it up if possible
      window.location.reload();
    });
    
    await page.waitForURL(/projects\/RPL:catch-the-bus\/4/);
    
    const tasks = page.locator('.c-project-task');
    await expect(tasks.first()).toBeVisible();
    
    const firstCheckbox = tasks.first().locator('.c-project-task__checkbox');
    if (await firstCheckbox.isChecked()) {
      await firstCheckbox.uncheck();
      await page.waitForTimeout(500);
    }

    console.log('[E2E] Checking first task...');
    await firstCheckbox.check();
    
    await expect(async () => {
      const isScrolled = await page.evaluate(() => window.scrollY > 0);
      expect(isScrolled).toBeTruthy();
    }).toPass({ timeout: 5000 });

    console.log('[E2E] Checking last task...');
    const count = await tasks.count();
    const lastCheckbox = tasks.nth(count - 1).locator('.c-project-task__checkbox');
    
    if (await lastCheckbox.isChecked()) {
      await lastCheckbox.uncheck();
      await page.waitForTimeout(500);
    }
    
    await lastCheckbox.check();
    
    await expect(page).toHaveURL(/projects\/RPL:catch-the-bus\/5/, { timeout: 10000 });
  });
});
