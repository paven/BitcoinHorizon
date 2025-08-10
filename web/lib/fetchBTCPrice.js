export function fetchBTCPrice(result = {price: null, error: null}, URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd") {
    return fetch(URL)
        .then((res) =>
                res.json()
                    .then(
                        (data) => {
                            console.log("[fetchBTCPrice] API response:", data);
                            if (res.ok && data && data.bitcoin && typeof data.bitcoin.usd === 'number') {
                                result.price = data.bitcoin.usd;
                                result.error = null;
                            } else {
                                result.price = null;
                                result.error = `Error: Unexpected API response structure`;
                            }
                            return result;
                        },
                        (reason) => {
                            result.error = `Error parsing response: ${reason}`;
                            result.price = null;
                            return result;
                        }
                    ),
            (reason) => {
                result.error = `Error fetching data: ${reason}`;
                result.price = null;
                return result;
            }
        )
        .catch((e) => {
            result.error = `Error fetching data: ${e.message}` ;
            result.price = null;
            return result;
        });
}
