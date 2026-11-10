/**
 * CARTA DIGITAL EXPRESS • Maqueta Breborn.cl (V Región, Chile)
 * 1 sola pantalla estilo app de pedidos rápidos directo a WhatsApp
 */

const WHATSAPP_PHONE = '56956823670';

const MENU = [
  { id: 'p1', cat: 'promos', tag: 'AHORRA $1.500', emoji: '🔥', name: 'Promo Bajón: Churrasco + Papas + Lata', desc: 'Churrasco italiano en pan fresco, porción de papas fritas y bebida 350cc.', price: 7990 },
  { id: 'p2', cat: 'promos', tag: 'PARA 2', emoji: '🌭', name: 'Combo 2x Completos + 2 Bebidas', desc: 'Dos italianos gigantes con tomate fresco, palta molida y mayo casera.', price: 8990 },
  { id: 's1', cat: 'sandwiches', tag: 'TOP VENTAS', emoji: '🥩', name: 'Churrasco Italiano Especial', desc: 'Posta rosada a la plancha, palta fresca, tomate y mayo en frica o marraqueta.', price: 6490 },
  { id: 's2', cat: 'sandwiches', tag: '', emoji: '🧀', name: 'Barros Luco Clásico en Marraqueta', desc: 'Carne laminada a la plancha con abundante queso mantecoso fundido.', price: 5990 },
  { id: 's3', cat: 'sandwiches', tag: '', emoji: '🌭', name: 'Italiano Gigante Artesanal', desc: 'Vienesa premium 22 cm, palta hass molida al momento y tomate picado.', price: 3990 },
  { id: 'c1', cat: 'compartir', tag: 'CLÁSICO PORTEÑO', emoji: '🍟', name: 'Chorrillana Porteña XL (Para 2–3)', desc: 'Papas fritas caseras, vacuno salteado, cebolla caramelizada y 3 huevos.', price: 11990 },
  { id: 'c2', cat: 'compartir', tag: '', emoji: '🍕', name: 'Pizza Napolitana Familiar', desc: 'Masa delgada piedra, salsa de tomate italiana, mozzarella, tomate y aceitunas.', price: 10990 },
  { id: 'c3', cat: 'compartir', tag: '', emoji: '🥟', name: 'Empanadas de Pino Horno (Pack x4)', desc: 'Recién horneadas con carne picada, aceituna, huevo y un toque de merquén.', price: 7990 },
  { id: 'b1', cat: 'bebidas', tag: '', emoji: '🥤', name: 'Bebida en Lata 350cc Helada', desc: 'Coca-Cola Original / Zero, Fanta, Sprite o Canada Dry.', price: 1800 },
  { id: 'b2', cat: 'bebidas', tag: 'NATURAL', emoji: '🍹', name: 'Jugo Natural de Temporada 500cc', desc: 'Frutilla-menta, mango o limonada con jengibre recién hecha.', price: 2990 }
];

const State = {
  cat: 'todos',
  query: '',
  cart: {}, // id -> qty
  deliveryMode: 'Retiro en Local',
  deliveryFee: 0
};

const formatCLP = (n) => '$' + Number(n).toLocaleString('es-CL');

document.addEventListener('DOMContentLoaded', () => {
  initFilters();
  initSheet();
  renderMenu();
  updateBar();
});

function initFilters() {
  document.querySelectorAll('#catTabs .cat-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#catTabs .cat-pill').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      State.cat = btn.dataset.cat;
      renderMenu();
    });
  });

  document.getElementById('menuSearch').addEventListener('input', (e) => {
    State.query = e.target.value.trim().toLowerCase();
    renderMenu();
  });
}

function renderMenu() {
  const list = document.getElementById('menuList');
  const items = MENU.filter((it) => {
    if (State.cat !== 'todos' && it.cat !== State.cat) return false;
    if (State.query && !(`${it.name} ${it.desc}`.toLowerCase().includes(State.query))) return false;
    return true;
  });

  if (items.length === 0) {
    list.innerHTML = '<div class="empty-filter">No encontramos platos con esa búsqueda. Prueba limpiando el filtro 🔍</div>';
    return;
  }

  list.innerHTML = items.map((it) => {
    const qty = State.cart[it.id] || 0;
    return `
      <article class="menu-item ${qty > 0 ? 'in-cart' : ''}">
        <div class="mi-left">
          <div class="mi-emoji">${it.emoji}</div>
          <div>
            ${it.tag ? `<span class="mi-tag">${it.tag}</span>` : ''}
            <h3>${it.name}</h3>
            <p class="mi-desc">${it.desc}</p>
            <span class="mi-price">${formatCLP(it.price)}</span>
          </div>
        </div>
        <div class="mi-right">
          ${
            qty === 0
              ? `<button type="button" class="btn-add" onclick="setQty('${it.id}', 1)">+ Agregar</button>`
              : `<div class="qty-stepper">
                   <button type="button" class="step-btn" onclick="setQty('${it.id}', ${qty - 1})">−</button>
                   <strong>${qty}</strong>
                   <button type="button" class="step-btn" onclick="setQty('${it.id}', ${qty + 1})">+</button>
                 </div>`
          }
        </div>
      </article>
    `;
  }).join('');
}

window.setQty = function (id, newQty) {
  if (newQty <= 0) {
    delete State.cart[id];
  } else {
    State.cart[id] = newQty;
    showToast('✓ Agregado al pedido');
  }
  renderMenu();
  updateBar();
  renderSheet();
};

function getCartTotals() {
  let count = 0;
  let subtotal = 0;
  Object.entries(State.cart).forEach(([id, qty]) => {
    const it = MENU.find((m) => m.id === id);
    if (it && qty > 0) {
      count += qty;
      subtotal += it.price * qty;
    }
  });
  return { count, subtotal };
}

function updateBar() {
  const { count, subtotal } = getCartTotals();
  document.getElementById('barCount').textContent = count;
  document.getElementById('barTotal').textContent = formatCLP(subtotal);
}

function initSheet() {
  document.getElementById('openOrderModalBtn').addEventListener('click', openSheet);
  document.getElementById('closeSheetBtn').addEventListener('click', closeSheet);
  document.getElementById('sheetBackdrop').addEventListener('click', closeSheet);

  document.querySelectorAll('#deliverySwitch .ms-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#deliverySwitch .ms-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      State.deliveryMode = btn.dataset.mode;
      State.deliveryFee = Number(btn.dataset.fee);
      document.getElementById('addressWrap').style.display = State.deliveryFee > 0 ? 'block' : 'none';
      renderSheet();
    });
  });

  document.getElementById('sendWaOrderBtn').addEventListener('click', sendWaOrder);
}

function openSheet() {
  const { count } = getCartTotals();
  if (count === 0) {
    showToast('Agrega al menos 1 producto de la carta primero');
    return;
  }
  renderSheet();
  document.getElementById('orderSheet').classList.add('open');
  document.getElementById('sheetBackdrop').classList.add('open');
}

function closeSheet() {
  document.getElementById('orderSheet').classList.remove('open');
  document.getElementById('sheetBackdrop').classList.remove('open');
}

function renderSheet() {
  const { count, subtotal } = getCartTotals();
  const delFee = count > 0 ? State.deliveryFee : 0;
  const grand = subtotal + delFee;

  const lines = [];
  Object.entries(State.cart).forEach(([id, qty]) => {
    const it = MENU.find((m) => m.id === id);
    if (it && qty > 0) {
      lines.push(`
        <div class="sheet-item-row">
          <div><strong>${qty}x ${it.name}</strong></div>
          <div><strong>${formatCLP(it.price * qty)}</strong></div>
        </div>
      `);
    }
  });

  document.getElementById('sheetItems').innerHTML = lines.join('');
  document.getElementById('sheetSubtotal').textContent = formatCLP(subtotal);
  document.getElementById('sheetDelivery').textContent = formatCLP(delFee);
  document.getElementById('sheetGrandTotal').textContent = formatCLP(grand);
}

function sendWaOrder() {
  const { count, subtotal } = getCartTotals();
  if (count === 0) return;

  const name = document.getElementById('custName').value.trim();
  const addr = document.getElementById('custAddress').value.trim();
  const pay = document.getElementById('payMethod').value;
  const notes = document.getElementById('custNotes').value.trim();

  if (!name) {
    showToast('Escribe tu nombre para enviar el pedido');
    document.getElementById('custName').focus();
    return;
  }
  if (State.deliveryFee > 0 && !addr) {
    showToast('Escribe la dirección para el delivery');
    document.getElementById('custAddress').focus();
    return;
  }

  const itemLines = Object.entries(State.cart)
    .filter(([, q]) => q > 0)
    .map(([id, q]) => {
      const it = MENU.find((m) => m.id === id);
      return `• ${q}x ${it.name} — ${formatCLP(it.price * q)}`;
    });

  const total = subtotal + State.deliveryFee;
  const msg = [
    `¡Hola! 🍔 Pedido vía *Carta Express* de *LA PICADA DEL PUERTO*:`,
    ``,
    ...itemLines,
    ``,
    `Subtotal: ${formatCLP(subtotal)}`,
    `Entrega: ${State.deliveryMode} (${formatCLP(State.deliveryFee)})`,
    `💰 *Total:* ${formatCLP(total)}`,
    ``,
    `👤 Nombre: ${name}`,
    ...(State.deliveryFee > 0 ? [`📍 Dirección: ${addr}`] : []),
    `💳 Pago: ${pay}`,
    ...(notes ? [`📝 Notas: ${notes}`] : [])
  ].join('\n');

  window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window.__t);
  window.__t = setTimeout(() => t.classList.remove('show'), 2200);
}
