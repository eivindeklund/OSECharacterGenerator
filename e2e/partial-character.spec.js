import { expect, test } from '@playwright/test';

const PARTIAL_KEY = 'partialCharacter';
const CHARACTER_STORAGE_KEY = 'characterStorage';

// Helper: start a character, roll abilities, and pick Fighter.
// Leaves the browser at /#/ability with a partial character auto-saved.
async function rollAbilitiesAndPickFighter(page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Start/i }).click();
  await expect(page.getByRole('heading', { name: /Ability Scores/i })).toBeVisible();
  await page.getByRole('button', { name: /Roll All/i }).click();
  await page.getByRole('button', { name: /^Fighter$/i }).click();
}

test.describe('Partial character persistence', () => {
  // Ensure a clean localStorage before each test in this group
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate((key) => localStorage.removeItem(key), PARTIAL_KEY);
  });

  test('Landing page shows Continue/Discard when a partial character exists', async ({ page }) => {
    await rollAbilitiesAndPickFighter(page);

    // Navigate back to landing
    await page.goto('/#/');

    // The "Start" button should be gone; Continue and Discard should appear
    await expect(page.getByRole('button', { name: /^Start$/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /Continue/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Discard/i })).toBeVisible();

    // Contextual label should mention the class
    await expect(page.getByText(/In progress.*Fighter/i)).toBeVisible();
  });

  test('Continue resumes at the furthest valid wizard step', async ({ page }) => {
    // After rolling stats + picking class but before rolling HP,
    // getFurthestRoute returns /class
    await rollAbilitiesAndPickFighter(page);
    await page.goto('/#/');

    await page.getByRole('button', { name: /Continue/i }).click();

    // Should land on Class screen (Hit Die is a distinctive element)
    await expect(page.getByText(/Hit Die/i)).toBeVisible();
  });

  test('Discard clears the partial and starts a fresh character', async ({ page }) => {
    await rollAbilitiesAndPickFighter(page);
    await page.goto('/#/');

    await page.getByRole('button', { name: /Discard/i }).click();

    // Should be on a fresh Ability screen — no class pre-selected
    await expect(page.getByRole('heading', { name: /Ability Scores/i })).toBeVisible();

    // Advancing to the class screen should be impossible (no scores rolled, no class selected)
    await expect(page.getByRole('button', { name: /Class Options/i })).toBeDisabled();

    // Any saved partial should be blank (new character id, no class), NOT the old Fighter partial
    const stored = await page.evaluate((key) => localStorage.getItem(key), PARTIAL_KEY);
    const partial = stored ? JSON.parse(stored) : null;
    expect(partial?.characterClass?.name ?? '').toBe('');
  });

  test('Reloading at /#/ability restores the wizard screen', async ({ page }) => {
    await rollAbilitiesAndPickFighter(page);

    // Reload while still at /#/ability
    await page.reload();

    // Ability screen should be visible (character-menu no longer hidden)
    await expect(page.getByRole('heading', { name: /Ability Scores/i })).toBeVisible();
    // Previous class selection should be restored
    await expect(page.getByRole('button', { name: /^Fighter$/i })).toBeVisible();
  });

  test('Reloading at /#/class restores the wizard screen', async ({ page }) => {
    await rollAbilitiesAndPickFighter(page);

    // Advance to class screen
    await page.getByRole('button', { name: /Class Options/i }).click();
    await expect(page.getByText(/Hit Die/i)).toBeVisible();

    await page.reload();

    await expect(page.getByText(/Hit Die/i)).toBeVisible();
  });

  test('Partial character appears in the Tavern with an In Progress badge', async ({ page }) => {
    await rollAbilitiesAndPickFighter(page);

    // Navigating to the tavern while the character is in-progress
    await page.goto('/#/tavern');

    await expect(page.locator('.character-button--partial')).toBeVisible();
    await expect(page.locator('.character-button--partial-badge')).toHaveText(/In Progress/i);
  });

  test('Clicking the partial in the Tavern resumes the wizard', async ({ page }) => {
    await rollAbilitiesAndPickFighter(page);
    await page.goto('/#/tavern');

    // Click the partial character card
    await page.locator('.character-button--partial').click();

    // getFurthestRoute → /class because stats are rolled and class is set but HP is not
    await expect(page.getByText(/Hit Die/i)).toBeVisible();
  });

  test('Deleting the partial from the Tavern removes the In-Progress entry and clears storage', async ({ page }) => {
    await rollAbilitiesAndPickFighter(page);
    await page.goto('/#/tavern');

    // Delete button appears on hover
    const partialCard = page.locator('.character-button--partial');
    await partialCard.hover();
    await partialCard.locator('.character-button--delete').click();

    // Card should disappear
    await expect(page.locator('.character-button--partial')).not.toBeVisible();

    // localStorage should be cleared
    const stored = await page.evaluate((key) => localStorage.getItem(key), PARTIAL_KEY);
    expect(stored).toBeNull();

    // Back to landing — plain "Start" button, no Continue/Discard
    await page.goto('/#/');
    await expect(page.getByRole('button', { name: /^Start$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue/i })).not.toBeVisible();
  });

  test('Saving a finished character clears the partial', async ({ page }) => {
    // Complete the full wizard flow — reaching /sheet triggers auto-save which also clears partial
    await rollAbilitiesAndPickFighter(page);
    await page.getByRole('button', { name: /Class Options/i }).click();
    await page.getByRole('button', { name: /Roll HP/i }).click();
    await page.getByRole('button', { name: /Equipment/i }).click();
    await page.getByRole('button', { name: /Roll Gold/i }).click();
    await page.getByRole('button', { name: /Character Details/i }).click();
    await page.locator('input[type="text"]').first().fill('Partial Save Hero');
    await page.getByRole('button', { name: /^Neutral$/i }).click();
    await page.getByRole('button', { name: /Character Sheet/i }).click();
    await expect(page.getByText(/Saving Throws/i)).toBeVisible();

    // saveCharacter fires on mount of CharacterSheetScreen, clearing the partial
    const stored = await page.evaluate((key) => localStorage.getItem(key), PARTIAL_KEY);
    expect(stored).toBeNull();

    // Tavern should show the finished character, not an In-Progress badge
    await page.goto('/#/tavern');
    await expect(page.locator('.character-button--partial')).not.toBeVisible();
    await expect(page.getByText(/Partial Save Hero/i)).toBeVisible();
  });
});

// Helper: complete the full wizard and save the character with the given name.
// Returns to '/' after saving.
async function saveCompleteCharacter(page, name) {
  await page.goto('/');
  await page.evaluate((key) => localStorage.removeItem(key), PARTIAL_KEY);
  await page.getByRole('button', { name: /Start/i }).click();
  await page.getByRole('button', { name: /Roll All/i }).click();
  await page.getByRole('button', { name: /^Fighter$/i }).click();
  await page.getByRole('button', { name: /Class Options/i }).click();
  await page.getByRole('button', { name: /Roll HP/i }).click();
  await page.getByRole('button', { name: /Equipment/i }).click();
  await page.getByRole('button', { name: /Roll Gold/i }).click();
  await page.getByRole('button', { name: /Character Details/i }).click();
  await page.locator('input[type="text"]').first().fill(name);
  await page.getByRole('button', { name: /^Neutral$/i }).click();
  await page.getByRole('button', { name: /Character Sheet/i }).click();
  await expect(page.getByText(/Saving Throws/i)).toBeVisible();
}

test.describe('Tavern button visibility and modal when partial is in progress', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(
      ([pk, csk]) => { localStorage.removeItem(pk); localStorage.removeItem(csk); },
      [PARTIAL_KEY, CHARACTER_STORAGE_KEY],
    );
  });

  test('Tavern button is visible at landing when a partial character exists', async ({ page }) => {
    // Create a partial by rolling ability scores then navigating back to /
    await rollAbilitiesAndPickFighter(page);
    await page.goto('/#/');
    // Partial now exists — Tavern button must still be visible
    await expect(page.getByRole('button', { name: /Tavern/i })).toBeVisible();
  });

  test('Modal is shown when clicking a saved character while partial is in progress', async ({ page }) => {
    await saveCompleteCharacter(page, 'Tavern Hero');
    // Full reload so React state resets (characterRolled → false, Start button visible)
    await page.goto('/');
    await page.getByRole('button', { name: /Start/i }).click();
    await page.getByRole('button', { name: /Roll All/i }).click();
    await page.getByRole('button', { name: /^Fighter$/i }).click();
    // Navigate to tavern
    await page.goto('/#/tavern');
    // Click the saved (complete) character
    await page.getByText(/Tavern Hero/i).click();
    // Dialog must appear
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog')).toContainText(/in.progress/i);
  });

  test('Confirming the modal clears the partial and loads the saved character', async ({ page }) => {
    await saveCompleteCharacter(page, 'Confirmed Hero');
    await page.goto('/');
    await page.getByRole('button', { name: /Start/i }).click();
    await page.getByRole('button', { name: /Roll All/i }).click();
    await page.getByRole('button', { name: /^Fighter$/i }).click();
    await page.goto('/#/tavern');
    await page.getByText(/Confirmed Hero/i).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: /Load Character/i }).click();
    // Should navigate to /sheet and show the saved character
    await expect(page).toHaveURL(/#\/sheet/);
    await expect(page.getByText(/Confirmed Hero/i)).toBeVisible();
    // Partial should be cleared from localStorage
    const stored = await page.evaluate((key) => localStorage.getItem(key), PARTIAL_KEY);
    expect(stored).toBeNull();
  });

  test('Cancelling the modal keeps the partial and stays in the tavern', async ({ page }) => {
    await saveCompleteCharacter(page, 'Cancel Hero');
    await page.goto('/');
    await page.getByRole('button', { name: /Start/i }).click();
    await page.getByRole('button', { name: /Roll All/i }).click();
    await page.getByRole('button', { name: /^Fighter$/i }).click();
    await page.goto('/#/tavern');
    const partialBefore = await page.evaluate((key) => localStorage.getItem(key), PARTIAL_KEY);
    await page.getByText(/Cancel Hero/i).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: /^Cancel$/i }).click();
    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
    // Still on tavern page; partial unchanged
    await expect(page).toHaveURL(/#\/tavern/);
    const partialAfter = await page.evaluate((key) => localStorage.getItem(key), PARTIAL_KEY);
    expect(partialAfter).not.toBeNull();
    expect(partialAfter).toEqual(partialBefore);
  });
});
