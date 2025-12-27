// /js/cart/checkout.js
// Checkout: WhatsApp + Bank Transfer + Email (Supabase Edge Function)

document.addEventListener("DOMContentLoaded", () => {

  const cart = window.pdCart.getCart();
  const itemContainer = document.getElementById("checkout-items");
  const totalsContainer = document.getElementById("checkoutTotals");

  renderItems();
  renderTotals();

  /* ----------------------------------
     RENDER ITEMS
  ----------------------------------- */
  function renderItems() {
    if (!itemContainer) return;

    if (cart.length === 0) {
      itemContainer.innerHTML = "<p>Your cart is empty.</p>";
      return;
    }

    itemContainer.innerHTML = cart.map(i => `
      <div class="checkout-row">
        <strong>${i.title}</strong>
        <span>Qty: ${i.quantity}</span>
        <span>₦${Number(i.price).toLocaleString()}</span>
      </div>
    `).join("");
  }

  /* ----------------------------------
     TOTALS
  ----------------------------------- */
  function renderTotals() {
    if (!totalsContainer) return;

    const subtotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);

    totalsContainer.innerHTML = `
      <p>Subtotal: ₦${subtotal.toLocaleString()}</p>
      <p>Shipping: ₦0</p>
      <h3>Total: ₦${subtotal.toLocaleString()}</h3>
    `;
  }

  /* ----------------------------------
     WHATSAPP ORDER
  ----------------------------------- */
  document.getElementById("orderWhatsapp")?.addEventListener("click", () => {
    if (!cart.length) return alert("Your cart is empty.");

    const phone = "2348108405835";
    const summary = cart.map(i =>
      `${i.title} (x${i.quantity}) - ₦${i.price.toLocaleString()}`
    ).join("%0A");

    const total = cart.reduce((a, i) => a + i.price * i.quantity, 0);

    window.open(
      `https://wa.me/${phone}?text=Order:%0A${summary}%0ATotal: ₦${total.toLocaleString()}`,
      "_blank"
    );
  });

  /* ----------------------------------
     EMAIL ORDER
  ----------------------------------- */
  async function sendOrderEmail() {
    const total = cart.reduce((a, i) => a + i.price * i.quantity, 0);

    const res = await fetch(
      "https://knjojfphqdpbrqbfrspx.supabase.co/functions/v1/send-order-email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${window.SUPABASE_ANON_KEY}`,
          "apikey": window.SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          email: "admin@prissydeluxe.store",
          items: cart,
          total
        })
      }
    );

    if (!res.ok) throw new Error(await res.text());
  }

  document.getElementById("submitReceipt")?.addEventListener("click", async () => {
    const status = document.getElementById("receiptStatus");

    status.textContent = "Sending order...";
    status.style.color = "#333";

    try {
      await sendOrderEmail();
      status.textContent = "Order sent successfully.";
      status.style.color = "green";
      window.pdCart.clearCart();
    } catch {
      status.textContent = "Failed to send order.";
      status.style.color = "red";
    }
  });

});
