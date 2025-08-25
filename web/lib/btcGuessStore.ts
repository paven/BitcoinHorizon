import {Model, store} from 'hybrids';

// In-memory enumerable model for guesses.
// See: https://hybrids.js.org/store/model
export interface Guess {
    id: string;
    direction: 'up' | 'down';
    status: 'new' | 'pending' | 'resolved';
    outcome: 'correct' | 'incorrect' | 'pending'; // changed from null to 'pending'
    initialPrice: number;
    initialTimestamp: number;
    resolutionPrice?: number;
    resolutionTimestamp?: number;
    playerId: string;
}

// This model is in-memory only. To persist or fetch from an API, add [store.connect].
export const Guess: Model<Guess> = {
    id: true, // enumerable model
    direction: 'up',
    status: 'new',
    outcome: 'pending', // changed from function/null to string default
    initialPrice: 0,
    initialTimestamp: 0,
    playerId: '',
    // resolutionPrice and resolutionTimestamp are optional and not included in the model definition,
    // so they will be undefined unless set by store.set().
    // To persist or fetch, add [store.connect]: { ... }
}

// Utility: Returns true if there are any active guesses (status 'new' or 'pending')
// should be enough to look at latest, if we want to optimize
export function hasActiveGuesses(): boolean {
    const allGuesses = store.get([Guess]);
    return Array.isArray(allGuesses) && allGuesses.some(
        g => g.status === 'new' || g.status === 'pending'
    );
}
