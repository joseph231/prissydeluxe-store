// /js/ui/darkmode.js
// Very small theme toggler stored in localStorage
(function(){
  const key = 'pd_theme';
  const html = document.documentElement;
  const stored = localStorage.getItem(key);
  if (stored === 'dark') html.setAttribute('data-theme', 'dark');

  // global toggle function (call from UI if needed)
  window.pdToggleTheme = function() {
    if (html.getAttribute('data-theme') === 'dark') {
      html.removeAttribute('data-theme');
      localStorage.setItem(key, 'light');
    } else {
      html.setAttribute('data-theme', 'dark');
      localStorage.setItem(key, 'dark');
    }
  };
})();
