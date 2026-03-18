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
