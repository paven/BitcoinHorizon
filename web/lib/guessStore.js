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

    // A computed property to easily check if a guess is active.
    active: ({guess}) => guess !== "",
    [store.connect]: {
        // Reads from localStorage to restore the session. Returns null if nothing is stored.
        get: (id) => JSON.parse(localStorage.getItem('bitcoin-horizon-guess')) ||
            {guess: "", initialPrice: -1, timestamp: -1},
        // Writes the current state to localStorage.
        set: (id, values) => {
            localStorage.setItem('bitcoin-horizon-guess', JSON.stringify(values));
            console.log('Set bitcoin-horizon-guess in localStorage:', values);
            console.log("expect a key", Object.keys(localStorage))

            return values;
        },
    },
};