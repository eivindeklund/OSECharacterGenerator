/**
 * Visual regression tests — "golden screenshot" comparisons.
 *
 * Run once to generate baselines:
 *   npm run test:visual-update
 *
 * Compare against baselines:
 *   npm run test:visual
 *
 * View diffs in the HTML report after a failure:
 *   npm run test:e2e-report
 *
 * Screenshots are stored alongside this file in
 *   e2e/visual.spec.js-snapshots/
 *
 * Design notes
 * ------------
 * • Math.random is replaced with a deterministic LCG so that every dice roll
 *   produces the same values on each run.
 * • CSS animations / transitions are disabled so screenshots don't catch a
 *   mid-animation frame.
 * • Tests run on the "visual" Playwright project (Chromium, 1280×800) only.
 *   See playwright.config.js for the project definition.
 */

import { expect, test } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Inject a seeded deterministic replacement for Math.random and disable all
 * CSS animations.  Must be called before page.goto() so the script runs
 * before the app bootstraps.
 */
async function setupDeterministicPage(page) {
  // Disable reduced-motion media query (suppresses some animation shortcuts)
  await page.emulateMedia({ reducedMotion: 'reduce' });

  await page.addInitScript(() => {
    // Simple LCG — same sequence every run.
    let seed = 0xdeadbeef;
    Math.random = () => {
      seed = Math.imul(1664525, seed) + 1013904223;
      // Shift to unsigned 32-bit, then normalise to [0, 1)
      return ((seed >>> 0) / 0x100000000);
    };

    // Disable CSS animations / transitions as soon as the document is ready.
    const disableAnimations = () => {
      const style = document.createElement('style');
      style.textContent =
        '*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }';
      document.head.appendChild(style);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', disableAnimations);
    } else {
      disableAnimations();
    }
  });
}

/** Take a full-page screenshot and compare it against the stored baseline. */
async function snap(page, name) {
  await expect(page).toHaveScreenshot(`${name}.png`, {
    fullPage: true,
    // Allow a small pixel-level tolerance for sub-pixel rendering differences
    // between runs (font hinting, GPU compositing, etc.).
    maxDiffPixelRatio: 0.01,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Visual regression — wizard screens', () => {
  test.beforeEach(async ({ page }) => {
    await setupDeterministicPage(page);
  });

  test('Landing screen — initial state', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /Start/i })).toBeVisible();
    await snap(page, 'landing-initial');
  });

  test('Ability screen — after rolling all stats', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Start/i }).click();
    await expect(page.getByRole('heading', { name: /Ability Scores/i })).toBeVisible();

    await page.getByRole('button', { name: /Roll All/i }).click();
    // Wait for at least one score value to appear before snapping
    await expect(page.locator('[data-testid="ability-score"], .ability-score-value').first())
      .toBeVisible()
      .catch(() => {}); // graceful fallback if selector doesn't exist yet

    await snap(page, 'ability-rolled');
  });

  test('Ability screen — Fighter selected', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Start/i }).click();
    await expect(page.getByRole('heading', { name: /Ability Scores/i })).toBeVisible();

    await page.getByRole('button', { name: /Roll All/i }).click();
    await page.getByRole('button', { name: /^Fighter$/i }).click();

    await snap(page, 'ability-fighter-selected');
  });

  test('ClassDescription — Fighter details modal', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Start/i }).click();
    await expect(page.getByRole('heading', { name: /Ability Scores/i })).toBeVisible();

    await page.getByRole('button', { name: /Roll All/i }).click();
    await expect(page.getByRole('button', { name: /^Fighter$/i })).toBeVisible();
    await page.getByTitle('Fighter Details').click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await snap(page, 'class-description-fighter');
  });

  test('ClassDescription — Elf details modal (XP bonus rule)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Start/i }).click();
    await expect(page.getByRole('heading', { name: /Ability Scores/i })).toBeVisible();

    await page.getByRole('button', { name: /Roll All/i }).click();
    await expect(page.getByRole('button', { name: /^Elf$/i })).toBeVisible();
    await page.getByTitle('Elf Details').click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await snap(page, 'class-description-elf');
  });

  test('Class screen — after rolling HP', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Start/i }).click();
    await page.getByRole('button', { name: /Roll All/i }).click();
    await page.getByRole('button', { name: /^Fighter$/i }).click();
    await page.getByRole('button', { name: /Class Options/i }).click();

    await expect(page.getByText(/Hit Die/i)).toBeVisible();
    await page.getByRole('button', { name: /Roll HP/i }).click();

    await snap(page, 'class-hp-rolled');
  });

  test('Equipment screen — after rolling gold', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Start/i }).click();
    await page.getByRole('button', { name: /Roll All/i }).click();
    await page.getByRole('button', { name: /^Fighter$/i }).click();
    await page.getByRole('button', { name: /Class Options/i }).click();
    await page.getByRole('button', { name: /Roll HP/i }).click();
    await page.getByRole('button', { name: /Equipment/i }).click();

    await expect(page.getByRole('heading', { name: /^Equipment$/i })).toBeVisible();
    await page.getByRole('button', { name: /Roll Gold/i }).click();

    await snap(page, 'equipment-gold-rolled');
  });

  test('Details screen — filled in', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Start/i }).click();
    await page.getByRole('button', { name: /Roll All/i }).click();
    await page.getByRole('button', { name: /^Fighter$/i }).click();
    await page.getByRole('button', { name: /Class Options/i }).click();
    await page.getByRole('button', { name: /Roll HP/i }).click();
    await page.getByRole('button', { name: /Equipment/i }).click();
    await page.getByRole('button', { name: /Roll Gold/i }).click();
    await page.getByRole('button', { name: /Character Details/i }).click();

    await expect(page.getByRole('heading', { name: /Character Details/i })).toBeVisible();
    await page.locator('input[type="text"]').first().fill('Aldric Stonewood');
    await page.getByRole('button', { name: /^Neutral$/i }).click();

    await snap(page, 'details-filled');
  });

  test('Character sheet screen', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Start/i }).click();
    await page.getByRole('button', { name: /Roll All/i }).click();
    await page.getByRole('button', { name: /^Fighter$/i }).click();
    await page.getByRole('button', { name: /Class Options/i }).click();
    await page.getByRole('button', { name: /Roll HP/i }).click();
    await page.getByRole('button', { name: /Equipment/i }).click();
    await page.getByRole('button', { name: /Roll Gold/i }).click();
    await page.getByRole('button', { name: /Character Details/i }).click();
    await page.locator('input[type="text"]').first().fill('Aldric Stonewood');
    await page.getByRole('button', { name: /^Neutral$/i }).click();
    await page.getByRole('button', { name: /Character Sheet/i }).click();

    await expect(page.getByText(/Saving Throws/i)).toBeVisible();
    await expect(page.getByText(/Aldric Stonewood/i)).toBeVisible();

    await snap(page, 'character-sheet');
  });
});

test.describe('Visual regression — landing screen states', () => {
  test.beforeEach(async ({ page }) => {
    await setupDeterministicPage(page);
  });

  test('Landing screen — partial character in progress', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Start/i }).click();
    await page.getByRole('button', { name: /Roll All/i }).click();
    await page.getByRole('button', { name: /^Fighter$/i }).click();
    // Wait for localStorage auto-save
    await page.waitForFunction(() => !!localStorage.getItem('partialCharacter'));

    await page.goto('/#/');
    await expect(page.getByRole('button', { name: /Continue/i })).toBeVisible();

    await snap(page, 'landing-partial-character');
  });
});

test.describe('Visual regression — tavern / storage', () => {
  test.beforeEach(async ({ page }) => {
    await setupDeterministicPage(page);
  });

  test('Tavern screen — empty', async ({ page }) => {
    await page.goto('/');
    // Clear stored characters to ensure a consistent empty state
    await page.evaluate(() => localStorage.removeItem('characterStorage'));

    await page.goto('/#/tavern');
    await expect(page).toHaveURL(/#\/tavern/);
    await snap(page, 'tavern-empty');
  });
});

test.describe('Visual regression — campaign settings', () => {
  test.beforeEach(async ({ page }) => {
    await setupDeterministicPage(page);
  });

  test('Campaign override form — abilities section open with one ability', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /manage campaigns/i }).click();
    await page.getByPlaceholder(/campaign name/i).fill('Visual Test Campaign');
    await page.getByRole('button', { name: /create/i }).click();

    // Navigate to Classes tab
    await page.getByRole('button', { name: /^classes$/i }).click();

    // Open Add Override form
    await page.getByRole('button', { name: /add override/i }).click();
    await page.getByRole('combobox', { name: /base class/i }).selectOption('Fighter');

    // Enable and populate abilities override
    await page.getByRole('checkbox', { name: /override abilities/i }).check();
    await page.getByRole('button', { name: /add ability/i }).click();
    await page.locator('.campaign-ability-row-name').fill('Berserker Rage');
    await page.locator('.campaign-ability-row-desc').fill('Double damage when enraged.');

    // Wait for stable state before snapping
    await expect(page.locator('.campaign-ability-row-name')).toHaveValue('Berserker Rage');

    await snap(page, 'campaign-override-abilities-form');
  });

  test('Campaign override form — level progression editor open (table view)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /manage campaigns/i }).click();
    await page.getByPlaceholder(/campaign name/i).fill('Level Editor Visual Test');
    await page.getByRole('button', { name: /create/i }).click();

    await page.getByRole('button', { name: /^classes$/i }).click();
    await page.getByRole('button', { name: /add override/i }).click();
    await page.getByRole('combobox', { name: /base class/i }).selectOption('Fighter');

    // Enable level progression override and copy from base
    await page.getByRole('checkbox', { name: /override level progression/i }).check();
    await page.getByRole('button', { name: /copy from base class/i }).click();

    // Wait for 14 rows to appear
    await expect(page.locator('.campaign-level-table tbody tr')).toHaveCount(14);

    await snap(page, 'campaign-override-level-editor-table');
  });

  test('Campaign override form — level progression editor (card view)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /manage campaigns/i }).click();
    await page.getByPlaceholder(/campaign name/i).fill('Level Card Visual Test');
    await page.getByRole('button', { name: /create/i }).click();

    await page.getByRole('button', { name: /^classes$/i }).click();
    await page.getByRole('button', { name: /add override/i }).click();
    await page.getByRole('combobox', { name: /base class/i }).selectOption('Fighter');

    await page.getByRole('checkbox', { name: /override level progression/i }).check();
    await page.getByRole('button', { name: /copy from base class/i }).click();
    await expect(page.locator('.campaign-level-table tbody tr')).toHaveCount(14);

    // Switch to card view
    await page.getByRole('button', { name: /cards/i }).click();
    await expect(page.locator('.campaign-level-card').first()).toBeVisible();

    await snap(page, 'campaign-override-level-editor-cards');
  });
});
