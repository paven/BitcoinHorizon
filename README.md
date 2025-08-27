# BitcoinHorizon

BitcoinHorizon is a web application where players predict whether the Bitcoin (BTC) price will go up or down. Players
make one guess at a time, and after 60 seconds, their guess is resolved based on the latest BTC price. Correct guesses
increase the player's score, while incorrect guesses decrease it. Scores and guesses are persisted locally in the
browser.

## Features

- See the latest BTC price in USD.
- Make a prediction ("up" or "down") about the next price movement.
- Only one active guess at a time.
- Guess resolves after 60 seconds using real BTC price data.
- Score is updated based on guess outcome and persisted locally.
- All logic and state handled client-side.

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm

### Installation

```bash
npm install
```

### Running Locally

Start the development server:

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

### Testing

Run all Playwright tests:

```bash
npm run test
```

### Building for Production

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Deployment

The app is a static site and can be deployed to any static hosting provider (e.g., AWS S3, Netlify, Vercel):

1. Build the app:

    ```bash
    npm run build
    ```

2. Upload the contents of the `dist` directory to your static hosting provider.

## Project Structure

- `/web` - Source code
- `/tests` - Automated tests
- `/dist` - Production build output

## Configuration

- `vite.config.js` - Vite build configuration
- `playwright.config.js` - Playwright test configuration
