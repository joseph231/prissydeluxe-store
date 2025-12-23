// /js/ui/utils.js
export function formatCurrency(n) {
  return '₦' + Number(n).toLocaleString();
}
export function qs(sel, el=document) { return el.querySelector(sel); }
export function qsa(sel, el=document) { return Array.from(el.querySelectorAll(sel)); }
