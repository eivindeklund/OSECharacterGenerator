/**
 * CSS tests for the OSE Character Generator.
 *
 * Run:
 *   npm run test:css
 *
 * Two testing styles are used:
 *
 *  1. "Isolated CSS rules" — Quixote creates a sandboxed iframe with the app's
 *     CSS injected as inline text.  HTML snippets are added and their computed
 *     styles asserted.  No app state, no navigation beyond the base URL.
 *
 *  2. "Live rendered styles" — navigate to the running app and read computed
 *     styles on the real DOM.  Verifies the complete CSS pipeline end-to-end
 *     (Vite build, tokens cascade, component rendering).
 *
 * See e2e/css-helpers.js for helper API documentation.
 */

import { expect, test } from '@playwright/test';
import {
    appCSS,
    campaignSettingsCSS,
    getIsolatedStyles,
    injectQuixote,
    packOptionsCSS,
    tokensCSS,
    tokenValue
} from './css-helpers.js';

// ---------------------------------------------------------------------------
// Isolated CSS rules — App.css
// ---------------------------------------------------------------------------

test.describe('Isolated CSS rules — App.css', () => {
  // Inject quixote once per test after navigating to the base page.
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectQuixote(page);
  });

  test('.ability-score--value-button has transparent background, no border, and pointer cursor', async ({
    page,
  }) => {
    const styles = await getIsolatedStyles(
      page,
      tokensCSS + '\n' + appCSS,
      '<button class="ability-score--value-button">12</button>',
      '.ability-score--value-button',
      ['cursor', 'border-top-style', 'background-color'],
    );

    expect(styles['cursor']).toBe('pointer');
    expect(styles['border-top-style']).toBe('none');
    // transparent computes to rgba(0, 0, 0, 0)
    expect(styles['background-color']).toBe('rgba(0, 0, 0, 0)');
  });

  test('.ability-score-container inside .container has display: grid', async ({ page }) => {
    const styles = await getIsolatedStyles(
      page,
      tokensCSS + '\n' + appCSS,
      '<div class="container"><div class="ability-score-container"></div></div>',
      '.ability-score-container',
      ['display'],
    );

    expect(styles['display']).toBe('grid');
  });

  test('.ability-score-container > div has display: flex and column direction', async ({
    page,
  }) => {
    const styles = await getIsolatedStyles(
      page,
      tokensCSS + '\n' + appCSS,
      '<div class="container"><div class="ability-score-container"><div id="child"></div></div></div>',
      '#child',
      ['display', 'flex-direction'],
    );

    expect(styles['display']).toBe('flex');
    expect(styles['flex-direction']).toBe('column');
  });

  test('.armour-container has display: flex and row direction', async ({ page }) => {
    const styles = await getIsolatedStyles(
      page,
      tokensCSS + '\n' + appCSS,
      '<div class="armour-container"></div>',
      '.armour-container',
      ['display', 'flex-direction'],
    );

    expect(styles['display']).toBe('flex');
    expect(styles['flex-direction']).toBe('row');
  });

  test('.button--quick-generate inside .header is wide enough for its label', async ({
    page,
  }) => {
    // Uses a live DOM measurement so that Chromium performs real text layout.
    // The button must not clip or scroll its text (scrollWidth <= offsetWidth).
    const overflow = await page.evaluate(() => {
      const btn = document.querySelector('.button--quick-generate');
      if (!btn) return 'element not found';
      return btn.scrollWidth > btn.offsetWidth
        ? `button scrollWidth ${btn.scrollWidth} > offsetWidth ${btn.offsetWidth}`
        : 'ok';
    });
    expect(overflow).toBe('ok');
  });
});

// ---------------------------------------------------------------------------
// Isolated CSS rules — PackOptions.css
// ---------------------------------------------------------------------------

test.describe('Isolated CSS rules — PackOptions.css', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectQuixote(page);
  });

  test('.pack-tabs has display: flex', async ({ page }) => {
    const styles = await getIsolatedStyles(
      page,
      tokensCSS + '\n' + packOptionsCSS,
      '<div class="pack-tabs"></div>',
      '.pack-tabs',
      ['display'],
    );

    expect(styles['display']).toBe('flex');
  });

  test('.pack-tab-button.active uses the --gold-color token for its text colour', async ({
    page,
  }) => {
    // --gold-color: #d99e30  →  rgb(217, 158, 48)
    const styles = await getIsolatedStyles(
      page,
      tokensCSS + '\n' + packOptionsCSS,
      '<button class="pack-tab-button active">Weapons</button>',
      '.pack-tab-button.active',
      ['color'],
    );

    expect(styles['color']).toBe('rgb(217, 158, 48)');
  });

  test('.pack-tab-button.active has bold font weight', async ({ page }) => {
    const styles = await getIsolatedStyles(
      page,
      tokensCSS + '\n' + packOptionsCSS,
      '<button class="pack-tab-button active">Weapons</button>',
      '.pack-tab-button.active',
      ['font-weight'],
    );

    // bold / 700 — browsers may normalise to the numeric value
    expect(['bold', '700']).toContain(styles['font-weight']);
  });
});

// ---------------------------------------------------------------------------
// Isolated CSS rules — CampaignSettings.css
// ---------------------------------------------------------------------------

test.describe('Isolated CSS rules — CampaignSettings.css', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectQuixote(page);
  });

  test('.campaign-settings-header has display: flex', async ({ page }) => {
    const styles = await getIsolatedStyles(
      page,
      tokensCSS + '\n' + campaignSettingsCSS,
      '<div class="campaign-settings-header"></div>',
      '.campaign-settings-header',
      ['display'],
    );
    expect(styles['display']).toBe('flex');
  });

  test('.campaign-toggle-fieldset has no visible border', async ({ page }) => {
    const styles = await getIsolatedStyles(
      page,
      tokensCSS + '\n' + campaignSettingsCSS,
      '<fieldset class="campaign-toggle-fieldset"></fieldset>',
      '.campaign-toggle-fieldset',
      ['border-top-style'],
    );
    expect(styles['border-top-style']).toBe('none');
  });

  test('.campaign-checklist-items has display: flex', async ({ page }) => {
    const styles = await getIsolatedStyles(
      page,
      tokensCSS + '\n' + campaignSettingsCSS,
      '<div class="campaign-checklist-items"></div>',
      '.campaign-checklist-items',
      ['display'],
    );
    expect(styles['display']).toBe('flex');
  });

  test('.campaign-override-form-grid has display: grid', async ({ page }) => {
    const styles = await getIsolatedStyles(
      page,
      tokensCSS + '\n' + campaignSettingsCSS,
      '<div class="campaign-override-form-grid"></div>',
      '.campaign-override-form-grid',
      ['display'],
    );
    expect(styles['display']).toBe('grid');
  });

  test('.button--sm has reduced height compared to base button', async ({ page }) => {
    const styles = await getIsolatedStyles(
      page,
      tokensCSS + '\n' + appCSS,
      '<button class="button button--sm">Label</button>',
      '.button--sm',
      ['height'],
    );
    // button--sm sets height: 28px
    expect(styles['height']).toBe('28px');
  });

  test('.campaign-ability-row has display: flex', async ({ page }) => {
    const styles = await getIsolatedStyles(
      page,
      tokensCSS + '\n' + campaignSettingsCSS,
      '<ul><li class="campaign-ability-row"><div class="campaign-ability-row-fields"></div></li></ul>',
      '.campaign-ability-row',
      ['display'],
    );
    expect(styles['display']).toBe('flex');
  });

  test('.campaign-ability-row-fields has display: flex and column direction', async ({ page }) => {
    const styles = await getIsolatedStyles(
      page,
      tokensCSS + '\n' + campaignSettingsCSS,
      '<ul><li class="campaign-ability-row"><div class="campaign-ability-row-fields"></div></li></ul>',
      '.campaign-ability-row-fields',
      ['display', 'flex-direction'],
    );
    expect(styles['display']).toBe('flex');
    expect(styles['flex-direction']).toBe('column');
  });

  test('.campaign-level-table has display: table', async ({ page }) => {
    const styles = await getIsolatedStyles(
      page,
      tokensCSS + '\n' + campaignSettingsCSS,
      '<table class="campaign-level-table"><tbody></tbody></table>',
      '.campaign-level-table',
      ['display'],
    );
    expect(styles['display']).toBe('table');
  });

  test('.campaign-level-table-input has box-sizing: border-box', async ({ page }) => {
    const styles = await getIsolatedStyles(
      page,
      tokensCSS + '\n' + campaignSettingsCSS,
      '<table class="campaign-level-table"><tbody><tr>' +
        '<td><input class="campaign-level-table-input" type="number" value="42" /></td>' +
        '</tr></tbody></table>',
      '.campaign-level-table-input',
      ['box-sizing'],
    );
    expect(styles['box-sizing']).toBe('border-box');
  });

  test('.campaign-level-card has display: flex', async ({ page }) => {
    const styles = await getIsolatedStyles(
      page,
      tokensCSS + '\n' + campaignSettingsCSS,
      '<div class="campaign-level-card"></div>',
      '.campaign-level-card',
      ['display'],
    );
    expect(styles['display']).toBe('flex');
  });

  test('.campaign-level-card-grid has display: grid', async ({ page }) => {
    const styles = await getIsolatedStyles(
      page,
      tokensCSS + '\n' + campaignSettingsCSS,
      '<div class="campaign-level-card"><div class="campaign-level-card-grid"></div></div>',
      '.campaign-level-card-grid',
      ['display'],
    );
    expect(styles['display']).toBe('grid');
  });

  test('.campaign-level-view-toggle has display: flex', async ({ page }) => {
    const styles = await getIsolatedStyles(
      page,
      tokensCSS + '\n' + campaignSettingsCSS,
      '<div class="campaign-level-view-toggle"></div>',
      '.campaign-level-view-toggle',
      ['display'],
    );
    expect(styles['display']).toBe('flex');
  });
});

// ---------------------------------------------------------------------------
// Live rendered styles — full CSS pipeline verification
// ---------------------------------------------------------------------------

/**
 * Returns the text content of every button whose rendered width is too narrow
 * to contain its text (scrollWidth > offsetWidth).
 */
async function overflowingButtons(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('button'))
      .filter((btn) => btn.scrollWidth > btn.offsetWidth)
      .map((btn) => btn.textContent?.trim()),
  );
}

test.describe('Live rendered styles', () => {
  test('--main-bg-color token is resolved at the expected value', async ({ page }) => {
    await page.goto('/');
    const value = await tokenValue(page, '--main-bg-color');
    expect(value).toBe('#2f4f4f');
  });

  test('--gold-color token is resolved at the expected value', async ({ page }) => {
    await page.goto('/');
    const value = await tokenValue(page, '--gold-color');
    expect(value).toBe('#d99e30');
  });

  test('--danger-color token is resolved at the expected value', async ({ page }) => {
    await page.goto('/');
    const value = await tokenValue(page, '--danger-color');
    expect(value).toBe('#b10909');
  });
});

// ---------------------------------------------------------------------------
// Button text-overflow regression tests
// These prevent the recurring "button too narrow for its label" bug.
// ---------------------------------------------------------------------------

test.describe('Button text overflow — no button may be narrower than its label', () => {
  test('landing screen has no overflowing buttons', async ({ page }) => {
    await page.goto('/');
    const overflow = await overflowingButtons(page);
    expect(overflow).toEqual([]);
  });
});
