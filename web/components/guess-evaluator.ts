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
            // To prevent restarting the countdown on every model update,
            // we only call setupCountdown if there isn't an interval already running.
            if (host.intervalId) return;

            // Kick off the countdown process for a new guess, or resume it for a pending one on page load.
            if (guess && (guess.status === 'new' || guess.status === 'pending')) {
                setupCountdown(host);
            }
        }
    },
    secondsLeft: 60,
    intervalId: false,
    render: ({guess, guesses, secondsLeft}) => {
        if (!guess) return html`
            <div>No guess, ${guesses.length} guesses made</div>`;
        if ((guess.status === 'new' || guess.status === 'pending')) {
            if (secondsLeft > 0)
                return html`
                    <div>
                        <span>Comparing in: ${secondsLeft}s</span>
                    </div>
                `;
            else
                return html`
                    <div>
                        <span>Looking for price change</span>
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
