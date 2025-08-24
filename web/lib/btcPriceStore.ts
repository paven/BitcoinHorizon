import {store, Model} from "hybrids";

// Interface for the API response
interface CoinGeckoResponse {
    bitcoin: {
        usd: number;
    };
}

// Interface for our price model
interface IBTCPriceData {
    id?: string;        // Optional as this is a singleton
    price: number;
    timestamp: number;
    error?: string;
}

// URL for the CoinGecko API
const API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";

// Create the model
export const BTCPrice: Model<IBTCPriceData> = {
    // Default values
    price: 0,
    timestamp: 0,
    error: "",

    // Connect to external data source
    [store.connect]: {
        get: async () => {
            try {
                const response = await fetch(API_URL);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data: CoinGeckoResponse = await response.json();

                return {
                    price: data.bitcoin.usd,
                    timestamp: Date.now(),
                    error: ""
                };
            } catch (err) {
                // Return error state but maintain type safety
                return {
                    price: 0,
                    timestamp: Date.now(),
                    error: err instanceof Error ? err.message : "Unknown error occurred"
                };
            }
        },

        // Cache for 10 seconds
        cache: 10000,

        // Enable offline support
        //offline: true,
    }
};

// Helper function to check if price data is valid
export const isPriceValid = (price: IBTCPriceData): boolean => {
    return price.price > 0 && !price.error &&
        (Date.now() - price.timestamp) < 60000; // Price is less than 60 seconds old
};

// Helper function to get fresh price data
export const refreshPrice = async (): Promise<IBTCPriceData> => {
    store.clear(BTCPrice, false); // Clear the cache but keep the value
    return store.get(BTCPrice);   // Fetch fresh data
};

export {store};
export default BTCPrice;
