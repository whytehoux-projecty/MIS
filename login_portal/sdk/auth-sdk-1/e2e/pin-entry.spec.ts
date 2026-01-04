import { test, expect } from '@playwright/test';

/**
 * PIN Entry E2E Tests
 */

test.describe('PIN Entry Component', () => {
    // Note: These tests require the app to be in a state where PIN entry is visible
    // This typically happens after QR scan detection

    test.describe('when PIN entry is visible', () => {
        test.beforeEach(async ({ page }) => {
            // Navigate to page and simulate scanned state
            // In a real scenario, this would involve mocking the QR scan API response
            await page.goto('/');
        });

        test.skip('should display 6 input boxes', async ({ page }) => {
            // This test is skipped as it requires QR scan to be simulated
            // When PIN entry is visible:
            const inputs = page.locator('input[inputmode="numeric"]');
            await expect(inputs).toHaveCount(6);
        });

        test.skip('should auto-focus first input', async ({ page }) => {
            // When PIN entry is visible, first input should be focused
            const firstInput = page.locator('input[inputmode="numeric"]').first();
            await expect(firstInput).toBeFocused();
        });

        test.skip('should advance to next input on digit entry', async ({ page }) => {
            const inputs = page.locator('input[inputmode="numeric"]');

            await inputs.nth(0).type('1');
            await expect(inputs.nth(1)).toBeFocused();

            await inputs.nth(1).type('2');
            await expect(inputs.nth(2)).toBeFocused();
        });

        test.skip('should go back on backspace', async ({ page }) => {
            const inputs = page.locator('input[inputmode="numeric"]');

            await inputs.nth(0).type('123');
            // Now at 4th input

            await page.keyboard.press('Backspace');
            await expect(inputs.nth(2)).toBeFocused();
        });

        test.skip('should only accept numeric input', async ({ page }) => {
            const input = page.locator('input[inputmode="numeric"]').first();

            await input.type('abc123');

            // Should only have '1' (first digit that was accepted)
            await expect(input).toHaveValue('1');
        });

        test.skip('should handle paste of full PIN', async ({ page }) => {
            const inputs = page.locator('input[inputmode="numeric"]');

            // Focus first input
            await inputs.nth(0).click();

            // Paste full PIN
            await page.evaluate(() => {
                navigator.clipboard.writeText('123456');
            });
            await page.keyboard.press('Control+v');

            // All inputs should be filled
            await expect(inputs.nth(0)).toHaveValue('1');
            await expect(inputs.nth(1)).toHaveValue('2');
            await expect(inputs.nth(2)).toHaveValue('3');
            await expect(inputs.nth(3)).toHaveValue('4');
            await expect(inputs.nth(4)).toHaveValue('5');
            await expect(inputs.nth(5)).toHaveValue('6');
        });
    });
});
