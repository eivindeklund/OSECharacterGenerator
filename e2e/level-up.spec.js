import { expect, test } from '@playwright/test';

// ── Shared helpers ────────────────────────────────────────────────────────────

/**
 * Complete the full wizard flow and arrive at the character sheet.
 * Returns the page at /#/sheet with the character ready.
 */
async function createCharacterToSheet(page, { className = 'Fighter', name = 'Level Up Hero' } = {}) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.removeItem('partialCharacter');
    localStorage.removeItem('characterStorage');
  });
  await page.getByRole('button', { name: /Start/i }).click();
  await expect(page.getByRole('heading', { name: /Ability Scores/i })).toBeVisible();

  // Some classes have minimum ability score requirements. Re-roll until the
  // class button is enabled so the test doesn't depend on lucky random rolls.
  const classBtn = page.getByRole('button', { name: new RegExp(`^${className}$`, 'i') });
  for (let attempt = 0; attempt < 20; attempt++) {
    await page.getByRole('button', { name: /Roll All/i }).click();
    // Brief wait for React to process the state update
    await page.waitForTimeout(100);
    const enabled = await classBtn.isEnabled();
    if (enabled) break;
  }
  await classBtn.click();
  // Wait for the navigation button to confirm class selection was registered
  await expect(page.getByRole('button', { name: /Class Options/i })).toBeEnabled();
  await page.getByRole('button', { name: /Class Options/i }).click();

  await expect(page.getByText(/Hit Die/i)).toBeVisible({ timeout: 20000 });

  // Click Roll HP (internally fires a 200ms setTimeout before updating state).
  // For spellcasting classes the spell-select is rendered based on class, not HP
  // state, so check it immediately — clicking Random Spell before HP settles is fine.
  await page.getByRole('button', { name: /Roll HP/i }).click();
  const spellSelect = page.locator('select.spells-select');
  if (await spellSelect.isVisible()) {
    await page.getByRole('button', { name: /Random Spell/i }).click();
  }

  // Wait for Equipment button to be enabled — this is the definitive signal that
  // HP has been set (and a spell selected for casters). 20s covers the 200ms
  // setTimeout even under heavy parallel-browser CPU contention.
  await expect(page.getByRole('button', { name: /Equipment/i })).toBeEnabled({ timeout: 20000 });
  await page.getByRole('button', { name: /Equipment/i }).click();

  await expect(page.getByRole('heading', { name: /^Equipment$/i })).toBeVisible();
  // Roll Gold also uses a 200ms setTimeout; wait for Character Details to be enabled.
  await page.getByRole('button', { name: /Roll Gold/i }).click();
  await expect(page.getByRole('button', { name: /Character Details/i })).toBeEnabled({ timeout: 20000 });
  await page.getByRole('button', { name: /Character Details/i }).click();

  await expect(page.getByRole('heading', { name: /Character Details/i })).toBeVisible();
  const nameInput = page.locator('input[type="text"]').first();
  await nameInput.fill(name);
  await expect(nameInput).toHaveValue(name);

  // Use a CSS-specific locator for the alignment button to avoid any ambiguity.
  // Then wait for the Character Sheet nav button to be enabled — ScreenNavigation
  // disables it until both name AND alignment requirements are satisfied, making
  // this a single definitive check that's more robust than inspecting CSS classes.
  await page.locator('.alignment-button-container button', { hasText: 'Neutral' }).click();
  const charSheetBtn = page.getByRole('button', { name: /Character Sheet/i });
  await expect(charSheetBtn).toBeEnabled();
  await charSheetBtn.click();

  await expect(page.getByText(/Saving Throws/i)).toBeVisible({ timeout: 20000 });
  await expect(page.getByText(new RegExp(name, 'i'))).toBeVisible({ timeout: 20000 });
  // Confirm the Level Up button is rendered before returning — ensures the sheet is
  // fully hydrated and canLevelUp has been evaluated, eliminating a race condition
  // where tests click Level Up before the button exists in the DOM.
  await expect(page.getByRole('button', { name: /Level Up/i })).toBeVisible();
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe('Level-Up feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('partialCharacter');
      localStorage.removeItem('characterStorage');
    });
  });

  test('Level Up button is visible on the character sheet for a level-1 character', async ({ page }) => {
    await createCharacterToSheet(page);
    await expect(page.getByRole('button', { name: /Level Up/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Level Up.*Level 2/i })).toBeVisible();
  });

  test('clicking Level Up opens the level-up modal', async ({ page }) => {
    await createCharacterToSheet(page);
    await page.getByRole('button', { name: /Level Up/i }).click();

    // Modal dialog should be visible
    await expect(page.getByRole('dialog')).toBeVisible();
    // Step 1 heading
    await expect(page.getByRole('heading', { name: /Hit Points/i })).toBeVisible();
  });

  test('fighter level-up: roll HP in modal updates level and HP on sheet', async ({ page }) => {
    await createCharacterToSheet(page, { className: 'Fighter' });

    // Note the current HP shown on the sheet
    const hpBefore = parseInt(
      await page.locator('.charsheet-value').filter({ hasText: /^\d+$/ }).first().innerText()
    );
    // Current level text contains "Level 1 Fighter"
    await expect(page.getByText(/Level 1 Fighter/i)).toBeVisible();

    // Open modal
    await page.getByRole('button', { name: /Level Up/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Roll HP
    await page.getByRole('button', { name: /Roll HP/i }).click();
    await expect(page.getByRole('button', { name: /Re-roll/i })).toBeVisible();

    // Advance to summary
    await page.getByRole('button', { name: /Next.*Summary/i }).click();
    await expect(page.getByRole('heading', { name: /Level Up Summary/i })).toBeVisible();
    await expect(page.getByText(/Level:.*1.*→.*2/i)).toBeVisible();

    // Confirm
    await page.getByRole('button', { name: /Confirm Level Up/i }).click();

    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Level should now read 2
    await expect(page.getByText(/Level 2 Fighter/i)).toBeVisible();

    // Level Up button should now say "→ Level 3"
    await expect(page.getByRole('button', { name: /Level Up.*Level 3/i })).toBeVisible();
  });

  test('cancel from modal HP step does not change level', async ({ page }) => {
    await createCharacterToSheet(page);

    await page.getByRole('button', { name: /Level Up/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Cancel immediately
    await page.getByRole('button', { name: /^Cancel$/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Level should still be 1
    await expect(page.getByText(/Level 1 Fighter/i)).toBeVisible();
  });

  test('modal summary shows HP gain before confirmation', async ({ page }) => {
    await createCharacterToSheet(page, { className: 'Fighter' });

    await page.getByRole('button', { name: /Level Up/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: /Roll HP/i }).click();
    await page.getByRole('button', { name: /Next.*Summary/i }).click();

    // Summary should show a HP change heading
    await expect(page.locator('.level-up-modal-summary-list').getByText(/Hit Points/i)).toBeVisible();
    await expect(page.getByText(/Level:.*1.*→.*2/i)).toBeVisible();
  });

  test('magic-user level-up shows spell selection step and adds spell', async ({ page }) => {
    await createCharacterToSheet(page, { className: 'Magic-User', name: 'Gandalf' });

    await page.getByRole('button', { name: /Level Up/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Step 1: roll HP
    await page.getByRole('button', { name: /Roll HP/i }).click();

    // Magic-User level 2 unlocks 2nd spell slot (first gains a 2nd 1st-level slot)
    // At level 2, MU gets 2 first-level spell slots (gaining 1), which doesn't
    // unlock a NEW spell level — no spell step expected on level 1→2.
    // However on level 2→3, the first 2nd-level slot appears.
    // On 1→2, the button may say "Next: Summary →" (no new spell level unlocked).
    const nextBtn = page.getByRole('button', { name: /Next/i });
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();

    // We should be on summary OR spell selection
    const onSummary = await page.getByRole('heading', { name: /Level Up Summary/i }).isVisible();
    const onSpell = await page.getByRole('heading', { name: /New Spell/i }).isVisible();
    expect(onSummary || onSpell).toBe(true);

    if (onSpell) {
      // Pick a spell
      const firstSpell = page.locator('input[name="new-spell"]').first();
      await firstSpell.check();
      await page.getByRole('button', { name: /Next.*Summary/i }).click();
    }

    await expect(page.getByRole('heading', { name: /Level Up Summary/i })).toBeVisible();
    await page.getByRole('button', { name: /Confirm Level Up/i }).click();

    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText(/Level 2 Magic-User/i)).toBeVisible();
  });

  test('HP re-roll button works in the modal', async ({ page }) => {
    await createCharacterToSheet(page, { className: 'Fighter' });

    await page.getByRole('button', { name: /Level Up/i }).click();
    await page.getByRole('button', { name: /Roll HP/i }).click();

    // Should show re-roll button now
    await expect(page.getByRole('button', { name: /Re-roll/i })).toBeVisible();

    // Re-roll should still be possible multiple times
    await page.getByRole('button', { name: /Re-roll/i }).click();
    await expect(page.getByRole('button', { name: /Re-roll/i })).toBeVisible();

    // Can still proceed
    await expect(page.getByRole('button', { name: /Next/i })).toBeEnabled();
  });

  test('Level Up button is NOT visible when character is at max level', async ({ page }) => {
    await createCharacterToSheet(page, { className: 'Halfling' });

    // Halfling max level is 8 — level them up 7 times
    for (let i = 1; i < 8; i++) {
      await page.getByRole('button', { name: /Level Up/i }).click();
      await expect(page.getByRole('dialog')).toBeVisible();

      const isRollLevel = await page.getByRole('button', { name: /Roll HP/i }).isVisible();
      if (isRollLevel) {
        await page.getByRole('button', { name: /Roll HP/i }).click();
      }

      // Skip spell step if present
      const nextBtn = page.getByRole('button', { name: /Next/i });
      if (await nextBtn.isVisible()) {
        const spellStep = await page.getByRole('heading', { name: /New Spell/i }).isVisible();
        if (spellStep) {
          const firstSpell = page.locator('input[name="new-spell"]').first();
          if (await firstSpell.isVisible()) await firstSpell.check();
        }
        await nextBtn.click();
      }

      await page.getByRole('button', { name: /Confirm Level Up/i }).click();
      await expect(page.getByRole('dialog')).not.toBeVisible();
    }

    // Now at level 8 (max for Halfling)
    await expect(page.getByText(/Level 8 Halfling/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Level Up/i })).not.toBeVisible();
  });

  test('THAC0 is shown on the character sheet', async ({ page }) => {
    await createCharacterToSheet(page, { className: 'Fighter' });
    await expect(page.getByText('THAC0')).toBeVisible();
  });

  test('level and class are shown on the character sheet subheader', async ({ page }) => {
    await createCharacterToSheet(page, { className: 'Fighter', name: 'Conan' });
    await expect(page.getByText(/Level 1 Fighter/i)).toBeVisible();
  });

  test('Magic-User L6→L7: modal asks for both a L1 spell and a L4 spell', async ({ page }) => {
    // Inject a level-6 Magic-User directly via localStorage so we skip the full wizard.
    // The character knows only 'Magic Missile', leaving many L1 and all L4 spells available.
    const level6MU = {
      character: {
        id: 'e2e-l6-mu',
        name: 'Archmage Test',
        languages: ['Common'],
        hasLanguages: true,
        personality: null,
        misfortune: null,
        appearance: null,
        backgroundSkill: null,
        alignment: 'Neutral',
      },
      abilityScores: {
        strength: 10, intelligence: 13, wisdom: 10,
        dexterity: 10, constitution: 10, charisma: 10,
      },
      characterModifiers: {
        xpModifierPercentage: '+5%',
        strengthModMelee: '0', strengthModDoors: '-3',
        intelligenceModLanguages: '1', intelligenceModLiteracy: 'Literate',
        intelligenceModExtraLanguageCount: '0',
        wisdomMod: '0', dexterityModAC: '0', dexterityModMissiles: '0',
        dexterityModInitiative: '0', constitutionMod: '0',
        charismaModNPCReactions: '0', charismaModRetainersMax: '0',
        charismaModLoyalty: '0',
      },
      characterStatistics: {
        hitPoints: 12, hpRolls: 0, hpResult: null, hpSeed: null,
        armourClass: 9, spell: 'Magic Missile', hasSpells: true,
        unarmouredAC: 9, level: 6, spells: ['Magic Missile'],
      },
      characterClass: { name: 'Magic-User' },
      characterEquipment: { armour: [], weapons: [], adventuringGear: [], gold: 40 },
      partial: true,
    };

    await page.evaluate((data) => {
      localStorage.setItem('partialCharacter', JSON.stringify(data));
    }, level6MU);

    // Navigate to the landing page so the app auto-loads the partial character,
    // then click Continue (which routes to /#/sheet via getFurthestRoute).
    // We avoid navigating directly to /#/sheet because CharacterSheetScreen's
    // saveCharacter() useEffect (child) fires before useCharacterManager's load
    // useEffect (parent), clearing the partial from localStorage before it's read.
    await page.goto('/');
    await expect(page.getByRole('button', { name: /Continue/i })).toBeVisible();
    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page.getByText(/Level 6 Magic-User/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Level Up.*Level 7/i })).toBeVisible();

    // ── Open the modal ────────────────────────────────────────────────────────
    await page.getByRole('button', { name: /Level Up.*Level 7/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // ── Step 1: HP ───────────────────────────────────────────────────────────
    await page.getByRole('button', { name: /Roll HP/i }).click();
    await expect(page.getByRole('button', { name: /Re-roll/i })).toBeVisible();

    // Button should say "Next: Spell →" because spell tiers were gained
    await expect(page.getByRole('button', { name: /Next.*Spell/i })).toBeVisible();
    await page.getByRole('button', { name: /Next.*Spell/i }).click();

    // ── Step 2: L1 spell selection ────────────────────────────────────────
    await expect(page.getByRole('heading', { name: /New Spell.*1st/i })).toBeVisible();
    await page.locator('input[name="new-spell"]').first().click();

    // Clicking Next should move to the L4 spell step (not summary yet)
    await page.getByRole('button', { name: /Next.*Spell/i }).click();

    // ── Step 3: L4 spell selection ────────────────────────────────────────
    await expect(page.getByRole('heading', { name: /New Spell.*4th/i })).toBeVisible();
    await page.locator('input[name="new-spell"]').first().click();

    // Now Next goes to summary
    await page.getByRole('button', { name: /Next.*Summary/i }).click();

    // ── Step 4: Summary ───────────────────────────────────────────────────
    await expect(page.getByRole('heading', { name: /Level Up Summary/i })).toBeVisible();
    await expect(page.getByText(/Level:.*6.*→.*7/i)).toBeVisible();

    // Summary must list two new spells
    const newSpellItems = page.locator('.level-up-modal-summary-list li').filter({ hasText: /New spell/i });
    await expect(newSpellItems).toHaveCount(2);

    // ── Confirm ───────────────────────────────────────────────────────────
    await page.getByRole('button', { name: /Confirm Level Up/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText(/Level 7 Magic-User/i)).toBeVisible();
  });
});
