import {store} from "https://unpkg.com/hybrids@^9";

/**
 * Defines the global application state model.
 * This model is a singleton, meaning there's only one instance of it.
 * It's configured to persist its state to localStorage.
 */
export const Game = {
    score: 0,
    [store.connect]: {
        // The localStorage API is synchronous. Our get/set methods should be too.
        get: () => {
            try {
                const storedGame = localStorage.getItem('bitcoin-horizon-game');
                // If data exists, parse and return it. Otherwise, explicitly return
                // the default structure to avoid relying on the store's internal fallback.
                return storedGame ? JSON.parse(storedGame) : {score: 0};
            } catch (e) {
                console.error("Error reading game state from localStorage", e);
                // On error, also return the default structure to ensure the app can proceed.
                return {score: 0};
            }
        },
        // set() must return the values that were set.
        set: (id, values) => { // id is undefined for a singleton model.
            localStorage.setItem('bitcoin-horizon-game', JSON.stringify(values));
            return values;
        },
    },
};

/**
 * Defines an in-memory model for the current price.
 * This is used as a global cache to avoid race conditions and simplify component communication.
 */
export const LatestPrice = {
    price: undefined,
    error: undefined,
};