import {html, define} from "https://unpkg.com/hybrids@^9";
import {fetchBTCPrice} from "../lib/fetchBTCPrice.js";

console.log("[bitcoin-price] Script loaded, about to define component");

export default define({
    tag: "bitcoin-price",
    price: {
        value: {
            price: undefined,
            error: null
        },
        connect: (host, key, invalidate) => {
            console.log('[bitcoin-price] connect called', host);
            fetchBTCPrice().then((result) => {
                console.log('[bitcoin-price] fetchBTCPrice result', result);
                host.price = result;

                function dispatchPriceEvent() {
                    console.log('[bitcoin-price] dispatching btc-price-updated', host.price);
                    host.price.error ? host.dispatchEvent(
                            new CustomEvent("btc-price-error", {
                                detail: host.price,
                                bubbles: true,
                                composed: true,
                            })) :
                        host.dispatchEvent(
                            new CustomEvent("btc-price-updated", {
                                detail: host.price,
                                bubbles: true,
                                composed: true,
                            })
                        );
                }

                dispatchPriceEvent();
                return null; //no need for

            })
        }
    },
    render:
        ({price}) => {
            console.log("[bitcoin-price] render", price);
            return html`
                <span class="bitcoin-price">
        ${price.error // This was a bug, 'error' was not defined.
                ? html`<span style="color:red;">${price.error}</span>`
                : price.price !== undefined && price.price !== null
                        ? html`BTC/USD: <strong>${price.price}</strong>`
                        : "Loading BTC price..."}
      </span>
            `;
        },
});

console.log("[bitcoin-price] Component defined");
