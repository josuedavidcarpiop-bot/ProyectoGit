// cart.js - manejo de carrito en localStorage (simulado)
const CART_KEY = 'utp_marketplace_cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function addToCart(productId) {
  const cart = getCart();
  cart.push({ id: productId, addedAt: Date.now() });
  saveCart(cart);
  alert('Producto agregado al carrito');
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartCount();
}

function updateCartCount() {
  const count = getCart().length || 0;
  const badges = document.querySelectorAll('#cart-count, #cart-count-2');
  badges.forEach(b => b.textContent = count);
}

async function renderCartList() {
  const listEl = document.getElementById('cart-list');
  if (!listEl) return;

  const cart = getCart();
  if (cart.length === 0) {
    listEl.innerHTML = '<p>El carrito está vacío.</p>';
    return;
  }

  const counts = {};
  cart.forEach(item => counts[item.id] = (counts[item.id] || 0) + 1);
  const ids = Object.keys(counts);

  const API = "http://localhost:3000";
  const rows = [];
  for (const id of ids) {
    try {
      const res = await fetch(`${API}/producto/${id}`);
      if (res.ok) {
        const p = await res.json();
        rows.push({ product: p, qty: counts[id] });
      }
    } catch (err) {
      console.error('Error fetch producto carrito', err);
    }
  }

  listEl.innerHTML = '';
  let total = 0;
  rows.forEach(r => {
    const subtotal = (r.product.precio || 0) * r.qty;
    total += subtotal;
    const node = document.createElement('div');
    node.className = 'd-flex align-items-center gap-3 mb-3 tarjeta-producto p-3';
    node.innerHTML = `
      <img src="img/default.jpg" style="width:84px;height:84px;object-fit:cover;border-radius:6px;">
      <div class="flex-grow-1">
        <h5 class="mb-1">${r.product.nombre}</h5>
        <p class="mb-1 text-muted">${r.product.categoria || ''}</p>
        <p class="mb-0">S/ ${ (r.product.precio || 0).toFixed(2) } x ${r.qty} = S/ ${ subtotal.toFixed(2) }</p>
      </div>
      <div>
        <button class="btn btn-sm btn-outline-danger remove-item" data-id="${r.product.id}">Eliminar</button>
      </div>
    `;
    listEl.appendChild(node);
  });

  const totalNode = document.createElement('div');
  totalNode.className = 'mt-4 text-end';
  totalNode.innerHTML = `<h4>Total: S/ ${total.toFixed(2)}</h4>`;
  listEl.appendChild(totalNode);

  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = Number(e.currentTarget.dataset.id);
      removeFromCart(id);
    });
  });

  const clearBtn = document.getElementById('clear-cart');
  if (clearBtn) clearBtn.addEventListener('click', () => { clearCart(); renderCartList(); });

  const checkoutBtn = document.getElementById('checkout');
  if (checkoutBtn) checkoutBtn.addEventListener('click', () => {
    alert('Compra simulada finalizada. Carrito vacío.');
    clearCart();
    renderCartList();
  });
}

function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== id);
  saveCart(cart);
  renderCartList();
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  renderCartList();
});
