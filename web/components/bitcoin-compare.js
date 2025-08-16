import {html, define} from "hybrids";

export default define({
    tag: "bitcoin-compare",
    guess: null,
    initialPrice: undefined,
    newPrice: {
        value: undefined,
        observe: (host, newPrice, oldPrice) => {
            // When the new price arrives, the guess is considered "resolved".
            // We only want to fire this once when the price transitions from undefined.
            if (newPrice !== undefined && oldPrice === undefined) {
                const isCorrect = (host.guess === 'up' && newPrice > host.initialPrice) ||
                    (host.guess === 'down' && newPrice < host.initialPrice);

                console.log('[bitcoin-compare] Guess resolved, dispatching event.');
                host.dispatchEvent(new CustomEvent('guess-resolved', {
                    bubbles: true,
                    composed: true,
                    detail: {result: isCorrect ? 'correct' : 'incorrect'}
                }));
            }
        }
    },
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
                                    ${host.newPrice !== undefined
                                            ? html`
                                                <br>New Price: <strong>${host.newPrice}</strong>
                                                <br>Result: <strong>${
                                                        (host.guess === 'up' && host.newPrice > host.initialPrice) ||
                                                        (host.guess === 'down' && host.newPrice < host.initialPrice)
                                                                ? 'Correct'
                                                                : 'Incorrect'
                                                }</strong>
                                            `
                                            : ''
                        }
                                </p>
                            `
            }
        </section>
    `
});
