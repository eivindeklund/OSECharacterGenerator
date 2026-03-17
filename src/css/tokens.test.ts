/**
 * CSS Token Hygiene Tests
 *
 * These tests enforce the token discipline described in docs/html-css-style.md §3
 * and the comment-format spec defined in tokens.css itself.
 *
 * Rules checked:
 *  1. tokens.css must exist.
 *  2. Every CSS custom-property declaration (--name: value) in tokens.css must
 *     be immediately preceded (ignoring blank lines) by a comment line that
 *     contains the text "Usage:".
 *  3. In App.css and PackOptions.css, every line that contains a bare hex colour
 *     (#rrggbb / #rgb / etc.) or rgb/rgba() value *outside* of a CSS comment must
 *     satisfy at least one exemption:
 *       a. The non-comment portion of the line is a CSS custom-property definition
 *          (starts with --name:), which is a token re-declaration and therefore
 *          allowed to contain raw values.
 *       b. The line's original text (including its inline comment) contains
 *          "one-off:", signalling a deliberate, documented exception.
 */

import { existsSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dir = dirname(__filename);
const cssDir = resolve(__dir); // same directory as this test

function readCss(filename: string): string {
  return readFileSync(resolve(cssDir, filename), 'utf-8');
}

// ---------------------------------------------------------------------------
// Helpers: comment-aware line scanning
// ---------------------------------------------------------------------------

/**
 * Given a single CSS line and the current "inside block comment" state,
 * returns:
 *   activePart  – the characters on this line that are NOT inside /* … * /
 *   nextInBlock – whether we are still inside a block comment at line end
 *
 * NB: We intentionally do NOT count any "one-off:" text inside the comment
 * as part of activePart, because the caller uses activePart only to detect
 * raw colour values in the rule itself.
 */
function splitLineByComments(
  line: string,
  inBlockComment: boolean,
): { activePart: string; nextInBlock: boolean } {
  let activePart = '';
  let i = 0;

  while (i < line.length) {
    if (inBlockComment) {
      if (line[i] === '*' && line[i + 1] === '/') {
        inBlockComment = false;
        i += 2;
      } else {
        i++;
      }
    } else {
      if (line[i] === '/' && line[i + 1] === '*') {
        inBlockComment = true;
        i += 2;
      } else {
        activePart += line[i];
        i++;
      }
    }
  }

  return { activePart, nextInBlock: inBlockComment };
}

/** Regex that matches a bare hex colour or an rgb/rgba function call. */
const COLOR_RE = /#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])|rgba?\s*\(/i;

/** True when the non-comment portion of a line is a CSS custom-property def. */
function isCustomPropDef(activePart: string): boolean {
  return /^\s*--[\w-]+\s*:/.test(activePart);
}

/**
 * Scan a CSS file's content and return every violation:
 * a line that has a bare colour value outside comments, is not a custom-prop
 * definition, and does not carry a "one-off:" exemption comment.
 */
function findBareColorViolations(
  content: string,
): Array<{ lineNumber: number; text: string }> {
  const violations: Array<{ lineNumber: number; text: string }> = [];
  const lines = content.split('\n');
  let inBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const { activePart, nextInBlock } = splitLineByComments(line, inBlock);
    inBlock = nextInBlock;

    if (!COLOR_RE.test(activePart)) continue;
    if (isCustomPropDef(activePart)) continue;

    // Exemption: the original line (comments included) carries "one-off:"
    if (line.includes('one-off:')) continue;

    violations.push({ lineNumber: i + 1, text: line });
  }

  return violations;
}

// ---------------------------------------------------------------------------
// Helpers: tokens.css Usage-comment format checker
// ---------------------------------------------------------------------------

/**
 * In tokens.css every --custom-property declaration must be preceded by a
 * comment block (/* … * /) that contains "Usage:".  The comment may span
 * multiple lines; the checker walks backwards from the token to the opening
 * /* and verifies that the word "Usage:" appears somewhere inside it.
 *
 * Returns violations: tokens whose preceding comment is absent or lacks "Usage:".
 */
function findTokensWithoutUsageComment(
  content: string,
): Array<{ lineNumber: number; token: string }> {
  const violations: Array<{ lineNumber: number; token: string }> = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^\s*(--[\w-]+)\s*:/);
    if (!match) continue;

    // Walk backwards past blank lines
    let j = i - 1;
    while (j >= 0 && lines[j].trim() === '') {
      j--;
    }
    if (j < 0) {
      violations.push({ lineNumber: i + 1, token: match[1] });
      continue;
    }

    // Collect the entire comment block immediately above the token declaration.
    // Comments end with */ and open with /*; walk to the opening line.
    let commentLines: string[] = [];
    if (lines[j].includes('*/')) {
      // Walk back to the /* that opens this block
      while (j >= 0 && !lines[j].includes('/*')) {
        commentLines.push(lines[j]);
        j--;
      }
      if (j >= 0) {
        commentLines.push(lines[j]); // the /* … line itself
      }
    } else {
      // Single preceding non-comment line — not a block comment
      commentLines.push(lines[j]);
    }

    const commentText = commentLines.join('\n');
    if (!commentText.includes('Usage:')) {
      violations.push({ lineNumber: i + 1, token: match[1] });
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('tokens.css', () => {
  it('exists at src/css/tokens.css', () => {
    expect(existsSync(resolve(cssDir, 'tokens.css'))).toBe(true);
  });

  it('has a "Usage:" comment immediately before every custom-property declaration', () => {
    const content = readCss('tokens.css');
    const violations = findTokensWithoutUsageComment(content);

    const messages = violations.map(
      (v) => `  Line ${v.lineNumber}: ${v.token} — missing Usage: comment`,
    );
    expect(violations, messages.join('\n')).toHaveLength(0);
  });
});

describe('App.css — no bare hex/rgb colour values', () => {
  it('every colour value is either a var(), in a custom-property def, or marked /* one-off: */', () => {
    const content = readCss('App.css');
    const violations = findBareColorViolations(content);

    const messages = violations.map(
      (v) => `  Line ${v.lineNumber}: ${v.text.trim()}`,
    );
    expect(
      violations,
      `Bare colour values found in App.css:\n${messages.join('\n')}\n` +
        'Fix: use var(--token) or add /* one-off: <reason> */ on the same line.',
    ).toHaveLength(0);
  });
});

describe('PackOptions.css — no bare hex/rgb colour values', () => {
  it('every colour value is either a var(), in a custom-property def, or marked /* one-off: */', () => {
    const content = readCss('PackOptions.css');
    const violations = findBareColorViolations(content);

    const messages = violations.map(
      (v) => `  Line ${v.lineNumber}: ${v.text.trim()}`,
    );
    expect(
      violations,
      `Bare colour values found in PackOptions.css:\n${messages.join('\n')}\n` +
        'Fix: use var(--token) or add /* one-off: <reason> */ on the same line.',
    ).toHaveLength(0);
  });
});

describe('PuristWebSheet.css — no bare hex/rgb colour values', () => {
  it('every colour value is either a var(), in a custom-property def, or marked /* one-off: */', () => {
    const content = readFileSync(
      resolve(__dir, '../containers/character/purist-web-sheet/PuristWebSheet.css'),
      'utf-8',
    );
    const violations = findBareColorViolations(content);

    const messages = violations.map(
      (v) => `  Line ${v.lineNumber}: ${v.text.trim()}`,
    );
    expect(
      violations,
      `Bare colour values found in PuristWebSheet.css:\n${messages.join('\n')}\n` +
        'Fix: use var(--token) or add /* one-off: <reason> */ on the same line.',
    ).toHaveLength(0);
  });
});
