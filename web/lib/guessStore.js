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