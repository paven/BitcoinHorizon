import { html, define } from "https://unpkg.com/hybrids@%5E9";

export default define({
  tag: 'bitcoin-guess',
    guess: null, // 'up' | 'down' | null
    isGuessActive: (host) => host.guess !== null,
    render: function (host) {
      return html`
    <h2>Make Your Guess</h2>
    <button id="guess-up" type="button"
            class="${host.guess === 'up' ? 'selected' : host.guess === null ? '' : 'disabled'}"
            disabled="${host.guess ? 'disabled' : ''}"
            onclick="${() => {
                if (!host.guess) host.guess = 'up';
            }}">Up ${host.guess === 'up' ? '✅' : ''}
    </button>
    <button id="guess-down" type="button"
            class="${host.guess === 'down' ? 'selected' : host.guess === null ? '' : 'disabled'}"
            disabled="${host.guess ? 'disabled' : ''}"
            onclick="${() => {
                if (!host.guess) host.guess = 'down';
            }}">Down ${host.guess === 'down' ? '✅' : ''}
    </button>
    <div id="guess-message">
      ${host.guess ? html`You selected: <b>${host.guess.toUpperCase()}</b> ${host.guess === 'up' ? '🚀' : '📉'}` : 'No guess selected.'}
    </div>
  `;
  },
});
