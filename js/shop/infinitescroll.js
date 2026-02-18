import { loadProducts } from "./category-loader.js";

let ticking = false;

function handleScroll() {

    if (ticking) return;

    ticking = true;

    requestAnimationFrame(() => {

        const scrollPosition = window.innerHeight + window.scrollY;
        const threshold = document.documentElement.scrollHeight - 200;

        if (scrollPosition >= threshold) {
            loadProducts();
        }

        ticking = false;
    });
}

/* INITIAL LOAD */
document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
});

/* SCROLL LISTENER */
window.addEventListener("scroll", handleScroll);
