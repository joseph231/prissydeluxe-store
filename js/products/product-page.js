import { supabase } from "../core/supabaseClient.js";

const params = new URLSearchParams(window.location.search);
let slug = params.get("slug");

if (!slug) {
  const parts = window.location.pathname.split("/");
  slug = parts[parts.length - 1];
}

async function loadProduct() {
  if (!slug) return;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    console.error("Product load error:", error);
    return;
  }

  document.getElementById("product-title").textContent = data.title;
  document.getElementById("product-price").textContent =
    `₦${Number(data.price).toLocaleString()}`;

  document.getElementById("product-description").textContent =
    data.description || "";

  const brandEl = document.getElementById("product-brand");
  if (brandEl) brandEl.textContent = `Brand: ${data.brand || "—"}`;

  const catEl = document.getElementById("product-category");
  if (catEl) catEl.textContent = `Category: ${data.category || "—"}`;

  const imgEl = document.getElementById("product-image");
  if (imgEl) imgEl.src = data.image_url;
}

loadProduct();
