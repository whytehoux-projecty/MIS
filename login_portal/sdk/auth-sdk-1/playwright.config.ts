import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Central Auth SDK E2E Tests
 * 
 * IMPORTANT: E2E tests require a running demo application that uses the SDK.
 * Run the demo app first:
 *   cd examples/demo-app && npm run dev
 * 
 * Then run E2E tests:
 *   npm run test:e2e
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './e2e',
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['list'],
    ],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
        /* Screenshot on failure */
        screenshot: 'only-on-failure',
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
        /* Test against mobile viewports. */
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] },
        },
    ],

    /* 
     * No automatic web server - the SDK is a library, not an app.
     * E2E tests should be run against a demo app that uses the SDK.
     * 
     * To auto-start a dev server, uncomment below and specify your demo app:
     * webServer: {
     *     command: 'npm run dev',
     *     url: 'http://localhost:3000',
     *     reuseExistingServer: !process.env.CI,
     *     timeout: 120000,
     * },
     */
});
