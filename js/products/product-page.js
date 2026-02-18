import { supabase } from "../../supabase.js";

const container = document.querySelector(".product-page");

const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

async function loadProduct() {

    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error) {
        console.error(error);
        return;
    }

    container.innerHTML = `
        <div class="product-layout">
            <div class="product-image">
                <img src="${data.image_url}" alt="${data.name}">
            </div>

            <div class="product-info">
                <h1>${data.name}</h1>
                <p class="price" data-price="${data.price}">
                    ₦${data.price.toLocaleString()}
                </p>
                <p class="description">${data.description || ""}</p>

                <div class="product-actions">
                    <input type="number" value="1" min="1">
                    <button class="add-to-cart">Add to Cart</button>
                </div>
            </div>
        </div>
    `;
}

loadProduct();
