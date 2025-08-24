import {define, html, store} from 'hybrids';
// `btcPriceStore` exports a value and a type both named `BTCPrice`.
// We import the value as `BTCPriceModel` and the type as `IBTCPriceData` for clarity.
import {BTCPrice} from '../lib/btcPriceStore';

export interface BTCPriceComponent {
    price: BTCPrice;
}

export default define<BTCPriceComponent>({
    tag: "btc-price",
    price: store(BTCPrice),
    // The render function must handle the `null` case for `price`.
    render: ({price}) => html`
        <div class="btc-price">
            <strong>BTC Price:</strong> ${price ? `$${price.price}` : 'Loading...'}
        </div>
    `,
});
