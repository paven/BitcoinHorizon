import {define, html, store, BTCPrice} from '../lib/btcPriceStore';
import {Guess, hasActiveGuesses} from '../lib/btcGuessStore';

export interface GuessComponent {
    playerId: string;
    price: BTCPrice;
    disabled: boolean;
}

function createGuess(direction: 'up' | 'down', playerId: string, initialPrice: number): Omit<Guess, 'id'> {
    return {
        direction,
        status: 'new',
        outcome: 'pending',
        initialPrice,
        initialTimestamp: Date.now(),
        playerId,
    };
}

async function makeGuess(host: GuessComponent, direction: 'up' | 'down') {
    if (host.disabled) return;
    const guessPayload = createGuess(direction, host.playerId, host.price.price);
    await store.set(Guess, guessPayload); // Await the async set
    host.disabled = true;
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
    disabled: hasActiveGuesses(),
    render: ({price, disabled}) => html`
        <div>
            ${store.ready(price) ? html`
                <button id="guess-up" disabled=${disabled} onclick="${host => makeGuess(host, 'up')}">Up</button>
                <button id="guess-down" disabled=${disabled} onclick="${host => makeGuess(host, 'down')}">Down</button>
                ${!disabled ? html`
                    <div>No guess made yet. Please make a guess.</div>
                ` : ''}
            ` : html`
                <div>Loading price...</div>
            `}
        </div>
    `,
});
