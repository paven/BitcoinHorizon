import { html, define } from "https://unpkg.com/hybrids@%5E9";

function startWaiting(host) {
    host.isWaiting = true;
    setTimeout(() => {
        host.isWaiting = false;
        host.render(); // force re-render
    }, 60000); // 60 seconds
}

function makeGuess(host, guess) {
    if (!host.guess) {
        host.guess = guess;
        // Emit guess-made event
        host.dispatchEvent(new CustomEvent('guess-made', {detail: {guess: guess}}));
        startWaiting(host);
        host.render();
    }
}

export default define({
  tag: 'bitcoin-guess',
    guess: null, // 'up' | 'down' | null
    isGuessActive: (host) => host.guess !== null,
    isWaiting: false,
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

              .loader {
                  border: 3px solid #f3f3f3;
                  border-top: 3px solid #3498db;
                  border-radius: 50%;
                  width: 16px;
                  height: 16px;
                  animation: spin 2s linear infinite;
              }

              @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
              }
          </style>
    <h2>Make Your Guess</h2>
    <button id="guess-up" type="button"
            class="${host.guess === 'up' ? 'selected' : host.guess === null ? '' : 'disabled'}"
            disabled="${host.guess ? 'disabled' : ''}"
            onclick="${() => makeGuess(host, 'up')}"
    >Up ${host.guess === 'up' ? '✅' : ''}
    </button>
    <button id="guess-down" type="button"
            class="${host.guess === 'down' ? 'selected' : host.guess === null ? '' : 'disabled'}"
            disabled="${host.guess ? 'disabled' : ''}"
            onclick="${() => makeGuess(host, 'down')}"
    >Down ${host.guess === 'down' ? '✅' : ''}
    </button>
    <div id="guess-message">
      ${host.guess ? (
          host.isWaiting
              ? html`<span>Waiting for result... <span class="loader"></span></span>`
              : html`You selected: <b>${host.guess.toUpperCase()}</b> ${host.guess === 'up' ? '🚀' : '📉'}`
      ) : 'No guess selected.'}
    </div>
  `;
  },
});
