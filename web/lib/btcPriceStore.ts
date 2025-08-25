import {store, Model, define, html} from "hybrids";

// Interface for the API response
interface CoinGeckoResponse {
    bitcoin: {
        usd: number;
    };
}

// Interface for our price model
export interface BTCPrice {
    id?: string;
    price: number;
    timestamp: number;
}

// URL for the CoinGecko API
const API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";

// Create the model
export const BTCPrice: Model<BTCPrice> = {
    // Default values
    price: -1,
    timestamp: -1,

    // Connect to external data source
    [store.connect]: {
        get: async function () {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    const errorMessage = `HTTP error! status: ${response.status}`;
                    console.error("BTCPrice store fetch error:", errorMessage);
                    return null;
                }

                const data: CoinGeckoResponse = await response.json();

                return {
                    price: data.bitcoin.usd,
                    timestamp: Date.now(),
                };
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
                console.error("BTCPrice store fetch error:", errorMessage, err);
                return null;
            }
        },
        // Cache for 10 seconds
        cache: 10000,

        // Enable offline support
        //offline: true,
    }
};

// Helper function to check if price data is valid
export const isPriceValid = (price: BTCPrice): boolean => {
    return price.price > 0 && (Date.now() - price.timestamp) < 60000; // Price is less than 60 seconds old
};

// Helper function to get fresh price data
export const refreshPrice = async (): Promise<BTCPrice> => {
    store.clear(BTCPrice, false); // Clear the cache but keep the value
    return store.get(BTCPrice);   // Fetch fresh data
};

export {store, define, html};
export type {Model}
export default BTCPrice;