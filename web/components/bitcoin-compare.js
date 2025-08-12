import {html, define} from "https://unpkg.com/hybrids@^9";

export default define({
    tag: "bitcoin-compare",
    guess: null,
    initialPrice: undefined,
    render: (host) => html`
        <section class="bitcoin-compare">
            <h2>Bitcoin Compare</h2>
            ${
                    host.guess === undefined || host.guess === null
                            ? html`<p>Waiting for guess</p>`
                            : html`
                                <p>
                                    Guess: <strong>${host.guess}</strong><br>
                                    Initial Price: <strong>${host.initialPrice}</strong>
                                </p>
                            `
            }
        </section>
    `
});
