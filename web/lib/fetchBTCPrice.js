import {latestPriceStore} from './priceStore.js';

function updateStore(result) {
    latestPriceStore.price = result.price;
    latestPriceStore.error = result.error;
    return result;
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
                return {price: data.bitcoin.usd, error: null};
            } else {
                throw new Error('Unexpected API response structure');
            }
        })
        .catch((e) => {
            return {price: null, error: e.message};
        })
        .then(updateStore); // Always update the store with the final result
}
