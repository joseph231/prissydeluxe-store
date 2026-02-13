let currentCurrency = "NGN";
let exchangeRate = 1500; // fallback rate

/* ===========================
   FETCH LIVE RATE
=========================== */
async function fetchRate() {
    try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await res.json();
        exchangeRate = data.rates.NGN;
    } catch (err) {
        console.warn("Using fallback rate");
    }
}

fetchRate();

/* ===========================
   CONVERSION
=========================== */
export function convertPrice(priceNGN) {
    if (currentCurrency === "NGN") {
        return priceNGN.toLocaleString();
    }

    const usd = priceNGN / exchangeRate;
    return usd.toFixed(2);
}

export function toggleCurrency() {
    currentCurrency = currentCurrency === "NGN" ? "USD" : "NGN";
    location.reload();
}

export function getCurrentCurrency() {
    return currentCurrency;
}
