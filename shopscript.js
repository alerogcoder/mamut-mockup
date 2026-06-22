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
        if (link && link !== '#') window.location.href = link;
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