import {define, html, store} from 'hybrids';
import {Guess} from '../lib/btcGuessStore';

interface Score {
    correct: number;
    incorrect: number;
    total: number;
}

function calculateScore(guesses: Guess[]): Score {
    if (!Array.isArray(guesses)) {
        return {correct: 0, incorrect: 0, total: 0};
    }
    const resolvedGuesses = guesses.filter(g => g.status === 'resolved');
    const correct = resolvedGuesses.filter(g => g.outcome === 'correct').length;
    const incorrect = resolvedGuesses.filter(g => g.outcome === 'incorrect').length;

    return {
        correct,
        incorrect,
        total: resolvedGuesses.length
    };
}

export const ScoreComponent = {
    guesses: store([Guess]),
    score: ({guesses}) => calculateScore(guesses) as Score,
    render: ({score}: { score: Score }) => html`
        <style>
            :host {
                display: block;
                border: 1px solid #ccc;
                padding: 16px;
                border-radius: 8px;
                margin-top: 20px;
                text-align: center;
            }

            .score-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
                margin-top: 1rem;
            }

            .score-item {
                background-color: #f9f9f9;
                border: 1px solid #eee;
                border-radius: 4px;
                padding: 1rem;
            }

            .score-item h3 {
                margin: 0 0 0.5rem;
                font-size: 0.9rem;
                font-weight: 500;
                color: #666;
            }

            .score-item p {
                margin: 0;
                font-size: 1.8rem;
                font-weight: bold;
            }
        </style>
        <h2>Score</h2>
        <div class="score-grid">
            <div class="score-item">
                <h3>Correct</h3>
                <p>${score.correct}</p>
            </div>
            <div class="score-item">
                <h3>Incorrect</h3>
                <p>${score.incorrect}</p>
            </div>
            <div class="score-item">
                <h3>Total</h3>
                <p>${score.total}</p>
            </div>
        </div>
    `,
};

export default define({
    tag: 'score-component',
    ...ScoreComponent,
});