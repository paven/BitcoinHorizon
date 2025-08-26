import {define, html, store} from 'hybrids';
import {Guess, lastGuess, setupCountdown} from '../lib/btcGuessStore';
import BTCPrice from "../lib/btcPriceStore";


export interface GuessEvaluator {
    guesses: Guess[];
    guess: Guess;
    price: BTCPrice;
    secondsLeft: number;
    intervalId: number | false;
}

export default define<GuessEvaluator>({
    tag: 'guess-evaluator',
    // Connect to the singleton BTCPrice model
    price: store(BTCPrice),
    guesses: store([Guess]),
    guess: {
        value: () => lastGuess() || false,
        observe: (host, guess) => {
            console.log('guess updated in evaluator:', guess);
            // The only responsibility here should be to kick off the process for a new guess.
            // All other logic for resolution is now handled cleanly in `setupCountdown`.
            if (guess && guess.status === 'new') {
                setupCountdown(host);
            }
        }
    },
    secondsLeft: 60,
    intervalId: false,
    render: ({guess, guesses, secondsLeft}) => {
        if (!guess) return html`
            <div>No guess, ${guesses.length} guesses made</div>`;
        if (guess.status === 'new' || guess.status === 'pending') {
            return html`
                <div>
                    <span>Guess pending. Resolves in: ${secondsLeft}s</span>
                </div>
            `;
        }
        if (guess.status === 'resolved') {
            return html`
                <div>
                    <span>Guess resolved: 
                        ${guess.outcome === 'correct' ? '✅ Correct' :
                                guess.outcome === 'incorrect' ? '❌ Incorrect' :
                                        '...'
                        }</span>
                </div>
            `;
        }
        return html`
            <div>Unknown guess status</div>`;
    },
});
