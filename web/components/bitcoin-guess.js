import {define} from 'hybrids';

export default define({
  tag: 'bitcoin-guess',
  render: function (host) {
      return `
    <h2>Make Your Guess</h2>
    <button id="guess-up" type="button">Up</button>
    <button id="guess-down" type="button">Down</button>
    <div id="guess-message"></div>
  `;
  },
});

