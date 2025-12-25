// /js/cart/cart.js
// Centralized and stable client-side cart manager.
// Fully compatible with Supabase + local fallback mode.

(function () {

  /* ---------------------------
     CART STORAGE (LOCAL ONLY)
     --------------------------- */
  function getCart() {
    try {
      const raw = localStorage.getItem("pd_cart");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn("Failed to read cart:", e);
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem("pd_cart", JSON.stringify(cart));
    } catch (e) {
      console.warn("Failed to save cart:", e);
    }
  }

  /* ---------------------------
     NORMALIZATION HELPERS
     --------------------------- */
  function normalizeItem(item) {
    return {
      id: item.id,
      title: item.title || "Untitled",
      image: item.image || "",
      price: formatPriceToNumber(item.price),
      quantity: item.quantity ? Number(item.quantity) : 1
    };
  }

  function formatPriceToNumber(price) {
    if (price == null) return 0;
    if (typeof price === "number") return price;
    const clean = String(price).replace(/[^0-9.]/g, "");
    return Number(clean) || 0;
  }

  /* ---------------------------
     ADD / REMOVE / CLEAR
     --------------------------- */
  function addToCart(item) {
    const cart = getCart();
    const cleanItem = normalizeItem(item);

    const existing = cart.find(p => String(p.id) === String(cleanItem.id));

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push(cleanItem);
    }

    saveCart(cart);
  }

  function removeFromCart(index) {
    const cart = getCart();
    if (index >= 0 && index < cart.length) {
      cart.splice(index, 1);
      saveCart(cart);
    }
  }

  function clearCart() {
    localStorage.setItem("pd_cart", "[]");
  }

  /* ---------------------------
     CART PAGE RENDERING
     --------------------------- */
  function renderCart() {
    const container = document.getElementById("cartList");
    const totals = document.getElementById("cartTotals");
    if (!container || !totals) return;

    const items = getCart();
    container.innerHTML = "";

    if (items.length === 0) {
      container.innerHTML = `<p style="color:#666">Your cart is empty.</p>`;
      totals.innerHTML = `Subtotal: ₦0<br>Shipping: ₦0<br><strong>Total: ₦0</strong>`;
      return;
    }

    let subtotal = 0;

    items.forEach((item, index) => {
      const price = formatPriceToNumber(item.price);
      subtotal += price * item.quantity;

      const row = document.createElement("div");
      row.className = "cart-row";
      row.style.cssText = "display:flex;gap:12px;margin-bottom:12px;align-items:center";

      row.innerHTML = `
        <img src="${item.image}" 
             alt=""
             style="width:90px;height:90px;object-fit:cover;border-radius:6px" />

        <div style="flex:1">
          <div style="font-weight:700">${item.title}</div>
          <div style="color:#666">₦${price.toLocaleString()}</div>

          <div style="margin-top:6px;display:flex;gap:8px;align-items:center">
              <button class="qtyMinus" data-idx="${index}" 
                      style="padding:4px 10px;border:1px solid #ccc;background:#f7f7f7;border-radius:6px">-</button>

              <span>${item.quantity}</span>

              <button class="qtyPlus" data-idx="${index}" 
                      style="padding:4px 10px;border:1px solid #ccc;background:#f7f7f7;border-radius:6px">+</button>

              <button class="removeItem" data-idx="${index}" 
                      style="margin-left:10px;background:transparent;color:#b00;border:0">Remove</button>
          </div>
        </div>
      `;

      container.appendChild(row);
    });

    totals.innerHTML = `
      Subtotal: ₦${subtotal.toLocaleString()}<br>
      Shipping: ₦0<br>
      <strong>Total: ₦${subtotal.toLocaleString()}</strong>
    `;

    /* Quantity buttons */
    document.querySelectorAll(".qtyMinus").forEach(btn => {
      btn.onclick = () => {
        const idx = Number(btn.dataset.idx);
        const cart = getCart();
        if (cart[idx].quantity > 1) {
          cart[idx].quantity -= 1;
          saveCart(cart);
          renderCart();
        }
      };
    });

    document.querySelectorAll(".qtyPlus").forEach(btn => {
      btn.onclick = () => {
        const idx = Number(btn.dataset.idx);
        const cart = getCart();
        cart[idx].quantity += 1;
        saveCart(cart);
        renderCart();
      };
    });

    /* Remove item */
    document.querySelectorAll(".removeItem").forEach(btn => {
      btn.onclick = () => {
        removeFromCart(Number(btn.dataset.idx));
        renderCart();
      };
    });

    /* Clear cart */
    const clearBtn = document.getElementById("clearCart");
    if (clearBtn && !clearBtn.dataset.bound) {
      clearBtn.dataset.bound = "1";
      clearBtn.addEventListener("click", () => {
        clearCart();
        renderCart();
      });
    }
  }

  /* ---------------------------
     PUBLIC EXPORT
     --------------------------- */
  window.pdCart = {
    getCart,
    saveCart,
    addToCart,
    removeFromCart,
    clearCart,
    renderCart
  };

})();
