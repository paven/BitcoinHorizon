import {define, html, store} from 'hybrids';
import {Guess, lastGuess, setupCountdown} from '../lib/btcGuessStore';
import BTCPrice from "../lib/btcPriceStore";


export interface GuessEvaluator {
    guesses: Guess[];
    guess: Guess;
    secondsLeft: number;
    intervalId: number | false;
}

export default define<GuessEvaluator>({
    tag: 'guess-evaluator',
    guesses: store([Guess]),
    guess: {
        value: () => lastGuess() || false,
        observe: (host, guess) => {
            console.log('guess updated', guess)
            if (guess.status === 'new') setupCountdown(host);
            else if (guess.status === 'pending' && guess.secondsLeft <= 0)
                store.set(guess, {status: 'resolved'})
            else if (guess.status === "resolved" && guess.outcome === 'pending') {
                var btcPrice = store.get(BTCPrice);
                if (store.ready(btcPrice) && btcPrice.timestamp <= guess.initialTimestamp + 10000) {
                    store.set(guess,
                        {resolutionPrice: btcPrice.price, resolutionTimestamp: btcPrice.timestamp})
                }
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
