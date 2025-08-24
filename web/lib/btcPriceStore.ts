import {store, Model, define, html} from "hybrids";

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
export interface BTCPrice {
    id?: string;
    price: number;
    timestamp: number;
    error: string;
    errorLog: IErrorLogEntry[];
}

// URL for the CoinGecko API
const API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";

const ErrorLogEntry: IErrorLogEntry = {
    price: 0,
    timestamp: 0,
    error: "",
};

// This will hold the last known state of the model. It's moved to the module scope
// to avoid `this` context issues within the store's `observe` method.
let lastModel: BTCPrice | null = null;

/**
 * Resets the module-level `lastModel` variable.
 * This is intended for use in testing environments to ensure test isolation.
 */
export function _resetLastModelForTests() {
    lastModel = null;
}

// Create the model
export const BTCPrice: Model<BTCPrice> = {
    // Default values
    price: -1,
    timestamp: -1,
    error: "",
    errorLog: [ErrorLogEntry],

    // Connect to external data source
    [store.connect]: {
        get: async function () {
            function errorPrice(errorMessage: string) {
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

            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    return errorPrice(`HTTP error! status: ${response.status}`);
                }

                const data: CoinGeckoResponse = await response.json();

                return {
                    price: data.bitcoin.usd,
                    timestamp: Date.now(),
                    error: "",
                    errorLog: [], // On success, we reset the error log
                };
            } catch (err) {
                console.log("err ", err);

                const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";

                return errorPrice(errorMessage);
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
export const isPriceValid = (price: BTCPrice): boolean => {
    return price.price > 0 && price.error == "" &&
        (Date.now() - price.timestamp) < 60000; // Price is less than 60 seconds old
};

// Helper function to get fresh price data
export const refreshPrice = async (): Promise<BTCPrice> => {
    store.clear(BTCPrice, false); // Clear the cache but keep the value
    return store.get(BTCPrice);   // Fetch fresh data
};

export {store, define, html};
export type {Model}
export default BTCPrice;