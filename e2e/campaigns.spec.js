// @ts-check
import { expect, test } from '@playwright/test';

// ── helpers ────────────────────────────────────────────────────────────────────

/**
 * Navigate to /#/campaigns - the campaigns management screen.
 * The "Manage Campaigns" button is rendered by LandingScreen which is always
 * visible as a header on top of the outlet routes.
 */
async function goToCampaigns(page) {
  await page.goto('/');
  await page.getByRole('button', { name: /manage campaigns/i }).click();
  await expect(page.getByRole('heading', { name: /campaigns/i })).toBeVisible();
}

// ── Create campaign ────────────────────────────────────────────────────────────

test('Campaigns: can create a new campaign and land on its settings page', async ({ page }) => {
  await goToCampaigns(page);

  // Fill in campaign name and submit
  await page.getByPlaceholder(/campaign name/i).fill('E2E Test Campaign');
  await page.getByRole('button', { name: /create/i }).click();

  // Should navigate to the new campaign's settings screen
  await expect(page.getByRole('heading', { name: /e2e test campaign.*settings/i })).toBeVisible();
  await expect(page).toHaveURL(/\/campaigns\/.+\/settings/);
});

// ── Campaign settings tabs ─────────────────────────────────────────────────────

test('Campaign settings: all four tabs are reachable and show content', async ({ page }) => {
  // First create a campaign
  await goToCampaigns(page);
  await page.getByPlaceholder(/campaign name/i).fill('Tab Test');
  await page.getByRole('button', { name: /create/i }).click();
  await expect(page).toHaveURL(/\/campaigns\/.+\/settings/);

  // General tab (default) — campaign name input should show the name
  await expect(page.locator('.campaign-name-input')).toHaveValue('Tab Test');

  // Classes tab — shows custom class management area
  await page.getByRole('button', { name: /^classes$/i }).click();
  await expect(page.getByText(/no custom classes defined yet/i)).toBeVisible();

  // Equipment tab — shows custom equipment area
  await page.getByRole('button', { name: /^equipment$/i }).click();
  await expect(page.getByText(/no custom equipment defined/i)).toBeVisible();

  // Spells tab — shows custom spell lists area
  await page.getByRole('button', { name: /^spells$/i }).click();
  await expect(page.getByText(/no custom spell lists defined/i)).toBeVisible();
});

// ── Campaign save ─────────────────────────────────────────────────────────────

test('Campaign settings: renaming and saving persists on the campaigns list', async ({ page }) => {
  // Create campaign
  await goToCampaigns(page);
  await page.getByPlaceholder(/campaign name/i).fill('Original Name');
  await page.getByRole('button', { name: /create/i }).click();
  await expect(page).toHaveURL(/\/campaigns\/.+\/settings/);

  // Rename it
  await page.locator('.campaign-name-input').fill('Renamed Campaign');
  await page.getByRole('button', { name: /save & back/i }).click();

  // Back on the campaigns list, verify the new name appears
  await expect(page.getByRole('heading', { name: /campaigns/i })).toBeVisible();
  await expect(page.getByText('Renamed Campaign')).toBeVisible();
});

// ── Tavern campaign filter ─────────────────────────────────────────────────────

test('Tavern: campaign filter dropdown shows created campaigns', async ({ page }) => {
  // 1. Create a campaign named "Dungeon Crawl"
  await goToCampaigns(page);
  await page.getByPlaceholder(/campaign name/i).fill('Dungeon Crawl');
  await page.getByRole('button', { name: /create/i }).click();

  // 2. Go back, activate the campaign via the Play button
  await page.getByRole('button', { name: /save.*back/i }).click();
  const playButtons = page.getByRole('button', { name: /^play$/i });
  // Play the "Dungeon Crawl" campaign (last in list)
  await playButtons.last().click();

  // 3. Activate → navigates to landing; go to tavern
  await page.getByRole('button', { name: /tavern/i }).click();
  await expect(page.getByRole('heading', { name: /tavern/i })).toBeVisible();

  // 4. The campaign filter dropdown should include "Dungeon Crawl"
  await expect(page.locator('#tavern-campaign')).toContainText('Dungeon Crawl');
});

// ── Campaign landing via direct URL ───────────────────────────────────────────

test('Campaign landing: /campaign/:id activates the campaign and shows name', async ({ page }) => {
  // 1. Create a campaign to get a real id
  await goToCampaigns(page);
  await page.getByPlaceholder(/campaign name/i).fill('Direct URL Campaign');
  await page.getByRole('button', { name: /create/i }).click();
  await expect(page).toHaveURL(/\/campaigns\/(?<id>[^/]+)\/settings/);

  // Extract the campaign id from the URL
  const url = page.url();
  const match = url.match(/\/campaigns\/([^/]+)\/settings/);
  const campaignId = match?.[1];
  expect(campaignId).toBeTruthy();

  // 2. Navigate directly to the campaign landing URL
  await page.goto(`/#/campaign/${campaignId}`);

  // 3. Should show the campaign name and action buttons
  await expect(page.locator('.campaign-landing--title')).toBeVisible();
  await expect(page.locator('.campaign-landing--title')).toHaveText(/direct url campaign/i);
  await expect(page.getByRole('button', { name: /create character/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /view characters/i })).toBeVisible();
});

// ── Campaign Settings — General tab reorganisation ────────────────────────────

test('Campaign settings: General tab does NOT show class checklist items', async ({ page }) => {
  await goToCampaigns(page);
  await page.getByPlaceholder(/campaign name/i).fill('Layout Test');
  await page.getByRole('button', { name: /create/i }).click();
  await expect(page).toHaveURL(/\/campaigns\/.+\/settings/);

  // General tab is active by default — class checklist should NOT be present
  await expect(page.locator('.campaign-checklist-item').first()).not.toBeVisible();
});

// ── Campaign Settings — Classes tab ───────────────────────────────────────────

test('Campaign settings: Classes tab has class filter grouped by category', async ({ page }) => {
  await goToCampaigns(page);
  await page.getByPlaceholder(/campaign name/i).fill('Class Filter Test');
  await page.getByRole('button', { name: /create/i }).click();
  await page.getByRole('button', { name: /^classes$/i }).click();

  // "All classes" checkbox is present
  await expect(page.getByRole('checkbox', { name: /all classes/i })).toBeVisible();

  // Category headings from classOptionsData
  await expect(page.getByText(/\bbasic\b/i)).toBeVisible();
  await expect(page.getByText(/\badvanced\b/i)).toBeVisible();
});

test('Campaign settings: class filter persists — unchecking a class restricts it', async ({ page }) => {
  await goToCampaigns(page);
  await page.getByPlaceholder(/campaign name/i).fill('Restrict Fighter Test');
  await page.getByRole('button', { name: /create/i }).click();
  await page.getByRole('button', { name: /^classes$/i }).click();

  // Uncheck Fighter
  await page.getByRole('checkbox', { name: /^Fighter$/i }).uncheck();
  await page.getByRole('button', { name: /save & back/i }).click();

  // Re-open settings
  await page.getByRole('button', { name: /settings/i }).last().click();
  await page.getByRole('button', { name: /^classes$/i }).click();

  // Fighter should remain unchecked after saving
  await expect(page.getByRole('checkbox', { name: /^Fighter$/i })).not.toBeChecked();
});

test('Campaign settings: can add and remove a class override', async ({ page }) => {
  await goToCampaigns(page);
  await page.getByPlaceholder(/campaign name/i).fill('Override Test');
  await page.getByRole('button', { name: /create/i }).click();
  await page.getByRole('button', { name: /^classes$/i }).click();

  // Open the override form
  await page.getByRole('button', { name: /add override/i }).click();

  // Select a base class and give it a new name
  await page.getByRole('combobox', { name: /base class/i }).selectOption('Fighter');
  await page.getByRole('textbox', { name: /name.*override/i }).fill('Warrior');

  await page.getByRole('button', { name: /save override/i }).click();

  // Override appears in the list
  await expect(page.locator('.campaign-override-list')).toContainText('Override: Fighter');
  await expect(page.locator('.campaign-override-list')).toContainText('"Warrior"');

  // Remove it
  await page.getByRole('button', { name: /remove/i }).last().click();
  await expect(page.locator('.campaign-override-list')).not.toBeVisible();
});

// ── Campaign Settings — Equipment tab ─────────────────────────────────────────

test('Campaign settings: Equipment tab has NonBxEquipment toggle', async ({ page }) => {
  await goToCampaigns(page);
  await page.getByPlaceholder(/campaign name/i).fill('Equipment Toggle Test');
  await page.getByRole('button', { name: /create/i }).click();
  await page.getByRole('button', { name: /^equipment$/i }).click();

  // NonBxEquipment three-state toggle is now in Equipment tab (not General)
  await expect(page.getByText(/non-b\/x equipment/i)).toBeVisible();
});

test('Campaign settings: Equipment tab shows equipment and weapon filter checkboxes', async ({ page }) => {
  await goToCampaigns(page);
  await page.getByPlaceholder(/campaign name/i).fill('Equipment Filter Test');
  await page.getByRole('button', { name: /create/i }).click();
  await page.getByRole('button', { name: /^equipment$/i }).click();

  // Equipment filter section
  await expect(page.getByText(/allowed equipment/i)).toBeVisible();
  await expect(page.getByRole('checkbox', { name: /all items/i })).toBeVisible();

  // Weapon filter section
  await expect(page.getByText(/allowed weapons/i)).toBeVisible();
  await expect(page.getByRole('checkbox', { name: /all weapons/i })).toBeVisible();
});

test('Campaign settings: can add and remove custom equipment', async ({ page }) => {
  await goToCampaigns(page);
  await page.getByPlaceholder(/campaign name/i).fill('Custom Equipment Test');
  await page.getByRole('button', { name: /create/i }).click();
  await page.getByRole('button', { name: /^equipment$/i }).click();

  // Open add form
  await page.getByRole('button', { name: /add equipment/i }).click();
  await page.getByRole('textbox', { name: /item name/i }).fill('Magic Stone');
  await page.getByRole('spinbutton', { name: /price.*gp/i }).fill('50');
  await page.getByRole('textbox', { name: /category/i }).fill('Magical');
  await page.getByRole('button', { name: /save equipment/i }).click();

  // Item appears in list
  await expect(page.locator('.campaign-custom-item-list')).toContainText('Magic Stone');

  // Remove it
  await page.locator('.campaign-custom-item-list').getByRole('button', { name: /remove/i }).click();
  await expect(page.locator('.campaign-custom-item-list')).not.toContainText('Magic Stone');
});

test('Campaign settings: can add and remove custom weapons', async ({ page }) => {
  await goToCampaigns(page);
  await page.getByPlaceholder(/campaign name/i).fill('Custom Weapon Test');
  await page.getByRole('button', { name: /create/i }).click();
  await page.getByRole('button', { name: /^equipment$/i }).click();

  await page.getByRole('button', { name: /add weapon/i }).click();
  await page.getByRole('textbox', { name: /weapon name/i }).fill('Vorpal Blade');
  await page.getByRole('spinbutton', { name: /price.*gp/i }).fill('100');
  await page.getByRole('textbox', { name: /damage/i }).fill('1d8');
  await page.getByRole('combobox', { name: /category/i }).selectOption('Melee');
  await page.getByRole('button', { name: /save weapon/i }).click();

  await expect(page.locator('.campaign-custom-weapon-list')).toContainText('Vorpal Blade');

  await page.locator('.campaign-custom-weapon-list').getByRole('button', { name: /remove/i }).click();
  await expect(page.locator('.campaign-custom-weapon-list')).not.toContainText('Vorpal Blade');
});

// ── Campaign Settings — Spells tab ────────────────────────────────────────────

test('Campaign settings: Spells tab shows spell filter sections for built-in lists', async ({ page }) => {
  await goToCampaigns(page);
  await page.getByPlaceholder(/campaign name/i).fill('Spell Filter Test');
  await page.getByRole('button', { name: /create/i }).click();
  await page.getByRole('button', { name: /^spells$/i }).click();

  // Built-in spell list names should appear as section headers
  await expect(page.getByText(/magic-user/i)).toBeVisible();
  await expect(page.getByText(/^cleric$/i)).toBeVisible();
});

test('Campaign settings: can add a custom spell to a spell list', async ({ page }) => {
  await goToCampaigns(page);
  await page.getByPlaceholder(/campaign name/i).fill('Custom Spell Test');
  await page.getByRole('button', { name: /create/i }).click();
  await page.getByRole('button', { name: /^spells$/i }).click();

  await page.getByRole('button', { name: /add custom spell/i }).click();
  await page.getByRole('combobox', { name: /spell list/i }).selectOption('magic-user');
  await page.getByRole('spinbutton', { name: /spell level/i }).fill('1');
  await page.getByRole('textbox', { name: /spell name/i }).fill('Arcane Bolt');
  await page.getByRole('button', { name: /save spell/i }).click();

  await expect(page.locator('.campaign-custom-spells-section')).toContainText('Arcane Bolt');

  // Remove the custom spell
  await page.locator('.campaign-custom-spells-section').getByRole('button', { name: /remove/i }).click();
  await expect(page.locator('.campaign-custom-spells-section')).not.toContainText('Arcane Bolt');
});

// ── Campaign delete ────────────────────────────────────────────────────────────

test('Campaigns: can delete a non-default campaign with confirmation', async ({ page }) => {
  // Create a campaign
  await goToCampaigns(page);
  await page.getByPlaceholder(/campaign name/i).fill('To Be Deleted');
  await page.getByRole('button', { name: /create/i }).click();
  await page.getByRole('button', { name: /save.*back/i }).click();

  await expect(page.getByRole('heading', { name: /campaigns/i })).toBeVisible();
  await expect(page.getByText('To Be Deleted')).toBeVisible();

  // Click Delete once → confirmation prompt
  const deleteButtons = page.getByRole('button', { name: /^delete$/i });
  await deleteButtons.last().click();
  await expect(page.getByRole('button', { name: /confirm delete/i })).toBeVisible();

  // Confirm deletion
  await page.getByRole('button', { name: /confirm delete/i }).click();
  await expect(page.getByText('To Be Deleted')).not.toBeVisible();
});

// ── Class override abilities ───────────────────────────────────────────────────

test('Campaign settings: can add and save abilities in a class override', async ({ page }) => {
  await goToCampaigns(page);
  await page.getByPlaceholder(/campaign name/i).fill('Abilities Override Test');
  await page.getByRole('button', { name: /create/i }).click();
  await page.getByRole('button', { name: /^classes$/i }).click();

  // Open the override form
  await page.getByRole('button', { name: /add override/i }).click();
  await page.getByRole('combobox', { name: /base class/i }).selectOption('Fighter');

  // Enable abilities override
  await page.getByRole('checkbox', { name: /override abilities/i }).check();

  // Add an ability
  await page.getByRole('button', { name: /add ability/i }).click();
  await page.locator('.campaign-ability-row-name').fill('Berserker Rage');
  await page.locator('.campaign-ability-row-desc').fill('Double damage when enraged.');

  // Save the override
  await page.getByRole('button', { name: /save override/i }).click();
  await expect(page.locator('.campaign-override-list')).toContainText('Override: Fighter');

  // Re-open to verify persistence
  await page.getByRole('button', { name: /edit/i }).click();
  await expect(page.getByRole('checkbox', { name: /override abilities/i })).toBeChecked();
  await expect(page.locator('.campaign-ability-row-name')).toHaveValue('Berserker Rage');
  await expect(page.locator('.campaign-ability-row-desc')).toHaveValue('Double damage when enraged.');

  // Remove the ability
  await page.locator('.campaign-ability-row').getByRole('button', { name: /remove/i }).click();
  await expect(page.locator('.campaign-ability-row')).not.toBeVisible();

  // Cancel the override form
  await page.locator('.campaign-override-form-actions').getByRole('button', { name: /cancel/i }).click();
});

test('Campaign settings: ability override persists through save & back', async ({ page }) => {
  await goToCampaigns(page);
  await page.getByPlaceholder(/campaign name/i).fill('Ability Persist Test');
  await page.getByRole('button', { name: /create/i }).click();
  await page.getByRole('button', { name: /^classes$/i }).click();

  // Add override with abilities
  await page.getByRole('button', { name: /add override/i }).click();
  await page.getByRole('combobox', { name: /base class/i }).selectOption('Thief');
  await page.getByRole('checkbox', { name: /override abilities/i }).check();
  await page.getByRole('button', { name: /add ability/i }).click();
  await page.locator('.campaign-ability-row-name').fill('Shadow Strike');
  await page.getByRole('button', { name: /save override/i }).click();

  // Save & Back then re-open
  await page.getByRole('button', { name: /save.*back/i }).click();
  await page.getByRole('button', { name: /settings/i }).last().click();
  await page.getByRole('button', { name: /^classes$/i }).click();
  await page.getByRole('button', { name: /edit/i }).click();

  await expect(page.getByRole('checkbox', { name: /override abilities/i })).toBeChecked();
  await expect(page.locator('.campaign-ability-row-name')).toHaveValue('Shadow Strike');
});

// ── Level progression editor — override ───────────────────────────────────────

test('Level progression: override toggle shows and hides the editor', async ({ page }) => {
  await goToCampaigns(page);
  await page.getByPlaceholder(/campaign name/i).fill('Level Toggle Test');
  await page.getByRole('button', { name: /create/i }).click();
  await page.getByRole('button', { name: /^classes$/i }).click();

  await page.getByRole('button', { name: /add override/i }).click();
  await page.getByRole('combobox', { name: /base class/i }).selectOption('Fighter');

  // Editor is hidden by default
  await expect(page.locator('.campaign-level-editor')).not.toBeVisible();

  // Enabling the checkbox reveals the editor
  await page.getByRole('checkbox', { name: /override level progression/i }).check();
  await expect(page.locator('.campaign-level-editor')).toBeVisible();

  // Unchecking hides it again
  await page.getByRole('checkbox', { name: /override level progression/i }).uncheck();
  await expect(page.locator('.campaign-level-editor')).not.toBeVisible();
});

test('Level progression: Copy from base class populates rows', async ({ page }) => {
  await goToCampaigns(page);
  await page.getByPlaceholder(/campaign name/i).fill('Copy Base Test');
  await page.getByRole('button', { name: /create/i }).click();
  await page.getByRole('button', { name: /^classes$/i }).click();

  await page.getByRole('button', { name: /add override/i }).click();
  await page.getByRole('combobox', { name: /base class/i }).selectOption('Fighter');
  await page.getByRole('checkbox', { name: /override level progression/i }).check();

  // Before copying, the table should be empty
  await expect(page.locator('.campaign-level-editor')).toBeVisible();

  // Click "Copy from base class"
  await page.getByRole('button', { name: /copy from base class/i }).click();

  // Fighter has 14 levels — there should now be 14 rows in the table
  const rows = page.locator('.campaign-level-table tbody tr');
  await expect(rows).toHaveCount(14);

  // The first row should show level 1 with XP 0
  await expect(rows.first().locator('[aria-label*="XP"]').first()).toHaveValue('0');
});

test('Level progression: editing XP value persists through save and re-open', async ({ page }) => {
  await goToCampaigns(page);
  await page.getByPlaceholder(/campaign name/i).fill('Level Persist Test');
  await page.getByRole('button', { name: /create/i }).click();
  await page.getByRole('button', { name: /^classes$/i }).click();

  await page.getByRole('button', { name: /add override/i }).click();
  await page.getByRole('combobox', { name: /base class/i }).selectOption('Fighter');
  await page.getByRole('checkbox', { name: /override level progression/i }).check();
  await page.getByRole('button', { name: /copy from base class/i }).click();

  // Change the XP for level 2 (second row's XP input)
  const rows = page.locator('.campaign-level-table tbody tr');
  await rows.nth(1).locator('[aria-label*="XP"]').first().fill('1500');

  await page.getByRole('button', { name: /save override/i }).click();

  // Save & Back, then re-open and edit
  await page.getByRole('button', { name: /save.*back/i }).click();
  await page.getByRole('button', { name: /settings/i }).last().click();
  await page.getByRole('button', { name: /^classes$/i }).click();
  await page.getByRole('button', { name: /edit/i }).click();

  // Level progression checkbox should be checked
  await expect(page.getByRole('checkbox', { name: /override level progression/i })).toBeChecked();

  // Level 2 XP should still be 1500
  const row2 = page.locator('.campaign-level-table tbody tr').nth(1);
  await expect(row2.locator('[aria-label*="XP"]').first()).toHaveValue('1500');
});

test('Level progression: can add a row', async ({ page }) => {
  await goToCampaigns(page);
  await page.getByPlaceholder(/campaign name/i).fill('Add Row Test');
  await page.getByRole('button', { name: /create/i }).click();
  await page.getByRole('button', { name: /^classes$/i }).click();

  await page.getByRole('button', { name: /add override/i }).click();
  await page.getByRole('checkbox', { name: /override level progression/i }).check();

  const rows = page.locator('.campaign-level-table tbody tr');
  await expect(rows).toHaveCount(0);

  await page.getByRole('button', { name: /add level/i }).click();
  await expect(rows).toHaveCount(1);

  await page.getByRole('button', { name: /add level/i }).click();
  await expect(rows).toHaveCount(2);
});

test('Level progression: can remove a row', async ({ page }) => {
  await goToCampaigns(page);
  await page.getByPlaceholder(/campaign name/i).fill('Remove Row Test');
  await page.getByRole('button', { name: /create/i }).click();
  await page.getByRole('button', { name: /^classes$/i }).click();

  await page.getByRole('button', { name: /add override/i }).click();
  await page.getByRole('checkbox', { name: /override level progression/i }).check();
  await page.getByRole('button', { name: /add level/i }).click();
  await page.getByRole('button', { name: /add level/i }).click();

  const rows = page.locator('.campaign-level-table tbody tr');
  await expect(rows).toHaveCount(2);

  // Remove the first row
  await rows.first().getByRole('button', { name: /remove/i }).click();
  await expect(rows).toHaveCount(1);
});

test('Level progression: card view toggle switches from table to cards', async ({ page }) => {
  await goToCampaigns(page);
  await page.getByPlaceholder(/campaign name/i).fill('Card View Test');
  await page.getByRole('button', { name: /create/i }).click();
  await page.getByRole('button', { name: /^classes$/i }).click();

  await page.getByRole('button', { name: /add override/i }).click();
  await page.getByRole('checkbox', { name: /override level progression/i }).check();
  await page.getByRole('button', { name: /add level/i }).click();

  // Default is table view
  await expect(page.locator('.campaign-level-table')).toBeVisible();
  await expect(page.locator('.campaign-level-card')).not.toBeVisible();

  // Switch to card view
  await page.getByRole('button', { name: /cards/i }).click();
  await expect(page.locator('.campaign-level-card')).toBeVisible();
  await expect(page.locator('.campaign-level-table')).not.toBeVisible();

  // Switch back to table view
  await page.getByRole('button', { name: /table/i }).click();
  await expect(page.locator('.campaign-level-table')).toBeVisible();
  await expect(page.locator('.campaign-level-card')).not.toBeVisible();
});

// ── Custom class creation ─────────────────────────────────────────────────────

test('Campaign settings: can add a new custom class that inherits level progression', async ({ page }) => {
  await goToCampaigns(page);
  await page.getByPlaceholder(/campaign name/i).fill('New Class Inherit Test');
  await page.getByRole('button', { name: /create/i }).click();
  await page.getByRole('button', { name: /^classes$/i }).click();

  // Open the new custom class form
  await page.getByRole('button', { name: /add custom class/i }).click();

  // Fill in required fields
  await page.getByRole('textbox', { name: /class name/i }).fill('Battle Mage');
  await page.getByRole('spinbutton', { name: /hit die/i }).fill('6');
  await page.getByRole('spinbutton', { name: /max level/i }).fill('10');

  // Choose "inherit" level progression (should be default)
  await expect(page.getByRole('radio', { name: /inherit.*existing/i })).toBeChecked();
  await page.getByRole('combobox', { name: /inherit.*class/i }).selectOption('Fighter');

  await page.getByRole('button', { name: /save class/i }).click();

  // Custom class appears in the list
  await expect(page.locator('.campaign-override-list')).toContainText('New Class: Battle Mage');
});

test('Campaign settings: can add a new custom class with custom level progression', async ({ page }) => {
  await goToCampaigns(page);
  await page.getByPlaceholder(/campaign name/i).fill('New Class Custom Levels Test');
  await page.getByRole('button', { name: /create/i }).click();
  await page.getByRole('button', { name: /^classes$/i }).click();

  await page.getByRole('button', { name: /add custom class/i }).click();

  await page.getByRole('textbox', { name: /class name/i }).fill('Guardian');
  await page.getByRole('spinbutton', { name: /hit die/i }).fill('8');
  await page.getByRole('spinbutton', { name: /max level/i }).fill('12');

  // Switch to custom level progression
  await page.getByRole('radio', { name: /custom progression/i }).check();

  // The level progression editor should appear
  await expect(page.locator('.campaign-level-editor')).toBeVisible();

  // Add a level row
  await page.getByRole('button', { name: /add level/i }).click();

  await page.getByRole('button', { name: /save class/i }).click();

  await expect(page.locator('.campaign-override-list')).toContainText('New Class: Guardian');
});

test('Campaign settings: custom class with inherit progression is saved and reloads correctly', async ({ page }) => {
  await goToCampaigns(page);
  await page.getByPlaceholder(/campaign name/i).fill('Class Reload Test');
  await page.getByRole('button', { name: /create/i }).click();
  await page.getByRole('button', { name: /^classes$/i }).click();

  // Add new class
  await page.getByRole('button', { name: /add custom class/i }).click();
  await page.getByRole('textbox', { name: /class name/i }).fill('Paladin Clone');
  await page.getByRole('spinbutton', { name: /hit die/i }).fill('8');
  await page.getByRole('spinbutton', { name: /max level/i }).fill('14');
  await page.getByRole('combobox', { name: /inherit.*class/i }).selectOption('Cleric');
  await page.getByRole('button', { name: /save class/i }).click();

  // Save & Back, re-open
  await page.getByRole('button', { name: /save.*back/i }).click();
  await page.getByRole('button', { name: /settings/i }).last().click();
  await page.getByRole('button', { name: /^classes$/i }).click();

  // The custom class should be listed
  await expect(page.locator('.campaign-override-list')).toContainText('New Class: Paladin Clone');

  // Edit it — the form should re-populate correctly
  await page.locator('.campaign-override-list').getByRole('button', { name: /edit/i }).last().click();
  await expect(page.getByRole('textbox', { name: /class name/i })).toHaveValue('Paladin Clone');
  await expect(page.getByRole('combobox', { name: /inherit.*class/i })).toHaveValue('Cleric');
});
