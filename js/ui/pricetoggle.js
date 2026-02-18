let currentCurrency = "NGN";
let exchangeRate = 1500; // fallback

async function fetchRate() {
    try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await res.json();

        if (data?.rates?.NGN) {
            exchangeRate = data.rates.NGN;
        }
    } catch (err) {
        console.warn("Using fallback rate:", err);
    }
}

// Call immediately
fetchRate();

export function updatePrices() {

    document.querySelectorAll(".price").forEach(el => {

        const base = parseFloat(el.dataset.price);

        if (isNaN(base)) return;

        if (currentCurrency === "NGN") {
            el.textContent = `₦${base.toLocaleString()}`;
        } else {
            const usd = base / exchangeRate;
            el.textContent = `$${usd.toFixed(2)}`;
        }
    });
}

export function initCurrencyToggle() {

    const btn = document.getElementById("currency-toggle");
    if (!btn) return;

    btn.addEventListener("click", () => {

        currentCurrency = currentCurrency === "NGN" ? "USD" : "NGN";

        btn.textContent = currentCurrency;

        updatePrices();
    });
}
