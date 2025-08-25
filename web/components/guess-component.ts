import {define, html, store} from 'hybrids';
import {guessStore, Guess} from '../lib/btcGuessStore';
import {BTCPrice} from '../lib/btcPriceStore';

export interface GuessComponent {
    playerId: string;
    price: BTCPrice;
    disabled: boolean;
}

function createGuess(direction: 'up' | 'down', playerId: string, initialPrice: number): Guess {
    return {
        id: `${playerId}-${Date.now()}`,
        direction,
        status: 'new',
        outcome: null,
        initialPrice,
        initialTimestamp: Date.now(),
        playerId,
    };
}

function makeGuess(host: GuessComponent, direction: 'up' | 'down') {
    if (host.disabled) return;
    const guess = createGuess(direction, host.playerId, host.price.price);
    guessStore.addGuess(guess);
    host.disabled = true;
}

export default define<GuessComponent>({
    tag: 'guess-component',
    playerId: '',
    price: store(BTCPrice),
    disabled: false,
    render: ({price, disabled}) => html`
        <div>
            ${store.pending(price) && html`
                <div>Loading price...</div>
            `}
            ${store.error(price) && html`
                <div class="error">Could not load price. Please try again later.</div>
            `}
            ${store.ready(price) && !store.error(price) && html`
                <button disabled="${disabled}" onclick="${host => makeGuess(host, 'up')}">Up</button>
                <button disabled="${disabled}" onclick="${host => makeGuess(host, 'down')}">Down</button>
                ${!disabled ? html`
                    <div>No guess made yet. Please make a guess.</div>
                ` : ''}
            `}
        </div>
    `,
});
