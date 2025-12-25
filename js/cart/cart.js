// /js/cart/cart.js
// Centralized and stable client-side cart manager.

(function () {

  const CART_KEY = "pd_cart";

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function normalizeItem(item) {
    return {
      id: item.id,
      title: item.title || "Untitled",
      image: item.image || "",
      price: Number(String(item.price).replace(/[^0-9]/g, "")) || 0,
      quantity: Number(item.quantity || 1)
    };
  }

  function addToCart(item) {
    const cart = getCart();
    const clean = normalizeItem(item);

    const existing = cart.find(p => String(p.id) === String(clean.id));
    if (existing) existing.quantity += clean.quantity;
    else cart.push(clean);

    saveCart(cart);
  }

  function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
  }

  function clearCart() {
    saveCart([]);
  }

  function renderCart() {
    const container = document.getElementById("cartList");
    const totals = document.getElementById("cartTotals");
    if (!container || !totals) return;

    const items = getCart();
    container.innerHTML = "";

    if (!items.length) {
      container.innerHTML = "<p>Your cart is empty.</p>";
      totals.innerHTML = "<strong>Total: ₦0</strong>";
      return;
    }

    let subtotal = 0;

    items.forEach((item, index) => {
      subtotal += item.price * item.quantity;

      container.innerHTML += `
        <div class="cart-row">
          <img src="${item.image}">
          <div>
            <strong>${item.title}</strong>
            <div>₦${item.price.toLocaleString()}</div>
            <div>
              <button data-i="${index}" class="minus">−</button>
              <span>${item.quantity}</span>
              <button data-i="${index}" class="plus">+</button>
              <button data-i="${index}" class="remove">Remove</button>
            </div>
          </div>
        </div>`;
    });

    totals.innerHTML = `<strong>Total: ₦${subtotal.toLocaleString()}</strong>`;

    document.querySelectorAll(".minus").forEach(b =>
      b.onclick = () => {
        const c = getCart();
        if (c[b.dataset.i].quantity > 1) {
          c[b.dataset.i].quantity--;
          saveCart(c);
          renderCart();
        }
      }
    );

    document.querySelectorAll(".plus").forEach(b =>
      b.onclick = () => {
        const c = getCart();
        c[b.dataset.i].quantity++;
        saveCart(c);
        renderCart();
      }
    );

    document.querySelectorAll(".remove").forEach(b =>
      b.onclick = () => {
        removeFromCart(b.dataset.i);
        renderCart();
      }
    );
  }

  window.pdCart = { getCart, addToCart, clearCart, renderCart };
})();
