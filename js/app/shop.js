// /js/app/shop.js
import { supabase } from "../core/supabaseClient.js";

console.log("shop.js loaded");

const PRODUCTS_PER_PAGE = 12;
let currentPage = 1;

const grid = document.getElementById("products-grid");
const pagination = document.getElementById("pagination");

async function loadProducts(page = 1) {
  const from = (page - 1) * PRODUCTS_PER_PAGE;
  const to = from + PRODUCTS_PER_PAGE - 1;

  const { data, error, count } = await supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("in_stock", true)
    .range(from, to)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Product fetch error:", error);
    return;
  }

  renderProducts(data);
  renderPagination(count);
}

function renderProducts(products) {
  grid.innerHTML = "";

  if (!products || products.length === 0) {
    grid.innerHTML = "<p>No products found.</p>";
    return;
  }

  products.forEach(p => {
    grid.innerHTML += `
      <a href="product.html?id=${p.id}&slug=${p.slug}" class="product-card">
        <img src="${p.image_url}" alt="${p.title}">
        <h3>${p.title}</h3>
        <p>₦${Number(p.price).toLocaleString()}</p>
      </a>
    `;
  });
}

function renderPagination(total) {
  pagination.innerHTML = "";

  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);
  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");
    btn.onclick = () => {
      currentPage = i;
      loadProducts(i);
    };
    pagination.appendChild(btn);
  }
}

loadProducts();
