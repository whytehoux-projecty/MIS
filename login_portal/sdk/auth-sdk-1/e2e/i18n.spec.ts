import { test, expect } from '@playwright/test';

/**
 * Internationalization E2E Tests
 */

test.describe('Internationalization', () => {
    test.describe('Default English', () => {
        test('should display English text by default', async ({ page }) => {
            await page.goto('/');

            // Check for English text
            await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
            await expect(page.getByText(/scan the qr code/i)).toBeVisible();
        });
    });

    // These tests would require the app to support locale switching
    // Example implementation with URL parameter: /?locale=es

    test.describe.skip('Spanish locale', () => {
        test('should display Spanish text', async ({ page }) => {
            await page.goto('/?locale=es');

            // Check for Spanish text
            await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
            await expect(page.getByText(/escanea el código qr/i)).toBeVisible();
        });
    });

    test.describe.skip('French locale', () => {
        test('should display French text', async ({ page }) => {
            await page.goto('/?locale=fr');

            // Check for French text
            await expect(page.getByRole('heading', { name: /connexion/i })).toBeVisible();
            await expect(page.getByText(/scannez le code qr/i)).toBeVisible();
        });
    });
});

test.describe('Manual Entry Locale', () => {
    test('should display localized manual entry text', async ({ page }) => {
        await page.goto('/');

        // Click manual entry link
        await page.getByText(/enter membership key manually/i).click();

        // Check for localized input label
        await expect(page.getByLabel(/membership key/i)).toBeVisible();

        // Check for localized button text
        await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    });
});
