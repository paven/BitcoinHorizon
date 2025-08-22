import {define, html, store} from "hybrids";
import {LatestPrice} from '../lib/priceStore.js';
import {Guess, makeGuess, checkStoredGuess} from '../lib/guessStore.js';

window.testStore = store;
window.testGuess = Guess;

export default define({
  tag: 'bitcoin-guess',
  guess: {
    value: () => store.get(Guess).guess,
    connect: (host, key, invalidate) => {
      // Check if there's a stored guess and start waiting if needed
      console.log("bitcoin-guess connected, checking for stored guess");
      checkStoredGuess(host);
      return () => {
      }; // Disconnect function (not needed here)
    },
    observe: (host, value, lastValue) => {
      console.log("bitcoin-guess guess changed, render", value, lastValue);
    },
  },
  //guessStore: store(Guess),
  isWaiting: store(Guess, 'isWaiting'),
    isGuessActive: (host) => host.guess !== "",
    latestPrice: store(LatestPrice),
  render: function (host,) {
    const {isGuessActive, latestPrice, guess} = host;
    console.log("[bitcoin-guess] render", guess);

    // `latestPrice.ok` is a computed boolean property from the store model.
        const priceIsOk = store.ready(latestPrice) && latestPrice.ok;
        const buttonsDisabled = isGuessActive || !priceIsOk;
      return html`

        <h2>Make Your Guess ${store.ready(latestPrice) ? latestPrice.price : '...'}</h2>
        <button id="guess-up" type="button"
                class="${guess === 'up' ? 'selected' : ''}"
                disabled=${buttonsDisabled}
                onclick="${() => makeGuess(host, 'up', latestPrice.price)}"
        >Up${guess === 'up' ? '✅' : ''}
        </button>
        <button id="guess-down" type="button"
                class="${host.guess === 'down' ? 'selected' : ''}"
                disabled=${buttonsDisabled}
                onclick="${() => makeGuess(host, 'down', latestPrice.price)}"
        >Down ${guess === 'down' ? '✅' : ''}
        </button>
        <div id="guess-message">
          ${guess ? (
              html`You selected: <b>${guess.toUpperCase()}</b> ${host.guess === 'up' ? '🚀' : '📉'}` +
              host.isWaiting && html`<span>Waiting for result... <span class="loader"></span></span>`
          ) : 'No guess selected.'}
        </div>

        <style>
              button.selected {
                  background: #e0ffe0;
                  border: 2px solid #2ecc40;
                  font-weight: bold;
                  box-shadow: 0 0 8px #2ecc40;
                  transition: background 0.2s, box-shadow 0.2s;
              }

              button[disabled]:not(.selected) {
                  background: #f8f8f8;
                  border: 2px dashed #bbb;
                  color: #bbb;
                  opacity: 0.7;
                  font-weight: normal;
                  box-shadow: none;
                  filter: grayscale(0.3);
                  transition: background 0.2s, box-shadow 0.2s, color 0.2s, border 0.2s;
              }

              button:not([disabled]) {
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

              button:not([disabled]):hover {
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
                0% {
                  transform: rotate(0deg);
                }
                100% {
                  transform: rotate(360deg);
                }
              }
          </style>
      `;
  },
});
