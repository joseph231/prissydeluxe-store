// /js/products/filters.js
// Binds the search input and category select to redirect to shop page with params
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');

  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const q = searchInput.value.trim();
        const cat = categoryFilter?.value || '';
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (cat) params.set('category', cat);
        window.location.href = '/html/shop.html?' + params.toString();
      }
    });
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
      const q = searchInput?.value.trim() || '';
      const cat = categoryFilter.value;
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (cat) params.set('category', cat);
      window.location.href = '/html/shop.html?' + params.toString();
    });
  }
});
