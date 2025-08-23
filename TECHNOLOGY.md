# TypeScript Technology Stack

* TypeScript 5.4
* Vite (for development server, building, and TypeScript compilation)
* hybrids.js with TypeScript definitions
* GitHub Pages (for static site hosting; Jekyll features will not be used)
* Source code is in the `/web` subfolder. The static site is built to the `/dist` folder for hosting.
* Playwright with TypeScript support (for automated UI testing)
* Amazon DynamoDB (for backend state persistence)

Additional TypeScript-specific tooling:

* ESLint with TypeScript parser and rules
* Prettier for consistent code formatting
* tsconfig.json for TypeScript compilation settings