import {html, define} from "https://unpkg.com/hybrids@^9";

export default define({
    tag: "score-display",
    score: 0,
    render: ({score}) => html`
        <style>
            :host {
                display: block;
                font-size: 1.2em;
                margin: 0.5em 0;
            }
        </style>
        <div>Score: <span id="score-value">${score}</span></div>
    `,
});

