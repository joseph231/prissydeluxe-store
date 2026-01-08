// /js/products/product-page.js
// FINAL — Z1 aligned, production-safe

(async function () {
  const container = document.getElementById("productContainer");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    container.innerHTML = "<p>Invalid product.</p>";
    return;
  }

  container.innerHTML =
    '<p style="text-align:center;color:#777">Loading product…</p>';

  try {
    let product = null;

    /* ===============================
       1. PRODUCTION: SUPABASE FIRST
    ================================ */
    if (window.supabase) {
      const { data, error } = await window.supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        product = data;
      }
    }

    /* ===============================
       2. FALLBACK: Z1 DEMO SOURCE
    ================================ */
    if (!product && window.getSingleProduct) {
      product = await window.getSingleProduct(id);
    }

    if (!product) {
      container.innerHTML =
        "<p style='text-align:center'>Product not found.</p>";
      return;
    }

    /* ===============================
       3. NORMALIZE DATA
    ================================ */
    const images = product.gallery?.length
      ? product.gallery
      : [product.image];

    /* ===============================
       4. RENDER
    ================================ */
    container.innerHTML = `
      <div class="product-layout">
        <div class="product-gallery">
          <div class="thumb-main">
            <img id="mainImage" src="${images[0]}" alt="${product.title}">
          </div>
          <div class="thumb-row">
            ${images
        .map(
          (src) =>
            `<img class="thumb" src="${src}" data-src="${src}" alt="">`
        )
        .join("")}
          </div>
        </div>

        <div class="product-details">
          <h1 class="product-title">${product.title}</h1>
          <p class="product-desc">${product.description || ""}</p>
          <div class="product-price">${product.price}</div>

          <div class="product-meta">
            ${product.brand ? `<div><b>Brand:</b> ${product.brand}</div>` : ""}
            ${product.category
        ? `<div><b>Category:</b> ${product.category}</div>`
        : ""
      }
          </div>

          <div class="product-actions">
            <input id="qtyInput" type="number" min="1" value="1">
            <button id="addToCartBtn" class="btn-primary">
              Add to cart
            </button>
          </div>
        </div>
      </div>
    `;

    /* ===============================
       5. GALLERY SWITCH
    ================================ */
    const mainImg = document.getElementById("mainImage");
    container.querySelectorAll(".thumb").forEach((t) => {
      t.addEventListener("click", () => {
        mainImg.src = t.dataset.src;
      });
    });

    /* ===============================
       6. CART LOGIC
    ================================ */
    const cartBtn = document.getElementById("addToCartBtn");
    cartBtn.addEventListener("click", () => {
      const qty = Math.max(
        1,
        parseInt(document.getElementById("qtyInput").value || 1)
      );

      const cart =
        JSON.parse(localStorage.getItem("pd_cart")) || [];

      const existing = cart.find((i) => i.id === product.id);
      if (existing) existing.qty += qty;
      else
        cart.push({
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          qty,
        });

      localStorage.setItem("pd_cart", JSON.stringify(cart));

      document.dispatchEvent(new CustomEvent("cart:updated"));

      cartBtn.textContent = "Added ✓";
      setTimeout(() => (cartBtn.textContent = "Add to cart"), 1200);
    });
  } catch (err) {
    console.error("Product page error:", err);
    container.innerHTML =
      "<p style='text-align:center'>Failed to load product.</p>";
  }
})();
