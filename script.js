const overlay = document.getElementById('modal-overlay');
const modal = document.getElementById('modal');
const closeBtn = document.getElementById('modal-close');
const singles = document.querySelectorAll('article.single');

const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalArtist = document.getElementById('modal-artist');
const modalDescription = document.getElementById('modal-description');
const modalAudio = document.getElementById('modal-audio');
const modalAudioSrc = document.getElementById('modal-audio-src');
const modalLinks = document.getElementById('modal-links');

singles.forEach(single => {
    single.style.cursor = 'crosshair';
    single.addEventListener('click', () => {
        modalImg.src = single.dataset.img;
        const modalArtistImg = document.getElementById('modal-artist-img');
        modalArtistImg.src = single.dataset.artistph;
        modalArtistImg.alt = single.dataset.artist;
        modalImg.alt = single.dataset.title;
        modalTitle.textContent = single.dataset.title;
        modalArtist.textContent = single.dataset.artist;
        modalDescription.textContent = single.dataset.description;
        modalAudioSrc.src = single.dataset.audio;
        modalAudio.load();
        modalLinks.innerHTML = `
    <a href="${single.dataset.spotify}" target="_blank">Spotify</a>
    <a href="${single.dataset.bandcamp}" target="_blank">Bandcamp</a>
`;
        openModal();
    });
});

closeBtn.addEventListener('click', closeModal);

overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

function openModal() {
    overlay.style.display = 'flex';
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });
    });
}

function closeModal() {
    overlay.classList.remove('active');
    modalAudio.pause();
    modalAudio.currentTime = 0;
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);
}