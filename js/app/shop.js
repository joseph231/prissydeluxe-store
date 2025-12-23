// /js/app/shop.js
// Load products from Supabase with pagination

document.addEventListener("DOMContentLoaded", () => {
  initShop();
});

async function initShop() {
  if (!window.supabase) {
    console.error("Supabase client missing");
    return;
  }

  const url = new URL(window.location.href);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = 12; // products per page
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  loadProducts(from, to, page);
}

async function loadProducts(from, to, currentPage) {
  const grid = document.getElementById("productGrid");
  const pagination = document.getElementById("pagination");

  grid.innerHTML = "Loading products...";

  const { data, error, count } = await window.supabase
    .from("products")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    grid.innerHTML = "Failed to load products.";
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    grid.innerHTML = "No products available.";
    return;
  }

  grid.innerHTML = data
    .map(
      (p) => `
        <div class="product-card">
          <img src="${p.image_url}" alt="${p.title}">
          <h3>${p.title}</h3>
          <p class="price">₦${p.price}</p>
          <button class="add-to-cart" data-id="${p.id}">Add to Cart</button>
        </div>`
    )
    .join("");

  setupAddToCartButtons();
  setupPagination(count, currentPage);
}

function setupAddToCartButtons() {
  const buttons = document.querySelectorAll(".add-to-cart");
  buttons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const productId = btn.getAttribute("data-id");

      const session = (await window.supabase.auth.getSession()).data.session;
      if (!session) {
        window.location.href = "../html/login.html";
        return;
      }

      const { error } = await window.supabase.from("cart_items").insert([
        {
          user_id: session.user.id,
          product_id: productId,
          quantity: 1,
        },
      ]);

      if (error) {
        console.error(error);
        alert("Failed to add to cart.");
      } else {
        btn.textContent = "Added ✓";
        btn.classList.add("added");
        setTimeout(() => {
          btn.textContent = "Add to Cart";
          btn.classList.remove("added");
        }, 1500);
      }
    });
  });
}

function setupPagination(totalCount, currentPage) {
  const pagination = document.getElementById("pagination");
  const limit = 12;
  const totalPages = Math.ceil(totalCount / limit);

  let html = "";

  if (currentPage > 1) {
    html += `<a href="?page=${currentPage - 1}" class="page-btn">Prev</a>`;
  }

  for (let i = 1; i <= totalPages; i++) {
    html += `<a href="?page=${i}" class="page-btn ${
      i === currentPage ? "active" : ""
    }">${i}</a>`;
  }

  if (currentPage < totalPages) {
    html += `<a href="?page=${currentPage + 1}" class="page-btn">Next</a>`;
  }

  pagination.innerHTML = html;
}
