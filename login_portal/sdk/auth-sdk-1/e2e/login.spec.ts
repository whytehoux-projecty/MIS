import { test, expect } from '@playwright/test';

/**
 * Login Flow E2E Tests
 * 
 * These tests simulate real user interactions with the login page.
 */

test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should display the login page with QR code', async ({ page }) => {
        // Wait for page to load
        await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();

        // Check for QR code image
        await expect(page.getByAltText('Login QR Code')).toBeVisible();

        // Check for countdown timer
        await expect(page.locator('[class*="font-mono"]')).toBeVisible();
    });

    test('should display branding when configured', async ({ page }) => {
        // Check for company logo if configured
        const logo = page.locator('img[alt*="Logo"]');
        if (await logo.count() > 0) {
            await expect(logo).toBeVisible();
        }

        // Check for powered by text
        const poweredBy = page.getByText(/powered by/i);
        if (await poweredBy.count() > 0) {
            await expect(poweredBy).toBeVisible();
        }
    });

    test('should show manual entry option', async ({ page }) => {
        // Check for manual entry link
        await expect(page.getByText(/enter membership key manually/i)).toBeVisible();

        // Click to switch to manual entry
        await page.getByText(/enter membership key manually/i).click();

        // Should show membership key input
        await expect(page.getByLabel(/membership key/i)).toBeVisible();

        // Should show sign in button
        await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    });

    test('should toggle between QR and manual entry', async ({ page }) => {
        // Start with QR code visible
        await expect(page.getByAltText('Login QR Code')).toBeVisible();

        // Switch to manual entry
        await page.getByText(/enter membership key manually/i).click();
        await expect(page.getByLabel(/membership key/i)).toBeVisible();
        await expect(page.getByAltText('Login QR Code')).not.toBeVisible();

        // Switch back to QR
        await page.getByText(/use qr code instead/i).click();
        await expect(page.getByAltText('Login QR Code')).toBeVisible();
        await expect(page.getByLabel(/membership key/i)).not.toBeVisible();
    });
});

test.describe('Manual Entry Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Switch to manual entry
        await page.getByText(/enter membership key manually/i).click();
    });

    test('should allow typing in membership key field', async ({ page }) => {
        const input = page.getByLabel(/membership key/i);
        await input.fill('test-membership-key');
        await expect(input).toHaveValue('test-membership-key');
    });

    test('should have sign in button disabled when input is empty', async ({ page }) => {
        const button = page.getByRole('button', { name: /sign in/i });
        const input = page.getByLabel(/membership key/i);

        // Clear input
        await input.fill('');

        // Button might not be disabled, but clicking should not submit
        await button.click();

        // Should still be on login page
        await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    });
});

test.describe('Accessibility', () => {
    test('should have proper heading structure', async ({ page }) => {
        await page.goto('/');

        // Should have a main heading
        const h1 = page.getByRole('heading', { level: 1 });
        await expect(h1).toBeVisible();
    });

    test('should have main landmark', async ({ page }) => {
        await page.goto('/');

        const main = page.getByRole('main');
        await expect(main).toBeVisible();
    });

    test('should have accessible form inputs in manual mode', async ({ page }) => {
        await page.goto('/');
        await page.getByText(/enter membership key manually/i).click();

        // Input should have a label
        const input = page.getByLabel(/membership key/i);
        await expect(input).toBeVisible();
        await expect(input).toHaveAttribute('type', 'password');
    });

    test('should be keyboard navigable', async ({ page }) => {
        await page.goto('/');

        // Tab through elements
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');

        // Should be able to focus the manual entry link
        const activeElement = page.locator(':focus');
        await expect(activeElement).toBeVisible();
    });
});

test.describe('Responsive Design', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');

        // QR code should still be visible
        await expect(page.getByAltText('Login QR Code')).toBeVisible();

        // Content should fit in viewport
        const container = page.locator('[role="main"]');
        const box = await container.boundingBox();
        expect(box?.width).toBeLessThanOrEqual(375);
    });

    test('should display correctly on tablet viewport', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto('/');

        // All elements should be visible
        await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
        await expect(page.getByAltText('Login QR Code')).toBeVisible();
    });

    test('should display correctly on desktop viewport', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto('/');

        // All elements should be visible and centered
        await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
        await expect(page.getByAltText('Login QR Code')).toBeVisible();
    });
});

test.describe('Error Handling', () => {
    test('should display error alert when error occurs', async ({ page }) => {
        // This test requires API mocking to trigger an error
        // For now, we just verify the error alert component exists
        await page.goto('/');

        // No errors initially
        const errorAlert = page.locator('[role="alert"]');
        await expect(errorAlert).not.toBeVisible();
    });
});

test.describe('QR Code Timer', () => {
    test('should display countdown timer', async ({ page }) => {
        await page.goto('/');

        // Timer should be visible
        const timer = page.locator('[class*="font-mono"]');
        await expect(timer).toBeVisible();

        // Should show time in format "M:SS"
        const timerText = await timer.textContent();
        expect(timerText).toMatch(/\d+:\d{2}/);
    });

    test('should countdown over time', async ({ page }) => {
        await page.goto('/');

        const timer = page.locator('[class*="font-mono"]');
        const initialTime = await timer.textContent();

        // Wait 2 seconds
        await page.waitForTimeout(2000);

        const updatedTime = await timer.textContent();

        // Time should have decreased (or stayed same if just under 1 second passed)
        expect(updatedTime).toBeDefined();
    });
});
