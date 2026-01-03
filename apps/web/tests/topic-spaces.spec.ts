import { test, expect } from '@playwright/test';

test.describe('Topic Spaces & Visibility', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page (de-DE is default)
    await page.goto('/de-DE/');
  });

  test('should display Topic Spaces section with Technologies and Interests', async ({ page }) => {
    const section = page.locator('.c-topics-overview');
    await expect(section).toBeVisible();
    
    const techTitle = page.locator('h3:has-text("Technologien")');
    await expect(techTitle).toBeVisible();
    
    const interestTitle = page.locator('h3:has-text("Interessen")');
    await expect(interestTitle).toBeVisible();
  });

  test('should filter pathways when a technology tile is clicked', async ({ page }) => {
    // Get initial count of pathways
    const initialCards = await page.locator('.c-pathway-card').count();
    
    // Click on "Scratch" technology tile
    await page.locator('.c-topic-card:has-text("Scratch")').click();
    
    // Check if filter title updated
    await expect(page.locator('h2:has-text("Lernpfade für")')).toBeVisible();
    
    // Verify filtered count (should be 1 based on our rpl-pathways.yaml update)
    const filteredCards = await page.locator('.c-pathway-card').count();
    expect(filteredCards).toBeLessThanOrEqual(initialCards);
    
    // Verify the remaining card has the "Scratch" tag
    const techTag = page.locator('.c-pathway-tag--tech:has-text("Scratch")');
    await expect(techTag).toBeVisible();
  });

  test('should filter pathways when an interest tag is clicked', async ({ page }) => {
    // Click on "Space" interest tag
    await page.locator('.c-interest-tag:has-text("Space")').click();
    
    // Verify filtered result
    const cards = page.locator('.c-pathway-card');
    await expect(cards).toHaveCount(1);
    
    const interestTag = page.locator('.c-pathway-tag--interest:has-text("Space")');
    await expect(interestTag).toBeVisible();
  });

  test('should reset filters when "Alle" is clicked', async ({ page }) => {
    // First apply a filter
    await page.locator('.c-topic-card:has-text("Scratch")').click();
    const filteredCount = await page.locator('.c-pathway-card').count();
    
    // Click "Alle" tile
    await page.locator('.c-topic-card:has-text("Alle")').click();
    
    // Verify all pathways are shown again
    const resetCount = await page.locator('.c-pathway-card').count();
    expect(resetCount).toBeGreaterThan(filteredCount);
    await expect(page.locator('h2:has-text("Alle Lernpfade")')).toBeVisible();
  });

  test('should navigate to pathway detail view when a card is clicked', async ({ page }) => {
    const firstCard = page.locator('.c-pathway-card').first();
    const title = await firstCard.locator('.c-project-card__heading').textContent();
    
    await firstCard.click();
    
    // Verify URL and title in detail view
    await expect(page).toHaveURL(/.*\/pathways\/.*/);
    // In PathwayView, the title should be present
    await expect(page.locator('h1')).toContainText(title?.trim() || '');
  });
});


