// Simple demo "cart" carried through the URL as a ?cart= param.
// (No localStorage/sessionStorage used, so this works the same whether
// you open the files directly or host them.)

const PRODUCTS = {
  'cedar-smoke':   { name: 'Cedar & Smoke',   price: 28, color: '#7a5c3e', page: 'product-cedar-smoke.html' },
  'sea-salt-fig':  { name: 'Sea Salt Fig',    price: 24, color: '#8fa89e', page: 'product-sea-salt-fig.html' },
  'amber-moss':    { name: 'Amber & Moss',    price: 32, color: '#a8522f', page: 'product-amber-moss.html' },
  'quiet-library': { name: 'Quiet Library',   price: 26, color: '#4a5c45', page: 'product-quiet-library.html' }
};

function getCart() {
  const params = new URLSearchParams(window.location.search);
  const c = params.get('cart');
  try { return c ? JSON.parse(decodeURIComponent(c)) : []; } catch (e) { return []; }
}

let cart = getCart();

function cartQuery() {
  return 'cart=' + encodeURIComponent(JSON.stringify(cart));
}

// Rewrites every link marked data-nav="somepage.html" to carry the current cart forward
function refreshNavLinks() {
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.setAttribute('href', el.getAttribute('data-nav') + '?' + cartQuery());
  });
  document.querySelectorAll('#cart-count').forEach(el => {
    el.textContent = cart.length;
  });
}

function addToCart(id) {
  const p = PRODUCTS[id];
  if (!p) return;
  cart.push({ id, name: p.name, price: p.price });
  refreshNavLinks();

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'add_to_cart',
    ecommerce: { items: [{ item_name: p.name, price: p.price }] }
  });
  console.log('dataLayer push: add_to_cart', p.name, p.price);

  const btn = document.getElementById('add-btn-' + id) || document.getElementById('add-btn');
  if (btn) {
    const original = btn.textContent;
    btn.textContent = 'Added ✓';
    setTimeout(() => { btn.textContent = original; }, 900);
  }
}

function renderCartPage() {
  const list = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  if (!list) return;

  if (cart.length === 0) {
    list.innerHTML = '<p>Your cart is empty. <a href="index.html">Back to shop</a>.</p>';
    if (totalEl) totalEl.textContent = '';
    return;
  }

  list.innerHTML = cart.map(i =>
    `<div class="cart-item"><span>${i.name}</span><span>$${i.price.toFixed(2)}</span></div>`
  ).join('');

  const total = cart.reduce((sum, i) => sum + i.price, 0);
  if (totalEl) totalEl.textContent = 'Total: $' + total.toFixed(2);
}

function checkout() {
  const total = cart.reduce((sum, i) => sum + i.price, 0);

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'purchase',
    ecommerce: {
      value: total,
      currency: 'USD',
      items: cart.map(i => ({ item_name: i.name, price: i.price }))
    }
  });
  console.log('dataLayer push: purchase', total);

  document.getElementById('cart-view').style.display = 'none';
  const conf = document.getElementById('confirmation');
  conf.style.display = 'block';
  conf.querySelector('#order-total').textContent = 'Order total: $' + total.toFixed(2);
}

document.addEventListener('DOMContentLoaded', () => {
  refreshNavLinks();
  renderCartPage();
});
