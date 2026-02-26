# HTML & CSS Style Guide

OSE Character Generator — last updated 2026-02-26

---

## 1. Overview & Guiding Principles

1. **Classes, not inline styles.** Inline `style={{…}}` props are reserved for values that are genuinely computed at runtime (e.g. a colour derived from a roll result). Static visual choices belong in CSS.
2. **CSS custom properties for every design token.** No bare hex values, magic pixel numbers, or hard-coded colours outside the token definitions.
3. **Consistent naming via the project's BEM-lite convention.** Class names are the contract between HTML and CSS; keep them predictable.
4. **Specificity stays low.** Avoid context-selector chains longer than two tokens; almost never use `!important`.
5. **`skeleton.css` and `normalize.css` are third-party files — never edit them.** All project tokens live in the `html {}` block of `skeleton.css` currently; the plan is to migrate them to a first-party `src/css/tokens.css` file.

---

## 2. File Structure

```
src/css/
  normalize.css     ← third-party, do not touch
  skeleton.css      ← third-party base + app design tokens (html block); do not add rules here
  tokens.css        ← (to create) canonical CSS variable definitions extracted from skeleton.css
  App.css           ← all project rules; sectioned, see below
  PackOptions.css   ← example of an acceptable per-feature file for larger new subsystems
```

### Sections inside App.css

`App.css` should be kept in the following order, separated by `/* === Section === */` comment headers:

1. **Google Fonts imports** (already at top)
2. **Global resets / root** (`*`, `html`, `body`, `a`)
3. **Utility / state classes** (`.fade`, `.opacity-0`, animations)
4. **Layout scaffolding** (`.wrapper`, `.layout`, `.wrapper-container`, `.character-menu`, `.container` overrides)
5. **Typography** (`.header-default`, `.title`, headings used as components)
6. **Buttons** (`.button--*` modifiers; see §5)
7. **Screens** (per-wizard-step blocks: `.ability-screen`, `.equipment-screen`, etc.)
8. **Component blocks** (`.ability-score-container`, `.backpack-container`, `.character-storage`, `.modal-*`, etc.)
9. **Navigation** (`.screen-navigation-container`, `.gold-container`, etc.)
10. **Media queries** (collected at the bottom, not scattered inline)

New CSS for a feature that is small (< ~30 lines) goes into the relevant section of `App.css`.  
New CSS for a larger, self-contained subsystem (like the pack-options UI) **may** live in a dedicated `FeatureName.css` file imported by its component.

---

## 3. Design Tokens (CSS Custom Properties)

All tokens are defined once, on the `html` element, so they are inherited everywhere.  
**Do not re-declare tokens on descended elements** (the current `.wrapper {}` re-declaration is a known issue to remove).

### Current token set

| Variable | Value | Semantic meaning |
|---|---|---|
| `--main-bg-color` | `#2f4f4f` | Primary brand/action colour (dark teal) |
| `--secondary-bg-color` | `#376659` | Secondary panels / hover |
| `--tertiary-bg-color` | `#375a66` | Tertiary accent |
| `--light-bg-color` | `#375a6652` | Hover highlight, selected state bg |
| `--dark-bg-color` | `#141414` | Inverted surfaces |
| `--main-bg-white` | `rgb(255 255 255)` | White card surface |
| `--main-text-color` | `#101726` | Body text |
| `--secondary-text-color` | `#32465c` | Dimmed / meta text |
| `--button-bg-color` | `rgba(49,116,81,0.2)` | Default button fill |
| `--primary-bg-hover` | `#0f0a2b` | Dark hover on primary elements |
| `--arrow-color` | `#2f4f4f79` | Arrow icon fill |
| `--arrow-color-hover` | `#325c44` | Arrow icon hover |
| `--light-green` | `rgba(49,116,81,0.1)` | Subtle light accent |

### Tokens to add

Add these to `tokens.css` (future) and reference via `var()` everywhere:

| Variable | Suggested value | Replaces |
|---|---|---|
| `--gold-color` | `#d99e30` | Hard-coded `#d99e30` in `PackOptions.css` and inline styles |
| `--gold-color-bg` | `rgba(255,217,0,0.8)` | `.gold` background in App.css |
| `--danger-color` | `#b10909` | `.requirement-message` colour |
| `--border-radius-sm` | `4px` | Repeated `border-radius: 4px` |
| `--border-radius-md` | `8px` | Repeated `border-radius: 8px` |
| `--border-radius-lg` | `10px` | Repeated `border-radius: 10px` |
| `--chip-bg` | `#f0f0f0` | Inline weapon quality chip backgrounds |
| `--chip-bg-active` | `#2c5f8a` | Inline active chip background |
| `--chip-bg-active-engaged` | `#4a7c59` | Inline class-filter chip |

### Rules for using tokens

- Always use `var(--token-name)` — no bare hex or rgb values in rules.
- One exception: truly unique one-off things inside a `transition` value target may use a literal value with a comment.
- When adding a new colour or spacing constant used in more than one place, define a token first.

---

## 4. Naming Convention (BEM-lite)

The project uses a home-grown variant of BEM. The convention is:

```
block-name               .character-button
block-name--modifier     .character-button--partial
block-name-element       .character-button-name        ← element separator is single hyphen
block-name-element--mod  .character-button-name--active
```

> **Why not standard BEM `__`?** The codebase was started without it and the single-hyphen element separator is used consistently throughout. Introducing `__` now would split the naming style. Stick with single-hyphen elements and double-dash modifiers.

### Rules

1. **Block names** are hyphenated lowercase nouns describing a component or region:  
   `ability-score`, `character-button`, `equipment-screen`, `modal`, `saving-throws`.

2. **Element names** append a hyphen + noun to the block:  
   `character-button-name`, `modal-header`, `backpack-item`, `gold-container`.

3. **Modifier names** append `--` + adjective/state to a block or element:  
   `character-button--partial`, `button--primary`, `ability-score--value`.

4. **State modifiers** (JS-toggled) are BEM modifiers, not data attributes or separate classes:  
   `button--selected`, `pack-tab-button--active` (not `active` alone, not `is-selected`).

5. **Never use generic utility classes as the only class** on a structural element (e.g., avoid `<div className="flex center">`). Use a meaningful block or element class; add layout properties to it directly.

6. **Screen/page root elements** use the pattern `[feature]-screen`:  
   `ability-screen`, `equipment-screen`, `character-storage-screen`.

7. **Container wrappers** for purchase/selection use `[feature]-container`:  
   `armour-container`, `backpack-container`, `equipment-purchase-container`.

### What to rename (known inconsistencies)

| Current | Should become | Reason |
|---|---|---|
| `.button-primary` | `.button--primary` | Modifier should use double-dash |
| `.button-small` | `.button--sm` | Modifier should use double-dash; also currently undefined (bug) |
| `.button-class-option` | `.button--class-option` | Mixed dash style |
| `.basic-classes-header` | `.class-list-header` | Reads as BEM element, not a standalone block |
| `.selected-class-details-trigger` | `.class-details-trigger` | Remove "selected" — it is always rendered |
| `.wrapper-container` | *(delete or absorb into `.layout`)* | Redundant wrapper |

---

## 5. Button System

The base `.button` class is provided by `skeleton.css`. Never change `skeleton.css`.

### Variants (visual style — add alongside `.button`)

| Class | Meaning | Background |
|---|---|---|
| `.button--primary` | Main call-to-action | `--main-bg-color` |
| *(default)* | Secondary / ghost action | `--button-bg-color` |

Currently `skeleton.css` defines `.button-primary` (single dash). This should be aliased or renamed to `.button--primary` when skeleton is eventually replaced.

### Size modifiers

| Class | Meaning |
|---|---|
| `.button--sm` | Compact buttons (qty +/− controls, filter chips) — height ~28 px, padding `0 8px`, font-size 1.2 rem |
| *(default)* | Standard 38 px height |

> **`button-small` is currently used but not defined.** It renders as unstyled. Fix: add `.button--sm` to `App.css` and update the three components that reference it.

### Named purpose modifiers (layout/spacing only)

These set only the `width`, `margin`, or other positional properties specific to where that button lives. They do **not** change colour.

Examples: `.button--roll`, `.button--storage`, `.button--reroll`, `.button--info-icon`, `.button--gold`.

### Selected / toggled state

Use a `--selected` modifier that sets only background and outline:

```css
.button--selected {
  background-color: var(--light-bg-color);
  outline: 2px solid var(--main-bg-color);
}
```

Do not duplicate it as `button--alignment--selected` and `button--gender--selected` separately — both can use `.button--selected`.

---

## 6. HTML Patterns

### Semantic elements

- Use `<button>` for anything the user clicks to trigger an action.
- Use `<a>` for navigation to another route or external URL.
- **Do not use `<div>` with a click handler** as a button-substitute. The `.character-button` cards in `CharacterStorage` are the main offender — convert to `<button>` or `<article>` with an inner `<button>` for the primary action.

### Interactive cards (character storage cards)

Preferred pattern:

```tsx
<article className="character-button">
  <button
    className="character-button-load"          // primary action, fills card
    onClick={() => loadCharacter(char)}
  >
    …name, class…
  </button>
  <button className="character-button-delete button--icon" aria-label="Delete">×</button>
  <button className="character-button-share button--icon" aria-label="Share">…</button>
</article>
```

### Forms

- Wrap label + input pairs in `<label>` (implicit association) or use `htmlFor` + `id`.
- Do not use a `<div className="form-label">` as a label — use `<label>`.
- `<fieldset>` + `<legend>` for radio groups (armour selection, alignment, gender).

### Lists

- Use `<ul>` / `<ol>` + `<li>` for repeated items (class abilities, equipment items, save throws).
- Supply `list-style: none` in CSS when the bullet is not desired — do not add `role="list"` unless ARIA needs it.

### Headings

- `<h1>` — page/app title only (landing screen title).
- `<h2>` — screen-level heading (one per wizard step).
- `<h3>` — major section within a screen.
- `<h4>` — minor section / sub-header.
- Do not skip levels. Do not use headings purely for sizing — use a class on a `<p>` or `<span>` instead.

---

## 7. Inline Styles — When They're Acceptable

**Acceptable**: a value that changes at runtime based on component props or state that cannot be expressed with a pre-defined class or CSS variable.

```tsx
// OK — colour is computed from roll result
<span style={{ color: rollIsGood ? 'green' : 'red' }}>…</span>

// OK — width driven by a number that varies
<div style={{ width: `${percentage}%` }} />
```

**Not acceptable** — static values that belong in CSS:

```tsx
// Bad — static layout
<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>

// Bad — static colour/styling
<span style={{ backgroundColor: '#f0f0f0', borderRadius: '8px', padding: '0 5px' }}>
```

The largest current violations are in `WeaponOptionsContainer.tsx`, `ItemOptionsContainer.tsx`, `GearOptionsContainer.tsx`, and `ArmourOptionsContainer.tsx`. These should be migrated to named CSS classes in `App.css` (or a dedicated `EquipmentOptions.css`).

---

## 8. The `!important` Rule

Use `!important` only as a last resort to override a third-party stylesheet (i.e. `skeleton.css` or `normalize.css`) where the selector cannot otherwise be beaten.

**Never** use `!important` to override another project rule. If you need to, the specificity of the original rule is too high — fix the original rule instead.

Current violations to resolve:

- `.button--alignment--selected / --gender--selected` hover states use `!important` because `.class-options-container > .button-class-option:hover` is overly specific. Lower that selector's specificity.
- The `@media` block `!important` on `.class-container` widths indicates the base rules are too specific — fix the base rules.

---

## 9. CSS Variable Scope Trap (Known Issue)

Currently **`App.css` re-declares CSS variables inside `.wrapper {}`**. Because all wizard content is inside `.wrapper`, those declarations shadow the `html`-level values. The effect:

- `.wrapper` children see the `.wrapper` token values.
- Any component rendered *outside* `.wrapper` (currently just `LandingScreen`'s outermost layer when unscrolled) sees the `html` values.

**Resolution plan**: Remove the variable block from `.wrapper {}`. Ensure all tokens have their single canonical definition at `html {}` (or in `tokens.css`). Adjust the teal/grey values to match what `.wrapper` was providing if needed.

---

## 10. Specificity Guidelines

| Selector type | Acceptable? | Note |
|---|---|---|
| `.class` | ✅ | Default — use always |
| `.parent > .child` | ✅ sparingly | Only when the child class would otherwise collide in a different context |
| `.block .element` | ✅ for state | e.g. `.character-button:hover .character-button-delete` |
| `element.class` | ⚠️ avoid | e.g. `div.ability-screen` — drop the element qualifier |
| `.a > .b > .c` | ❌ | Too deep; refactor the class names |
| `#id` | ❌ | Only `#dice-box` is acceptable (third-party requirement) |

Overriding the skeleton's `button` base rule is the one legitimate reason for a slightly elevated selector. Use the pattern `.button.button--<name>` (two classes, no element) to win against `button` (element selector, lower specificity).

---

## 11. Common Patterns Reference

### Collapsible section (equipment panels)

```tsx
<section className="equipment-panel">
  <button
    className="equipment-panel-toggle"
    aria-expanded={isOpen}
    onClick={toggleOpen}
  >
    <span>{title}</span>
    <span aria-hidden="true">{isOpen ? '▼' : '▶'}</span>
  </button>
  {isOpen && (
    <div className="equipment-panel-body">
      …
    </div>
  )}
</section>
```

```css
.equipment-panel {}
.equipment-panel-toggle {
  display: flex;
  justify-content: space-between;
  width: 100%;
  /* inherits .button base */
}
.equipment-panel-body { padding: 1rem 0; }
```

### Filter chip row

```tsx
<div className="filter-chip-row">
  <button
    className={`filter-chip${isActive ? ' filter-chip--active' : ''}`}
    onClick={toggle}
  >
    {label}
  </button>
</div>
```

```css
.filter-chip-row { display: flex; flex-wrap: wrap; gap: 4px; }

.filter-chip {
  background-color: var(--chip-bg);
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 1.2rem;
  border: 1px solid #bbb;
  color: #555;
}
.filter-chip--active {
  background-color: var(--chip-bg-active);
  border-color: var(--chip-bg-active);
  color: #fff;
  font-weight: bold;
}
```

### Item row (qty controls)

```tsx
<li className="item-row">
  <span className="item-row-name">{item.name}</span>
  <span className="item-row-price">{item.price} gp</span>
  <div className="qty-controls">
    <button className="button button--sm qty-controls-dec" …>−</button>
    <span className="qty-controls-value">{qty}</span>
    <button className="button button--sm qty-controls-inc" …>+</button>
  </div>
</li>
```

---

## 12. Checklist for New Components

Before merging a new component:

- [ ] No inline `style={{}}` except for runtime-computed values
- [ ] All class names follow the BEM-lite convention (`block`, `block-element`, `block--modifier`)
- [ ] No new bare hex/rgb values — use `var(--token)`
- [ ] No `!important`
- [ ] Buttons use `<button>`, links use `<a>`
- [ ] Interactive groups (radios, checkboxes) wrapped in `<fieldset>` with `<legend>`
- [ ] New CSS added to the correct section of `App.css` (or a named feature file)
- [ ] No new token-shadow by declaring variables on a non-`html` ancestor
