console.log("Playwright config loaded");
import {defineConfig} from '@playwright/test';

export default defineConfig({
    webServer: {
        command: 'npx vite --port 5173',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
        stderr: 'pipe',
    },
    projects: [
        {
            name: 'ui',
            testMatch: /tests\/ui\/.*\.spec\.js/,
            use: {
                baseURL: 'http://localhost:5173',
                // ...other use options...
            },
        },
        {
            name: 'js',
            testMatch: /tests\/js\/.*\.spec\.js/,
            // No webServer for JS/unit tests
        }
    ],
    // ...existing config...
});
