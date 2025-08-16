import {store} from "hybrids";
import {LatestPrice} from './priceStore.js';

function updateStore(result) {
    // Atomically update the store by merging the new data with the current state.
    // This functional update preserves other properties on the model, like the `ok` method.
    return store.set(LatestPrice, result);
}

export function fetchBTCPrice(
    fetchFn,
    URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
) {
    return fetchFn(URL)
        .then(response => {
            if (!response.ok) {
                // Handle HTTP errors like 404 or 500
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.bitcoin && typeof data.bitcoin.usd === 'number') {
                return {price: data.bitcoin.usd, error: ""};
            } else {
                throw new Error('Unexpected API response structure');
            }
        })
        .catch((e) => {
            return {price: -1, error: e.message};
        })
        .then(updateStore); // Always update the store with the final result
}
