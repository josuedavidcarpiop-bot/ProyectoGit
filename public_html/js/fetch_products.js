// fetch_products.js - carga productos desde backend y pinta las tarjetas
const API = "http://localhost:3000";

async function loadCatalog() {
  try {
    const res = await fetch(`${API}/productos`);
    const productos = await res.json();

    const grid = document.getElementById('catalog-grid');
    if (!grid) return;

    grid.innerHTML = '';

    productos.forEach(p => {

  const img = p.imagen
    ? `/uploads/${p.imagen}`
    : 'img/default.png';

  const col = document.createElement('div');
  col.className = 'col-12 col-sm-6 col-md-4 col-lg-3 catalog-card-enter';

  col.innerHTML = `
    <div class="tarjeta-producto h-100 d-flex flex-column">
      <img src="${img}" class="imagen-producto" alt="${escapeHtml(p.nombre || '')}">
      <div class="info-producto mt-auto">
        <h3 class="titulo-producto">${escapeHtml(p.nombre || '')}</h3>
        <p class="carrera">${escapeHtml(p.categoria || '')}</p>
        <p class="precio">${formatPrecio(p.precio)}</p>
        <a href="producto.html?id=${p.id}" class="btn-detalle">Ver detalles</a>
        <button class="btn btn-sm btn-outline-danger mt-2 w-100 add-cart" data-id="${p.id}">Agregar al carrito</button>
      </div>
    </div>
  `;

  grid.appendChild(col);
});


    // listeners para botones agregar al carrito
    document.querySelectorAll('.add-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        addToCart(Number(id));
      });
    });

    updateCartCount();
  } catch (err) {
    console.error('Error cargando productos:', err);
  }
}

function formatPrecio(p) {
  return 'S/ ' + (Number(p) || 0).toFixed(2);
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/[&<>"'`=\/]/g, function (s) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#96;',
      '=': '&#61;'
    })[s];
  });
}


async function loadProductDetail() {
  const el = document.getElementById('product-detail');
  if (!el) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    el.innerHTML = '<p>Producto no especificado.</p>';
    return;
  }

  try {
    const res = await fetch(`${API}/producto/${id}`);
    if (!res.ok) {
      el.innerHTML = '<p>Producto no encontrado.</p>';
      return;
    }
    const p = await res.json();

    const img = p.imagen_url || 'img/default.png';

    el.innerHTML = `
      <div class="tarjeta-producto p-3">
        <div class="row g-4">
          <div class="col-md-5">
            <img src="${img}" alt="${escapeHtml(p.nombre)}" class="imagen-producto" style="height:100%;max-height:520px;">
          </div>
          <div class="col-md-7">
            <h2 class="titulo-producto">${escapeHtml(p.nombre)}</h2>
            <p class="carrera"><strong>Categoría:</strong> ${escapeHtml(p.categoria || '')}</p>
            <p class="precio">${formatPrecio(p.precio)}</p>
            <p style="margin-top:12px;">${escapeHtml(p.descripcion || '')}</p>
            <p><strong>Stock:</strong> ${p.stock ?? '-'}</p>
            <div class="mt-3">
              <button id="btn-add-detail" data-id="${p.id}" class="btn btn-danger">Agregar al carrito</button>
              <a href="catalogo.html" class="btn btn-outline-secondary ms-2">Volver al catálogo</a>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-add-detail').addEventListener('click', () => {
      addToCart(Number(p.id));
    });

    updateCartCount();
  } catch (err) {
    console.error('Error cargando detalle:', err);
  }
}

// iniciar carga según página
document.addEventListener('DOMContentLoaded', () => {
  loadCatalog();
  loadProductDetail();
});
