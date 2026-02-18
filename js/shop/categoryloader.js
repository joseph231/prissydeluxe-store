import { supabase } from "../../supabase.js";

const grid = document.getElementById("productsGrid");
const title = document.getElementById("categoryTitle");
const loader = document.getElementById("loader");

const params = new URLSearchParams(window.location.search);
let category = params.get("category");

// Normalize category
if (category) {
    category = category.toLowerCase();
    title.textContent = category.toUpperCase();
}

let page = 0;
const limit = 12; // clean pagination
let loading = false;
let finished = false;

export async function loadProducts() {

    if (loading || finished || !category) return;

    loading = true;
    loader.style.display = "block";

    const from = page * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
        .from("products")
        .select("*")
        .ilike("category", category) // case insensitive match
        .range(from, to);

    if (error) {
        console.error("Supabase error:", error);
        loader.style.display = "none";
        loading = false;
        return;
    }

    if (!data.length) {
        finished = true;
        loader.style.display = "none";
        loading = false;
        return;
    }

    data.forEach(product => {
        grid.appendChild(createCard(product));
    });

    page++;
    loading = false;
    loader.style.display = "none";
}

function createCard(product) {

    const price = product.price ?? 0;

    const card = document.createElement("div");
    card.classList.add("product-card");

    card.innerHTML = `
        <a href="product.html?slug=${product.slug}">
            <div class="product-image">
                <img src="${product.image_url || '../assets/images/fallback.webp'}"
                     alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price"
                   data-price="${price}">
                   ₦${price.toLocaleString()}
                </p>
            </div>
        </a>
    `;

    return card;
}
