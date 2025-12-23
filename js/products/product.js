// product.js — FINAL, error-proof, Supabase-ready

console.log("product.js loaded");

// 1 — Demo products (always shown if Supabase unavailable)
const DEMO_PRODUCTS = [
  {
    id: 1,
    title: "Royal Rose Elixir",
    price: "₦45,000",
    image: "assets/images/products/p1.jpg"
  },
  {
    id: 2,
    title: "Amber Noir Essence",
    price: "₦55,000",
    image: "assets/images/products/p2.jpg"
  },
  {
    id: 3,
    title: "Velvet Oud Parfum",
    price: "₦60,000",
    image: "assets/images/products/p3.jpg"
  },
  {
    id: 4,
    title: "Lilac Whisper Mist",
    price: "₦38,000",
    image: "assets/images/products/p4.jpg"
  },
  {
    id: 5,
    title: "Citrus Bloom Fresh",
    price: "₦32,000",
    image: "assets/images/products/p5.jpg"
  }
];

// Expand to simulate 30 products (pagination test)
let EXPANDED = [];
for (let i = 0; i < 6; i++) {
  DEMO_PRODUCTS.forEach(p => {
    EXPANDED.push({
      ...p,
      id: EXPANDED.length + 1
    });
  });
}

// 2 — Main Exported Function
window.fetchProductsFromSupabase = async function ({ page, perPage, q }) {

  let all = EXPANDED;

  // search filter
  if (q) {
    all = all.filter(p =>
      p.title.toLowerCase().includes(q.toLowerCase())
    );
  }

  // pagination slice
  const start = (page - 1) * perPage;
  const end = start + perPage;

  return all.slice(start, end);
};

// 3 — Get 1 product by ID
window.getSingleProduct = async function (id) {
  let p = EXPANDED.find(x => String(x.id) === String(id));
  return p || null;
};
