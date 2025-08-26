// Usage in browser console:
//   await inspectStores.getGuesses()      // Get all guesses (array)
//   await inspectStores.getLastGuess()    // Get the latest guess (object or null)
//   await inspectStores.getPrice()        // Get the current BTC price model
//   await inspectStores.clearGuesses()    // Clear all guesses
//   await inspectStores.clearPrice()      // Clear cached price
//   await inspectStores.resolveGuesses()  // Resolve all guesses (refresh from store)
//   await inspectStores.resolvePrice()    // Resolve price (refresh from store)
//   await inspectStores.getAll()          // Get all guesses and price

import {store} from "hybrids";
import {Guess, lastGuess} from "./btcGuessStore";
import BTCPrice from "./btcPriceStore";

// Expose helpers for debugging in the browser console
window.inspectStores = {
    getGuesses: async () => await store.resolve([Guess]),
    getLastGuess: async () => {
        const all = await store.resolve([Guess]);
        if (!Array.isArray(all) || all.length === 0) return null;
        return all.reduce((acc, g) =>
            g.initialTimestamp > acc.initialTimestamp ? g : acc
        );
    },
    getPrice: async () => await store.resolve(BTCPrice),
    clearGuesses: async () => await store.clear([Guess], true),
    clearPrice: async () => await store.clear(BTCPrice, true),
    resolveGuesses: async () => await store.resolve([Guess]),
    resolvePrice: async () => await store.resolve(BTCPrice),
    getAll: async () => ({
        guesses: await store.resolve([Guess]),
        price: await store.resolve(BTCPrice),
    }),
};

console.info(
    "inspectStores loaded. Try: await inspectStores.getGuesses(), await inspectStores.getLastGuess(), await inspectStores.getPrice(), await inspectStores.getAll() in the console."
);
