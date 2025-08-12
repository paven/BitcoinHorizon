import {html, define} from "https://unpkg.com/hybrids@^9";

export default define({
    tag: "bitcoin-compare",
    guess: undefined,
    initialPrice: undefined,
    makeGuess: (host, guess, initialPrice) => {
        host.guess = guess;
        host.initialPrice = initialPrice;
        console.log("Guess made:", {guess, initialPrice});
    },
    render: ({guess, initialPrice}) => html`
        <section class="bitcoin-compare">
            <h2>Bitcoin Compare</h2>
            ${
                    guess === undefined || guess === null
                            ? html`<p>Waiting for guess</p>`
                            : html`
                                <p>
                                    Guess: <strong>${guess}</strong><br>
                                    Initial Price: <strong>${initialPrice}</strong>
                                </p>
                            `
            }
        </section>
    `
});
