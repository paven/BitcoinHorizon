import {store} from "hybrids";
/**
 * Defines an in-memory model for the current price.
 * This is used as a global cache to avoid race conditions and simplify component communication.
 */
export const LatestPrice = {
    // Define simple default values. `store.clear()` will reset the model to this state.
    price: -1,
    error: "",
    // This is a computed property. It receives the model instance and derives its value.
    ok: ({price, error}) => price >= 0 && error === "",
};