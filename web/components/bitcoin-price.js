import {html, define} from "hybrids";
import {fetchBTCPrice} from "../lib/fetchBTCPrice.js";

console.log("[bitcoin-price] Script loaded, about to define component");

// Helper to dispatch events, adhering to DRY principle.
function dispatchPriceEvent(host) {
    console.log(`[bitcoin-price] dispatching btc-price-${host.price.error ? 'error' : 'updated'}`, host.price);
    const eventName = host.price.error ? "btc-price-error" : "btc-price-updated";
    host.dispatchEvent(
        new CustomEvent(eventName, {
            detail: host.price,
            bubbles: true,
            composed: true,
        })
    );
}

// Helper to fetch and update price, used by both connect and refreshPrice.
function updatePrice(host) {
    return fetchBTCPrice(fetch).then((result) => {
        console.log('[bitcoin-price] fetchBTCPrice result', result);
        host.price = result;
        dispatchPriceEvent(host);
    });
}

export default define({
    tag: "bitcoin-price",
    price: {
        value: {
            price: undefined,
            error: null
        },
        connect: (host, key, invalidate) => {
            console.log('[bitcoin-price] connect called', host);

            const refreshHandler = () => updatePrice(host);
            host.addEventListener('refresh-btc-price', refreshHandler);

            updatePrice(host); // Initial fetch

            return () => {
                host.removeEventListener('refresh-btc-price', refreshHandler);
            };
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
        }
});

console.log("[bitcoin-price] Component defined");
