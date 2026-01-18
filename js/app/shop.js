// /js/app/shop.js
import { supabase } from "../core/supabaseClient.js";

console.log("shop.js loaded");

const PRODUCTS_PER_PAGE = 12;
let currentPage = 1;
let totalPages = 1;

// DOM
const grid = document.getElementById("products-grid");
const pagination = document.getElementById("pagination");
const searchInput = document.getElementById("shopSearch");
const searchBtn = document.getElementById("searchBtn");

// ---------------- LOAD PRODUCTS ----------------
async function loadProducts(page = 1, search = "") {
  const from = (page - 1) * PRODUCTS_PER_PAGE;
  const to = from + PRODUCTS_PER_PAGE - 1;

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("in_stock", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Product fetch error:", error);
    grid.innerHTML = "<p>Failed to load products.</p>";
    return;
  }

  totalPages = Math.ceil(count / PRODUCTS_PER_PAGE);

  renderProducts(data);
  renderPagination();
}

// ---------------- RENDER PRODUCTS ----------------
function renderProducts(products) {
  grid.innerHTML = "";

  if (!products || products.length === 0) {
    grid.innerHTML = "<p>No products found.</p>";
    return;
  }

  products.forEach(p => {
    grid.insertAdjacentHTML(
      "beforeend",
      `
      <div class="product-card">
        <img src="${p.image_url}" alt="${p.title}">
        <h3>${p.title}</h3>
        <p class="price">₦${Number(p.price).toLocaleString()}</p>

        <div class="product-actions">
          <a href="product.html?id=${p.id}&slug=${p.slug}" class="btn-outline">
            View Product
          </a>
          <button class="btn-primary" data-id="${p.id}">
            Add to Cart
          </button>
        </div>
      </div>
      `
    );
  });
}

// ---------------- PAGINATION ----------------
function renderPagination() {
  pagination.innerHTML = "";

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");

    btn.onclick = () => {
      currentPage = i;
      loadProducts(currentPage, searchInput.value.trim());
    };

    pagination.appendChild(btn);
  }
}

// ---------------- SEARCH ----------------
searchBtn.addEventListener("click", () => {
  currentPage = 1;
  loadProducts(currentPage, searchInput.value.trim());
});

// ENTER KEY SEARCH
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") searchBtn.click();
});

// ---------------- INIT ----------------
loadProducts();
