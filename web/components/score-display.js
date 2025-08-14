import {html, define, store} from "https://unpkg.com/hybrids@^9";
import {Game} from "../lib/store.js";

export default define({
    tag: "score-display",
    // The 'game' property connects this component to the global Game store.
    // It will automatically re-render when the store's data changes.
    game: store(Game),
    render: ({game}) => html`
        <style>
            :host {
                display: block;
                font-size: 1.2em;
                margin: 0.5em 0;
            }
        </style>
        <!-- Use store.ready() to ensure data is loaded before displaying it -->
        <div>Score: <span id="score-value">${store.ready(game) ? game.score : '...'}</span></div>
    `,
});
