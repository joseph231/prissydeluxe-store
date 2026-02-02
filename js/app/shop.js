// /js/app/shop.js
import { supabase } from "../core/supabaseClient.js";

console.log("shop.js loaded");

/* ================= CONFIG ================= */
const PRODUCTS_PER_PAGE = 15; // 3 × 5
let currentPage = 1;
let totalPages = 1;
let currentCurrency = localStorage.getItem("pd_currency") || "NGN";

/* ================= DOM ================= */
const grid = document.getElementById("products-grid");
const pagination = document.getElementById("pagination");
const searchInput = document.getElementById("shopSearch");
const searchBtn = document.getElementById("searchBtn");

/* ================= HELPERS ================= */
function formatPrice(priceNGN) {
  if (currentCurrency === "USD") {
    const usd = priceNGN / 1500; // adjust later with live FX
    return `$${usd.toFixed(2)}`;
  }
  return `₦${Number(priceNGN).toLocaleString()}`;
}

function getCart() {
  return JSON.parse(localStorage.getItem("pd_cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("pd_cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
}

/* ================= LOAD PRODUCTS ================= */
async function loadProducts(page = 1, search = "") {
  if (!grid) return;

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
    console.error("Supabase fetch error:", error);
    grid.innerHTML = "<p>Failed to load products.</p>";
    return;
  }

  totalPages = count ? Math.ceil(count / PRODUCTS_PER_PAGE) : 1;

  renderProducts(data || []);
  renderPagination();
}

/* ================= RENDER PRODUCTS ================= */
function renderProducts(products) {
  grid.innerHTML = "";

  if (!products.length) {
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
        <p class="price">${formatPrice(p.price)}</p>

        <div class="product-actions">
          <a href="/product/${p.slug}" class="btn-outline view-product">
            View Product
          </a>
          <button class="btn-primary add-to-cart" data-id="${p.id}">
            Add to Cart
          </button>
        </div>
      </div>
      `
    );
  });
}

/* ================= PAGINATION ================= */
function renderPagination() {
  pagination.innerHTML = "";

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");

    btn.addEventListener("click", () => {
      currentPage = i;
      loadProducts(currentPage, searchInput.value.trim());
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    pagination.appendChild(btn);
  }
}

/* ================= ADD TO CART ================= */
grid.addEventListener("click", async e => {
  const btn = e.target.closest(".add-to-cart");
  if (!btn) return;

  const productId = btn.dataset.id;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (error || !data) {
    alert("Unable to add product to cart.");
    return;
  }

  const cart = getCart();
  const existing = cart.find(i => i.id === data.id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: data.id,
      title: data.title,
      price: data.price,
      image: data.image_url,
      qty: 1
    });
  }

  saveCart(cart);
  alert("Product added to cart");
});

/* ================= SEARCH ================= */
searchBtn?.addEventListener("click", () => {
  currentPage = 1;
  loadProducts(currentPage, searchInput.value.trim());
});

searchInput?.addEventListener("keydown", e => {
  if (e.key === "Enter") searchBtn.click();
});

/* ================= CURRENCY SWITCH ================= */
document.querySelectorAll("[data-currency]").forEach(btn => {
  btn.addEventListener("click", () => {
    currentCurrency = btn.dataset.currency;
    localStorage.setItem("pd_currency", currentCurrency);
    loadProducts(currentPage, searchInput.value.trim());
  });
});

/* ================= INIT ================= */
loadProducts();
