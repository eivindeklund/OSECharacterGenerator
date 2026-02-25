import { expect, test } from '@playwright/test';

test('Tavern: navigating to a saved character loads the character sheet without errors', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // 1. Landing Screen → start character generation
  await page.goto('/');
  await page.getByRole('button', { name: /Start/i }).click();

  // 2. Ability Screen → roll all stats and pick a class
  await expect(page.getByRole('heading', { name: /Ability Scores/i })).toBeVisible();
  await page.getByRole('button', { name: /Roll All/i }).click();
  await page.getByRole('button', { name: /^Fighter$/i }).click();

  // 3. Class Options Screen → roll HP
  await page.getByRole('button', { name: /Class Options/i }).click();
  await expect(page.getByText(/Hit Die/i)).toBeVisible();
  await page.getByRole('button', { name: /Roll HP/i }).click();

  // 4. Equipment Screen → roll gold
  await page.getByRole('button', { name: /Equipment/i }).click();
  await page.getByRole('button', { name: /Roll Gold/i }).click();

  // 5. Details Screen → enter name and alignment
  await page.getByRole('button', { name: /Character Details/i }).click();
  await expect(page.getByRole('heading', { name: /Character Details/i })).toBeVisible();
  await page.locator('input[type="text"]').first().fill('Tavern Test Hero');
  await page.getByRole('button', { name: /^Neutral$/i }).click();

  // 6. Character Sheet Screen → auto-saved on mount
  await page.getByRole('button', { name: /Character Sheet/i }).click();
  await expect(page.getByText(/Saving Throws/i)).toBeVisible();
  await expect(page.getByText(/Tavern Test Hero/i)).toBeVisible();

  // 7. Navigate to the Tavern
  await page.getByRole('button', { name: /Tavern/i }).click();
  await expect(page.getByRole('heading', { name: /tavern/i })).toBeVisible();

  // 8. Click on the saved character — this previously threw:
  //    "characterClass.xpModifierPercentage is not a function"
  await page.locator('.character-button--name', { hasText: 'Tavern Test Hero' }).click();

  // 9. Verify the character sheet loaded correctly
  await expect(page.getByText(/Saving Throws/i)).toBeVisible();
  await expect(page.getByText(/Tavern Test Hero/i)).toBeVisible();
  await expect(page.getByText(/Fighter/i)).toBeVisible();

  // 10. Verify no console errors were thrown
  const xpModifierErrors = consoleErrors.filter(e =>
    e.includes('xpModifierPercentage') || e.includes('is not a function')
  );
  expect(xpModifierErrors).toEqual([]);
});
