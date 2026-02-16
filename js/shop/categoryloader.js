import { supabase } from "../../supabase.js";

const grid = document.querySelector(".products-grid");

const params = new URLSearchParams(window.location.search);
const category = params.get("category");

let page = 0;
const limit = 8;
let loading = false;
let finished = false;

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
        grid.appendChild(createCard(product));
    });

    page++;
    loading = false;
}

/* PRODUCT CARD */
function createCard(product) {

    const card = document.createElement("div");
    card.classList.add("product-card");

    card.innerHTML = `
        <a href="product.html?id=${product.id}">
            <div class="product-image">
                <img src="${product.image_url}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price" data-price="${product.price_ngn}">
                    ₦${product.price_ngn.toLocaleString()}
                </p>
            </div>
        </a>
    `;

    return card;
}

/* INITIAL LOAD */
loadProducts();
