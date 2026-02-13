import { supabase } from "../../supabase.js";
import { convertPrice, getCurrentCurrency } from "../ui/pricetoggle.js";

const grid = document.querySelector(".products-grid");
const params = new URLSearchParams(window.location.search);
const category = params.get("category");

let page = 0;
const limit = 8;
let loading = false;
let finished = false;

/* ===========================
   LOAD PRODUCTS
=========================== */
export async function loadProducts() {
    if (loading || finished) return;

    loading = true;

    const from = page * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", category)
        .range(from, to);

    if (error) {
        console.error(error);
        loading = false;
        return;
    }

    if (!data.length) {
        finished = true;
        loading = false;
        return;
    }

    data.forEach(product => {
        grid.appendChild(renderProductCard(product));
    });

    page++;
    loading = false;
}

/* ===========================
   PRODUCT CARD
=========================== */
function renderProductCard(product) {
    const currency = getCurrentCurrency();
    const converted = convertPrice(product.price_ngn);

    const card = document.createElement("div");
    card.classList.add("product-card");

    card.innerHTML = `
        <a href="product.html?id=${product.id}">
            <div class="product-image">
                <img src="${product.image_url}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price">
                    ${currency === "USD" ? "$" : "₦"}
                    ${converted}
                </p>
            </div>
        </a>
    `;

    return card;
}
