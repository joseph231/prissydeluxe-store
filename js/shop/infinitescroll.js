import { loadProducts } from "../shop/categoryloader.js";

window.addEventListener("scroll", () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 300) {
        loadProducts();
    }
});
