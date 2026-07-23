import { test, expect } from '@playwright/test';

test.describe('Blog Application Tests', () => {
  test('Home page should have correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Curated Corners/);
  });

  test('Should navigate to Admin page', async ({ page }) => {
    await page.goto('/');
    // Check if the logo is visible
    await expect(page.locator('.logo')).toBeVisible();
    
    // Navigate manually to admin to check the route
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible();
  });

  test('Shop page should load properly', async ({ page }) => {
    await page.goto('/shop');
    await expect(page.getByRole('heading', { name: 'Shop The Aesthetic' })).toBeVisible();
  });

  test('About page should load properly', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('heading', { name: 'About Curated Corners' })).toBeVisible();
  });

  test('Bento grid images should load successfully', async ({ page }) => {
    await page.goto('/');
    const firstBoxImage = page.locator('.box-image-bg').first();
    await expect(firstBoxImage).toBeVisible();
  });
});
