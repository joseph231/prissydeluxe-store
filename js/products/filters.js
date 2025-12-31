// /js/products/filters.js
// Handles search and category filter redirection to shop page
// Architecture preserved, behavior hardened

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');

  // If neither control exists, do nothing
  if (!searchInput && !categoryFilter) return;

  /**
   * Builds query params and redirects to shop page
   */
  function redirectToShop(query, category) {
    const params = new URLSearchParams();

    if (query) params.set('q', query);
    if (category) params.set('category', category);

    const targetUrl = '/html/shop.html' + (params.toString() ? `?${params}` : '');

    // Prevent redundant redirects
    if (window.location.pathname + window.location.search === targetUrl) return;

    window.location.href = targetUrl;
  }

  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key !== 'Enter') return;

      const q = searchInput.value.trim();
      const cat = categoryFilter ? categoryFilter.value : '';

      redirectToShop(q, cat);
    });
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
      const q = searchInput ? searchInput.value.trim() : '';
      const cat = categoryFilter.value;

      redirectToShop(q, cat);
    });
  }
});
