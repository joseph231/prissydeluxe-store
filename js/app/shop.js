// /js/app/shop.js
console.log("shop.js loaded");

if (!window.supabase) {
  console.error("Supabase not available on window");
  throw new Error("Supabase not initialized");
}

const PRODUCTS_PER_PAGE = 12;
let currentPage = 1;

const grid = document.getElementById("products-grid");
const pagination = document.getElementById("pagination");

async function loadProducts(page = 1) {
  const from = (page - 1) * PRODUCTS_PER_PAGE;
  const to = from + PRODUCTS_PER_PAGE - 1;

  const { data, error, count } = await window.supabase
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
  const pages = Math.ceil(total / PRODUCTS_PER_PAGE);
  pagination.innerHTML = "";

  const pages = Math.ceil(total / PRODUCTS_PER_PAGE);
  if (pages <= 1) return;

  for (let i = 1; i <= pages; i++) {
    pagination.innerHTML += `
      <button ${i === currentPage ? "class='active'" : ""}
        onclick="goToPage(${i})">${i}</button>
    `;
  }
}

window.goToPage = function (page) {
  currentPage = page;
  loadProducts(page);
};

loadProducts();
