import { html, define } from "https://unpkg.com/hybrids@%5E9";

export default define({
  tag: 'bitcoin-guess',
  render: function () {
      return html`
    <h2>Make Your Guess</h2>
    <button id="guess-up" type="button">Up</button>
    <button id="guess-down" type="button">Down</button>
    <div id="guess-message"></div>
  `;
  },
});
