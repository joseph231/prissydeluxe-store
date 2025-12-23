// /js/cart/checkout.js
// Full checkout handler: WhatsApp orders + Bank Transfer + Supabase Email

document.addEventListener("DOMContentLoaded", () => {

  /* ---------------------------
     LOAD CART
  ----------------------------*/
  const cart = window.pdCart?.getCart() || [];
  const itemContainer = document.getElementById("checkout-items");
  const totalsContainer = document.getElementById("checkoutTotals");

  renderCheckoutItems();
  renderTotals();

  /* ---------------------------
     RENDER ITEMS
  ----------------------------*/
  function renderCheckoutItems() {
    if (!itemContainer) return;

    if (cart.length === 0) {
      itemContainer.innerHTML = `<p>Your cart is empty.</p>`;
      return;
    }

    itemContainer.innerHTML = cart.map(i => `
      <div class="checkout-row">
        <strong>${i.title}</strong>
        <div>Qty: ${i.quantity}</div>
        <div>₦${Number(i.price).toLocaleString()}</div>
      </div>
    `).join("");
  }

  /* ---------------------------
     TOTAL CALCULATIONS
  ----------------------------*/
  function renderTotals() {
    if (!totalsContainer) return;

    let subtotal = 0;
    cart.forEach(i => subtotal += Number(i.price) * i.quantity);

    totalsContainer.innerHTML = `
      <p>Subtotal: ₦${subtotal.toLocaleString()}</p>
      <p>Shipping: ₦0</p>
      <h3>Total: ₦${subtotal.toLocaleString()}</h3>
    `;
  }

  /* ===========================================================
     1. ORDER VIA WHATSAPP
     ===========================================================*/
  document.getElementById("orderWhatsapp")?.addEventListener("click", () => {
    if (cart.length === 0) return alert("Your cart is empty.");

    const phone = "234 8108405835"; // ADMIN NUMBER

    const summary = cart
      .map(i => `${i.title} (x${i.quantity}) - ₦${i.price.toLocaleString()}`)
      .join("%0A");

    const total = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);

    const msg = encodeURIComponent(
      `Hello, I want to place an order:%0A%0A${summary}%0A%0ATotal: ₦${total.toLocaleString()}`
    );

    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  });

  /* ===========================================================
     2. BANK TRANSFER SECTION
     ===========================================================*/
  const bankDetails = document.getElementById("bankDetailsSection");
  if (bankDetails) {
    bankDetails.innerHTML = `
      <h3>Bank Transfer Details</h3>
      <p><strong>Bank Name:</strong> GTBank</p>
      <p><strong>Account Name:</strong> Priscilia Ogbonna</p>
      <p><strong>Account Number:</strong> 0210409779</p>

      <div style="margin-top:15px">
        <label><strong>Upload Payment Receipt</strong></label>
        <input type="file" id="uploadReceipt" />
      </div>

      <button id="submitReceipt"
        style="margin-top:12px;padding:10px 14px;background:black;color:white;border-radius:6px;">
        Send Receipt to Admin
      </button>

      <p id="receiptStatus" style="margin-top:10px;"></p>
    `;
  }

  /* ===========================================================
     3. SEND ORDER EMAIL VIA SUPABASE EDGE FUNCTION
     ===========================================================*/
  async function sendOrderEmail(cart) {
    const total = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);

    const payload = {
      email: "admin@prissydeluxe.store",
      items: cart.map(i => ({
        name: i.title,
        qty: i.quantity,
        price: i.price
      })),
      total
    };

    const res = await fetch(
      "https://knjojfphqdpbrqbfrspx.supabase.co/functions/v1/send-order-email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    if (!res.ok) throw new Error("Email send failed");
    return await res.json();
  }

  /* ---------------------------
     HANDLE RECEIPT SUBMISSION
  ----------------------------*/
  document.getElementById("submitReceipt")?.addEventListener("click", async () => {
    const status = document.getElementById("receiptStatus");

    if (cart.length === 0) {
      status.textContent = "Your cart is empty.";
      status.style.color = "red";
      return;
    }

    status.textContent = "Sending order to admin...";
    status.style.color = "#333";

    try {
      await sendOrderEmail(cart);
      status.textContent = "Order successfully sent to admin.";
      status.style.color = "green";
    } catch (err) {
      status.textContent = "Failed to send order. Try again.";
      status.style.color = "red";
    }
  });

});
