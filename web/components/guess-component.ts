import {define, html} from 'hybrids';
import {guessStore, Guess} from '../lib/btcGuessStore';

export interface GuessComponent {
    playerId: string;
    initialPrice: number;
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
    const guess = createGuess(direction, host.playerId, host.initialPrice);
    guessStore.addGuess(guess);
    host.disabled = true;
}

export default define<GuessComponent>({
    tag: 'guess-component',
    playerId: '',
    initialPrice: 0,
    disabled: false,
    render: ({disabled}) => html`
        <div>
            <button disabled="${disabled}" onclick="${host => makeGuess(host, 'up')}">Up</button>
            <button disabled="${disabled}" onclick="${host => makeGuess(host, 'down')}">Down</button>
            ${!disabled ? html`
                <div>No guess made yet. Please make a guess.</div>` : ''}
        </div>
    `,
});
