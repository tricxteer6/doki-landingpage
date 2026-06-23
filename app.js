let carouselIndex = 0;
let carouselSlides = [];
let carouselTimer = null;
let heroBgImage = '';
let publishedEvents = [];
let navbarHideTimer = null;
let navbarHovering = false;
let lastScrollY = 0;
const NAVBAR_HIDE_DELAY = 10000;
const SCROLL_TOP_THRESHOLD = 8;

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

function resolveImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads')) return `${API_ORIGIN}${url}`;
  return url;
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function renderHero(hero) {
  const titleEl = document.getElementById('hero-title');
  const subtitleEl = document.getElementById('hero-subtitle');

  if (titleEl) titleEl.textContent = hero.title || '';
  if (subtitleEl) subtitleEl.textContent = hero.subtitle || '';

  heroBgImage = hero.bg_image || '';
  applyHeroBackground();
}

function applyHeroBackground() {
  const carouselBg = document.getElementById('hero-carousel-bg');
  const staticBg = document.getElementById('hero-static-bg');

  if (carouselSlides.length > 0) {
    carouselBg?.classList.remove('hidden');
    if (staticBg) {
      staticBg.style.backgroundImage = '';
      staticBg.classList.add('hidden');
    }
    return;
  }

  carouselBg?.classList.add('hidden');
  staticBg?.classList.remove('hidden');

  if (heroBgImage && staticBg) {
    staticBg.style.backgroundImage = `url('${resolveImageUrl(heroBgImage)}')`;
  } else if (staticBg) {
    staticBg.style.backgroundImage = '';
  }
}

function renderCarousel(slides) {
  const carouselBg = document.getElementById('hero-carousel-bg');
  const track = document.getElementById('carousel-track');
  const dots = document.getElementById('carousel-dots');

  if (!slides || slides.length === 0) {
    carouselSlides = [];
    carouselBg?.classList.add('hidden');
    dots?.classList.add('hidden');
    applyHeroBackground();
    return;
  }

  carouselSlides = slides;
  carouselIndex = 0;

  track.innerHTML = slides
    .map(
      (slide) => `
      <div class="carousel-slide">
        <img src="${resolveImageUrl(slide.image_url)}" alt=""
          class="w-full h-full object-cover" loading="lazy" />
      </div>
    `
    )
    .join('');

  if (slides.length > 1) {
    dots.classList.remove('hidden');
    dots.innerHTML = slides
      .map(
        (_, i) => `
        <button type="button" data-index="${i}" aria-label="Go to slide ${i + 1}"
          class="carousel-dot w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition ${i === 0 ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}"></button>
      `
      )
      .join('');

    dots.querySelectorAll('.carousel-dot').forEach((dot) => {
      dot.addEventListener('click', () => goToSlide(Number(dot.dataset.index)));
    });
  } else {
    dots.classList.add('hidden');
    dots.innerHTML = '';
  }

  applyHeroBackground();
  updateCarouselView();
  startCarouselAutoplay();
}

function updateCarouselView() {
  const track = document.getElementById('carousel-track');
  const dots = document.querySelectorAll('.carousel-dot');

  if (!track || !carouselSlides.length) return;

  track.style.transform = `translateX(-${carouselIndex * 100}%)`;

  dots.forEach((dot, i) => {
    dot.classList.toggle('bg-white', i === carouselIndex);
    dot.classList.toggle('scale-125', i === carouselIndex);
    dot.classList.toggle('bg-white/50', i !== carouselIndex);
  });
}

function goToSlide(index) {
  if (!carouselSlides.length) return;
  carouselIndex = (index + carouselSlides.length) % carouselSlides.length;
  updateCarouselView();
  resetCarouselAutoplay();
}

function nextSlide() {
  goToSlide(carouselIndex + 1);
}

function prevSlide() {
  goToSlide(carouselIndex - 1);
}

function startCarouselAutoplay() {
  stopCarouselAutoplay();
  if (carouselSlides.length > 1) {
    carouselTimer = setInterval(nextSlide, 5000);
  }
}

function stopCarouselAutoplay() {
  if (carouselTimer) {
    clearInterval(carouselTimer);
    carouselTimer = null;
  }
}

function resetCarouselAutoplay() {
  stopCarouselAutoplay();
  startCarouselAutoplay();
}

function initCarouselControls() {
  const heroSection = document.getElementById('hero-section');
  heroSection?.addEventListener('mouseenter', stopCarouselAutoplay);
  heroSection?.addEventListener('mouseleave', startCarouselAutoplay);

  let touchStartX = 0;
  heroSection?.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopCarouselAutoplay();
  }, { passive: true });
  heroSection?.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (carouselSlides.length > 1 && Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    startCarouselAutoplay();
  }, { passive: true });
}

function truncateText(text, max = 120) {
  if (!text || text.length <= max) return text || '';
  return `${text.slice(0, max).trim()}…`;
}

function renderEvents(events) {
  const container = document.getElementById('events-container');
  const loadingEl = document.getElementById('events-loading');
  const emptyEl = document.getElementById('events-empty');

  if (loadingEl) loadingEl.classList.add('hidden');

  if (!events || events.length === 0) {
    publishedEvents = [];
    if (emptyEl) emptyEl.classList.remove('hidden');
    return;
  }

  publishedEvents = events;
  if (emptyEl) emptyEl.classList.add('hidden');

  container.innerHTML = events
    .map(
      (event, index) => `
      <article role="button" tabindex="0" data-event-index="${index}"
        class="event-card group bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden border border-gray-100 cursor-pointer hover:border-doki-orange/40 focus:outline-none focus:ring-2 focus:ring-doki-orange">
        <div class="aspect-video bg-doki-light overflow-hidden relative">
          ${
            event.image_url
              ? `<img src="${resolveImageUrl(event.image_url)}" alt="${escapeHtml(event.title)}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />`
              : `<div class="w-full h-full flex items-center justify-center">
                   <svg class="w-16 h-16 text-doki-orange/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                   </svg>
                 </div>`
          }
          <span class="absolute bottom-3 right-3 bg-doki-orange text-white text-xs font-semibold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition">Baca selengkapnya</span>
        </div>
        <div class="p-4 sm:p-6">
          <time class="text-xs text-doki-orange font-semibold uppercase tracking-wide">${formatDate(event.date)}</time>
          <h3 class="font-bold text-doki-dark text-lg mt-2 mb-2 leading-snug">${escapeHtml(event.title)}</h3>
          <p class="text-gray-600 text-sm leading-relaxed line-clamp-3">${escapeHtml(truncateText(event.description || 'Klik untuk melihat detail layanan.'))}</p>
        </div>
      </article>
    `
    )
    .join('');

  container.querySelectorAll('.event-card').forEach((card) => {
    const open = () => openLayananModal(Number(card.dataset.eventIndex));
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });
}

function openLayananModal(index) {
  const event = publishedEvents[index];
  if (!event) return;

  const modal = document.getElementById('layanan-modal');
  const img = document.getElementById('layanan-modal-image');
  const placeholder = document.getElementById('layanan-modal-image-placeholder');

  document.getElementById('layanan-modal-date').textContent = formatDate(event.date);
  document.getElementById('layanan-modal-title').textContent = event.title || '';
  document.getElementById('layanan-modal-desc').textContent =
    event.description || 'Hubungi kami untuk informasi lebih lanjut mengenai layanan ini.';

  if (event.image_url) {
    img.src = resolveImageUrl(event.image_url);
    img.alt = event.title || 'Layanan Dokinesia';
    img.classList.remove('hidden');
    placeholder.classList.add('hidden');
  } else {
    img.src = '';
    img.classList.add('hidden');
    placeholder.classList.remove('hidden');
  }

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  document.querySelector('.layanan-modal-body')?.scrollTo(0, 0);
}

function closeLayananModal() {
  document.getElementById('layanan-modal')?.classList.add('hidden');
  document.body.style.overflow = '';
}

function initLayananModal() {
  document.getElementById('layanan-modal-close')?.addEventListener('click', closeLayananModal);
  document.getElementById('layanan-modal-backdrop')?.addEventListener('click', closeLayananModal);
  document.getElementById('layanan-modal-cta')?.addEventListener('click', closeLayananModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLayananModal();
  });
}

function initDesktopNavbarAutoHide() {
  const wrapper = document.getElementById('navbar-wrapper');
  const hoverZone = document.getElementById('navbar-hover-zone');
  if (!wrapper) return;

  const isDesktop = () => window.matchMedia('(min-width: 768px)').matches;

  function clearHideTimer() {
    if (navbarHideTimer) {
      clearTimeout(navbarHideTimer);
      navbarHideTimer = null;
    }
  }

  function showNavbar() {
    if (!isDesktop()) return;
    wrapper.classList.remove('navbar-hidden');
    clearHideTimer();
  }

  function hideNavbar() {
    if (!isDesktop()) return;
    if (window.scrollY <= SCROLL_TOP_THRESHOLD) return;
    if (navbarHovering) return;
    wrapper.classList.add('navbar-hidden');
  }

  function scheduleHideAfterLeave() {
    if (!isDesktop()) return;
    if (window.scrollY <= SCROLL_TOP_THRESHOLD) return;
    clearHideTimer();
    navbarHideTimer = setTimeout(() => {
      if (!navbarHovering) hideNavbar();
    }, NAVBAR_HIDE_DELAY);
  }

  function onNavbarEnter() {
    navbarHovering = true;
    showNavbar();
  }

  function onNavbarLeave() {
    navbarHovering = false;
    scheduleHideAfterLeave();
  }

  function onScroll() {
    if (!isDesktop()) return;

    const y = window.scrollY;

    if (y <= SCROLL_TOP_THRESHOLD) {
      showNavbar();
      lastScrollY = y;
      return;
    }

    if (y > lastScrollY + 4) {
      hideNavbar();
    }

    lastScrollY = y;
  }

  function bindDesktopBehavior() {
    if (!isDesktop()) {
      wrapper.classList.remove('navbar-hidden');
      navbarHovering = false;
      clearHideTimer();
      return;
    }

    lastScrollY = window.scrollY;
    if (window.scrollY <= SCROLL_TOP_THRESHOLD) {
      showNavbar();
    } else {
      wrapper.classList.add('navbar-hidden');
    }
  }

  let scrollTicking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        onScroll();
        scrollTicking = false;
      });
    },
    { passive: true }
  );

  wrapper.addEventListener('mouseenter', onNavbarEnter);
  wrapper.addEventListener('mouseleave', onNavbarLeave);
  hoverZone?.addEventListener('mouseenter', onNavbarEnter);
  hoverZone?.addEventListener('mouseleave', onNavbarLeave);

  window.addEventListener('resize', bindDesktopBehavior);
  bindDesktopBehavior();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderLogo(data) {
  const container = document.getElementById('site-logo');
  const img = document.getElementById('site-logo-img');
  const fallback = document.getElementById('site-logo-fallback');
  if (!container || !img || !fallback) return;

  if (data?.logo_url) {
    img.src = resolveImageUrl(data.logo_url);
    img.classList.remove('hidden');
    fallback.classList.add('hidden');
    container.classList.remove('bg-doki-orange');
  } else {
    img.src = '';
    img.classList.add('hidden');
    fallback.classList.remove('hidden');
    container.classList.add('bg-doki-orange');
  }
}

async function loadLogo() {
  try {
    const data = await fetchJSON(`${API_BASE_URL}/logo`);
    renderLogo(data);
  } catch (err) {
    console.error('Failed to load logo:', err);
  }
}

async function loadHero() {
  try {
    const hero = await fetchJSON(`${API_BASE_URL}/hero`);
    renderHero(hero);
  } catch (err) {
    console.error('Failed to load hero:', err);
    const titleEl = document.getElementById('hero-title');
    const subtitleEl = document.getElementById('hero-subtitle');
    if (titleEl) titleEl.textContent = 'Urus Dokumen Kilat';
    if (subtitleEl) subtitleEl.textContent = 'Tidak dapat memuat data hero. Pastikan API backend berjalan.';
  }
}

async function loadCarousel() {
  try {
    const slides = await fetchJSON(`${API_BASE_URL}/carousel`);
    renderCarousel(slides);
  } catch (err) {
    console.error('Failed to load carousel:', err);
    carouselSlides = [];
    applyHeroBackground();
  }
}

async function loadEvents() {
  const loadingEl = document.getElementById('events-loading');
  if (loadingEl) loadingEl.classList.remove('hidden');

  try {
    const events = await fetchJSON(`${API_BASE_URL}/events`);
    renderEvents(events);
  } catch (err) {
    console.error('Failed to load events:', err);
    if (loadingEl) loadingEl.classList.add('hidden');
    const emptyEl = document.getElementById('events-empty');
    if (emptyEl) {
      emptyEl.textContent = 'Gagal memuat layanan. Pastikan API backend berjalan.';
      emptyEl.classList.remove('hidden');
    }
  }
}

function initMobileNav() {
  const menu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('mobile-menu-overlay');
  const openBtn = document.getElementById('mobile-menu-btn');
  const closeBtn = document.getElementById('mobile-menu-close');

  function openMenu() {
    menu.classList.add('open');
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menu.classList.remove('open');
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  }

  openBtn?.addEventListener('click', openMenu);
  closeBtn?.addEventListener('click', closeMenu);
  overlay?.addEventListener('click', closeMenu);
  document.querySelectorAll('.mobile-nav-link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}

function initContactWhatsApp() {
  const WHATSAPP_NUMBER = '6281258880677';

  function buildWhatsAppMessage(nama, pesan) {
    return `Halo Dokinesia,

Saya ingin berkonsultasi mengenai layanan dokumen.

*Nama:* ${nama}
*Pesan:*
${pesan}

Terima kasih.`;
  }

  document.getElementById('btn-whatsapp')?.addEventListener('click', () => {
    const nama = document.getElementById('kontak-nama')?.value.trim();
    const pesan = document.getElementById('kontak-pesan')?.value.trim();

    if (!nama || !pesan) {
      alert('Mohon isi nama dan pesan terlebih dahulu.');
      return;
    }

    const text = encodeURIComponent(buildWhatsAppMessage(nama, pesan));
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank', 'noopener');
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  initMobileNav();
  initDesktopNavbarAutoHide();
  initCarouselControls();
  initContactWhatsApp();
  initLayananModal();
  await loadHero();
  await loadLogo();
  await loadCarousel();
  loadEvents();
});
