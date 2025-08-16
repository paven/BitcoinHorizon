/**
 * Defines an in-memory model for the current price.
 * This is used as a global cache to avoid race conditions and simplify component communication.
 */
export const latestPriceStore = {
    price: undefined,
    error: undefined,
};