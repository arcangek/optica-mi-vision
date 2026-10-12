// Variable del Carrito de Compras
let cart = [];

// Inicializar la página automáticamente al cargar
document.addEventListener("DOMContentLoaded", function() {
    switchPage('inicio');
});

// Navegación Multi-Página
function switchPage(pageId) {
    if (pageId === 'pedidos' && !getSession()) { openAuth('login', () => switchPage('pedidos')); return; }
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(sec => {
        sec.classList.add('hidden');
        sec.style.display = 'none';
    });

    // Mostrar la sección seleccionada
    const targetSection = document.getElementById('page-' + pageId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Actualizar botones del menú de escritorio
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        if (btn.getAttribute('data-target') === pageId) {
            btn.classList.add('text-optica-red', 'bg-red-50');
            btn.classList.remove('text-slate-600');
        } else {
            btn.classList.remove('text-optica-red', 'bg-red-50');
            btn.classList.add('text-slate-600');
        }
    });

    // Generar código QR dinámico si se accede a esa página
    if (pageId === 'qr') {
        const currentUrl = window.location.href;
        const qrImg = document.getElementById('qr-img');
        if (qrImg) {
            qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentUrl)}`;
        }
    }
}

// Menú desplegable para móviles
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// Cambio de pestañas en el Catálogo (Monturas vs Lunas)
function switchCatTab(tabName) {
    const btnMonturas = document.getElementById('btn-tab-monturas');
    const btnLunas = document.getElementById('btn-tab-lunas');
    const contentMonturas = document.getElementById('tab-content-monturas');
    const contentLunas = document.getElementById('tab-content-lunas');

    if (!btnMonturas || !btnLunas) return;

    if (tabName === 'monturas') {
        btnMonturas.className = "px-5 py-2 rounded-xl font-semibold text-sm transition bg-optica-red text-white";
        btnLunas.className = "px-5 py-2 rounded-xl font-semibold text-sm transition bg-slate-200 text-slate-700 hover:bg-slate-300";
        contentMonturas.classList.remove('hidden');
        contentLunas.classList.add('hidden');
    } else {
        btnLunas.className = "px-5 py-2 rounded-xl font-semibold text-sm transition bg-optica-red text-white";
        btnMonturas.className = "px-5 py-2 rounded-xl font-semibold text-sm transition bg-slate-200 text-slate-700 hover:bg-slate-300";
        contentLunas.classList.remove('hidden');
        contentMonturas.classList.add('hidden');
    }
}

// Funciones del Carrito de Compras
function addToCart(productName, price) {
    const existingItem = cart.find(item => item.name === productName);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: productName, price: price, quantity: 1 });
    }
    updateCartUI();
    showToast(`"${productName}" agregado al carrito`);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    const counter = document.getElementById('cart-counter');
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total');

    if (!counter || !container || !totalEl) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    counter.textContent = totalItems;

    if (cart.length === 0) {
        container.innerHTML = `<p class="text-slate-500 text-sm text-center py-6">Tu carrito está vacío. ¡Agrega productos desde el catálogo!</p>`;
        totalEl.textContent = "S/. 0.00";
        return;
    }

    let html = '';
    let totalPrice = 0;

    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        totalPrice += subtotal;
        html += `
            <div class="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                    <h4 class="font-bold text-sm text-slate-900">${item.name}</h4>
                    <p class="text-xs text-slate-500">S/. ${item.price.toFixed(2)} x ${item.quantity}</p>
                </div>
                <div class="flex items-center space-x-3">
                    <span class="font-extrabold text-sm text-optica-red">S/. ${subtotal.toFixed(2)}</span>
                    <button onclick="removeFromCart(${index})" class="text-red-500 hover:text-red-700 font-bold text-sm px-1.5 py-0.5 bg-white rounded-lg border border-red-100">✕</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    totalEl.textContent = `S/. ${totalPrice.toFixed(2)}`;
}

function toggleCartModal() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.classList.toggle('hidden');
    }
}

function checkoutWhatsApp() {
    if (cart.length === 0) {
        showToast("Tu carrito está vacío.");
        return;
    }

    const ses = getSession();
    if (!ses) { openAuth('login', checkoutWhatsApp); return; }
    let message = `*Cotización de Carrito - Óptica Mi Visión*%0A%0A*Cliente:* ${encodeURIComponent(ses.name)} (${encodeURIComponent(ses.phone)})%0A%0A`;
    let total = 0;

    cart.forEach(item => {
        let sub = item.price * item.quantity;
        total += sub;
        message += `• ${item.quantity}x ${item.name} - S/. ${sub.toFixed(2)}%0A`;
    });

    message += `%0A*Total a Pagar / Cotizar: S/. ${total.toFixed(2)}*%0A%0ADeseo coordinar la medida exacta y el recojo o envío.`;

    const whatsappNumber = '51927725412';
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
}

// Seleccionar un producto del catálogo para llevarlo al formulario de pedidos
function selectProductForOrder(productName) {
    switchPage('pedidos');
    const selectEl = document.getElementById('form-product');
    if (selectEl) {
        for (let i = 0; i < selectEl.options.length; i++) {
            if (selectEl.options[i].text.includes(productName) || selectEl.options[i].value.includes(productName)) {
                selectEl.selectedIndex = i;
                break;
            }
        }
    }
}

// Envío de datos y recetas directamente a WhatsApp
function sendToWhatsApp(e) {
    e.preventDefault();
    if (!getSession()) { openAuth('login'); return; }
    const name = document.getElementById('form-name').value;
    const phone = document.getElementById('form-phone').value;
    const product = document.getElementById('form-product').value;
    const details = document.getElementById('form-details').value;
    const fileInput = document.getElementById('form-file');

    let message = `*Nuevo Pedido / Receta - Óptica Mi Visión*%0A%0A`;
    message += `*Cliente:* ${encodeURIComponent(name)}%0A`;
    message += `*Teléfono:* ${encodeURIComponent(phone)}%0A`;
    message += `*Cuenta verificada:* ${encodeURIComponent(getSession().email)}%0A`;
    message += `*Producto/Servicio:* ${encodeURIComponent(product)}%0A`;
    if (details) {
        message += `*Detalles:* ${encodeURIComponent(details)}%0A`;
    }
    if (fileInput && fileInput.files.length > 0) {
        message += `*(El cliente ha indicado que adjuntará o enviará su receta fotográfica)*%0A`;
    }

    const whatsappNumber = '51927725412'; 
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappURL, '_blank');
}

/* ================= CUENTAS Y SESIÓN ================= */
const USERS_KEY = 'ov_users', SESSION_KEY = 'ov_session', LOCK_KEY = 'ov_lock';
let pendingAfterAuth = null, authMode = 'login', toastTimer;

const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const readJSON = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const getUsers = () => readJSON(USERS_KEY, {});

function getSession() {
    const s = readJSON(SESSION_KEY, null);
    if (!s || s.exp < Date.now()) { localStorage.removeItem(SESSION_KEY); return null; }
    return s;
}

function randSalt() {
    const a = new Uint8Array(16);
    (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach((_, i) => a[i] = Math.random() * 256);
    return Array.from(a).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(pw, salt) {
    if (!(window.crypto && crypto.subtle)) return btoa(unescape(encodeURIComponent(salt + pw)));
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: 150000 }, key, 256);
    return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function pwStrength(p) {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
}

function updateMeter(v) {
    const s = pwStrength(v), bar = document.getElementById('pw-bar');
    bar.style.width = v ? Math.max(s, 1) * 25 + '%' : '0';
    bar.style.background = ['#ef4444', '#ef4444', '#f59e0b', '#84cc16', '#16a34a'][s];
    document.getElementById('pw-label').textContent = v ? ['Muy débil', 'Débil', 'Regular', 'Buena', 'Excelente'][s] : 'Usa 8 o más caracteres con letras y números.';
}

function togglePass() {
    const i = document.getElementById('auth-pass'), show = i.type === 'password';
    i.type = show ? 'text' : 'password';
    document.getElementById('pass-toggle').textContent = show ? 'Ocultar' : 'Mostrar';
}

function authError(msg) {
    const el = document.getElementById('auth-error');
    el.textContent = msg;
    el.classList.toggle('hidden', !msg);
    return false;
}

function setAuthMode(m) {
    authMode = m;
    const reg = m === 'register';
    document.getElementById('reg-fields').classList.toggle('hidden', !reg);
    document.getElementById('pw-meter').classList.toggle('hidden', !reg);
    document.getElementById('auth-title').textContent = reg ? 'Crea tu cuenta' : 'Ingresa a tu cuenta';
    document.getElementById('auth-sub').textContent = reg ? 'Con tu cuenta enviarás pedidos y recetas de forma segura.' : 'Para enviar pedidos y recetas necesitamos verificar tu identidad.';
    document.getElementById('auth-submit').textContent = reg ? 'Crear cuenta y continuar' : 'Ingresar';
    document.getElementById('auth-pass').autocomplete = reg ? 'new-password' : 'current-password';
    ['login', 'register'].forEach(t => document.getElementById('tab-' + t).classList.toggle('is-active', t === m));
    updateMeter(document.getElementById('auth-pass').value);
    authError('');
}

function openAuth(mode = 'login', after = null) {
    pendingAfterAuth = after;
    setAuthMode(mode);
    document.getElementById('auth-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById(mode === 'register' ? 'auth-name' : 'auth-email').focus(), 50);
}

function closeAuth() {
    pendingAfterAuth = null;
    document.getElementById('auth-modal').classList.add('hidden');
    document.body.style.overflow = '';
    document.getElementById('auth-form').reset();
}

async function handleAuth(e) {
    e.preventDefault();
    const val = id => document.getElementById(id).value.trim();
    const email = val('auth-email').toLowerCase(), pw = document.getElementById('auth-pass').value;
    if (!/^\S+@\S+\.\S+$/.test(email)) return authError('Ingresa un correo válido.');
    const users = getUsers();

    if (authMode === 'register') {
        const name = val('auth-name'), phone = val('auth-phone').replace(/\s/g, '');
        if (name.length < 3) return authError('Escribe tu nombre completo.');
        if (!/^\d{9}$/.test(phone)) return authError('El teléfono debe tener 9 dígitos.');
        if (!(pw.length >= 8 && /\d/.test(pw) && /[A-Za-z]/.test(pw))) return authError('La contraseña necesita 8 o más caracteres, con letras y números.');
        if (users[email]) return authError('Este correo ya tiene una cuenta. Ingresa con tu contraseña.');
        const salt = randSalt();
        users[email] = { name, phone, salt, hash: await hashPassword(pw, salt) };
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        return startSession(email, users[email]);
    }

    const lock = readJSON(LOCK_KEY, { n: 0, until: 0 });
    if (lock.until > Date.now()) return authError(`Demasiados intentos. Espera ${Math.ceil((lock.until - Date.now()) / 1000)} segundos.`);
    const u = users[email];
    if (!u || await hashPassword(pw, u.salt) !== u.hash) {
        lock.n++;
        if (lock.n >= 5) { lock.until = Date.now() + 60000; lock.n = 0; }
        localStorage.setItem(LOCK_KEY, JSON.stringify(lock));
        return authError('Correo o contraseña incorrectos.');
    }
    localStorage.removeItem(LOCK_KEY);
    startSession(email, u);
}

function startSession(email, u) {
    const next = pendingAfterAuth;
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email, name: u.name, phone: u.phone, exp: Date.now() + 4 * 3600 * 1000 }));
    closeAuth();
    renderAuthUI();
    showToast(`Hola, ${u.name.split(' ')[0]}. Sesión iniciada.`);
    if (next) next();
}

function logout() {
    localStorage.removeItem(SESSION_KEY);
    renderAuthUI();
    switchPage('inicio');
    showToast('Sesión cerrada.');
}

function toggleUserMenu() {
    const m = document.getElementById('user-menu');
    if (m) m.classList.toggle('hidden');
}

function fillOrderForm() {
    const s = getSession(), n = document.getElementById('form-name'), p = document.getElementById('form-phone'), note = document.getElementById('order-session-note');
    if (s && n && p) { n.value = s.name; p.value = s.phone; }
    if (note) {
        note.classList.toggle('hidden', !s);
        if (s) note.textContent = `Pedido a nombre de ${s.name} · cuenta verificada (${s.email})`;
    }
}

function renderAuthUI() {
    const s = getSession(), area = document.getElementById('auth-area'), mob = document.getElementById('mobile-auth');
    document.body.classList.toggle('is-auth', !!s);
    const first = s ? s.name.split(' ')[0] : '';
    if (area) area.innerHTML = s
        ? `<button onclick="toggleUserMenu()" class="user-chip" aria-label="Mi cuenta"><span class="user-avatar">${esc(s.name[0].toUpperCase())}</span><span class="hidden lg:inline text-sm font-semibold text-slate-700">${esc(first)}</span></button>
           <div id="user-menu" class="hidden user-menu"><p class="text-sm font-bold text-slate-900 truncate">${esc(s.name)}</p><p class="text-xs text-slate-500 truncate mb-3">${esc(s.email)}</p><button onclick="logout()" class="w-full text-left text-sm font-semibold text-optica-red hover:bg-red-50 rounded-lg px-3 py-2">Cerrar sesión</button></div>`
        : `<button onclick="openAuth('login')" class="btn-ghost">Ingresar</button>`;
    if (mob) mob.innerHTML = s
        ? `<button onclick="logout();toggleMobileMenu()" class="block w-full text-left px-3 py-2 rounded-md font-semibold text-optica-red hover:bg-red-50">Cerrar sesión (${esc(first)})</button>`
        : `<button onclick="openAuth('login');toggleMobileMenu()" class="block w-full text-left px-3 py-2 rounded-md font-semibold text-optica-red hover:bg-red-50">Ingresar / Crear cuenta</button>`;
    fillOrderForm();
}

function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

document.addEventListener('DOMContentLoaded', renderAuthUI);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAuth(); });
document.addEventListener('click', e => {
    const m = document.getElementById('user-menu');
    if (m && !m.classList.contains('hidden') && !e.target.closest('#auth-area')) m.classList.add('hidden');
});
