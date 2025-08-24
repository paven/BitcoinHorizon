import {store, Model} from "hybrids";

// Interface for the API response
interface CoinGeckoResponse {
    bitcoin: {
        usd: number;
    };
}

// Option 1: Define a separate interface for error log entries
interface IErrorLogEntry {
    price: number;
    timestamp: number;
    error: string;
}

// Interface for our price model
interface IBTCPriceData {
    id?: string;
    price: number;
    timestamp: number;
    error: string;
    errorLog: IErrorLogEntry[];
}

// URL for the CoinGecko API
const API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";

const ErrorLogEntry: Model<IErrorLogEntry> = {
    price: 0,
    timestamp: 0,
    error: "",
};

// This will hold the last known state of the model. It's moved to the module scope
// to avoid `this` context issues within the store's `observe` method.
let lastModel: IBTCPriceData | null = null;

// Create the model
export const BTCPrice: Model<IBTCPriceData> = {
    // Default values
    price: 0,
    timestamp: 0,
    error: "",
    errorLog: [ErrorLogEntry],

    // Connect to external data source
    [store.connect]: {
        get: async function () {
            try {
                const response = await fetch(API_URL);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data: CoinGeckoResponse = await response.json();

                return {
                    price: data.bitcoin.usd,
                    timestamp: Date.now(),
                    error: "",
                    errorLog: [], // On success, we reset the error log
                };
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";

                if (lastModel && isPriceValid(lastModel)) {
                    const newErrorEntry = {
                        price: 0,
                        timestamp: Date.now(),
                        error: errorMessage,
                    };

                    return {
                        ...lastModel,
                        error: errorMessage,
                        errorLog: [...lastModel.errorLog, newErrorEntry],
                    };
                } else {
                    // Return error state but maintain type safety
                    return {
                        price: 0,
                        timestamp: Date.now(),
                        error: errorMessage,
                        errorLog: []
                    };
                }
            }
        },

        observe: function (id, model) {
            lastModel = model;
        },

        // Cache for 10 seconds
        cache: 10000,

        // Enable offline support
        //offline: true,
    }
};

// Helper function to check if price data is valid
export const isPriceValid = (price: IBTCPriceData): boolean => {
    return price.price > 0 && !price.error && !price.errorLog.length &&
        (Date.now() - price.timestamp) < 60000; // Price is less than 60 seconds old
};

// Helper function to get fresh price data
export const refreshPrice = async (): Promise<IBTCPriceData> => {
    store.clear(BTCPrice, false); // Clear the cache but keep the value
    return store.get(BTCPrice);   // Fetch fresh data
};

export {store};
export default BTCPrice;