// Navegación Multi-Página
function switchPage(pageId) {
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(sec => sec.classList.add('hidden'));

    const targetSection = document.getElementById('page-' + pageId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
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
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentUrl)}`;
    }
}

// Menú desplegable para móviles
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}

// Cambio de pestañas en el Catálogo (Monturas vs Lunas)
function switchCatTab(tabName) {
    const btnMonturas = document.getElementById('btn-tab-monturas');
    const btnLunas = document.getElementById('btn-tab-lunas');
    const contentMonturas = document.getElementById('tab-content-monturas');
    const contentLunas = document.getElementById('tab-content-lunas');

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

// Seleccionar un producto del catálogo para llevarlo al formulario de pedidos
function selectProductForOrder(productName) {
    switchPage('pedidos');
    const selectEl = document.getElementById('form-product');
    for (let i = 0; i < selectEl.options.length; i++) {
        if (selectEl.options[i].text.includes(productName) || selectEl.options[i].value.includes(productName)) {
            selectEl.selectedIndex = i;
            break;
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
    if (fileInput.files.length > 0) {
        message += `*(El cliente ha indicado que adjuntará o enviará su receta fotográfica)*%0A`;
    }

    const whatsappNumber = '51927725412'; 
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappURL, '_blank');
}