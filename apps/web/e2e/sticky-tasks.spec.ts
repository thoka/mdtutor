import { test, expect } from '@playwright/test';
import { checkSystemHealth } from './utils/health';

test.describe('Sticky Task Checkboxes', () => {
  test.beforeAll(async ({ request }) => {
    await checkSystemHealth(request);
  });

  test('checkbox remains visible when scrolling a long task', async ({ page }) => {
    await page.goto('/#/de-DE/projects/RPL:catch-the-bus/1');
    
    const task = page.locator('.c-project-task').first();
    const checkbox = task.locator('.c-project-task__checkbox');
    
    await expect(checkbox).toBeVisible();
    await task.scrollIntoViewIfNeeded();
    
    const baseline = await checkbox.boundingBox();
    if (!baseline) throw new Error('Checkbox box not found');
    console.log('[Sticky Test] Baseline Y:', baseline.y);

    // Scroll by 400px. If sticky at 20px, it should stop at 20px.
    // Natural position would be 279 - 400 = -121.
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(200);

    const current = await checkbox.boundingBox();
    if (!current) throw new Error('Checkbox box not found after scroll');
    
    console.log('[Sticky Test] Current Y after 400px scroll:', current.y);
    
    // If sticky at 20px, it should be around 20px.
    // Allow some margin for header/padding
    expect(current.y).toBeGreaterThanOrEqual(0);
    expect(current.y).toBeLessThan(100); 
    expect(current.y).toBeGreaterThan(-100); // It should NOT be -121
  });
});
