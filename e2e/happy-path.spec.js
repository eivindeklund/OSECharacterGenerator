import { expect, test } from '@playwright/test';

test('Happy Path: complete character generation flow', async ({ page }) => {
  // 1. Landing Screen
  await page.goto('/');
  await expect(page).toHaveTitle(/Old-School Character Generator/);
  
  const startButton = page.getByRole('button', { name: /Start/i });
  await expect(startButton).toBeVisible();
  await startButton.click();

  // 2. Ability Screen
  // Verify we reached Ability Screen
  await expect(page.getByRole('heading', { name: /Ability Scores/i })).toBeVisible();
  
  // Roll All stats
  const rollAllButton = page.getByRole('button', { name: /Roll All/i });
  await rollAllButton.click();
  
  // Select a class - Fighter is usually available
  const fighterButton = page.getByRole('button', { name: /^Fighter$/i });
  await expect(fighterButton).toBeVisible();
  await fighterButton.click();
  
  // Navigate to Class Options
  const toClassOptionsButton = page.getByRole('button', { name: /Class Options/i });
  await toClassOptionsButton.click();

  // 3. Class Options Screen
  // Verify we reached Class Options
  await expect(page.getByText(/Hit Die/i)).toBeVisible();
  
  // Roll HP
  const rollHPButton = page.getByRole('button', { name: /Roll HP/i });
  await rollHPButton.click();
  
  // Navigate to Equipment
  const toEquipmentButton = page.getByRole('button', { name: /Equipment/i });
  await toEquipmentButton.click();

  // 4. Equipment Screen
  // Verify we reached Equipment Screen
  await expect(page.getByRole('heading', { name: /^Equipment$/i })).toBeVisible();
  
  // Roll Gold
  const rollGoldButton = page.getByRole('button', { name: /Roll Gold/i });
  await rollGoldButton.click();
  
  // Navigate to Character Details
  const toDetailsButton = page.getByRole('button', { name: /Character Details/i });
  await toDetailsButton.click();

  // 5. Details Screen
  // Verify we reached Details Screen
  await expect(page.getByRole('heading', { name: /Character Details/i })).toBeVisible();
  
  // Enter Name
  await page.locator('input[type="text"]').first().fill('E2E Test Hero');
  
  // Select Alignment
  const neutralButton = page.getByRole('button', { name: /^Neutral$/i });
  await neutralButton.click();
  
  // Navigate to Character Sheet
  const toSheetButton = page.getByRole('button', { name: /Character Sheet/i });
  await toSheetButton.click();

  // 6. Character Sheet Screen
  // Verify final rendering
  await expect(page.getByText(/Saving Throws/i)).toBeVisible();
  await expect(page.getByText(/E2E Test Hero/i)).toBeVisible();
  await expect(page.getByText(/Fighter/i)).toBeVisible();
});
