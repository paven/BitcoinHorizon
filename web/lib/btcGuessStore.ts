import {store} from 'hybrids';

export interface Guess {
    id: string;
    direction: 'up' | 'down';
    status: 'new' | 'pending' | 'resolved';
    outcome: 'correct' | 'incorrect' | null;
    initialPrice: number;
    initialTimestamp: number;
    resolutionPrice?: number;
    resolutionTimestamp?: number;
    playerId: string;
}

export interface GuessStoreState {
    guesses: Guess[];
}

export const BtcGuessStore = {
    guesses: [],
    addGuess(guess: Guess) {
        this.guesses = [...this.guesses, guess];
    },
    getGuessesByPlayer(playerId: string): Guess[] {
        return this.guesses.filter(g => g.playerId === playerId);
    },
    getAllGuesses(): Guess[] {
        return [...this.guesses];
    },
    updateGuess(id: string, update: Partial<Guess>) {
        this.guesses = this.guesses.map(g =>
            g.id === id ? {...g, ...update} : g
        );
    },
    getGuessById(id: string): Guess | undefined {
        return this.guesses.find(g => g.id === id);
    }
};

export const guessStore = store(BtcGuessStore);
