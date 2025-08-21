import {store} from "hybrids";

/**
 * Defines the model for the user's active guess.
 * This model is a singleton and persists to localStorage, allowing the user's
 * guess to be restored across browser sessions.
 */
export const Guess = {
    guess: "", // 'up' | 'down'
    initialPrice: -1,
    timestamp: -1,
    ok: (guess, initialPrice, timestamp) => guess !== "" && initialPrice > 0 && timestamp > 0,

    [store.connect]: {
        // Reads from localStorage to restore the session. Returns null if nothing is stored.
        get: (id) => JSON.parse(localStorage.getItem('bitcoin-horizon-guess')) ||
            {guess: "", initialPrice: -1, timestamp: -1},
        // Writes the current state to localStorage.
        set: (id, values) => {
            localStorage.setItem('bitcoin-horizon-guess', JSON.stringify(values));
            return values;
        },
    },
};

function remainingTime(timeout = getTimeout()) {
    return timeout - (Date.now() - Store.get(Guess).timestamp);
}


function getTimeout() {
    return 60000;
}

function startWaiting(host, timeout = getTimeout()) {
    host.isWaiting = true;
    setTimeout(() => {
        host.isWaiting = false;
        // Signal that the 60-second wait is over.
        // The parent application will listen for this and trigger a new price fetch.
        console.log("Dispatching timer-expired event");
        host.dispatchEvent(new CustomEvent('timer-expired', {bubbles: true, composed: true}));
    }, remainingTime(timeout)); // 60 seconds
}

export function makeGuess(host, guess, initialPrice) {
    // Create the full guess detail
    let detail = {
        guess: guess,
        initialPrice: initialPrice,
        timestamp: Date.now()
    };

    // Store the full guess object first
    store.set(Guess, detail);

    // Update component property (this triggers a render)
    //host.guess = guess;

    // Dispatch event for other components
    host.dispatchEvent(new CustomEvent('guess-made', {
        detail: detail,
        bubbles: true,
        composed: true
    }));

    // Start waiting for the result
    startWaiting(host);
}