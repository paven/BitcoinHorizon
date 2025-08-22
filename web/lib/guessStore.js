import {store as hybridStore} from "hybrids";

// Create a wrapper around the store object that can be mocked for testing
export const store = {
    get: (model) => hybridStore.get(model),
    set: (model, values) => hybridStore.set(model, values),
    clear: (model) => hybridStore.clear(model)
};

function getOk() {
    return (guess, initialPrice, timestamp) => guess !== "" && initialPrice > 0 && timestamp > 0;
}

/**
 * Defines the model for the user's active guess.
 * This model is a singleton and persists to localStorage, allowing the user's
 * guess to be restored across browser sessions.
 */
export const Guess = {
    guess: "", // 'up' | 'down'
    initialPrice: -1,
    timestamp: -1,
    ok: getOk(),
    isWaiting: false,


    [hybridStore.connect]: {
        get: (id) => JSON.parse(localStorage.getItem('bitcoin-horizon-guess')) ||
            {guess: "", initialPrice: -1, timestamp: -1}, ok: false, isWaiting: false,
        set: (id, values) => {
            localStorage.setItem('bitcoin-horizon-guess', JSON.stringify(values));
            return values;
        },
        cache: false,
    },
};

function remainingTime(timeout = getTimeout()) {
    return timeout - (Date.now() - store.get(Guess).timestamp);
}

function getTimeout() {
    return 60000;
}

function startWaiting(host, timeout = getTimeout()) {
    store.set(Guess, {isWaiting: true});
    console.log("Waiting for result, dispatching timer-expired event");

    setTimeout(() => {
        store.set(Guess, {isWaiting: false});
        // Signal that the 60-second wait is over.
        // The parent application will listen for this and trigger a new price fetch.
        console.log("Dispatching timer-expired event");
        host.dispatchEvent(new CustomEvent('timer-expired', {bubbles: true, composed: true}));
    }, remainingTime(timeout)); // 60 seconds
}

export function checkStoredGuess(host) {
    const storedGuess = store.get(Guess);
    console.log("Checkining stored guees, trying to recover:", storedGuess);
    console.log("Evaluationg getOK", getOk()(storedGuess.guess, storedGuess.initialPrice, storedGuess.timestamp))
    // Check if there's a valid guess stored
    if (getOk()(storedGuess.guess, storedGuess.initialPrice, storedGuess.timestamp)) {
        const remaining = remainingTime();

        // Only start waiting if there's still time left
        if (remaining > 0) {
            console.log("Found stored guess, resuming wait:", storedGuess);

            // Dispatch the guess-made event so other components can update
            host.dispatchEvent(new CustomEvent('guess-made', {
                detail: {
                    guess: storedGuess.guess,
                    initialPrice: storedGuess.initialPrice,
                    timestamp: storedGuess.timestamp
                },
                bubbles: true,
                composed: true
            }));
            startWaiting(host, getTimeout());
        } else {
            store.set(Guess, {
                guess: Guess.guess,
                initialPrice: Guess.initialPrice,
                timestamp: Guess.timestamp,
                isWaiting: false,
            })
            store.clear(Guess, true);
            console.log("Found expired guess, clearing, not resuming wait");

            // Dispatch an event to notify that the guess has expired and been cleared
            // This will allow the UI to be updated to reflect the cleared state
            host.dispatchEvent(new CustomEvent('guess-expired', {
                bubbles: true,
                composed: true
            }));
        }
    }
}
export function makeGuess(host, guess, initialPrice) {
    // Create the full guess detail
    let detail = {
        guess: guess,
        initialPrice: initialPrice,
        timestamp: Date.now(),
    };

    // Store the full guess object first
    store.set(Guess, detail);

    // Dispatch event for other components
    host.dispatchEvent(new CustomEvent('guess-made', {
        detail: detail,
        bubbles: true,
        composed: true
    }));

    // Start waiting for the result
    startWaiting(host);
}