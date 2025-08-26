import {define, html, store, BTCPrice} from '../lib/btcPriceStore';
import {Guess, hasActiveGuesses, createGuess} from '../lib/btcGuessStore';

export interface GuessComponent {
    playerId: string;
    price: BTCPrice;
    guess: Guess[];
    disabled: boolean;
}

async function makeGuess(host: GuessComponent, direction: 'up' | 'down') {
    if (host.disabled) return;
    const guessPayload = createGuess({
        direction,
        playerId: host.playerId,
        initialPrice: host.price.price,
    });
    await store.set(Guess, guessPayload); // Await the async set
    // Expose all guesses for test/debug after set resolves
    if (typeof window !== "undefined") {
        // @ts-ignore
        window.__guesses__ = store.get([Guess]);
    }
}

export default define<GuessComponent>({
    tag: 'guess-component',
    playerId: '',
    price: store(BTCPrice),
    guess: store(Guess), //to trigger rendering on update.
    disabled: () => hasActiveGuesses(),
    render: ({price, guess, disabled}) => html`
        <div>
            ${store.ready(price) ? html`
                <button id="guess-up" disabled=${disabled} onclick="${host => makeGuess(host, 'up')}">Up</button>
                <button id="guess-down" disabled=${disabled} onclick="${host => makeGuess(host, 'down')}">Down</button>
                ${!disabled ? html`
                    <div>Please make a guess.</div>
                ` : ''}
            ` : html`
                <div>Loading price...</div>
            `}
        </div>
    `,
});
