import {Model, store} from 'hybrids';
import {GuessEvaluator} from "../components/guess-evaluator";


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
    intervalId: number | false;
}

const WAIT_TIME = 10000; //TODO: update to 60s

function getOutcome(guess: Guess): 'correct' | 'incorrect' | 'pending' {
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
    intervalId: false,
}

// Utility: Returns true if there are any active guesses (status 'new' or 'pending')
// should be enough to look at latest, if we want to optimize
export function hasActiveGuesses(): boolean {
    const allGuesses = store.get([Guess]);
    return Array.isArray(allGuesses) && allGuesses.some(
        g => g.status === 'new' || g.status === 'pending'
    );
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
    clearCountdown(host);
    if (!hasActiveGuesses()) return;

    const last = lastGuess();
    if (!host.guess || !host.guess.id || !last || host.guess.id !== last.id || host.intervalId) return;

    var guess = host.guess;
    if (guess && (guess.status === 'new')) {
        guess = await store.set(guess, {status: 'pending'});
        const initialSecondsLeft = getSecondsLeft(guess);
        host.secondsLeft = initialSecondsLeft;
        guess = await store.set(guess, {secondsLeft: initialSecondsLeft});
        const intervalId = window.setInterval(async () => {
            let currentGuess = store.get(Guess, guess.id);
            if (!currentGuess || currentGuess.status !== 'pending') {
                clearCountdown(host);
                return;
            }
            const newSecondsLeft = getSecondsLeft(currentGuess);
            host.secondsLeft = newSecondsLeft;
            currentGuess = await store.set(currentGuess, {secondsLeft: newSecondsLeft});
            console.log("tick:", currentGuess.secondsLeft, host.secondsLeft, host.intervalId);
            if (newSecondsLeft === 0) {
                clearCountdown(host);
                await store.set(currentGuess, {status: 'resolved', intervalId: false});
                console.log('Resolved', hasActiveGuesses(), host.intervalId);
            }
        }, 1000);
        host.intervalId = intervalId;
        await store.set(guess, {intervalId: intervalId});
    }
}

export {store};