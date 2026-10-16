const officialSite = 'https://harperhotels.com/';
const cityViews = {
  bali: { title: 'Bali', image: './assets/hero-room.png', alt: 'Warm Harper guest room' },
  yogyakarta: { title: 'Yogyakarta', image: './assets/journal-table.png', alt: 'A welcoming table arranged for sharing' },
  makassar: { title: 'Makassar', image: './assets/hotel-perintis.png', alt: 'Poolside space at a Harper hotel' },
};

function renderCity() {
  const requested = new URLSearchParams(window.location.search).get('city')?.toLowerCase();
  const city = requested && Object.hasOwn(cityViews, requested) ? requested : 'jakarta';
  document.querySelectorAll('[data-city]').forEach((tab) => {
    if (tab.dataset.city === city) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  });
  const view = document.getElementById('city-view');
  if (city !== 'jakarta') {
    const { title, image, alt } = cityViews[city];
    view.innerHTML = `<div class="city-landing"><div class="city-landing-copy"><p class="section-kicker">Find your rhythm</p><h3>${title}</h3><p>Explore the Harper experience in ${title}. For current properties, availability and booking details, visit the official Harper Hotels website.</p><a class="button button-primary" href="${officialSite}" target="_blank" rel="noopener noreferrer">Explore hotels <span aria-hidden="true">↗</span></a></div><div class="city-landing-photo"><img src="${image}" alt="${alt}" /></div></div>`;
    return;
  }
  const images = [
    { src: './assets/hotel-pasteur.png', title: 'Harper Pasteur', alt: 'Harper hotel exterior at dusk' },
    { src: './assets/hotel-malioboro.webp', title: 'Harper Malioboro', alt: 'Harper hotel building beneath a blue evening sky' },
    { src: './assets/hotel-perintis.png', title: 'Harper Perintis', alt: 'Poolside setting at Harper Perintis' },
    { src: './assets/hotel-cawang.png', title: 'Harper Cawang', alt: 'Harper Cawang building' },
  ];
  view.innerHTML = `<div class="gallery" aria-label="Preview Harper hotel photos">${images.map((photo, i) => `<button class="gallery-card${i === 0 ? ' is-active' : ''}" type="button" data-index="${i}" aria-label="Preview ${photo.title} photo" aria-pressed="${i === 0}"><img src="${photo.src}" alt="${photo.alt}" /><span class="gallery-label">${photo.title}</span></button>`).join('')}</div><div class="hotel-caption"><div><p id="hotel-location">Selected Harper stays · Indonesia</p><h3 id="hotel-name">${images[0].title}</h3></div><a href="${officialSite}" target="_blank" rel="noopener noreferrer">Discover hotels <span aria-hidden="true">↗</span></a></div>`;
  const cards = [...view.querySelectorAll('.gallery-card')];
  const select = (index) => {
    cards.forEach((card, i) => {
      const active = i === index;
      card.classList.toggle('is-active', active);
      card.setAttribute('aria-pressed', String(active));
    });
    document.getElementById('hotel-name').textContent = images[index].title;
  };
  cards.forEach((card, index) => {
    card.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse') select(index);
    });
    card.addEventListener('focus', () => select(index));
    card.addEventListener('click', () => select(index));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + cards.length) % cards.length;
        cards[next].focus();
      }
    });
  });
}

function setupMenu() {
  const button = document.querySelector('.menu-toggle');
  const menu = document.getElementById('primary-links');
  const close = () => {
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Open navigation menu');
    menu.classList.remove('is-open');
  };
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    menu.classList.toggle('is-open', open);
  });
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
  document.addEventListener('click', (event) => {
    if (!button.contains(event.target) && !menu.contains(event.target)) close();
  });
  window.matchMedia('(min-width: 801px)').addEventListener('change', close);
}

function setupNews() {
  const cards = [...document.querySelectorAll('.news-card')];
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  cards.forEach(card => card.classList.add('portal-pending'));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove('portal-pending');
      entry.target.classList.add('portal-visible');
      observer.unobserve(entry.target);
    });
  }, {threshold: .12, rootMargin: '0px 0px 48px 0px'});
  cards.forEach(card => observer.observe(card));
}

function setupSectionAnchors() {
  const nav = document.getElementById('site-nav');
  document.querySelectorAll('a[href="#journal"], a[href="#membership"]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    const section = document.querySelector(link.getAttribute('href'));
    const clearance = nav.getBoundingClientRect().height + 16;
    const top = window.scrollY + section.getBoundingClientRect().top - clearance;
    history.pushState(null, '', link.getAttribute('href'));
    window.scrollTo({top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }));
}

function setupMembershipMotion() {
  const section = document.getElementById('membership');
  const stage = section.querySelector('.membership-stage');
  const visual = section.querySelector('.membership-visual');
  const prints = [...section.querySelectorAll('.membership-print')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = value => Math.max(0, Math.min(1, value));
  let frame = 0;
  function update() {
    frame = 0;
    const header = document.getElementById('site-nav').getBoundingClientRect().height;
    const distance = Math.max(1, section.getBoundingClientRect().height - stage.getBoundingClientRect().height);
    const progress = clamp((header - section.getBoundingClientRect().top) / distance);
    const width = visual.clientWidth;
    const height = visual.clientHeight;
    const radiusX = width * .48;
    const radiusY = height * .48;
    prints.forEach((print, index) => {
      // Photos develop out of the phone's center and curl toward the edges.
      // The short fade at either end of the cycle conceals each reset.
      const phase = reduced.matches ? (index + .5) / prints.length : ((index + .5) / prints.length + progress * .58) % 1;
      const angle = phase * Math.PI * 3.4 - 1.2;
      const radius = .28 + phase * .7;
      const x = Math.cos(angle) * radiusX * radius;
      const y = Math.sin(angle) * radiusY * radius;
      const scale = .77 + phase * .3;
      const fadeIn = clamp((phase - .02) / .13);
      const fadeOut = clamp((1 - phase) / .12);
      print.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${(Math.sin(angle) * 4).toFixed(1)}deg) scale(${scale.toFixed(3)})`;
      print.style.opacity = (reduced.matches ? .78 : fadeIn * fadeOut * .92).toFixed(3);
      print.style.zIndex = String(Math.round(phase * 10));
    });
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule);
  reduced.addEventListener('change', schedule);
  update();
}

function setupMoments() {
  const track = document.getElementById('moments-track');
  const cards = [...track.querySelectorAll('a')];
  const position = document.querySelector('.moments-position');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = 2;
  let touchStart = null;
  function render() {
    const step = Math.min(285, Math.max(120, track.clientWidth * (window.innerWidth <= 650 ? .32 : .22)));
    cards.forEach((card, index) => {
      let offset = index - active;
      if (offset > cards.length / 2) offset -= cards.length;
      if (offset < -cards.length / 2) offset += cards.length;
      const distance = Math.abs(offset);
      card.style.setProperty('--x', `${offset * step}px`);
      card.style.setProperty('--card-scale', distance === 0 ? (window.innerWidth <= 650 ? '1.12' : '1.28') : distance === 1 ? '1.01' : '.78');
      card.style.setProperty('--card-opacity', distance === 2 ? '.76' : '1');
      card.style.zIndex = String(5 - distance);
      card.classList.toggle('is-current', distance === 0);
      card.setAttribute('aria-current', distance === 0 ? 'true' : 'false');
    });
    position.textContent = `${String(active + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
  }
  function go(step) { active = (active + step + cards.length) % cards.length; render(); }
  document.querySelectorAll('[data-moment-direction]').forEach(button => button.addEventListener('click', () => go(Number(button.dataset.momentDirection))));
  cards.forEach((card, index) => card.addEventListener('click', event => {
    if (index === active) return;
    event.preventDefault();
    active = index;
    render();
  }));
  track.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    go(event.key === 'ArrowRight' ? 1 : -1);
    cards[active].focus({preventScroll: true});
  });
  track.addEventListener('touchstart', event => { touchStart = event.changedTouches[0].clientX; }, {passive:true});
  track.addEventListener('touchend', event => {
    if (touchStart === null) return;
    const difference = event.changedTouches[0].clientX - touchStart;
    touchStart = null;
    if (Math.abs(difference) > 40) go(difference < 0 ? 1 : -1);
  }, {passive:true});
  reduced.addEventListener('change', render);
  window.addEventListener('resize', render);
  render();
}

function setupSectionPortalMotion() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const sections = [...document.querySelectorAll('.hero, .hotels, .offers, .news-section, .journal-cloud-transition, .moments, .membership, .footer')];
  sections.forEach(section => section.classList.add('portal-ready'));
  const clamp = value => Math.max(0, Math.min(1, value));
  let frame = 0;
  function update() {
    frame = 0;
    if (reduced.matches) {
      sections.forEach(section => section.style.removeProperty('--portal-progress'));
      return;
    }
    const height = innerHeight;
    const mobile = innerWidth <= 800;
    for (const section of sections) {
      if (section.classList.contains('hero')) continue;
      const bounds = section.getBoundingClientRect();
      if (bounds.bottom < -100 || bounds.top > height + 100) continue;
      const progress = clamp((height - bounds.top) / (height * (mobile ? .62 : .72)));
      const eased = progress * progress * (3 - 2 * progress);
      const remaining = 1 - eased;
      section.style.setProperty('--portal-progress', eased.toFixed(4));
      section.style.setProperty('--portal-circle', `${(18 + 132 * eased).toFixed(2)}%`);
      section.style.setProperty('--portal-curtain', `${(mobile ? 0 : 11 * remaining).toFixed(2)}%`);
      section.style.setProperty('--portal-radius', `${(22 * remaining).toFixed(2)}px`);
      section.style.setProperty('--portal-lift', `${((mobile ? 24 : 54) * remaining).toFixed(2)}px`);
      section.style.setProperty('--portal-scale', (1 - (mobile ? .025 : .065) * remaining).toFixed(4));
      section.style.setProperty('--portal-blur', `${(mobile ? 0 : 5 * remaining).toFixed(2)}px`);
      section.style.setProperty('--portal-opacity', (1 - .42 * remaining).toFixed(4));
      section.style.setProperty('--portal-cloud-opacity', (1 - .44 * remaining).toFixed(4));
      section.style.setProperty('--portal-paper-cut', `${((mobile ? 4 : 6) * remaining).toFixed(2)}%`);
      section.style.setProperty('--portal-bloom', (0.74 * remaining).toFixed(4));
    }
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  reduced.addEventListener('change', schedule);
  schedule();
}

function setupReveals() {
  const items = [...document.querySelectorAll('.reveal')];
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px 50px 0px' });
  items.forEach((item) => observer.observe(item));
}

function setupTextAnimations() {
  const selectors = [
    '#hero-title', '#hotels-title', '#offers-title', '#journal-title',
    '#moments-title', '.footer-invite h2',
    '.hotels .section-kicker', '.offers-intro .section-kicker',
    '.offers-intro > p:not(.section-kicker)', '.news-heading .section-kicker',
    '.moments .section-kicker', '.moments-hint',
    '.footer-invite p:not(.section-kicker)',
  ];
  const items = [...document.querySelectorAll(selectors.join(','))];
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('text-motion-shown');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px 36px 0px' });
  items.forEach((item, index) => {
    item.classList.add('text-motion', index % 2 ? 'text-motion-fold' : 'text-motion-blur');
    observer.observe(item);
  });
}

function setupScrollMotion() {
  const nav = document.getElementById('site-nav');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = value => Math.min(1, Math.max(0, value));
  const groups = [
    ['.hero', '--hero-scroll', 0, 24, 'px'],
    ['.hotels', '--hotel-zoom', 1.06, 1, ''],
    ['.offer-image', '--offer-drift', -8, 8, 'px'],
    ['.offers', '--offer-turn', -12, 24, 'deg'],
    ['.story-media', '--journal-lift', 12, -12, 'px'],
    ['.moments', '--moments-lift', 18, -18, 'px'],
    ['.membership-photo', '--member-shift', -16, 16, 'px'],
    ['.membership-points', '--benefit-lift', 10, 0, 'px'],
    ['.footer', '--footer-lift', 18, 0, 'px'],
    ['.footer', '--footer-brand-lift', 10, -6, 'px'],
  ];
  const items = groups.flatMap(([selector, property, from, to, unit]) =>
    [...document.querySelectorAll(selector)].map(element => ({ element, property, from, to, unit })));
  let frame = 0;
  let touching = false;

  const update = () => {
    frame = 0;
    const height = window.innerHeight;
    const scrollable = document.documentElement.scrollHeight - height;
    nav.style.setProperty('--scroll-progress', String(scrollable > 0 ? clamp(window.scrollY / scrollable) : 0));
    if (reduced.matches) {
      items.forEach(({ element, property }) => element.style.removeProperty(property));
      return;
    }
    const strength = window.innerWidth <= 800 ? .45 : 1;
    // Read geometry before writing styles. One frame per scroll event batch.
    const readings = items.map(item => ({ ...item, bounds: item.element.getBoundingClientRect() }));
    readings.forEach(({ element, property, from, to, unit, bounds }) => {
      if (bounds.bottom < 0 || bounds.top > height) return;
      // Freeze the moments frame while its links are being explored.
      if (property === '--moments-lift' &&
          (touching || element.matches(':hover, :focus-within'))) return;
      const progress = property === '--hero-scroll'
        ? clamp(-bounds.top / Math.max(1, bounds.height))
        : clamp((height - bounds.top) / (height + bounds.height));
      const eased = progress * progress * (3 - 2 * progress);
      let value = from + (to - from) * eased;
      value = unit === '' ? 1 + (value - 1) * strength : value * strength;
      element.style.setProperty(property, value.toFixed(4) + unit);
    });
  };
  const schedule = () => {
    if (!frame && !document.hidden) frame = window.requestAnimationFrame(update);
  };
  const moments = document.querySelector('.moments-window');
  moments?.addEventListener('pointerdown', () => { touching = true; }, { passive: true });
  window.addEventListener('pointerup', () => { touching = false; schedule(); }, { passive: true });
  window.addEventListener('pointercancel', () => { touching = false; schedule(); }, { passive: true });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('load', schedule, { once: true });
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', schedule);
  schedule();
}

renderCity();
setupMenu();
setupNews();
setupSectionAnchors();
setupMembershipMotion();
setupMoments();
setupSectionPortalMotion();
setupReveals();
setupTextAnimations();
setupScrollMotion();
document.getElementById('year').textContent = new Date().getFullYear();
