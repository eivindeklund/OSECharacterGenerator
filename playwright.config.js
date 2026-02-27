// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
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
        reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
        /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
        use: {
                /* Base URL to use in actions like `await page.goto('/')`. */
                baseURL: 'http://localhost:3000',

                /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
                trace: 'on-first-retry',
        },

        /* Configure projects for major browsers */
        projects: [
                {
                        name: 'chromium',
                        use: { ...devices['Desktop Chrome'] },
                        testIgnore: /visual\.spec/,
                },

                {
                        name: 'firefox',
                        use: { ...devices['Desktop Firefox'] },
                        testIgnore: /visual\.spec/,
                },

                {
                        name: 'webkit',
                        use: { ...devices['Desktop Safari'] },
                        testIgnore: /visual\.spec/,
                },

                {
                        // Visual regression tests run on a single browser with a fixed
                        // viewport so screenshots are stable across machines.
                        name: 'visual',
                        use: {
                                ...devices['Desktop Chrome'],
                                viewport: { width: 1280, height: 800 },
                        },
                        testMatch: /visual\.spec/,
                },
        ],

        /* Run your local dev server before starting the tests */
        webServer: {
                command: 'npm run dev',
                url: 'http://localhost:3000',
                reuseExistingServer: !process.env.CI,
        },
});
