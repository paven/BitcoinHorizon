import {test, expect} from '@playwright/test';
import {Guess, hasActiveGuesses} from '../../web/lib/btcGuessStore';
import {store} from 'hybrids';

test.describe('btcGuessStore evaluate', () => {
    test.beforeEach(async () => {
        await store.clear([Guess], true);
        var guesses = await store.resolve([Guess])
        guesses.forEach(guess => store.clear(guess), true);
    });

    test('can add a new guess', async () => {
        const guess = await store.set(Guess, {
            direction: 'up',
            status: 'new',
            outcome: 'pending',
            initialPrice: 10000,
            initialTimestamp: 1000000,
            playerId: 'player1',
        });
        await store.resolve([Guess]);
        expect(guess).toBeDefined();
        expect(guess.status).toBe('new');
        expect(guess.direction).toBe('up');
    });

    test('can update a guess status', async () => {
        const guess = await store.set(Guess, {
            direction: 'down',
            status: 'new',
            outcome: 'pending',
            initialPrice: 9000,
            initialTimestamp: 1000001,
            playerId: 'player2',
        });
        await store.resolve([Guess]);
        // Update and capture the updated instance
        const updatedGuess = await store.set(guess, {status: 'pending'});
        const resolved = await store.resolve(updatedGuess);
        expect(resolved?.status).toBe('pending');
    });

    test('hasActiveGuesses returns true if there are new or pending guesses', async () => {
        await store.set(Guess, {
            direction: 'up',
            status: 'new',
            outcome: 'pending',
            initialPrice: 11000,
            initialTimestamp: 1000002,
            playerId: 'player3',
        });
        await store.resolve([Guess]);
        expect(hasActiveGuesses()).toBe(true);
    });

    test('hasActiveGuesses returns false if all guesses are resolved', async () => {
        await store.set(Guess, {
            direction: 'down',
            status: 'resolved',
            outcome: 'correct',
            initialPrice: 12000,
            initialTimestamp: 1000003,
            playerId: 'player4',
        });
        await store.resolve([Guess]);
        expect(hasActiveGuesses()).toBe(false);
    });

    test('can retrieve all guesses', async () => {
        await store.set(Guess, {
            direction: 'up',
            status: 'new',
            outcome: 'pending',
            initialPrice: 13000,
            initialTimestamp: 1000004,
            playerId: 'player5',
        });
        await store.set(Guess, {
            direction: 'down',
            status: 'resolved',
            outcome: 'incorrect',
            initialPrice: 14000,
            initialTimestamp: 1000005,
            playerId: 'player6',
        });

        const all = await store.resolve([Guess]);
        // Log expanded fields for each guess
        console.log('Guess', store.ready(all), all.map(g => ({...g})));
        expect(Array.isArray(all)).toBe(true);
        expect(all.length).toBe(2);
    });
});
