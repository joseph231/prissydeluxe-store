// /js/products/product-page.js
// Loads product for product.html and wires add-to-cart with localStorage + mini-cart update.

(async function(){
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const container = document.getElementById('productContainer');
  if(!container) return;

  container.innerHTML = '<p style="text-align:center;color:#888">Loading product…</p>';

  try{
    let product = null;

    if(window.supabase && id){
      const { data, error } = await window.supabase.from('products').select('*').eq('id', id).single();
      if(error) throw error;
      product = data;
    }

    if(!product){
      // demo fallback
      product = {
        id: id || 'demo-1',
        title: 'Sample Product',
        description: 'Sample description — replace with product copy.',
        price: '₦12,000',
        image: '../assets/images/products/sample1.jpg',
        brand: 'PRISSYDELUXE',
        fragrance: 'Floral Amber',
        notes: 'Top: bergamot, heart: rose, base: sandalwood',
        category: 'Perfume',
        gallery: [
          '../assets/images/products/sample1.jpg',
          '../assets/images/products/sample2.jpg',
          '../assets/images/products/sample3.jpg'
        ]
      };
    }

    // Render: gallery left (stacked on mobile) + details
    container.innerHTML = `
      <div class="product-layout" style="display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:start">
        <div class="product-gallery" aria-label="Product images">
          <div class="thumb-main" style="background-image:url('${product.image}');height:420px;background-size:cover;border-radius:8px"></div>
          <div style="display:flex;gap:8px;margin-top:12px;">
            ${ (product.gallery || [product.image]).map(src => `<div class="thumb-small" style="width:80px;height:80px;background-image:url('${src}');background-size:cover;border-radius:6px;cursor:pointer" data-src="${src}"></div>`).join('') }
          </div>
        </div>

        <div class="product-details">
          <h2 style="font-family:${encodeURIComponent("Cormorant Garamond")}, serif">${product.title}</h2>
          <p style="color:#444;margin-top:8px">${product.description || ''}</p>
          <p style="margin-top:12px;font-weight:700">${product.price || ''}</p>

          <div style="margin-top:14px">
            <div><strong>Brand:</strong> ${product.brand || ''}</div>
            <div><strong>Fragrance:</strong> ${product.fragrance || ''}</div>
            <div style="margin-top:6px"><strong>Notes:</strong> ${product.notes || ''}</div>
            <div style="margin-top:10px"><strong>Category:</strong> ${product.category || ''}</div>
          </div>

          <div style="margin-top:20px;display:flex;gap:12px;align-items:center">
            <button id="addToCart" class="auth-btn">Add to cart</button>
            <a id="buyNow" href="./checkout.html" class="auth-btn" style="background:#444;text-decoration:none;color:#fff;padding:12px 18px;border-radius:8px">Order now</a>
            <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
              <label style="font-size:14px;color:#666">Qty</label>
              <input id="qtyInput" type="number" min="1" value="1" style="width:72px;padding:8px;border-radius:8px;border:1px solid #ddd" />
            </div>
          </div>
        </div>
      </div>
    `;

    // Thumb click -> change main
    const mainThumb = container.querySelector('.thumb-main');
    container.querySelectorAll('.thumb-small').forEach(el=>{
      el.addEventListener('click', ()=> {
        const s = el.dataset.src;
        mainThumb.style.backgroundImage = `url('${s}')`;
      });
    });

    function updateMiniCartUI(){
      // find cart count span (if exists)
      const cspan = document.querySelector('#navCartCount');
      const cart = JSON.parse(localStorage.getItem('pd_cart')||'[]');
      if(cspan) cspan.textContent = cart.reduce((s,i)=>s + (i.qty||1), 0);
    }
    updateMiniCartUI();

    document.getElementById('addToCart').addEventListener('click', ()=>{
      const qty = Math.max(1, parseInt(document.getElementById('qtyInput').value||1));
      const cart = JSON.parse(localStorage.getItem('pd_cart')||'[]');
      // if same id exists, increment qty
      const existing = cart.find(x=>x.id == product.id);
      if(existing){ existing.qty = (existing.qty || 1) + qty; }
      else { cart.push({id:product.id, title:product.title, price:product.price, image:product.image, qty}); }
      localStorage.setItem('pd_cart', JSON.stringify(cart));
      updateMiniCartUI();
      // show animated feedback (not alert)
      const btn = document.getElementById('addToCart');
      btn.textContent = 'Added ✓';
      btn.disabled = true;
      setTimeout(()=>{ btn.textContent = 'Add to cart'; btn.disabled = false; }, 1200);
    });

  } catch(err){
    console.error(err);
    container.innerHTML = '<p style="text-align:center;color:#888">Unable to load product.</p>';
  }
})();
