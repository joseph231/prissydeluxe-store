// /js/admin/admin-functions.js
document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('saveProduct');
  if (saveBtn) {
    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Admin save product: UI stub (implement supabase upload)');
    });
  }
});
