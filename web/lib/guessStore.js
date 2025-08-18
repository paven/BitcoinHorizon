import {store} from "hybrids";

/**
 * Defines the model for the user's active guess.
 * This model is a singleton and persists to localStorage, allowing the user's
 * guess to be restored across browser sessions.
 */
export const Guess = {
    guess: null, // 'up' | 'down'
    initialPrice: null,
    timestamp: null,
    // A computed property to easily check if a guess is active.
    active: ({guess}) => guess !== null,
    [store.connect]: {
        // Reads from localStorage to restore the session. Returns null if nothing is stored.
        get: () => {
            try {
                const stored = localStorage.getItem('bitcoin-horizon-guess');
                if (!stored) return null;
                return JSON.parse(stored);
            } catch (e) {
                console.error('Error reading from localStorage:', e);
                return null;
            }
        },
        // Writes the current state to localStorage.
        set: (id, values) => {
            try {
                // If values are null, the guess is cleared from storage.
                if (values === null) {
                    localStorage.removeItem('bitcoin-horizon-guess');
                    console.log('Cleared bitcoin-horizon-guess from localStorage');
                } else {
                    localStorage.setItem('bitcoin-horizon-guess', JSON.stringify(values));
                    console.log('Set bitcoin-horizon-guess in localStorage:', values);
                }
            } catch (e) {
                console.error('Error writing to localStorage:', e);
            }
        },
    },
};