import { loadProducts } from "./categoryloader.js";

let ticking = false;

function handleScroll() {

    if (ticking) return;

    ticking = true;

    requestAnimationFrame(() => {

        const scrollPosition = window.innerHeight + window.scrollY;
        const threshold = document.body.offsetHeight - 300;

        if (scrollPosition >= threshold) {
            loadProducts();
        }

        ticking = false;
    });
}

/* INITIAL LOAD */
loadProducts();

/* SCROLL */
window.addEventListener("scroll", handleScroll);
