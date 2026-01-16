import { supabase } from "../supabase.js";

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

async function loadProduct() {
  if (!productId) return;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (error || !data) {
    console.error(error);
    return;
  }

  document.title = `${data.title} | PrissyDeluxe`;

  document.getElementById("product-image").src = data.image_url;
  document.getElementById("product-title").textContent = data.title;
  document.getElementById("product-price").textContent =
    `₦${Number(data.price).toLocaleString()}`;
  document.getElementById("product-description").textContent =
    data.description;
}

loadProduct();
