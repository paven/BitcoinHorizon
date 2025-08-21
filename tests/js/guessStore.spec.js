import {test, expect} from '@playwright/test';
import {checkStoredGuess, Guess, store} from '../../web/lib/guessStore.js';

// Save original store methods to restore after tests
const originalStoreGet = store.get;
const originalStoreSet = store.set;
const originalStoreClear = store.clear;
const originalDateNow = Date.now;

test.afterAll(() => {
    // Restore original methods after all tests
    store.get = originalStoreGet;
    store.set = originalStoreSet;
    store.clear = originalStoreClear;
    Date.now = originalDateNow;
});

test('checkStoredGuess does nothing when no valid guess is stored', async () => {
    // Track if methods were called
    let setWasCalled = false;
    let clearWasCalled = false;
    let dispatchEventWasCalled = false;

    // Mock store methods
    store.get = () => ({
        guess: "",
        initialPrice: -1,
        timestamp: -1,
        ok: (guess, initialPrice, timestamp) =>
            guess !== "" && initialPrice > 0 && timestamp > 0
    });

    store.set = () => {
        setWasCalled = true;
        return {}; // Return empty object to avoid errors
    };

    store.clear = () => {
        clearWasCalled = true;
    };

    // Mock host element
    const mockHost = {
        dispatchEvent: () => {
            dispatchEventWasCalled = true;
        }
    };

    // Call the function
    checkStoredGuess(mockHost);

    // Verify no methods were called
    expect(setWasCalled).toBe(false);
    expect(clearWasCalled).toBe(false);
    expect(dispatchEventWasCalled).toBe(false);
});

test('checkStoredGuess starts waiting when a valid guess with remaining time is stored', async () => {
    // Track if methods were called with correct arguments
    let setCalledWithIsWaitingTrue = false;

    // Mock current time
    const currentTime = 1000000;
    Date.now = () => currentTime;

    // Mock store methods
    store.get = () => ({
        guess: "up",
        initialPrice: 50000,
        timestamp: currentTime - 30000, // 30 seconds ago
        ok: (guess, initialPrice, timestamp) =>
            guess !== "" && initialPrice > 0 && timestamp > 0
    });

    store.set = (model, values) => {
        if (model === Guess && values.isWaiting === true) {
            setCalledWithIsWaitingTrue = true;
        }
        return values; // Return values to avoid errors
    };

    // Mock host element
    const mockHost = {
        dispatchEvent: () => {
        }
    };

    // Call the function
    checkStoredGuess(mockHost);

    // Verify isWaiting was set to true
    expect(setCalledWithIsWaitingTrue).toBe(true);
});

test('checkStoredGuess clears store when a valid guess with expired time is stored', async () => {
    // Track if methods were called
    let setWasCalled = false;
    let clearCalledWithGuess = false;

    // Mock current time
    const currentTime = 1000000;
    Date.now = () => currentTime;

    // Mock store methods
    store.get = () => ({
        guess: "up",
        initialPrice: 50000,
        timestamp: currentTime - 70000, // 70 seconds ago (expired)
        ok: (guess, initialPrice, timestamp) =>
            guess !== "" && initialPrice > 0 && timestamp > 0
    });

    store.set = () => {
        setWasCalled = true;
        return {}; // Return empty object to avoid errors
    };

    store.clear = (model) => {
        if (model === Guess) {
            clearCalledWithGuess = true;
        }
    };

    // Mock host element
    const mockHost = {
        dispatchEvent: () => {
        }
    };

    // Call the function
    checkStoredGuess(mockHost);

    // Verify store was cleared and waiting was not started
    expect(clearCalledWithGuess).toBe(true);
    expect(setWasCalled).toBe(true);
});

test('checkStoredGuess clears store when a specific outdated guess is recovered', async () => {
    // Track if methods were called
    let setWasCalled = false;
    let clearCalledWithGuess = false;

    // Mock current time - set to a future time to ensure the timestamp is expired
    // The timestamp in the test data is 1755764242674, so we need a time that's more than 60 seconds later
    const currentTime = 1755764242674 + 120000; // 120 seconds after the timestamp
    Date.now = () => currentTime;

    // Mock store methods with the specific values from the issue description
    store.get = () => ({
        guess: "down",
        initialPrice: 113902,
        timestamp: 1755764242674,
        isWaiting: false,
        ok: (guess, initialPrice, timestamp) =>
            guess !== "" && initialPrice > 0 && timestamp > 0
    });

    store.set = () => {
        setWasCalled = true;
        return {}; // Return empty object to avoid errors
    };

    store.clear = (model) => {
        if (model === Guess) {
            clearCalledWithGuess = true;
        }
    };

    // Mock host element
    const mockHost = {
        dispatchEvent: () => {
        }
    };

    // Call the function
    checkStoredGuess(mockHost);

    // Verify store was cleared and waiting was not started
    expect(clearCalledWithGuess).toBe(true);
    expect(setWasCalled).toBe(true);
});
