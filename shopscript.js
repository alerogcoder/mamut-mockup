(function () {
    const overlay   = document.getElementById('modal-overlay');
    const closeBtn  = document.getElementById('modal-close');
    const img       = document.getElementById('modal-artist-img');
    const name      = document.getElementById('modal-artist');
    const price     = document.querySelector('#modal-info .product-price');
    const desc      = document.getElementById('modal-description');
    const buyBtn    = document.querySelector('#modal-info .buy-btn');
    const notice    = document.querySelector('#modal-info .product-notice');
    const sgToggle  = document.querySelector('#modal-info .size-guide-toggle');
    const sizeGuide = document.querySelector('#modal-info .size-guide');
    let lastFocused = null;

    document.querySelectorAll('.product').forEach(card => {
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        const open = () => openProduct(card);
        card.addEventListener('click', open);
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
        });
    });

    function openProduct(card) {
        const soldout  = card.dataset.soldout === 'true';
        const ondemand = card.dataset.ondemand === 'true';
        const hasGuide = card.dataset.sizeguide === 'true';
        const cardImg  = card.querySelector('.product-media img');

        img.src  = cardImg ? cardImg.src : '';
        img.alt  = cardImg ? cardImg.alt : '';
        name.textContent  = card.querySelector('.product-name')?.textContent || '';
        price.textContent = card.querySelector('.product-price')?.textContent || '';
        desc.textContent  = card.dataset.description || '';

        notice.hidden = !ondemand;
        if (ondemand) notice.textContent = 'Producte sota demanda, pot afectar al temps d’entrega del paquet.';

        sgToggle.hidden = !hasGuide;
        sizeGuide.hidden = true;
        sgToggle.setAttribute('aria-expanded', 'false');

        buyBtn.dataset.link = card.dataset.link || '#';
        buyBtn.disabled = soldout;
        buyBtn.textContent = soldout ? 'Esgotat' : 'Comprar →';

        openModal(card);
    }

    sgToggle.addEventListener('click', () => {
        const willOpen = sizeGuide.hidden;
        sizeGuide.hidden = !willOpen;
        sgToggle.setAttribute('aria-expanded', String(willOpen));
    });

    buyBtn.addEventListener('click', () => {
        const link = buyBtn.dataset.link;
        if (link && link !== '#') window.open(link, '_blank', 'noopener');
    });

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal();
    });

    function openModal(opener) {
        lastFocused = opener || document.activeElement;
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('active')));
        closeBtn.focus();
    }

    function closeModal() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => { overlay.style.display = 'none'; }, 300);
        if (lastFocused) lastFocused.focus();
    }
})();

(function () {
    const photo   = document.getElementById('modal-artist-photo');
    const zoomImg = document.getElementById('modal-artist-img');
    if (!photo || !zoomImg) return;

    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const SMOOTH = 0.18;            // 0.05 = mucha estela/suave · 0.5 = casi instantáneo

    let targetX = 50, targetY = 50; // adónde va
    let curX = 50, curY = 50;       // dónde está (interpolado)
    let raf = null;

    function targetFrom(clientX, clientY) {
        const r = photo.getBoundingClientRect();
        targetX = Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
        targetY = Math.max(0, Math.min(100, ((clientY - r.top) / r.height) * 100));
    }

    function loop() {
        const dx = targetX - curX, dy = targetY - curY;
        curX += dx * SMOOTH;
        curY += dy * SMOOTH;
        zoomImg.style.transformOrigin = `${curX}% ${curY}%`;
        if (photo.classList.contains('zoomed') && (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05)) {
            raf = requestAnimationFrame(loop);
        } else {
            raf = null;
        }
    }
    function startLoop() { if (!raf) raf = requestAnimationFrame(loop); }

    function resetZoom() {
        photo.classList.remove('zoomed');
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        zoomImg.style.transformOrigin = 'center center';
        curX = curY = targetX = targetY = 50;
    }

    if (canHover) {
        photo.addEventListener('mouseenter', e => {
            targetFrom(e.clientX, e.clientY);
            curX = targetX; curY = targetY;     // arranca en el punto, sin salto inicial
            photo.classList.add('zoomed');
            startLoop();
        });
        photo.addEventListener('mousemove', e => {
            if (photo.classList.contains('zoomed')) { targetFrom(e.clientX, e.clientY); startLoop(); }
        });
        photo.addEventListener('mouseleave', resetZoom);
    } else {
        // Móvil: toque para activar, arrastre directo (sin estela)
        photo.addEventListener('click', e => {
            if (photo.classList.toggle('zoomed')) {
                targetFrom(e.clientX, e.clientY);
                curX = targetX; curY = targetY;
                zoomImg.style.transformOrigin = `${curX}% ${curY}%`;
            } else {
                resetZoom();
            }
        });
        photo.addEventListener('touchmove', e => {
            if (!photo.classList.contains('zoomed')) return;
            const t = e.touches[0], r = photo.getBoundingClientRect();
            const x = Math.max(0, Math.min(100, ((t.clientX - r.left) / r.width) * 100));
            const y = Math.max(0, Math.min(100, ((t.clientY - r.top) / r.height) * 100));
            zoomImg.style.transformOrigin = `${x}% ${y}%`;
            e.preventDefault();
        }, { passive: false });
    }

    document.querySelectorAll('.product').forEach(c => c.addEventListener('click', resetZoom));
    document.getElementById('modal-close')?.addEventListener('click', resetZoom);
    document.getElementById('modal-overlay')?.addEventListener('click', e => {
        if (e.target.id === 'modal-overlay') resetZoom();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') resetZoom(); });
})();