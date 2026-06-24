let carouselIndex = 0;
let carouselSlides = [];
let carouselTimer = null;
let heroBgImage = '';
let publishedEvents = [];
let eventMobileIndex = 0;
let eventMobileTouchStartX = 0;
let publishedPackages = [];
let packageMobileIndex = 0;
let packageMobileTouchStartX = 0;
let publishedTestimonials = [];
let testimonialMobileIndex = 0;
let testimonialMobileTouchStartX = 0;
let navbarHideTimer = null;
let navbarHovering = false;
let lastScrollY = 0;
const NAVBAR_HIDE_DELAY = 10000;
const SCROLL_TOP_THRESHOLD = 8;

const DEFAULT_ABOUT = {
  paragraph1:
    'Dokinesia (Dokumen Kilat Indonesia) adalah penyedia layanan pengurusan dokumen pernikahan lintas negara, khususnya antara WNI dan WNA Taiwan, sejak tahun 2003.',
  paragraph2:
    'Dengan pengalaman lebih dari 20 tahun, kami memahami tantangan yang sering dihadapi pasangan lintas negara seperti perbedaan hukum, prosedur yang rumit, dan kendala bahasa.',
  paragraph3:
    'Kami hadir sebagai pendamping profesional yang komunikatif dan solutif. Ditangani oleh tim berpengalaman dan fasih dalam Bahasa Indonesia & Mandarin, seluruh proses berjalan cepat, aman, dan sesuai hukum Indonesia dan Taiwan.',
  quote: 'Dokinesia Solusi Mudah untuk Pernikahan Tanpa Ribet. Duduk Manis, Terima Beres!',
};

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
  const path = url.startsWith('/') ? url : `/${url}`;
  if (path.startsWith('/uploads')) {
    return `${typeof UPLOADS_ORIGIN !== 'undefined' ? UPLOADS_ORIGIN : API_ORIGIN}${path}`;
  }
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

function buildEventCardHtml(event, index) {
  return `
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
    `;
}

function bindEventCards(root) {
  if (!root) return;
  root.querySelectorAll('.event-card').forEach((card) => {
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

function updateEventsMobileNav() {
  const prev = document.getElementById('events-prev');
  const next = document.getElementById('events-next');
  const dots = document.getElementById('events-mobile-dots');
  const single = publishedEvents.length <= 1;

  prev?.toggleAttribute('disabled', single);
  next?.toggleAttribute('disabled', single);
  dots?.classList.toggle('hidden', single);
}

function renderEventMobileDots() {
  const dots = document.getElementById('events-mobile-dots');
  if (!dots) return;

  dots.innerHTML = publishedEvents
    .map(
      (_, i) => `
        <button type="button" data-event-dot="${i}" aria-label="Layanan ${i + 1}"
          class="w-2.5 h-2.5 rounded-full ${i === eventMobileIndex ? 'bg-doki-orange scale-110' : 'bg-gray-300'}"></button>
      `
    )
    .join('');

  dots.querySelectorAll('[data-event-dot]').forEach((dot) => {
    dot.addEventListener('click', () => goToEventMobile(Number(dot.dataset.eventDot)));
  });
}

function getEventMobileView() {
  return document.getElementById('events-mobile-view');
}

function syncEventSlideWidths() {
  const view = getEventMobileView();
  const track = document.getElementById('events-mobile-track');
  if (!view || !track) return 0;

  const width = view.clientWidth;
  track.querySelectorAll('.events-mobile-slide').forEach((slide) => {
    slide.style.width = `${width}px`;
  });
  return width;
}

function updateEventMobileSlide(animate = true) {
  const track = document.getElementById('events-mobile-track');
  if (!track || !publishedEvents.length) return;

  eventMobileIndex =
    ((eventMobileIndex % publishedEvents.length) + publishedEvents.length) %
    publishedEvents.length;

  const step = syncEventSlideWidths() || getEventMobileView()?.clientWidth || 0;

  if (!animate) {
    track.style.transition = 'none';
  }

  track.style.transform = `translateX(-${eventMobileIndex * step}px)`;

  if (!animate) {
    track.offsetHeight;
    track.style.transition = '';
  }

  renderEventMobileDots();
  updateEventsMobileNav();
}

function goToEventMobile(index) {
  if (!publishedEvents.length) return;
  const next =
    ((index % publishedEvents.length) + publishedEvents.length) %
    publishedEvents.length;
  if (next === eventMobileIndex) return;
  eventMobileIndex = next;
  updateEventMobileSlide(true);
}

function buildEventsMobileTrack() {
  const track = document.getElementById('events-mobile-track');
  if (!track || !publishedEvents.length) return;

  track.innerHTML = publishedEvents
    .map(
      (event, index) => `
      <div class="events-mobile-slide">
        ${buildEventCardHtml(event, index)}
      </div>
    `
    )
    .join('');

  bindEventCards(track);
  eventMobileIndex = 0;
  requestAnimationFrame(() => updateEventMobileSlide(false));
}

function initEventsMobileNav() {
  document.getElementById('events-prev')?.addEventListener('click', () => {
    goToEventMobile(eventMobileIndex - 1);
  });
  document.getElementById('events-next')?.addEventListener('click', () => {
    goToEventMobile(eventMobileIndex + 1);
  });

  const view = getEventMobileView();
  if (!view) return;

  view.addEventListener(
    'touchstart',
    (e) => {
      eventMobileTouchStartX = e.touches[0].clientX;
    },
    { passive: true }
  );

  view.addEventListener(
    'touchend',
    (e) => {
      const diff = e.changedTouches[0].clientX - eventMobileTouchStartX;
      if (Math.abs(diff) < 50) return;
      if (diff < 0) goToEventMobile(eventMobileIndex + 1);
      else goToEventMobile(eventMobileIndex - 1);
    },
    { passive: true }
  );

  window.addEventListener('resize', () => {
    if (!publishedEvents.length) return;
    updateEventMobileSlide(false);
  });
}

function renderEvents(events) {
  const desktopEl = document.getElementById('events-desktop');
  const mobileEl = document.getElementById('events-mobile');
  const loadingEl = document.getElementById('events-loading');
  const emptyEl = document.getElementById('events-empty');

  if (loadingEl) loadingEl.classList.add('hidden');

  if (!events || events.length === 0) {
    publishedEvents = [];
    if (emptyEl) emptyEl.classList.remove('hidden');
    if (desktopEl) desktopEl.innerHTML = '';
    mobileEl?.classList.add('hidden');
    return;
  }

  publishedEvents = events;
  if (emptyEl) emptyEl.classList.add('hidden');

  const cardsHtml = events.map((event, index) => buildEventCardHtml(event, index)).join('');

  if (desktopEl) {
    desktopEl.innerHTML = cardsHtml;
    bindEventCards(desktopEl);
  }

  if (mobileEl) {
    mobileEl.classList.remove('hidden');
    buildEventsMobileTrack();
  }
}

function packageImageBlock(pkg) {
  const src = resolveImageUrl(pkg.image_url);
  if (!src) {
    return `<div class="w-full h-48 sm:h-52 bg-doki-light flex items-center justify-center shrink-0">
      <svg class="w-16 h-16 text-doki-orange/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
    </div>`;
  }
  return `<div class="relative w-full h-48 sm:h-52 bg-doki-light overflow-hidden shrink-0">
    <img src="${src}" alt="${escapeHtml(pkg.name)}" class="absolute inset-0 w-full h-full object-cover" loading="lazy"
      onerror="this.style.display='none';this.nextElementSibling?.classList.remove('hidden')" />
    <div class="hidden absolute inset-0 flex items-center justify-center bg-doki-light">
      <svg class="w-16 h-16 text-doki-orange/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
    </div>
  </div>`;
}

function buildPackageCardHtml(pkg) {
  const featured = !!pkg.is_featured;
  const benefits = Array.isArray(pkg.benefits) ? pkg.benefits : [];
  const waText = encodeURIComponent(`Halo Dokinesia, saya tertarik paket ${pkg.name}.`);
  const waLink = `https://wa.me/6281258880677?text=${waText}`;

  return `
    <article class="package-card relative bg-white rounded-2xl overflow-hidden flex flex-col h-full border-2 shadow-sm ${featured ? 'border-doki-orange' : 'border-gray-200'}">
      ${featured ? '<span class="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">Paling Populer</span>' : ''}
      ${packageImageBlock(pkg)}
      <div class="p-5 sm:p-6 flex flex-col flex-1">
        <h3 class="font-display text-xl sm:text-2xl font-bold text-doki-orange uppercase text-center">${escapeHtml(pkg.name)}</h3>
        ${pkg.subtitle ? `<p class="text-sm text-gray-500 text-center mt-1 mb-4">${escapeHtml(pkg.subtitle)}</p>` : '<div class="mb-4"></div>'}
        <ul class="space-y-2.5 mb-6 flex-1">
          ${benefits
            .map(
              (item) => `
            <li class="flex items-start gap-2 text-sm text-gray-600">
              <svg class="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              <span>${escapeHtml(item)}</span>
            </li>
          `
            )
            .join('')}
        </ul>
        <a href="${waLink}" target="_blank" rel="noopener noreferrer"
          class="block text-center w-full py-3 rounded-full font-semibold text-sm transition ${featured ? 'bg-doki-orange hover:bg-doki-dark text-white' : 'border-2 border-doki-orange text-doki-orange hover:bg-doki-orange hover:text-white'}">
          Ambil Paket Ini
        </a>
      </div>
    </article>
  `;
}

function updatePackagesMobileNav() {
  const prev = document.getElementById('packages-prev');
  const next = document.getElementById('packages-next');
  const dots = document.getElementById('packages-mobile-dots');
  const single = publishedPackages.length <= 1;

  prev?.toggleAttribute('disabled', single);
  next?.toggleAttribute('disabled', single);
  dots?.classList.toggle('hidden', single);
}

function renderPackageMobileDots() {
  const dots = document.getElementById('packages-mobile-dots');
  if (!dots) return;

  dots.innerHTML = publishedPackages
    .map(
      (_, i) => `
        <button type="button" data-pkg-dot="${i}" aria-label="Paket ${i + 1}"
          class="w-2.5 h-2.5 rounded-full ${i === packageMobileIndex ? 'bg-doki-orange scale-110' : 'bg-gray-300'}"></button>
      `
    )
    .join('');

  dots.querySelectorAll('[data-pkg-dot]').forEach((dot) => {
    dot.addEventListener('click', () => goToPackageMobile(Number(dot.dataset.pkgDot)));
  });
}

function getPackageMobileView() {
  return document.getElementById('packages-mobile-view');
}

function syncPackageSlideWidths() {
  const view = getPackageMobileView();
  const track = document.getElementById('packages-mobile-track');
  if (!view || !track) return 0;

  const width = view.clientWidth;
  track.querySelectorAll('.packages-mobile-slide').forEach((slide) => {
    slide.style.width = `${width}px`;
  });
  return width;
}

function updatePackageMobileSlide(animate = true) {
  const track = document.getElementById('packages-mobile-track');
  if (!track || !publishedPackages.length) return;

  packageMobileIndex =
    ((packageMobileIndex % publishedPackages.length) + publishedPackages.length) %
    publishedPackages.length;

  const step = syncPackageSlideWidths() || getPackageMobileView()?.clientWidth || 0;

  if (!animate) {
    track.style.transition = 'none';
  }

  track.style.transform = `translateX(-${packageMobileIndex * step}px)`;

  if (!animate) {
    track.offsetHeight;
    track.style.transition = '';
  }

  renderPackageMobileDots();
  updatePackagesMobileNav();
}

function goToPackageMobile(index) {
  if (!publishedPackages.length) return;
  const next =
    ((index % publishedPackages.length) + publishedPackages.length) %
    publishedPackages.length;
  if (next === packageMobileIndex) return;
  packageMobileIndex = next;
  updatePackageMobileSlide(true);
}

function buildPackagesMobileTrack() {
  const track = document.getElementById('packages-mobile-track');
  if (!track || !publishedPackages.length) return;

  track.innerHTML = publishedPackages
    .map(
      (pkg) => `
      <div class="packages-mobile-slide">
        ${buildPackageCardHtml(pkg)}
      </div>
    `
    )
    .join('');

  packageMobileIndex = 0;
  requestAnimationFrame(() => updatePackageMobileSlide(false));
}

function initPackagesMobileNav() {
  document.getElementById('packages-prev')?.addEventListener('click', () => {
    goToPackageMobile(packageMobileIndex - 1);
  });
  document.getElementById('packages-next')?.addEventListener('click', () => {
    goToPackageMobile(packageMobileIndex + 1);
  });

  const view = document.getElementById('packages-mobile-view');
  if (!view) return;

  view.addEventListener(
    'touchstart',
    (e) => {
      packageMobileTouchStartX = e.touches[0].clientX;
    },
    { passive: true }
  );

  view.addEventListener(
    'touchend',
    (e) => {
      const diff = e.changedTouches[0].clientX - packageMobileTouchStartX;
      if (Math.abs(diff) < 50) return;
      if (diff < 0) goToPackageMobile(packageMobileIndex + 1);
      else goToPackageMobile(packageMobileIndex - 1);
    },
    { passive: true }
  );

  window.addEventListener('resize', () => {
    if (!publishedPackages.length) return;
    updatePackageMobileSlide(false);
  });
}

function renderPackages(packages) {
  const loadingEl = document.getElementById('packages-loading');
  const emptyEl = document.getElementById('packages-empty');
  const desktopEl = document.getElementById('packages-desktop');
  const mobileEl = document.getElementById('packages-mobile');

  loadingEl?.classList.add('hidden');

  if (!packages || packages.length === 0) {
    publishedPackages = [];
    emptyEl?.classList.remove('hidden');
    if (desktopEl) desktopEl.innerHTML = '';
    mobileEl?.classList.add('hidden');
    return;
  }

  publishedPackages = packages;
  packageMobileIndex = 0;
  emptyEl?.classList.add('hidden');

  if (desktopEl) {
    desktopEl.innerHTML = packages.map((pkg) => buildPackageCardHtml(pkg)).join('');
  }

  if (mobileEl) {
    mobileEl.classList.remove('hidden');
    buildPackagesMobileTrack();
  }
}

async function loadPackages() {
  const loadingEl = document.getElementById('packages-loading');
  loadingEl?.classList.remove('hidden');

  try {
    const packages = await fetchJSON(`${API_BASE_URL}/packages`);
    renderPackages(packages);
  } catch (err) {
    console.error('Failed to load packages:', err);
    loadingEl?.classList.add('hidden');
    document.getElementById('packages-empty')?.classList.remove('hidden');
  }
}

function parseYoutubeId(url) {
  const match = String(url).match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  return match ? match[1] : null;
}

function loadScriptOnce(src, id) {
  return new Promise((resolve) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.body.appendChild(script);
  });
}

async function refreshSocialEmbeds() {
  if (document.querySelector('.tiktok-embed')) {
    await loadScriptOnce('https://www.tiktok.com/embed.js', 'tiktok-embed-js');
    window.tiktokEmbed?.lib?.render?.();
  }
  if (document.querySelector('.instagram-media')) {
    await loadScriptOnce('https://www.instagram.com/embed.js', 'instagram-embed-js');
    window.instgrm?.Embeds?.process?.();
  }
}

function buildMediaEmbedHtml(item) {
  const title = escapeHtml(item.title || '');
  const url = escapeHtml(item.embed_url || '');
  const isPortrait = item.platform === 'tiktok' || item.platform === 'instagram';
  let embed = '';

  if (item.platform === 'youtube') {
    const id = parseYoutubeId(item.embed_url);
    if (id) {
      embed = `<iframe class="w-full h-full" src="https://www.youtube.com/embed/${id}" title="${title || 'YouTube video'}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>`;
    }
  } else if (item.platform === 'tiktok') {
    embed = `<blockquote class="tiktok-embed" cite="${url}"><section><a target="_blank" rel="noopener noreferrer" href="${url}">Tonton di TikTok</a></section></blockquote>`;
  } else if (item.platform === 'instagram') {
    embed = `<blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="14"></blockquote>`;
  }

  const articleClass = isPortrait
    ? 'media-embed-card w-full max-w-[340px]'
    : 'media-embed-card w-full max-w-3xl';
  const frameClass = isPortrait
    ? 'media-embed-portrait aspect-[9/16]'
    : 'aspect-video';

  return `
    <article class="${articleClass}">
      ${title ? `<h3 class="font-semibold text-doki-dark mb-3 text-center">${title}</h3>` : ''}
      <div class="media-embed-frame ${frameClass} rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center w-full">
        ${embed || '<p class="text-sm text-gray-400 p-6">Embed tidak dapat ditampilkan.</p>'}
      </div>
    </article>
  `;
}

function renderMedia(items) {
  const loadingEl = document.getElementById('media-loading');
  const emptyEl = document.getElementById('media-empty');
  const grid = document.getElementById('media-grid');

  loadingEl?.classList.add('hidden');

  if (!items || !items.length) {
    emptyEl?.classList.remove('hidden');
    if (grid) grid.innerHTML = '';
    return;
  }

  emptyEl?.classList.add('hidden');
  if (grid) {
    grid.innerHTML = items.map((item) => buildMediaEmbedHtml(item)).join('');
    refreshSocialEmbeds();
  }
}

async function loadMedia() {
  const loadingEl = document.getElementById('media-loading');
  loadingEl?.classList.remove('hidden');

  try {
    const items = await fetchJSON(`${API_BASE_URL}/media`);
    renderMedia(items);
  } catch (err) {
    console.error('Failed to load media:', err);
    loadingEl?.classList.add('hidden');
    document.getElementById('media-empty')?.classList.remove('hidden');
  }
}

function buildTestimonialCardHtml(item) {
  const src = resolveImageUrl(item.image_url);
  const imageBlock = src
    ? `<img src="${src}" alt="${escapeHtml(item.name)}" class="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full object-cover border-2 border-doki-orange/60 shrink-0" loading="lazy"
        onerror="this.style.display='none';this.nextElementSibling?.classList.remove('hidden')" />
       <div class="hidden w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
         <svg class="w-10 h-10 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
       </div>`
    : `<div class="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
         <svg class="w-10 h-10 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
       </div>`;

  return `
    <article class="testimonial-card bg-white/10 rounded-xl p-5 sm:p-6 backdrop-blur-sm h-full flex flex-col items-center text-center">
      ${imageBlock}
      <h3 class="font-bold text-doki-accent">${escapeHtml(item.name)}</h3>
      ${item.origin ? `<p class="text-sm text-white/70 mt-1 mb-3">${escapeHtml(item.origin)}</p>` : '<div class="mb-3"></div>'}
      <p class="text-sm text-white/90 leading-relaxed flex-1">${escapeHtml(item.description)}</p>
    </article>
  `;
}

function getTestimonialSlidesPerView() {
  if (!publishedTestimonials.length) return 1;
  if (window.innerWidth >= 1024) return Math.min(3, publishedTestimonials.length);
  if (window.innerWidth >= 768) return Math.min(2, publishedTestimonials.length);
  return 1;
}

function getTestimonialMaxIndex() {
  return Math.max(0, publishedTestimonials.length - getTestimonialSlidesPerView());
}

function updateTestimonialsCarouselNav() {
  const prev = document.getElementById('testimonials-prev');
  const next = document.getElementById('testimonials-next');
  const dots = document.getElementById('testimonials-carousel-dots');
  const maxIndex = getTestimonialMaxIndex();
  const single = maxIndex === 0;

  prev?.toggleAttribute('disabled', single || testimonialMobileIndex <= 0);
  next?.toggleAttribute('disabled', single || testimonialMobileIndex >= maxIndex);
  dots?.classList.toggle('hidden', single);
}

function renderTestimonialCarouselDots() {
  const dots = document.getElementById('testimonials-carousel-dots');
  if (!dots) return;

  const maxIndex = getTestimonialMaxIndex();
  const count = maxIndex + 1;

  dots.innerHTML = Array.from({ length: count }, (_, i) => `
        <button type="button" data-testimonial-dot="${i}" aria-label="Testimonial ${i + 1}"
          class="w-2.5 h-2.5 rounded-full ${i === testimonialMobileIndex ? 'bg-doki-orange scale-110' : 'bg-white/30'}"></button>
      `).join('');

  dots.querySelectorAll('[data-testimonial-dot]').forEach((dot) => {
    dot.addEventListener('click', () => goToTestimonialCarousel(Number(dot.dataset.testimonialDot)));
  });
}

function getTestimonialCarouselView() {
  return document.getElementById('testimonials-carousel-view');
}

function syncTestimonialSlideWidths() {
  const view = getTestimonialCarouselView();
  const track = document.getElementById('testimonials-carousel-track');
  if (!view || !track) return 0;

  const perView = getTestimonialSlidesPerView();
  const slideWidth = view.clientWidth / perView;
  track.querySelectorAll('.testimonials-carousel-slide').forEach((slide) => {
    slide.style.width = `${slideWidth}px`;
  });
  return slideWidth;
}

function updateTestimonialCarouselSlide(animate = true) {
  const track = document.getElementById('testimonials-carousel-track');
  if (!track || !publishedTestimonials.length) return;

  const maxIndex = getTestimonialMaxIndex();
  testimonialMobileIndex = Math.min(Math.max(testimonialMobileIndex, 0), maxIndex);

  const step = syncTestimonialSlideWidths() || getTestimonialCarouselView()?.clientWidth || 0;

  if (!animate) {
    track.style.transition = 'none';
  }

  track.style.transform = `translateX(-${testimonialMobileIndex * step}px)`;

  if (!animate) {
    track.offsetHeight;
    track.style.transition = '';
  }

  renderTestimonialCarouselDots();
  updateTestimonialsCarouselNav();
}

function goToTestimonialCarousel(index) {
  if (!publishedTestimonials.length) return;
  const maxIndex = getTestimonialMaxIndex();
  const next = Math.min(Math.max(index, 0), maxIndex);
  if (next === testimonialMobileIndex) return;
  testimonialMobileIndex = next;
  updateTestimonialCarouselSlide(true);
}

function buildTestimonialsCarouselTrack() {
  const track = document.getElementById('testimonials-carousel-track');
  if (!track || !publishedTestimonials.length) return;

  track.innerHTML = publishedTestimonials
    .map(
      (item) => `
      <div class="testimonials-carousel-slide">
        ${buildTestimonialCardHtml(item)}
      </div>
    `
    )
    .join('');

  testimonialMobileIndex = 0;
  requestAnimationFrame(() => updateTestimonialCarouselSlide(false));
}

function initTestimonialsCarousel() {
  document.getElementById('testimonials-prev')?.addEventListener('click', () => {
    goToTestimonialCarousel(testimonialMobileIndex - 1);
  });
  document.getElementById('testimonials-next')?.addEventListener('click', () => {
    goToTestimonialCarousel(testimonialMobileIndex + 1);
  });

  const view = getTestimonialCarouselView();
  if (!view) return;

  view.addEventListener(
    'touchstart',
    (e) => {
      testimonialMobileTouchStartX = e.touches[0].clientX;
    },
    { passive: true }
  );

  view.addEventListener(
    'touchend',
    (e) => {
      const diff = e.changedTouches[0].clientX - testimonialMobileTouchStartX;
      if (Math.abs(diff) < 50) return;
      if (diff < 0) goToTestimonialCarousel(testimonialMobileIndex + 1);
      else goToTestimonialCarousel(testimonialMobileIndex - 1);
    },
    { passive: true }
  );

  window.addEventListener('resize', () => {
    if (!publishedTestimonials.length) return;
    updateTestimonialCarouselSlide(false);
  });
}

function renderTestimonials(items) {
  const loadingEl = document.getElementById('testimonials-loading');
  const emptyEl = document.getElementById('testimonials-empty');
  const carouselEl = document.getElementById('testimonials-carousel');

  loadingEl?.classList.add('hidden');

  if (!items || !items.length) {
    publishedTestimonials = [];
    emptyEl?.classList.remove('hidden');
    carouselEl?.classList.add('hidden');
    return;
  }

  publishedTestimonials = items;
  testimonialMobileIndex = 0;
  emptyEl?.classList.add('hidden');

  if (carouselEl) {
    carouselEl.classList.remove('hidden');
    buildTestimonialsCarouselTrack();
  }
}

async function loadTestimonials() {
  const loadingEl = document.getElementById('testimonials-loading');
  loadingEl?.classList.remove('hidden');

  try {
    const items = await fetchJSON(`${API_BASE_URL}/testimonials`);
    renderTestimonials(items);
  } catch (err) {
    console.error('Failed to load testimonials:', err);
    loadingEl?.classList.add('hidden');
    document.getElementById('testimonials-empty')?.classList.remove('hidden');
  }
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
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLayananModal();
  });
}

function updateNavbarAppearance() {
  const wrapper = document.getElementById('navbar-wrapper');
  if (!wrapper) return;

  const atTop = window.scrollY <= SCROLL_TOP_THRESHOLD;
  wrapper.classList.toggle('navbar-at-top', atTop);
  wrapper.classList.toggle('navbar-solid', !atTop);
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
    updateNavbarAppearance();
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
    updateNavbarAppearance();

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
    updateNavbarAppearance();

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

function renderAbout(about) {
  const data = { ...DEFAULT_ABOUT, ...about };

  document.getElementById('about-p1').textContent = data.paragraph1 || '';
  document.getElementById('about-p2').textContent = data.paragraph2 || '';
  document.getElementById('about-p3').textContent = data.paragraph3 || '';

  const quoteEl = document.getElementById('about-quote');
  if (quoteEl) {
    const quote = (data.quote || '').trim();
    quoteEl.textContent = quote ? `"${quote}"` : '';
    quoteEl.classList.toggle('hidden', !quote);
  }

  const img = document.getElementById('about-image');
  const placeholder = document.getElementById('about-image-placeholder');
  if (data.image_url && img) {
    img.src = resolveImageUrl(data.image_url);
    img.alt = 'Tentang Dokinesia';
    img.classList.remove('hidden');
    placeholder?.classList.add('hidden');
  } else {
    img?.classList.add('hidden');
    placeholder?.classList.remove('hidden');
  }
}

async function loadAbout() {
  try {
    const about = await fetchJSON(`${API_BASE_URL}/about`);
    renderAbout(about);
  } catch (err) {
    console.error('Failed to load about:', err);
    renderAbout(DEFAULT_ABOUT);
  }
}

function applyLogoSlot(containerId, imgId, fallbackId, logoUrl) {
  const container = document.getElementById(containerId);
  const img = document.getElementById(imgId);
  const fallback = document.getElementById(fallbackId);
  if (!container || !img || !fallback) return;

  if (logoUrl) {
    img.src = resolveImageUrl(logoUrl);
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

function renderLogo(data) {
  const logoUrl = data?.logo_url || '';
  applyLogoSlot('site-logo', 'site-logo-img', 'site-logo-fallback', logoUrl);
  applyLogoSlot('footer-logo', 'footer-logo-img', 'footer-logo-fallback', logoUrl);
}

function initFooter() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const social = window.DOKINESIA_CONFIG?.social || {};
  const map = {
    'footer-social-whatsapp': social.whatsapp || 'https://wa.me/6281258880677',
    'footer-social-instagram': social.instagram,
    'footer-social-facebook': social.facebook,
    'footer-social-tiktok': social.tiktok,
  };

  Object.entries(map).forEach(([id, url]) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (url) {
      el.href = url;
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });

  const floatWa = document.getElementById('whatsapp-float');
  if (floatWa && (social.whatsapp || map['footer-social-whatsapp'])) {
    floatWa.href = social.whatsapp || map['footer-social-whatsapp'];
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

document.addEventListener('DOMContentLoaded', async () => {
  initFooter();
  initMobileNav();
  initDesktopNavbarAutoHide();
  initCarouselControls();
  initLayananModal();
  initPackagesMobileNav();
  initEventsMobileNav();
  initTestimonialsCarousel();
  await Promise.all([
    loadLogo(),
    loadHero(),
    loadAbout(),
    loadCarousel(),
    loadPackages(),
    loadMedia(),
    loadTestimonials(),
  ]);
  loadEvents();
});
