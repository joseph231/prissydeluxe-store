// /js/products/shop.js
// STEP 2.1 — FINAL, STABLE SHOP LOGIC

console.log("shop.js loaded");

document.addEventListener("DOMContentLoaded", initShop);

const PER_PAGE = 12;
let currentPage = 1;
let allProducts = [];

async function initShop() {
  if (typeof window.fetchProductsFromSupabase !== "function") {
    console.error("fetchProductsFromSupabase missing — product.js not loaded");
    return;
  }

  allProducts = await window.fetchProductsFromSupabase({
    page: 1,
    perPage: 1000
  });

  if (!Array.isArray(allProducts)) {
    console.error("Invalid product data");
    return;
  }

  bindUI();
  render();
  updateCartLink();
}

function bindUI() {
  document.getElementById("searchBtn")
    .addEventListener("click", () => {
      currentPage = 1;
      render();
    });

  document.getElementById("shopSearch")
    .addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        currentPage = 1;
        render();
      }
    });

  document.getElementById("prevPage")
    .addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        render();
      }
    });

  document.getElementById("nextPage")
    .addEventListener("click", () => {
      if (currentPage < totalPages()) {
        currentPage++;
        render();
      }
    });
}

function filteredProducts() {
  const q = document.getElementById("shopSearch").value.trim().toLowerCase();
  if (!q) return allProducts;
  return allProducts.filter(p =>
    (p.title || "").toLowerCase().includes(q)
  );
}

function totalPages() {
  return Math.max(1, Math.ceil(filteredProducts().length / PER_PAGE));
}

function render() {
  const list = document.getElementById("productList");
  const pageInfo = document.getElementById("pageInfo");

  const products = filteredProducts();
  const start = (currentPage - 1) * PER_PAGE;
  const pageItems = products.slice(start, start + PER_PAGE);

  list.innerHTML = "";

  if (!pageItems.length) {
    list.innerHTML = `<p class="empty-text">No products found.</p>`;
    return;
  }

  pageItems.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="../${p.image}" alt="${p.title}">
      <h4>${p.title}</h4>
      <p class="product-price">${p.price}</p>

      <div class="product-actions">
        <a class="btn-outline" href="./product.html?id=${p.id}">View</a>
        <button class="btn-add"
          data-id="${p.id}"
          data-title="${p.title}"
          data-price="${p.price}"
          data-image="../${p.image}">
          Add to Cart
        </button>
      </div>
    `;

    list.appendChild(card);
  });

  pageInfo.textContent = `Page ${currentPage} of ${totalPages()}`;
  bindAddToCart();
}

function bindAddToCart() {
  document.querySelectorAll(".btn-add").forEach(btn => {
    btn.onclick = () => {
      const cart = JSON.parse(localStorage.getItem("pd_cart") || "[]");
      const id = btn.dataset.id;

      const existing = cart.find(i => i.id == id);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({
          id,
          title: btn.dataset.title,
          price: btn.dataset.price,
          image: btn.dataset.image,
          qty: 1
        });
      }

      localStorage.setItem("pd_cart", JSON.stringify(cart));
      btn.textContent = "Added ✓";

      setTimeout(() => btn.textContent = "Add to Cart", 1200);
    };
  });
}

async function updateCartLink() {
  const cartBtn = document.getElementById("floatingCart");
  if (!cartBtn) return;

  let logged = false;

  try {
    if (window.supabase?.auth?.getSession) {
      const { data } = await window.supabase.auth.getSession();
      logged = !!data.session;
    }
  } catch { }

  if (!logged) logged = !!localStorage.getItem("pd_logged");

  cartBtn.href = logged ? "./cart.html" : "./login.html";
}
