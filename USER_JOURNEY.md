# User Guess Journey

This document models the user's journey for making a price guess, from the initial state to the resolution of the guess.
It describes what the user sees and does, and how the application data changes throughout the process.

---

## Data Models

To support this journey, we can envision two primary data models:

```typescript
// Represents the player's state
interface Player {
    id: string; // Unique player identifier (e.g., UUID)
    score: number;
    activeGuess: Guess | null; // Holds the currently pending guess
}

// Represents a single guess made by the player
interface Guess {
    id: string;
    direction: 'up' | 'down';
    status: 'pending' | 'resolved';
    outcome: 'correct' | 'incorrect' | null;

    initialPrice: number; // BTC price when the guess was made
    initialTimestamp: number; // Timestamp of the guess

    resolutionPrice?: number; // BTC price when the guess was resolved
    resolutionTimestamp?: number; // Timestamp of the resolution
}
```

---

## The Journey

### 1. Ready to Guess

This is the default state when the user arrives or after a previous guess has been resolved.

* **User View:**
    * Sees their current `score`.
    * Sees the latest `BTC price`, which updates periodically.
    * Sees two enabled buttons: "Up" and "Down".

* **Data State:**
    * The application has the player's `score`.
    * There is no active `Guess` object for the player (`Player.activeGuess` is `null`).

### 2. Making a Guess

The user decides whether the price will go up or down.

* **User Action:**
    * The user clicks either the "Up" or "Down" button.

* **Data State:**
    * A new `Guess` object is created.
    * `Guess.direction` is set to the user's choice ('up' or 'down').
    * `Guess.status` is set to `'pending'`.
    * `Guess.initialPrice` is captured from the current BTC price.
    * `Guess.initialTimestamp` is set to the current time.
    * The `Player.activeGuess` field is updated to reference this new `Guess` object.

### 3. Guess is Pending

The user must wait for the guess to be resolved.

* **User View:**
    * The "Up" and "Down" buttons are disabled.
    * A message is displayed, like: "Your guess for the price to go **up** is pending...".
    * The user continues to see their score and the live BTC price.

* **Data State:**
    * The system continuously checks for the resolution conditions for the pending `Guess`:
        1. `currentTime - Guess.initialTimestamp >= 60 seconds`
        2. `currentPrice !== Guess.initialPrice`

### 4. Guess Resolution

The waiting period is over, and the outcome is determined.

* **User View:**
    * A notification appears with the result, e.g., "You were right! The price went up. +1 point".
    * The player's `score` animates or updates to the new value.
    * The "Up" and "Down" buttons become enabled again.
    * The user is now back at stage 1, "Ready to Guess".

* **Data State:**
    * The `Guess.status` is updated to `'resolved'`.
    * The `Guess.outcome` is determined by comparing the `currentPrice` to `Guess.initialPrice`.
    * The `Player.score` is incremented or decremented by 1.
    * The `Player.activeGuess` is set back to `null`.
    * The player's new score is persisted to the backend.