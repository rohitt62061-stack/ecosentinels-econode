import { test, expect } from '@playwright/test';

test.describe('MCD Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the MCD Dashboard URL
    await page.goto('/mcd-dashboard');
  });

  test('should load the MCD Dashboard Header and Navigation', async ({ page }) => {
    // Verify logo/title
    await expect(page.locator('h1')).toContainText('EcoNode');
    
    // Check main side navigation presence
    const sidenav = page.locator('aside');
    await expect(sidenav).toBeVisible();
    await expect(sidenav.getByText('Dashboard')).toBeVisible();
  });

  test('should load the Governance Alerts empty state initially', async ({ page }) => {
    // Verify PolicyPanel/Alerts structure loads
    await expect(page.getByText('Governance Alerts', { exact: true })).toBeVisible();
    
    // Verify the empty state loads automatically
    await expect(page.getByText('No Alerts Today')).toBeVisible();
  });

  test('should load mock data upon action click', async ({ page }) => {
    // Locate the load action button inside empty state or header
    const loadButton = page.getByRole('button', { name: 'Load Data' });
    const checkButton = page.getByRole('button', { name: 'Run Manual Check' });

    // Click to load mock data
    await loadButton.or(checkButton).first().click();

    // Verify list populated (e.g., alert title is visible)
    await expect(page.getByText('PM 2.5 Spike in Okhla')).toBeVisible();
  });
});
