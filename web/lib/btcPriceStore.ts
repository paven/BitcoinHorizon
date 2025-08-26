import {store, Model, define, html} from "hybrids";

// Interface for our price model
export interface BTCPrice {
    id?: string;
    price: number;
    timestamp: number;
}

// Create the model
export const BTCPrice: Model<BTCPrice> = {
    // Default values
    price: -1,
    timestamp: -1,

    // Connect to external data source
    [store.connect]: {
        get: async () => {
            const primaryUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';
            const fallbackUrl = 'https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD';

            try {
                // Primary source: CoinGecko
                const response = await fetch(primaryUrl);
                if (!response.ok) throw new Error(`CoinGecko request failed: ${response.statusText}`);
                const data = await response.json();
                const price = data.bitcoin.usd;
                console.log('Fetched price from CoinGecko:', price);
                return {price, timestamp: Date.now()};
            } catch (error) {
                console.warn('Primary price source (CoinGecko) failed:', error);
                console.log('Trying fallback price source (CryptoCompare)...');

                // Fallback source: CryptoCompare
                const fallbackResponse = await fetch(fallbackUrl);
                // Log fallback error in the same format as the primary error for test consistency
                if (!fallbackResponse.ok) {
                    console.error('BTCPrice store fetch error:', `HTTP error! status: ${fallbackResponse.status}`);
                    throw new Error(`CryptoCompare request failed: ${fallbackResponse.statusText}`);
                }
                const fallbackData = await fallbackResponse.json();
                const price = fallbackData.USD;
                console.log('Fetched price from CryptoCompare:', price);
                return {price, timestamp: Date.now()};
            }
        },
        // Cache for 10 seconds
        cache: 10000,
    }
};

// Helper function to check if price data is valid
export const isPriceValid = (price: BTCPrice): boolean => {
    return price.price > 0 && (Date.now() - price.timestamp) < 60000; // Price is less than 60 seconds old
};

// Helper function to get fresh price data
export const refreshPrice = async (): Promise<BTCPrice> => {
    store.clear(BTCPrice, false); // Invalidate the cache
    return store.resolve(BTCPrice);   // Asynchronously resolve the fresh data.
};

export {store, define, html};
export type {Model}
export default BTCPrice;