// /js/app/shop.js
// Product listing with pagination + local cart integration (pdCart)

document.addEventListener("DOMContentLoaded", () => {
  initShop();
});

/* ----------------------------------
   INITIALIZATION
----------------------------------- */
async function initShop() {
  if (!window.supabase) {
    console.error("Supabase client missing");
    return;
  }

  const url = new URL(window.location.href);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = 12;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  await loadProducts(from, to, page);
  updateCartBadge();
}

/* ----------------------------------
   LOAD PRODUCTS
----------------------------------- */
async function loadProducts(from, to, currentPage) {
  const grid = document.getElementById("productGrid");
  const pagination = document.getElementById("pagination");

  if (!grid) return;

  grid.textContent = "Loading products...";

  const { data, error, count } = await window.supabase
    .from("products")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error(error);
    grid.textContent = "Failed to load products.";
    return;
  }

  if (!data || data.length === 0) {
    grid.innerHTML = '<p class="no-products">No products available.</p>';
    if (pagination) pagination.innerHTML = '';
    return;
  }

  grid.innerHTML = data.map(p => `
    <div class="product-card">
      <img src="${p.image_url}" alt="${p.title}">
      <h3>${p.title}</h3>
      <p class="price">₦${Number(p.price).toLocaleString()}</p>
      <button class="add-to-cart"
        data-id="${p.id}"
        data-title="${p.title}"
        data-price="${p.price}"
        data-image="${p.image_url}">
        Add to Cart
      </button>
    </div>
  `).join("");

  bindAddToCartButtons();
  setupPagination(count, currentPage);
}

/* ----------------------------------
   ADD TO CART (LOCAL)
----------------------------------- */
function bindAddToCartButtons() {
  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = {
        id: btn.dataset.id,
        title: btn.dataset.title,
        price: btn.dataset.price,
        image: btn.dataset.image
      };

      window.pdCart.addToCart(item);
      updateCartBadge();

      btn.textContent = "Added ✓";
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = "Add to Cart";
        btn.disabled = false;
      }, 1200);
    });
  });
}

/* ----------------------------------
   CART BADGE
----------------------------------- */
function updateCartBadge() {
  const badge = document.getElementById("navCartCount");
  if (!badge) return;

  const cart = window.pdCart.getCart();
  const count = cart.reduce((acc, i) => acc + i.quantity, 0);
  badge.textContent = count;
}

/* ----------------------------------
   PAGINATION
----------------------------------- */
function setupPagination(totalCount, currentPage) {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;

  const limit = 12;
  const totalPages = Math.ceil(totalCount / limit);

  let html = "";

  if (currentPage > 1) {
    html += `<a href="?page=${currentPage - 1}" class="page-btn">Prev</a>`;
  }

  for (let i = 1; i <= totalPages; i++) {
    html += `<a href="?page=${i}" class="page-btn ${i === currentPage ? "active" : ""}">${i}</a>`;
  }

  if (currentPage < totalPages) {
    html += `<a href="?page=${currentPage + 1}" class="page-btn">Next</a>`;
  }

  pagination.innerHTML = html;
}
