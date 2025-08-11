import { html, define } from "https://unpkg.com/hybrids@%5E9";

export default define({
  tag: 'bitcoin-guess',
    guess: null, // 'up' | 'down' | null
    isGuessActive: (host) => host.guess !== null,
    render: function (host) {
      return html`
          <style>
              button.selected {
                  background: #e0ffe0;
                  border: 2px solid #2ecc40;
                  font-weight: bold;
                  box-shadow: 0 0 8px #2ecc40;
                  transition: background 0.2s, box-shadow 0.2s;
              }

              button.disabled {
                  background: #f8f8f8;
                  border: 2px dashed #bbb;
                  color: #bbb;
                  opacity: 0.7;
                  font-weight: normal;
                  box-shadow: none;
                  filter: grayscale(0.3);
                  transition: background 0.2s, box-shadow 0.2s, color 0.2s, border 0.2s;
              }

              button:not(.selected):not(.disabled) {
                  background: #fff;
                  border: 2px solid #2d8cf0;
                  color: #2d8cf0;
                  opacity: 1;
                  font-weight: normal;
                  box-shadow: 0 0 4px #2d8cf0;
                  filter: none;
                  cursor: pointer;
                  transition: background 0.2s, box-shadow 0.2s, color 0.2s, border 0.2s;
              }

              button:not(.disabled):hover {
                  background: #e0e0e0;
                  border-color: #888;
                  color: #333;
                  opacity: 1;
                  filter: none;
              }
          </style>
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
