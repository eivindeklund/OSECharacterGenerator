/**
 * Helpers for Quixote CSS tests.
 *
 * Two testing styles are supported:
 *
 *  1. Isolated fixture tests  — inject app CSS into a Quixote iframe and
 *     assert computed styles on specific HTML snippets.  No app state needed;
 *     fast and fully reproducible.
 *     → injectQuixote() + getIsolatedStyles()
 *
 *  2. Live rendered style tests — navigate to a running app page and read
 *     computed styles on the real DOM.  Used to verify the full CSS pipeline
 *     end-to-end (Vite build, tokens cascade, etc.).
 *     → computedProp() + tokenValue()
 *
 * CSS file constants (tokensCSS, appCSS, packOptionsCSS) are read at module
 * load time so they are available without async setup in every test file.
 * If you add a new CSS file, export a constant for it here.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();

/** Absolute path to the bundled Quixote browser script. */
export const QUIXOTE_BUNDLE = join(ROOT, 'node_modules/quixote/dist/quixote.js');

// ---------------------------------------------------------------------------
// CSS file constants
// ---------------------------------------------------------------------------

/** Raw text of src/css/tokens.css — CSS custom-property declarations. */
export const tokensCSS = readFileSync(join(ROOT, 'src/css/tokens.css'), 'utf8');

/** Raw text of src/css/App.css — main application stylesheet. */
export const appCSS = readFileSync(join(ROOT, 'src/css/App.css'), 'utf8');

/** Raw text of src/css/PackOptions.css — equipment pack selector styles. */
export const packOptionsCSS = readFileSync(join(ROOT, 'src/css/PackOptions.css'), 'utf8');

// ---------------------------------------------------------------------------
// Isolated fixture helpers (Quixote)
// ---------------------------------------------------------------------------

/**
 * Inject the Quixote browser bundle into the current page.
 * Must be called after page.goto() because navigation clears injected scripts.
 *
 * @param {import('@playwright/test').Page} page
 */
export async function injectQuixote(page) {
  await page.addScriptTag({ path: QUIXOTE_BUNDLE });
}

/**
 * Create a Quixote iframe with the given inline CSS, add an HTML snippet,
 * and return computed style values for the selected element.
 *
 * All work runs inside page.evaluate(), so the app's dev server must be
 * reachable (the page should already be loaded) and injectQuixote() must have
 * been called first.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string}   cssText  - Inline CSS to load into the Quixote frame.
 * @param {string}   html     - HTML snippet to add to the frame body.
 * @param {string}   selector - CSS selector for the element to inspect.
 * @param {string[]} props    - CSS property names to read via getRawStyle().
 * @returns {Promise<Record<string, string>>} Map from property name to value.
 */
export async function getIsolatedStyles(page, cssText, html, selector, props) {
  return page.evaluate(
    async ({ css, html, selector, props }) => {
      const frame = await new Promise((resolve, reject) => {
        window.quixote.createFrame({ css, width: 800, height: 600 }, (err, f) =>
          err ? reject(err) : resolve(f),
        );
      });

      try {
        frame.add(html);
        const el = frame.get(selector);
        const result = {};
        for (const prop of props) {
          result[prop] = el.getRawStyle(prop);
        }
        frame.remove();
        return result;
      } catch (e) {
        frame.remove();
        throw e;
      }
    },
    { css: cssText, html, selector, props },
  );
}

// ---------------------------------------------------------------------------
// Live rendered style helpers
// ---------------------------------------------------------------------------

/**
 * Read the computed value of a CSS property on a DOM element in the live page.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} selector  CSS selector for the target element.
 * @param {string} property  CSS property name (e.g. 'display', 'flex-direction').
 * @returns {Promise<string>} Trimmed computed value string.
 */
export async function computedProp(page, selector, property) {
  return page.evaluate(
    ({ sel, prop }) => {
      const el = document.querySelector(sel);
      if (!el) throw new Error(`No element matches selector: ${sel}`);
      return window.getComputedStyle(el).getPropertyValue(prop).trim();
    },
    { sel: selector, prop: property },
  );
}

/**
 * Read the resolved value of a CSS custom property (design token) from the
 * <html> element, which is where all tokens are declared in tokens.css.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} token  Token name including the leading '--', e.g. '--gold-color'.
 * @returns {Promise<string>} Trimmed resolved value string.
 */
export async function tokenValue(page, token) {
  return page.evaluate(
    (t) => window.getComputedStyle(document.documentElement).getPropertyValue(t).trim(),
    token,
  );
}
