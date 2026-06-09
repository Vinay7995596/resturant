/* ============================================================
   STACKLY RESTAURANT — script.js
   ============================================================ */

/* ─── Global State ────────────────────────────────────────── */
const STACKLY = {
  currentUser: null,
  cart: [],
  orders: [],
  reservations: [],
  notifications: [],
  menuItems: [],
  theme: localStorage.getItem('stackly-theme') || 'dark',
};

/* ─── Init ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(STACKLY.theme);
  initLoadingScreen();
  initParticles();
  initTooltips();
  initRipple();
  initReveal();
  detectPage();
});

function detectPage() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  if (path === 'index.html' || path === '')     initAuthPage();
  if (path === 'signup.html')                   initSignupPage();
  if (path === 'forgot-password.html')          initForgotPage();
  if (path === 'customer-dashboard.html')       initCustomerDashboard();
  if (path === 'admin-dashboard.html')          initAdminDashboard();
}

/* ─── Theme ───────────────────────────────────────────────── */
function applyTheme(t) {
  STACKLY.theme = t;
  document.body.classList.toggle('light-theme', t === 'light');
  localStorage.setItem('stackly-theme', t);
  const toggles = document.querySelectorAll('[data-theme-toggle]');
  toggles.forEach(el => { if (el.tagName === 'INPUT') el.checked = (t === 'light'); });
}

/* ─── Loading Screen ──────────────────────────────────────── */
function initLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;
  setTimeout(() => {
    screen.classList.add('hidden');
    document.body.style.overflow = '';
    // Page-in animation
    const overlay = document.querySelector('.page-transition');
    if (overlay) { overlay.classList.add('out'); }
  }, 1900);
}

/* ─── Particle Canvas ─────────────────────────────────────── */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function randBetween(a, b) { return a + Math.random() * (b - a); }

  for (let i = 0; i < 55; i++) {
    particles.push({
      x: randBetween(0, W), y: randBetween(0, H),
      r: randBetween(1, 3),
      vx: randBetween(-0.3, 0.3), vy: randBetween(-0.5, -0.1),
      a: randBetween(0.2, 0.8),
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245,166,35,${p.a})`;
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.y < -5)  { p.y = H + 5; p.x = randBetween(0, W); }
      if (p.x < -5)  p.x = W + 5;
      if (p.x > W+5) p.x = -5;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ─── Ripple Effect ───────────────────────────────────────── */
function initRipple() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const circle = document.createElement('span');
    circle.classList.add('ripple-circle');
    const size = Math.max(rect.width, rect.height);
    circle.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
    btn.appendChild(circle);
    circle.addEventListener('animationend', () => circle.remove());
  });
}

/* ─── Scroll Reveal ───────────────────────────────────────── */
function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) en.target.classList.add('visible'); });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

function initTooltips() {} // Placeholder

/* ─── Toast System ────────────────────────────────────────── */
function showToast(msg, type = 'info', dur = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ️'}</span><span class="toast-msg">${msg}</span><span class="toast-close" onclick="this.parentElement.remove()">✕</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('removing'); setTimeout(() => toast.remove(), 300); }, dur);
}

/* ─── Navigation Helper ───────────────────────────────────── */
function goTo(page) {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.3s';
  setTimeout(() => { window.location.href = page; }, 300);
}
function go404() { goTo('404.html'); }

/* ─── Auth: Shared Utils ──────────────────────────────────── */
function validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function validatePassword(p) { return p && p.length >= 6; }
function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.add('show'); }
}
function clearError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}
function clearAllErrors() { document.querySelectorAll('.form-error').forEach(el => el.classList.remove('show')); }

/* ─── Logout ──────────────────────────────────────────────── */
function logout() {
  localStorage.removeItem('stackly-user');
  sessionStorage.clear();
  STACKLY.currentUser = null;
  STACKLY.cart = [];
  goTo('index.html');
}

/* ─── Password Toggle ─────────────────────────────────────── */
function initPasswordToggles() {
  document.querySelectorAll('.input-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const inp = btn.previousElementSibling || btn.closest('.input-wrapper').querySelector('input');
      if (!inp) return;
      const shown = inp.type === 'text';
      inp.type = shown ? 'password' : 'text';
      btn.textContent = shown ? '👁️' : '🙈';
    });
  });
}

/* ─── Remember Me ─────────────────────────────────────────── */
function loadRemembered() {
  const rem = localStorage.getItem('stackly-remember');
  if (!rem) return;
  try {
    const { email } = JSON.parse(rem);
    const emailInput = document.getElementById('login-email');
    const remCheck   = document.getElementById('remember-me');
    if (emailInput && email) emailInput.value = email;
    if (remCheck) remCheck.checked = true;
  } catch(e){}
}

/* ═══════════════════════════════════════════════════════════
   AUTH PAGE (index.html)
═══════════════════════════════════════════════════════════ */
function initAuthPage() {
  loadRemembered();
  initPasswordToggles();

  // Role tabs
  const tabs = document.querySelectorAll('.role-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      clearAllErrors();
    });
  });

  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      clearAllErrors();
      const email    = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const role     = document.querySelector('.role-tab.active')?.dataset.role || 'customer';
      let valid = true;

      if (!email)                { showError('email-error', 'Email is required.'); valid = false; }
      else if (!validateEmail(email)) { showError('email-error', 'Enter a valid email address.'); valid = false; }
      if (!password)             { showError('password-error', 'Password is required.'); valid = false; }
      else if (!validatePassword(password)) { showError('password-error', 'Password must be at least 6 characters.'); valid = false; }
      if (!valid) return;

      // Remember me
      const remCheck = document.getElementById('remember-me');
      if (remCheck?.checked) localStorage.setItem('stackly-remember', JSON.stringify({ email }));
      else localStorage.removeItem('stackly-remember');

      // Save session
      const user = { email, role, name: email.split('@')[0] };
      localStorage.setItem('stackly-user', JSON.stringify(user));
      STACKLY.currentUser = user;

      showToast('Login successful! Redirecting…', 'success', 1500);
      const loginBtn = document.getElementById('login-btn');
      if (loginBtn) { loginBtn.disabled = true; loginBtn.textContent = 'Signing in…'; }

      setTimeout(() => {
        if (role === 'admin' || role === 'chef') goTo('admin-dashboard.html');
        else goTo('customer-dashboard.html');
      }, 1600);
    });
  }

  // Animate counters in hero
  animateCounters();
}

/* ═══════════════════════════════════════════════════════════
   SIGNUP PAGE (signup.html)
═══════════════════════════════════════════════════════════ */
function initSignupPage() {
  initPasswordToggles();

  // Role tabs
  const tabs = document.querySelectorAll('.role-tab');
  const adminFields  = document.getElementById('admin-fields');
  const customerFields = document.getElementById('customer-fields');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const role = tab.dataset.role;
      if (adminFields)    adminFields.style.display    = (role === 'admin') ? 'block' : 'none';
      if (customerFields) customerFields.style.display = (role === 'customer') ? 'block' : 'none';
      clearAllErrors();
    });
  });

  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', e => {
      e.preventDefault();
      clearAllErrors();
      const role     = document.querySelector('.role-tab.active')?.dataset.role || 'customer';
      const name     = document.getElementById('signup-name').value.trim();
      const email    = document.getElementById('signup-email').value.trim();
      const mobile   = document.getElementById('signup-mobile').value.trim();
      const password = document.getElementById('signup-password').value;
      const confirm  = document.getElementById('signup-confirm').value;
      let valid = true;

      if (!name)               { showError('name-error', 'Full name is required.'); valid = false; }
      if (!email)              { showError('signup-email-error', 'Email is required.'); valid = false; }
      else if (!validateEmail(email)) { showError('signup-email-error', 'Enter a valid email.'); valid = false; }
      if (!mobile || mobile.length < 10) { showError('mobile-error', 'Enter a valid mobile number.'); valid = false; }
      if (!validatePassword(password)) { showError('signup-password-error', 'Password must be at least 6 characters.'); valid = false; }
      if (password !== confirm) { showError('confirm-error', 'Passwords do not match.'); valid = false; }

      if (role === 'admin') {
        const empId = document.getElementById('signup-empid')?.value.trim();
        if (!empId) { showError('empid-error', 'Employee ID is required.'); valid = false; }
      }
      if (!valid) return;

      const user = { email, role, name, mobile };
      localStorage.setItem('stackly-user', JSON.stringify(user));
      showToast('Account created! Redirecting to login…', 'success', 2000);
      const btn = document.getElementById('signup-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Creating Account…'; }
      setTimeout(() => goTo('index.html'), 2100);
    });
  }
}

/* ═══════════════════════════════════════════════════════════
   FORGOT PASSWORD PAGE
═══════════════════════════════════════════════════════════ */
function initForgotPage() {
  const form = document.getElementById('forgot-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    clearAllErrors();
    const email = document.getElementById('forgot-email').value.trim();
    if (!email)                { showError('forgot-email-error', 'Email is required.'); return; }
    if (!validateEmail(email)) { showError('forgot-email-error', 'Enter a valid email.'); return; }

    const btn = document.getElementById('forgot-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
    showToast('Reset link sent! Check your email.', 'success', 3000);
    setTimeout(() => {
      document.getElementById('forgot-step-1')?.classList.add('hidden');
      document.getElementById('forgot-step-2')?.classList.remove('hidden');
    }, 1500);
  });
}

/* ─── Counter Animation ───────────────────────────────────── */
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      el.textContent = Math.floor(start).toLocaleString() + suffix;
      if (start >= target) clearInterval(timer);
    }, 16);
  });
}

/* ═══════════════════════════════════════════════════════════
   CUSTOMER DASHBOARD
═══════════════════════════════════════════════════════════ */

// Sample data
const MENU_DATA = [
  { id:1, name:'Truffle Risotto', cat:'mains', price:24.99, emoji:'🍚', desc:'Creamy arborio rice with black truffle shavings and parmesan.' },
  { id:2, name:'Grilled Salmon', cat:'mains', price:28.99, emoji:'🐟', desc:'Atlantic salmon with lemon-herb butter and seasonal vegetables.' },
  { id:3, name:'Margherita Pizza', cat:'mains', price:18.99, emoji:'🍕', desc:'Classic tomato, fresh mozzarella, and basil on thin crust.' },
  { id:4, name:'Caesar Salad', cat:'starters', price:12.99, emoji:'🥗', desc:'Crisp romaine, housemade dressing, croutons, and shaved parmesan.' },
  { id:5, name:'Bruschetta', cat:'starters', price:9.99, emoji:'🍞', desc:'Toasted sourdough with tomato, garlic, basil and olive oil.' },
  { id:6, name:'Tiramisu', cat:'desserts', price:10.99, emoji:'🍰', desc:'Classic Italian dessert with mascarpone and espresso-soaked ladyfingers.' },
  { id:7, name:'Chocolate Lava', cat:'desserts', price:11.99, emoji:'🍫', desc:'Warm chocolate cake with a molten center, served with vanilla ice cream.' },
  { id:8, name:'Mango Smoothie', cat:'drinks', price:7.99, emoji:'🥤', desc:'Fresh mango blended with yogurt and a hint of cardamom.' },
  { id:9, name:'Espresso Martini', cat:'drinks', price:13.99, emoji:'🍸', desc:'Vodka, Kahlúa, and a double shot of espresso.' },
  { id:10, name:'Beef Burger', cat:'mains', price:19.99, emoji:'🍔', desc:'Wagyu beef patty, aged cheddar, caramelized onions, brioche bun.' },
  { id:11, name:'Mushroom Soup', cat:'starters', price:11.99, emoji:'🍲', desc:'Velvety wild mushroom soup with truffle oil and chives.' },
  { id:12, name:'Gelato Bowl', cat:'desserts', price:8.99, emoji:'🍨', desc:'Three scoops of housemade gelato — pick your flavors.' },
];

const ORDER_DATA_CUST = [
  { id:'#ORD-001', date:'2025-06-01', items:'Truffle Risotto, Caesar Salad', total:37.98, status:'Delivered' },
  { id:'#ORD-002', date:'2025-06-03', items:'Grilled Salmon, Tiramisu', total:39.98, status:'Delivered' },
  { id:'#ORD-003', date:'2025-06-07', items:'Margherita Pizza, Mango Smoothie', total:26.98, status:'Preparing' },
];

const RES_DATA_CUST = [
  { id:'#RES-01', date:'2025-06-10', time:'7:00 PM', guests:2, status:'Confirmed' },
  { id:'#RES-02', date:'2025-06-15', time:'8:30 PM', guests:4, status:'Pending' },
];

function initCustomerDashboard() {
  // Auth guard
  const user = JSON.parse(localStorage.getItem('stackly-user') || 'null');
  if (!user) { goTo('index.html'); return; }
  STACKLY.currentUser = user;

  // Populate user info
  document.querySelectorAll('.user-name-display').forEach(el => el.textContent = user.name || 'Guest');
  document.querySelectorAll('.user-initial').forEach(el => el.textContent = (user.name || 'G')[0].toUpperCase());
  document.querySelectorAll('.user-email-display').forEach(el => el.textContent = user.email || '');

  // Load cart from session
  try { STACKLY.cart = JSON.parse(sessionStorage.getItem('stackly-cart') || '[]'); } catch(e){ STACKLY.cart=[]; }

  STACKLY.menuItems = [...MENU_DATA];
  initSidebar('customer');
  initMenuSection();
  renderCartSection();
  renderOrdersTable(ORDER_DATA_CUST);
  renderReservationsTable(RES_DATA_CUST);
  initProfileSection(user);
  initSettingsSection();
  updateCartBadge();
  initCustomerHome();
  showSection('home');
  animateCounters();
}

function initCustomerHome() {
  const el = document.getElementById('home-order-count');
  if (el) { el.dataset.count = ORDER_DATA_CUST.length; el.textContent = ORDER_DATA_CUST.length; }
  const el2 = document.getElementById('home-cart-count');
  if (el2) { el2.dataset.count = STACKLY.cart.length; el2.textContent = STACKLY.cart.length; }
}

function updateCartBadge() {
  const total = STACKLY.cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'inline-flex' : 'none';
  });
  sessionStorage.setItem('stackly-cart', JSON.stringify(STACKLY.cart));
}

/* Menu */
function initMenuSection() {
  renderMenu('all');
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderMenu(btn.dataset.cat);
    });
  });

  const search = document.getElementById('menu-search');
  if (search) search.addEventListener('input', () => {
    const cat = document.querySelector('.cat-btn.active')?.dataset.cat || 'all';
    renderMenu(cat, search.value.toLowerCase());
  });
}

function renderMenu(cat, search = '') {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;
  let items = STACKLY.menuItems;
  if (cat !== 'all') items = items.filter(i => i.cat === cat);
  if (search) items = items.filter(i => i.name.toLowerCase().includes(search) || i.desc.toLowerCase().includes(search));

  if (!items.length) { grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:40px">No items found.</p>'; return; }

  grid.innerHTML = items.map(item => {
    const cartItem = STACKLY.cart.find(c => c.id === item.id);
    const qty = cartItem ? cartItem.qty : 0;
    return `
    <div class="menu-card reveal">
      <div class="menu-card-img">${item.emoji}</div>
      <div class="menu-card-body">
        <div class="menu-card-name">${item.name}</div>
        <div class="menu-card-desc">${item.desc}</div>
        <div class="menu-card-footer">
          <div class="menu-card-price">₹${(item.price * 83).toFixed(0)}</div>
          <div class="menu-card-actions">
            ${qty === 0 ? `
              <button class="btn btn-primary btn-sm" onclick="addToCart(${item.id})">+ Add</button>
            ` : `
              <div class="qty-control">
                <div class="qty-btn" onclick="changeQty(${item.id}, -1)">−</div>
                <span class="qty-val">${qty}</span>
                <div class="qty-btn" onclick="changeQty(${item.id}, 1)">+</div>
              </div>
            `}
          </div>
        </div>
      </div>
    </div>`;
  }).join('');
  initReveal();
}

function addToCart(id) {
  const item = STACKLY.menuItems.find(i => i.id === id);
  if (!item) return;
  const existing = STACKLY.cart.find(c => c.id === id);
  if (existing) existing.qty++;
  else STACKLY.cart.push({ ...item, qty: 1 });
  updateCartBadge();
  renderMenu(document.querySelector('.cat-btn.active')?.dataset.cat || 'all', document.getElementById('menu-search')?.value.toLowerCase() || '');
  renderCartSection();
  showToast(`${item.name} added to cart!`, 'success', 1800);
}

function changeQty(id, delta) {
  const idx = STACKLY.cart.findIndex(c => c.id === id);
  if (idx === -1) return;
  STACKLY.cart[idx].qty += delta;
  if (STACKLY.cart[idx].qty <= 0) STACKLY.cart.splice(idx, 1);
  updateCartBadge();
  renderMenu(document.querySelector('.cat-btn.active')?.dataset.cat || 'all', document.getElementById('menu-search')?.value.toLowerCase() || '');
  renderCartSection();
}

function removeFromCart(id) {
  STACKLY.cart = STACKLY.cart.filter(c => c.id !== id);
  updateCartBadge();
  renderCartSection();
  renderMenu(document.querySelector('.cat-btn.active')?.dataset.cat || 'all');
}

/* Cart */
function renderCartSection() {
  const itemsEl   = document.getElementById('cart-items-list');
  const summaryEl = document.getElementById('cart-summary-box');
  if (!itemsEl) return;

  if (!STACKLY.cart.length) {
    itemsEl.innerHTML = `<div class="cart-empty"><div class="cart-empty-icon">🛒</div><h3>Your cart is empty</h3><p style="color:var(--text-muted);margin-top:8px">Add items from the menu to get started.</p><button class="btn btn-primary" style="margin-top:18px" onclick="showSection('menu')">Browse Menu</button></div>`;
    if (summaryEl) summaryEl.style.display = 'none';
    return;
  }
  if (summaryEl) summaryEl.style.display = '';

  const subtotal = STACKLY.cart.reduce((s, i) => s + (i.price * 83 * i.qty), 0);
  const tax      = subtotal * 0.1;
  const delivery = 49;
  const total    = subtotal + tax + delivery;

  itemsEl.innerHTML = STACKLY.cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-cat">${item.cat}</div>
        <div class="qty-control" style="margin-top:8px">
          <div class="qty-btn" onclick="changeQty(${item.id},-1)">−</div>
          <span class="qty-val">${item.qty}</span>
          <div class="qty-btn" onclick="changeQty(${item.id},1)">+</div>
        </div>
      </div>
      <div>
        <div class="cart-item-price">₹${(item.price * 83 * item.qty).toFixed(0)}</div>
        <div class="cart-item-remove" onclick="removeFromCart(${item.id})" title="Remove">🗑️</div>
      </div>
    </div>
  `).join('');

  if (summaryEl) summaryEl.innerHTML = `
    <h3>Order Summary</h3>
    <div class="summary-row"><span>Subtotal</span><span>₹${subtotal.toFixed(0)}</span></div>
    <div class="summary-row"><span>Tax (10%)</span><span>₹${tax.toFixed(0)}</span></div>
    <div class="summary-row"><span>Delivery</span><span>₹${delivery}</span></div>
    <div class="summary-row total"><span>Total</span><span>₹${total.toFixed(0)}</span></div>
    <button class="btn btn-primary btn-full" style="margin-top:18px" onclick="placeOrder()">Place Order 🛍️</button>
    <button class="btn btn-ghost btn-full" style="margin-top:10px" onclick="clearCart()">Clear Cart</button>
  `;
}

function placeOrder() {
  if (!STACKLY.cart.length) { showToast('Your cart is empty!', 'warning'); return; }
  STACKLY.cart = [];
  updateCartBadge();
  renderCartSection();
  showToast('Order placed successfully! 🎉', 'success', 3000);
  showSection('orders');
}
function clearCart() {
  STACKLY.cart = []; updateCartBadge(); renderCartSection();
  renderMenu(document.querySelector('.cat-btn.active')?.dataset.cat || 'all');
}

/* Orders Table */
function renderOrdersTable(data) {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;
  const statusColor = { Delivered: 'success', Preparing: 'warning', Cancelled: 'error', Pending: 'info' };
  tbody.innerHTML = data.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.date}</td>
      <td>${o.items}</td>
      <td><strong>₹${(o.total * 83).toFixed(0)}</strong></td>
      <td><span class="badge badge-${statusColor[o.status]||'muted'}">${o.status}</span></td>
      <td><button class="btn btn-ghost btn-sm" onclick="go404()">Details</button></td>
    </tr>
  `).join('');
}

/* Reservations Table */
function renderReservationsTable(data) {
  const tbody = document.getElementById('reservations-tbody');
  if (!tbody) return;
  tbody.innerHTML = data.map(r => `
    <tr>
      <td><strong>${r.id}</strong></td>
      <td>${r.date}</td>
      <td>${r.time}</td>
      <td>${r.guests}</td>
      <td><span class="badge badge-${r.status==='Confirmed'?'success':'info'}">${r.status}</span></td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="cancelReservation('${r.id}')">Cancel</button>
      </td>
    </tr>
  `).join('');
}

function cancelReservation(id) {
  showToast(`Reservation ${id} cancelled.`, 'info');
}

/* Reservation form */
function initReservationForm() {
  const form = document.getElementById('reservation-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const date   = document.getElementById('res-date')?.value;
    const time   = document.getElementById('res-time')?.value;
    const guests = document.getElementById('res-guests')?.value;
    const notes  = document.getElementById('res-notes')?.value;
    if (!date || !time || !guests) { showToast('Please fill all required fields.', 'warning'); return; }
    const newRes = {
      id: '#RES-' + String(RES_DATA_CUST.length + 1).padStart(2,'0'),
      date, time, guests: parseInt(guests), status: 'Pending'
    };
    RES_DATA_CUST.push(newRes);
    renderReservationsTable(RES_DATA_CUST);
    form.reset();
    showToast('Reservation submitted! We will confirm shortly.', 'success');
    showSection('reservations');
  });
}

/* ─── Sidebar (shared) ────────────────────────────────────── */
function initSidebar(role) {
  const links = document.querySelectorAll('.sidebar-link');
  links.forEach(link => {
    link.addEventListener('click', () => {
      const target = link.dataset.section;
      if (!target) return;
      if (target === 'logout') { logout(); return; }
      if (target === '404') { go404(); return; }
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      showSection(target);
      closeSidebar();
    });
  });

  // Hamburger
  const hamburger = document.querySelector('.hamburger');
  const sidebar   = document.querySelector('.sidebar');
  const overlay   = document.querySelector('.sidebar-overlay');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      sidebar?.classList.toggle('open');
      overlay?.classList.toggle('show');
    });
  }
  if (overlay) overlay.addEventListener('click', closeSidebar);
}

function closeSidebar() {
  document.querySelector('.hamburger')?.classList.remove('open');
  document.querySelector('.sidebar')?.classList.remove('open');
  document.querySelector('.sidebar-overlay')?.classList.remove('show');
}

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('section-' + id);
  if (el) {
    el.classList.add('active');
    // Update topbar title
    const titleEl = document.querySelector('.topbar-title');
    if (titleEl) titleEl.textContent = el.dataset.title || id.charAt(0).toUpperCase() + id.slice(1);
    // Update sidebar active
    document.querySelectorAll('.sidebar-link').forEach(l => {
      l.classList.toggle('active', l.dataset.section === id);
    });
    // Init section-specific things
    if (id === 'reservations') initReservationForm();
    if (id === 'settings')     initSettingsSection();
    if (id === 'profile')      bindProfileForm();
  } else {
    go404();
  }
}

/* ─── Profile ─────────────────────────────────────────────── */
function initProfileSection(user) {
  const nameEl  = document.getElementById('profile-name');
  const emailEl = document.getElementById('profile-email');
  const initEl  = document.getElementById('profile-initial');
  const imgEl   = document.getElementById('profile-img');
  if (nameEl)  nameEl.textContent  = user.name  || 'User';
  if (emailEl) emailEl.textContent = user.email || '';
  if (initEl)  initEl.textContent  = (user.name || 'U')[0].toUpperCase();

  // Photo upload
  const photoInput = document.getElementById('profile-photo-input');
  const editBtn    = document.querySelector('.profile-avatar-edit');
  if (editBtn && photoInput) {
    editBtn.addEventListener('click', () => photoInput.click());
    photoInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        if (imgEl) imgEl.src = ev.target.result;
        if (initEl) initEl.style.display = 'none';
        localStorage.setItem('stackly-avatar', ev.target.result);
        showToast('Profile photo updated!', 'success');
      };
      reader.readAsDataURL(file);
    });
  }
  // Load saved avatar
  const savedAvatar = localStorage.getItem('stackly-avatar');
  if (savedAvatar && imgEl) { imgEl.src = savedAvatar; if (initEl) initEl.style.display = 'none'; }

  // Pre-fill form fields
  const nameInput   = document.getElementById('edit-name');
  const emailInput  = document.getElementById('edit-email');
  const mobileInput = document.getElementById('edit-mobile');
  if (nameInput)   nameInput.value   = user.name  || '';
  if (emailInput)  emailInput.value  = user.email || '';
  if (mobileInput) mobileInput.value = user.mobile || '';
}

function bindProfileForm() {
  const form = document.getElementById('profile-form');
  if (!form || form._bound) return;
  form._bound = true;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('stackly-user') || '{}');
    user.name   = document.getElementById('edit-name')?.value.trim()   || user.name;
    user.email  = document.getElementById('edit-email')?.value.trim()  || user.email;
    user.mobile = document.getElementById('edit-mobile')?.value.trim() || user.mobile;
    localStorage.setItem('stackly-user', JSON.stringify(user));
    STACKLY.currentUser = user;
    document.querySelectorAll('.user-name-display').forEach(el => el.textContent = user.name);
    document.querySelectorAll('.user-email-display').forEach(el => el.textContent = user.email);
    const profileNameEl = document.getElementById('profile-name');
    if (profileNameEl) profileNameEl.textContent = user.name;
    showToast('Profile saved successfully!', 'success');
  });
}

/* ─── Settings ────────────────────────────────────────────── */
function initSettingsSection() {
  const themeToggle = document.querySelector('[data-theme-toggle]');
  if (themeToggle && !themeToggle._bound) {
    themeToggle._bound = true;
    themeToggle.addEventListener('change', () => applyTheme(themeToggle.checked ? 'light' : 'dark'));
    themeToggle.checked = STACKLY.theme === 'light';
  }

  const pwForm = document.getElementById('change-password-form');
  if (pwForm && !pwForm._bound) {
    pwForm._bound = true;
    pwForm.addEventListener('submit', e => {
      e.preventDefault();
      const cur  = document.getElementById('current-password')?.value;
      const nw   = document.getElementById('new-password')?.value;
      const conf = document.getElementById('confirm-new-password')?.value;
      if (!cur || cur.length < 6) { showToast('Enter your current password.', 'warning'); return; }
      if (!validatePassword(nw))  { showToast('New password must be at least 6 characters.', 'warning'); return; }
      if (nw !== conf)            { showToast('Passwords do not match.', 'error'); return; }
      showToast('Password changed successfully!', 'success');
      pwForm.reset();
    });
  }

  const saveNotif = document.getElementById('save-notifications-btn');
  if (saveNotif && !saveNotif._bound) {
    saveNotif._bound = true;
    saveNotif.addEventListener('click', () => showToast('Notification preferences saved!', 'success'));
  }
}

/* ═══════════════════════════════════════════════════════════
   ADMIN DASHBOARD
═══════════════════════════════════════════════════════════ */
const ADMIN_ORDERS = [
  { id:'#ORD-011', customer:'Priya Sharma', items:'Truffle Risotto ×2', total:4998, status:'Preparing', time:'5 min ago' },
  { id:'#ORD-012', customer:'Rahul Verma', items:'Grilled Salmon, Tiramisu', total:3998, status:'Ready', time:'12 min ago' },
  { id:'#ORD-013', customer:'Meera Nair', items:'Margherita Pizza ×3', total:5697, status:'Delivered', time:'28 min ago' },
  { id:'#ORD-014', customer:'Arjun Patel', items:'Caesar Salad, Bruschetta', total:2298, status:'Pending', time:'2 min ago' },
  { id:'#ORD-015', customer:'Deepa Iyer', items:'Beef Burger ×2, Espresso Martini', total:5397, status:'Preparing', time:'8 min ago' },
];
const ADMIN_RESERVATIONS = [
  { id:'#RES-10', customer:'Kavya Reddy',  date:'2025-06-08', time:'7:00 PM', guests:4, status:'Confirmed' },
  { id:'#RES-11', customer:'Sanjay Kumar', date:'2025-06-09', time:'8:00 PM', guests:2, status:'Pending' },
  { id:'#RES-12', customer:'Anita Menon',  date:'2025-06-10', time:'1:00 PM', guests:6, status:'Confirmed' },
];
const ADMIN_CUSTOMERS = [
  { id:'CUS-001', name:'Priya Sharma',  email:'priya@email.com',  orders:12, spent:'₹18,400', joined:'2024-12-01', status:'Active' },
  { id:'CUS-002', name:'Rahul Verma',   email:'rahul@email.com',  orders:7,  spent:'₹10,200', joined:'2025-01-15', status:'Active' },
  { id:'CUS-003', name:'Meera Nair',    email:'meera@email.com',  orders:24, spent:'₹38,900', joined:'2024-09-20', status:'Active' },
  { id:'CUS-004', name:'Arjun Patel',   email:'arjun@email.com',  orders:3,  spent:'₹4,100',  joined:'2025-03-10', status:'Active' },
  { id:'CUS-005', name:'Deepa Iyer',    email:'deepa@email.com',  orders:18, spent:'₹27,600', joined:'2024-11-05', status:'Inactive' },
];
const INVENTORY_DATA = [
  { name:'Chicken Breast',  qty:45, unit:'kg',  min:10, max:60  },
  { name:'Truffle Oil',     qty:3,  unit:'liters', min:5, max:20 },
  { name:'Arborio Rice',    qty:28, unit:'kg',  min:10, max:40  },
  { name:'Atlantic Salmon', qty:12, unit:'kg',  min:8,  max:30  },
  { name:'Parmesan Cheese', qty:8,  unit:'kg',  min:5,  max:20  },
  { name:'Fresh Basil',     qty:2,  unit:'kg',  min:3,  max:10  },
  { name:'Mozzarella',      qty:22, unit:'kg',  min:8,  max:30  },
  { name:'Espresso Beans',  qty:15, unit:'kg',  min:10, max:25  },
];

function initAdminDashboard() {
  const user = JSON.parse(localStorage.getItem('stackly-user') || 'null');
  if (!user) { goTo('index.html'); return; }
  if (user.role !== 'admin' && user.role !== 'chef') {
    showToast('Access denied. Admin only.', 'error');
    setTimeout(() => goTo('customer-dashboard.html'), 1500);
    return;
  }
  STACKLY.currentUser = user;

  document.querySelectorAll('.user-name-display').forEach(el => el.textContent = user.name || 'Admin');
  document.querySelectorAll('.user-initial').forEach(el => el.textContent = (user.name || 'A')[0].toUpperCase());
  document.querySelectorAll('.user-email-display').forEach(el => el.textContent = user.email || '');

  initSidebar('admin');
  initAdminOrders();
  initAdminReservations();
  initMenuManagement();
  initAdminCustomers();
  initInventory();
  initReports();
  initProfileSection(user);
  initSettingsSection();
  showSection('dashboard');
  animateCounters();
  initBarChart();
  initDonutChart();
}

function initAdminOrders() {
  renderAdminOrdersTable(ADMIN_ORDERS);
  const filterStatus = document.getElementById('order-status-filter');
  if (filterStatus) filterStatus.addEventListener('change', () => {
    const val = filterStatus.value;
    const filtered = val ? ADMIN_ORDERS.filter(o => o.status === val) : ADMIN_ORDERS;
    renderAdminOrdersTable(filtered);
  });
}

function renderAdminOrdersTable(data) {
  const tbody = document.getElementById('admin-orders-tbody');
  if (!tbody) return;
  const statusColor = { Delivered:'success', Preparing:'warning', Pending:'info', Ready:'accent', Cancelled:'error' };
  tbody.innerHTML = data.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.customer}</td>
      <td>${o.items}</td>
      <td><strong>₹${o.total.toLocaleString()}</strong></td>
      <td><span class="badge badge-${statusColor[o.status]||'muted'}">${o.status}</span></td>
      <td style="color:var(--text-muted);font-size:0.82rem">${o.time}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="updateOrderStatus('${o.id}')">Update</button>
      </td>
    </tr>
  `).join('');
}

function updateOrderStatus(id) {
  const statuses = ['Pending','Preparing','Ready','Delivered'];
  const order = ADMIN_ORDERS.find(o => o.id === id);
  if (!order) return;
  const idx = statuses.indexOf(order.status);
  order.status = statuses[(idx + 1) % statuses.length];
  renderAdminOrdersTable(ADMIN_ORDERS);
  showToast(`Order ${id} updated to "${order.status}"`, 'success');
}

function initAdminReservations() {
  renderAdminReservationsTable(ADMIN_RESERVATIONS);
}

function renderAdminReservationsTable(data) {
  const tbody = document.getElementById('admin-reservations-tbody');
  if (!tbody) return;
  tbody.innerHTML = data.map(r => `
    <tr>
      <td><strong>${r.id}</strong></td>
      <td>${r.customer}</td>
      <td>${r.date}</td>
      <td>${r.time}</td>
      <td>${r.guests}</td>
      <td><span class="badge badge-${r.status==='Confirmed'?'success':'info'}">${r.status}</span></td>
      <td>
        <button class="btn btn-success btn-sm" onclick="confirmReservation('${r.id}')">Confirm</button>
        <button class="btn btn-danger btn-sm" style="margin-left:6px" onclick="rejectReservation('${r.id}')">Reject</button>
      </td>
    </tr>
  `).join('');
}

function confirmReservation(id) {
  const r = ADMIN_RESERVATIONS.find(r => r.id === id);
  if (r) { r.status = 'Confirmed'; renderAdminReservationsTable(ADMIN_RESERVATIONS); showToast(`Reservation ${id} confirmed!`, 'success'); }
}
function rejectReservation(id) {
  const idx = ADMIN_RESERVATIONS.findIndex(r => r.id === id);
  if (idx !== -1) { ADMIN_RESERVATIONS.splice(idx,1); renderAdminReservationsTable(ADMIN_RESERVATIONS); showToast(`Reservation ${id} rejected.`, 'info'); }
}

/* Menu Management */
function initMenuManagement() {
  renderAdminMenu();
  const addForm = document.getElementById('add-menu-form');
  if (addForm) {
    addForm.addEventListener('submit', e => {
      e.preventDefault();
      const name  = document.getElementById('new-item-name')?.value.trim();
      const cat   = document.getElementById('new-item-cat')?.value;
      const price = parseFloat(document.getElementById('new-item-price')?.value);
      const emoji = document.getElementById('new-item-emoji')?.value.trim() || '🍽️';
      const desc  = document.getElementById('new-item-desc')?.value.trim();
      if (!name || !cat || !price) { showToast('Fill all required fields.', 'warning'); return; }
      const newItem = { id: Date.now(), name, cat, price: price / 83, emoji, desc: desc || 'Delicious item from our kitchen.' };
      STACKLY.menuItems.push(newItem);
      renderAdminMenu();
      addForm.reset();
      closeModal('add-menu-modal');
      showToast(`"${name}" added to menu!`, 'success');
    });
  }
}

function renderAdminMenu() {
  const tbody = document.getElementById('admin-menu-tbody');
  if (!tbody) return;
  tbody.innerHTML = STACKLY.menuItems.length ? STACKLY.menuItems.map(item => `
    <tr>
      <td>${item.emoji}</td>
      <td><strong>${item.name}</strong></td>
      <td><span class="badge badge-muted">${item.cat}</span></td>
      <td><strong>₹${(item.price * 83).toFixed(0)}</strong></td>
      <td>${item.desc.substring(0, 40)}…</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="editMenuItem(${item.id})">Edit</button>
        <button class="btn btn-danger btn-sm" style="margin-left:6px" onclick="deleteMenuItem(${item.id})">Delete</button>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:24px">No menu items.</td></tr>';
}

function editMenuItem(id) { showToast('Edit functionality: Use the Edit modal in production.', 'info'); }
function deleteMenuItem(id) {
  const idx = STACKLY.menuItems.findIndex(i => i.id === id);
  if (idx !== -1) {
    const name = STACKLY.menuItems[idx].name;
    STACKLY.menuItems.splice(idx, 1);
    renderAdminMenu();
    showToast(`"${name}" removed from menu.`, 'info');
  }
}

/* Customers */
function initAdminCustomers() {
  renderAdminCustomers(ADMIN_CUSTOMERS);
  const search = document.getElementById('customer-search');
  if (search) search.addEventListener('input', () => {
    const q = search.value.toLowerCase();
    renderAdminCustomers(ADMIN_CUSTOMERS.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)));
  });
}

function renderAdminCustomers(data) {
  const tbody = document.getElementById('admin-customers-tbody');
  if (!tbody) return;
  tbody.innerHTML = data.map(c => `
    <tr>
      <td><strong>${c.id}</strong></td>
      <td>${c.name}</td>
      <td>${c.email}</td>
      <td>${c.orders}</td>
      <td>${c.spent}</td>
      <td>${c.joined}</td>
      <td><span class="badge badge-${c.status==='Active'?'success':'muted'}">${c.status}</span></td>
      <td><button class="btn btn-ghost btn-sm" onclick="go404()">View</button></td>
    </tr>
  `).join('');
}

/* Inventory */
function initInventory() {
  renderInventory();
}
function renderInventory() {
  const el = document.getElementById('inventory-list');
  if (!el) return;
  el.innerHTML = INVENTORY_DATA.map(item => {
    const pct  = Math.round((item.qty / item.max) * 100);
    const level = pct < 30 ? 'danger' : pct < 60 ? 'warn' : 'good';
    return `
    <div class="card" style="margin-bottom:14px;padding:18px">
      <div class="inventory-bar-label">
        <span><strong>${item.name}</strong> — ${item.qty} ${item.unit} / ${item.max} ${item.unit}</span>
        <span style="color:var(--text-muted)">${pct}%</span>
      </div>
      <div class="inventory-bar-track">
        <div class="inventory-bar-fill ${level}" style="width:${pct}%"></div>
      </div>
      ${item.qty < item.min ? `<small style="color:var(--error);margin-top:4px;display:block">⚠️ Below minimum stock (${item.min} ${item.unit})</small>` : ''}
    </div>`;
  }).join('');
}

/* Reports */
function initReports() {
  setTimeout(initBarChart, 500);
  setTimeout(initDonutChart, 500);
}

function initBarChart() {
  const bars = document.querySelectorAll('.bar');
  const heights = [40, 65, 50, 85, 70, 95, 60];
  bars.forEach((bar, i) => {
    setTimeout(() => { bar.style.height = heights[i] + '%'; }, i * 100);
  });
}

function initDonutChart() {
  const svg = document.getElementById('donut-svg');
  if (!svg) return;
  const circle = svg.querySelector('.donut-progress');
  if (!circle) return;
  const circumference = 2 * Math.PI * 40;
  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = circumference * (1 - 0.68);
}

/* ─── Modal ───────────────────────────────────────────────── */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

/* expose globals */
window.addToCart       = addToCart;
window.changeQty       = changeQty;
window.removeFromCart  = removeFromCart;
window.placeOrder      = placeOrder;
window.clearCart       = clearCart;
window.showSection     = showSection;
window.logout          = logout;
window.go404           = go404;
window.goTo            = goTo;
window.openModal       = openModal;
window.closeModal      = closeModal;
window.updateOrderStatus  = updateOrderStatus;
window.confirmReservation = confirmReservation;
window.rejectReservation  = rejectReservation;
window.editMenuItem    = editMenuItem;
window.deleteMenuItem  = deleteMenuItem;
window.cancelReservation = cancelReservation;
window.applyTheme      = applyTheme;