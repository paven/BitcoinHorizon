// Store for all guesses made by all players

export interface Guess {
    id: string;
    direction: 'up' | 'down';
    status: 'pending' | 'resolved';
    outcome: 'correct' | 'incorrect' | null;
    initialPrice: number;
    initialTimestamp: number;
    resolutionPrice?: number;
    resolutionTimestamp?: number;
    playerId: string;
}

export class GuessStore {
    private guesses: Guess[] = [];

    addGuess(guess: Guess) {
        this.guesses.push(guess);
    }

    getGuessesByPlayer(playerId: string): Guess[] {
        return this.guesses.filter(g => g.playerId === playerId);
    }

    getAllGuesses(): Guess[] {
        return [...this.guesses];
    }

    updateGuess(id: string, update: Partial<Guess>) {
        const idx = this.guesses.findIndex(g => g.id === id);
        if (idx !== -1) {
            this.guesses[idx] = {...this.guesses[idx], ...update};
        }
    }

    getGuessById(id: string): Guess | undefined {
        return this.guesses.find(g => g.id === id);
    }
}

export const guessStore = new GuessStore();

