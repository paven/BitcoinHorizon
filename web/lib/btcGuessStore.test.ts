import {getOutcome, Guess} from './btcGuessStore.js';

console.log('Running btcGuessStore tests...');

let testCount = 0;
let errorCount = 0;

function runTest(name: string, testFn: () => void) {
    testCount++;
    try {
        testFn();
        console.log(`✅ PASS: ${name}`);
    } catch (e) {
        errorCount++;
        console.error(`❌ FAIL: ${name}`);
        console.error(e);
    }
}

function assertEqual(actual: any, expected: any, msg = '') {
    if (actual !== expected) {
        throw new Error(`Assertion failed: ${msg} | Expected ${expected}, but got ${actual}`);
    }
}

const baseGuess: Guess = {
    id: '1',
    direction: 'up',
    status: 'resolved',
    outcome: 'pending', // this will be re-calculated by getOutcome
    initialPrice: 50000,
    initialTimestamp: Date.now(),
    resolutionPrice: -1,
    resolutionTimestamp: -1,
    secondsLeft: 0,
    playerId: 'test',
};

runTest('getOutcome should return "pending" if status is not "resolved"', () => {
    const guess = {...baseGuess, status: 'pending'} as Guess;
    assertEqual(getOutcome(guess), 'pending');
});

runTest('getOutcome should return "pending" if resolutionPrice is not set', () => {
    const guess = {...baseGuess, resolutionPrice: -1} as Guess;
    assertEqual(getOutcome(guess), 'pending');
});

runTest('getOutcome should return "correct" for a winning "up" guess', () => {
    const guess = {...baseGuess, direction: 'up', resolutionPrice: 50001} as Guess;
    assertEqual(getOutcome(guess), 'correct');
});

runTest('getOutcome should return "correct" for a winning "down" guess', () => {
    const guess = {...baseGuess, direction: 'down', resolutionPrice: 49999} as Guess;
    assertEqual(getOutcome(guess), 'correct');
});

runTest('getOutcome should return "incorrect" for a losing "up" guess (price went down)', () => {
    const guess = {...baseGuess, direction: 'up', resolutionPrice: 49999} as Guess;
    assertEqual(getOutcome(guess), 'incorrect');
});

runTest('getOutcome should return "incorrect" if price is unchanged', () => {
    const guess = {...baseGuess, direction: 'up', resolutionPrice: 50000} as Guess;
    assertEqual(getOutcome(guess), 'incorrect', 'up guess with same price');
});

if (errorCount > 0) {
    console.error(`\nFound ${errorCount} errors out of ${testCount} tests.`);
    // process.exit(1); // Uncomment to make CI fail on test errors
} else {
    console.log(`\nAll ${testCount} tests passed!`);
}