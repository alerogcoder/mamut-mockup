const overlay     = document.getElementById('modal-overlay');
const modal       = document.getElementById('modal');
const closeBtn    = document.getElementById('modal-close');
const player      = document.getElementById('modal-player');
const artistImg   = document.getElementById('modal-artist-img');
const artistName  = document.getElementById('modal-artist');
const description = document.getElementById('modal-description');
const links       = document.getElementById('modal-links');

let lastFocused = null;

// ── Tarjetas (click + teclado) ──
document.querySelectorAll('article.single').forEach(single => {
    single.tabIndex = 0;
    single.setAttribute('role', 'button');
    single.addEventListener('click', () => openSingle(single));
    single.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openSingle(single);
        }
    });
});

function openSingle(single) {
    const { artist, artistph, description: desc, embed, spotify, bandcamp } = single.dataset;
    const title = single.querySelector('.single-title')?.textContent.trim() ?? artist;
    artistImg.src           = artistph;
    artistImg.alt           = artist;
    artistName.textContent  = artist;
    description.textContent = desc;
    player.innerHTML = embed;
    links.innerHTML = `
        <a href="${spotify}" target="_blank" rel="noopener">Spotify</a>
        <a href="${bandcamp}" target="_blank" rel="noopener">Comprar</a>
        <button type="button" data-action="share" data-title="${title} — ${artist}" data-url="${bandcamp}">Compartir</button>`;
    openModal(single);
}

// ── Compartir (Web Share API + fallback) ──
links.addEventListener('click', e => {
    const btn = e.target.closest('[data-action="share"]');
    if (btn) share(btn);
});

async function share(btn) {
    const { title, url } = btn.dataset;
    if (navigator.share) {
        try { await navigator.share({ title, url }); }
        catch { /* el usuario canceló el diálogo */ }
        return;
    }
    // Navegadores sin Web Share (p. ej. Firefox de escritorio): copiar al portapapeles
    try {
        await navigator.clipboard.writeText(url);
        const original = btn.textContent;
        btn.textContent = '¡Enlace copiado!';
        setTimeout(() => { btn.textContent = original; }, 1500);
    } catch {
        window.open(url, '_blank', 'noopener');
    }
}

// ── Abrir / cerrar modal ──
closeBtn.addEventListener('click', closeModal);

overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal();
});

modal.addEventListener('keydown', trapFocus);

function openModal(opener) {
    lastFocused = opener ?? document.activeElement;
    overlay.style.display = 'flex';
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => requestAnimationFrame(() => {
        overlay.classList.add('active');
    }));
    closeBtn.focus();
}

function closeModal() {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => {
        overlay.style.display = 'none';
        player.innerHTML = '';
    }, 300);
    lastFocused?.focus();
}

// ── Focus trap: mantiene el Tab dentro del modal ──
function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const focusables = modal.querySelectorAll(
        'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last  = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
    }
}
