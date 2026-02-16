import { loadProducts } from "./categoryloader.js";

window.addEventListener("scroll", () => {

    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.body.offsetHeight - 200;

    if (scrollPosition >= threshold) {
        loadProducts();
    }
});
