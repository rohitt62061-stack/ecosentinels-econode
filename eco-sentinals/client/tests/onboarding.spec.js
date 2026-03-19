import { test, expect } from '@playwright/test';

test.describe('Onboarding Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the root URL
    await page.goto('/');
  });

  test('should load onboarding content and title', async ({ page }) => {
    // Verify general presence of EcoNode branding
    await expect(page.locator('h1')).toContainText('EcoNode');
    await expect(page.getByText('Smart Urban Metabolism')).toBeVisible();
  });

  test('should display role-selection cards', async ({ page }) => {
    // Verify Citizen & MCD cards exist
    await expect(page.getByText('Citizen App', { exact: true })).toBeVisible();
    await expect(page.getByText('MCD Dashboard', { exact: true })).toBeVisible();
  });

  test('should navigate to Citizen App on click', async ({ page }) => {
    // Click Citizen card
    await page.getByText('Citizen App').click();
    
    // Check if URL changed
    await expect(page).toHaveURL(/\/citizen-app/);
  });

  test('should navigate to MCD Dashboard on click', async ({ page }) => {
    // Click MCD Dashboard card
    await page.getByText('Access Command').click();
    
    // Check if URL changed
    await expect(page).toHaveURL(/\/mcd-dashboard/);
  });
});
