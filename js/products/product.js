// product.js — FINAL, STABLE, ID-CONSISTENT

console.log("product.js loaded");

const BASE_PRODUCTS = [
  {
    id: "demo-1",
    title: "Royal Rose Elixir",
    price: "₦45,000",
    image: "assets/images/products/p1.jpg",
    description: "Elegant rose fragrance"
  },
  {
    id: "demo-2",
    title: "Amber Noir Essence",
    price: "₦55,000",
    image: "assets/images/products/p2.jpg",
    description: "Warm amber tones"
  },
  {
    id: "demo-3",
    title: "Velvet Oud Parfum",
    price: "₦60,000",
    image: "assets/images/products/p3.jpg",
    description: "Deep oud luxury"
  },
  {
    id: "demo-4",
    title: "Lilac Whisper Mist",
    price: "₦38,000",
    image: "assets/images/products/p4.jpg",
    description: "Soft floral notes"
  },
  {
    id: "demo-5",
    title: "Citrus Bloom Fresh",
    price: "₦32,000",
    image: "assets/images/products/p5.jpg",
    description: "Bright citrus scent"
  }
];

// Expand to ~30 products
let ALL_PRODUCTS = [];
for (let i = 0; i < 6; i++) {
  BASE_PRODUCTS.forEach(p => {
    ALL_PRODUCTS.push({
      ...p,
      id: `${p.id}-${i}`
    });
  });
}

// SHOP FETCH
window.fetchProductsFromSupabase = async function ({ page, perPage, q }) {
  let results = [...ALL_PRODUCTS];

  if (q) {
    results = results.filter(p =>
      p.title.toLowerCase().includes(q.toLowerCase())
    );
  }

  const start = (page - 1) * perPage;
  return results.slice(start, start + perPage);
};

// SINGLE PRODUCT
window.getSingleProduct = async function (id) {
  return ALL_PRODUCTS.find(p => p.id === id) || null;
};
