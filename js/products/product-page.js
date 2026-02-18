import { supabase } from "../../supabase.js";

const titleEl = document.getElementById("product-title");
const imageEl = document.getElementById("product-image");
const brandEl = document.getElementById("product-brand");
const priceEl = document.getElementById("product-price");
const descEl = document.getElementById("product-description");

const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

async function loadProduct() {

    if (!slug) {
        console.error("No slug found in URL");
        return;
    }

    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error) {
        console.error("Supabase error:", error);
        return;
    }

    if (!data) {
        console.error("Product not found");
        return;
    }

    // Populate UI
    titleEl.textContent = data.name;
    brandEl.textContent = data.brand || "";
    descEl.textContent = data.description || "";

    imageEl.src = data.image_url || "../assets/images/fallback.webp";
    imageEl.alt = data.name;

    const price = data.price ?? 0;

    priceEl.dataset.price = price;
    priceEl.textContent = `₦${price.toLocaleString()}`;
}

document.addEventListener("DOMContentLoaded", loadProduct);
