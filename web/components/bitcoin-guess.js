import { html, define } from "https://unpkg.com/hybrids@%5E9";

export default define({
  tag: 'bitcoin-guess',
    guess: null, // 'up' | 'down' | null
    isGuessActive: (host) => host.guess !== null,
    render: function (host) {
      return html`
    <h2>Make Your Guess</h2>
    <button id="guess-up" type="button" onclick="${() => {
        host.guess = 'up';
    }}">Up
    </button>
    <button id="guess-down" type="button" onclick="${() => {
      host.guess = 'down';
    }}">Down
    </button>
    <div id="guess-message"></div>
  `;
  },
});
