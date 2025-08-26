import {Model, store} from 'hybrids';
import {GuessEvaluator} from "../components/guess-evaluator";
import BTCPrice, {refreshPrice} from "./btcPriceStore";

// A single in-memory store for tests, to ensure it persists across calls. Exported for cleanup in tests.
export const testInMemoryStore = {};

// A simple localStorage connector for hybrids.js store, based on the provided example.
function localStorageStore(key: string) {
    // Check if localStorage is available to avoid errors in non-browser environments.
    if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('localStorage is not available. Guesses will not be persisted.');
        // Provide a simple in-memory store for non-browser environments like tests.
        return {
            get: (id: string) => testInMemoryStore[id] || null,
            set: (id: string | undefined, values: Guess | null) => {
                if (values === null) {
                    if (id) delete testInMemoryStore[id];
                } else {
                    const modelId = id || values.id;
                    testInMemoryStore[modelId] = values;
                }
                return values;
            },
            list: () => Object.values(testInMemoryStore),
        };
    }

    const models = JSON.parse(localStorage.getItem(key) || "{}");

    const save = () => {
        localStorage.setItem(key, JSON.stringify(models));
    };

    return {
        get: (id: string) => models[id] || null,
        set: (id: string | undefined, values: Guess | null) => {
            if (values === null) {
                // Handle deletion
                if (id) delete models[id];
            } else {
                // Handle creation or update
                const modelId = id || values.id;
                models[modelId] = values;
            }
            save();
            return values;
        },
        list: () => Object.values(models),
    };
}

// A lock to prevent race conditions when setting up countdowns.
const setupLocks = new WeakMap<object, boolean>();


// In-memory enumerable model for guesses.
// See: https://hybrids.js.org/store/model
export interface Guess {
    id: string;
    direction: 'up' | 'down' | '';
    status: 'new' | 'pending' | 'resolved';
    outcome: 'correct' | 'incorrect' | 'pending';
    initialPrice: number;
    initialTimestamp: number;
    resolutionPrice: number;
    resolutionTimestamp: number;
    secondsLeft: number;
    playerId: string;
}

const WAIT_TIME = 10000; //TODO: update to 60s

// Exported for testing purposes
export function getOutcome(guess: Guess): 'correct' | 'incorrect' | 'pending' {
    if (guess.status !== 'resolved' || guess.initialPrice === -1 || guess.resolutionPrice === -1 || guess.direction === '') return 'pending'
    if (guess.direction === "up" &&
        guess.resolutionPrice > guess.initialPrice)
        return 'correct';
    else if (guess.direction === "down" &&
        guess.resolutionPrice < guess.initialPrice)
        return 'correct'
    else return 'incorrect'
}

// This model is in-memory only. To persist or fetch from an API, add [store.connect].
export const Guess: Model<Guess> = {
    id: true, // enumerable model
    direction: '', // default to 'up'
    status: 'new', // default to 'new'
    initialPrice: -1,
    initialTimestamp: -1,
    secondsLeft: Math.round(WAIT_TIME / 1000),
    resolutionPrice: -1,
    resolutionTimestamp: -1,
    outcome: (guess) => getOutcome(guess), // default to 'pending'
    playerId: '',
    [store.connect]: {
        ...localStorageStore('btc-guesses'),
        loose: true,
    },
}

// Utility: Returns true if there are any active guesses (status 'new' or 'pending')
// should be enough to look at latest, if we want to optimize
export function hasActiveGuesses(): boolean {
    // Optimization: Only the last guess can be active.
    const last = lastGuess();
    return !!last && (last.status === 'new' || last.status === 'pending');
}

// Utility: Create a guess with timestamp as id
export function createGuess(params: {
    direction: 'up' | 'down',
    playerId: string,
    initialPrice: number
}): Partial<Guess> {
    const ts = Date.now();
    return {
        direction: params.direction,
        status: 'new',
        outcome: 'pending',
        initialPrice: params.initialPrice,
        initialTimestamp: ts,
        playerId: params.playerId,
    };
}

// Utility: Returns the guess with the latest initialTimestamp, or null if none exist
export function lastGuess(): Guess | null {
    const allGuesses = store.get([Guess]);
    if (!Array.isArray(allGuesses) || allGuesses.length === 0) return null;
    return store.get(Guess, (allGuesses.reduce((acc: Guess, g: Guess) =>
        g.initialTimestamp > acc.initialTimestamp ? g : acc).id)
    );
}


function getSecondsLeft_(initialTimestamp: number) {
    if (!initialTimestamp) return 0;
    const left = Math.max(0,
        (WAIT_TIME / 1000) -
        Math.floor((Date.now() - initialTimestamp) / 1000));
    return isNaN(left) ? 0 : left;
}

export function getSecondsLeft(guess: Guess) {
    return getSecondsLeft_(guess.initialTimestamp);
}

export function clearCountdown(host: GuessEvaluator | Guess) {
    if (host.intervalId !== false) {
        window.clearInterval(host.intervalId);
        host.intervalId = false;
    }
}

export async function setupCountdown(host: GuessEvaluator) {
    // Use a lock to prevent race conditions from multiple rapid calls.
    if (setupLocks.get(host)) {
        console.log("Countdown setup already in progress. Exiting.");
        return;
    }
    setupLocks.set(host, true);

    try {
        // Clear any previously running interval for this host.
        clearCountdown(host);

        if (!hasActiveGuesses()) return;

        const last = lastGuess();
        if (!host.guess || !host.guess.id || !last || host.guess.id !== last.id) return;

        if (host.guess.status === 'new') {
            let guess = await store.set(host.guess, {status: 'pending'});
            const initialSecondsLeft = getSecondsLeft(guess);
            host.secondsLeft = initialSecondsLeft;
            guess = await store.set(guess, {secondsLeft: initialSecondsLeft});

            let lastPollTimestamp = 0; // Will cause immediate poll on first check

            const tick = async () => {
                const currentGuess = store.get(Guess, guess.id);

                if (!currentGuess || currentGuess.status !== 'pending') {
                    console.log("Guess is no longer pending. Stopping interval.");
                    clearCountdown(host);
                    return;
                }

                const newSecondsLeft = getSecondsLeft(currentGuess);
                host.secondsLeft = newSecondsLeft;
                await store.set(currentGuess, {secondsLeft: newSecondsLeft});
                console.log("tick:", newSecondsLeft);

                if (newSecondsLeft <= 0) {
                    const now = Date.now();
                    if (now - lastPollTimestamp >= 5000) {
                        lastPollTimestamp = now;

                        console.log('Polling for price change...');
                        const btcPrice = await refreshPrice();
                        const resolutionPrice = btcPrice?.price;

                        if (resolutionPrice !== undefined && resolutionPrice !== currentGuess.initialPrice) {
                            console.log(`Price changed from ${currentGuess.initialPrice} to ${resolutionPrice}. Resolving.`);
                            await store.set(currentGuess, {
                                status: 'resolved',
                                resolutionPrice: resolutionPrice,
                                resolutionTimestamp: Date.now(),
                            });
                            clearCountdown(host);
                        } else {
                            console.log(`Price is ${resolutionPrice}, same as initial ${currentGuess.initialPrice}. Continuing to poll.`);
                        }
                    }
                }
            };

            host.intervalId = window.setInterval(tick, 1000);
        }
    } finally {
        setupLocks.set(host, false);
    }
}

export {store};