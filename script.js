// Variable del Carrito de Compras
let cart = [];

// Inicializar la página automáticamente al cargar
document.addEventListener("DOMContentLoaded", function() {
    switchPage('inicio');
});

// Navegación Multi-Página
function switchPage(pageId) {
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
    alert(`¡"${productName}" agregado al carrito con éxito!`);
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
        alert("Tu carrito está vacío.");
        return;
    }

    let message = `*Cotización de Carrito - Óptica Mi Visión*%0A%0A`;
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
    const name = document.getElementById('form-name').value;
    const phone = document.getElementById('form-phone').value;
    const product = document.getElementById('form-product').value;
    const details = document.getElementById('form-details').value;
    const fileInput = document.getElementById('form-file');

    let message = `*Nuevo Pedido / Receta - Óptica Mi Visión*%0A%0A`;
    message += `*Cliente:* ${encodeURIComponent(name)}%0A`;
    message += `*Teléfono:* ${encodeURIComponent(phone)}%0A`;
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
