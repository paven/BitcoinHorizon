import {define, html, store} from 'hybrids';
import {Guess} from '../lib/btcGuessStore';

function calculateScore(guesses: Guess[]): number {
    if (!Array.isArray(guesses)) {
        return 0;
    }
    return guesses.filter(guess => guess.outcome === 'correct').length;
}

export const ScoreComponent = {
    guesses: store([Guess]),
    score: ({guesses}) => calculateScore(guesses),
    render: ({score}) => html`
        <style>
            :host {
                display: block;
                border: 1px solid #ccc;
                padding: 16px;
                border-radius: 8px;
                margin-top: 20px;
                text-align: center;
            }
        </style>
        <h2>Score</h2>
        <p>Correct Guesses: ${score}</p>
    `,
};

export default define({
    tag: 'score-component',
    ...ScoreComponent,
});