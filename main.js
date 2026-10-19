const officialSite = 'https://harperhotels.com/';
const cityHotels = [
  { city: 'jakarta', place: 'Jakarta, Indonesia', title: 'Harper MT Haryono', src: './assets/harper-room-03.jpg', alt: 'Guest suite at Harper MT Haryono in Jakarta' },
  { city: 'jakarta', place: 'Jakarta, Indonesia', title: 'Harper Cawang', src: './assets/hotel-cawang.png', alt: 'Harper Cawang exterior in Jakarta' },
  { city: 'bali', place: 'Kuta, Bali, Indonesia', title: 'Harper Kuta Bali', src: './assets/harper-room-01.jpg', alt: 'Guest room at Harper Kuta Bali' },
  { city: 'yogyakarta', place: 'Yogyakarta, Indonesia', title: 'Harper Malioboro Yogyakarta', src: './assets/harper-room-02.jpg', alt: 'Guest room at Harper Malioboro Yogyakarta' },
  { city: 'makassar', place: 'Makassar, Indonesia', title: 'Harper Perintis', src: './assets/harper-room-04.jpg', alt: 'Twin guest room at Harper Perintis in Makassar' },
  { city: 'palembang', place: 'Palembang, Indonesia', title: 'Harper Palembang', src: './assets/harper-room-05.jpg', alt: 'Guest room at Harper Palembang' },
  { city: 'banjarmasin', place: 'Banjarmasin, Indonesia', title: 'Harper Banjarmasin', src: './assets/harper-room-07.jpg', alt: 'Twin guest room at Harper Banjarmasin' },
  { city: 'kupang', place: 'Kupang, Indonesia', title: 'Harper Kupang', src: './assets/harper-room-08.jpg', alt: 'Guest room at Harper Kupang' },
  { city: 'bandung', place: 'Bandung, Indonesia', title: 'Harper Pasteur', src: './assets/hotel-pasteur.png', alt: 'Harper Pasteur exterior in Bandung' },
];

function renderCity() {
  const view = document.getElementById('city-view');
  const waypointHost = document.getElementById('city-waypoints');
  const cities = [...new Set(cityHotels.map(hotel => hotel.city))];
  const positions = [[8, 18], [25, 54], [48, 24], [79, 13], [71, 61], [28, 9], [6, 73], [91, 75]];
  waypointHost.innerHTML = cities.map((city, index) => `<button class="city-waypoint" type="button" data-city="${city}" style="--x:${positions[index][0]}%;--y:${positions[index][1]}%" aria-label="Preview Harper hotels in ${city[0].toUpperCase() + city.slice(1)}"><span class="city-point" aria-hidden="true"></span><span class="city-label">${city[0].toUpperCase() + city.slice(1)}</span></button>`).join('');
  view.innerHTML = `<div class="prism-gallery" aria-label="Explore Harper hotels">${cityHotels.map((hotel, i) => `<button class="prism-card" type="button" data-index="${i}" aria-label="Show ${hotel.title} in ${hotel.place}"><img src="${hotel.src}" alt="${hotel.alt}" width="900" height="600" loading="lazy" /></button>`).join('')}</div><div class="prism-footer"><button class="prism-arrow" type="button" data-step="-1" aria-label="Previous hotel"><span aria-hidden="true">←</span></button><div class="prism-caption"><p id="hotel-location"></p><h3 id="hotel-name"></h3><div class="city-properties" id="city-properties" aria-label="Hotels in selected city"></div></div><button class="prism-arrow" type="button" data-step="1" aria-label="Next hotel"><span aria-hidden="true">→</span></button></div>`;
  const panels = [...view.querySelectorAll('.prism-card')];
  const waypoints = [...waypointHost.querySelectorAll('.city-waypoint')];
  const route = document.querySelector('.city-route-active');
  let committed = 0;
  let preview = null;
  const show = (index) => {
    const hotel = cityHotels[index];
    panels.forEach((panel, i) => {
      let distance = (i - index + panels.length) % panels.length;
      if (distance > panels.length / 2) distance -= panels.length;
      panel.dataset.slot = Math.abs(distance) <= 2 ? String(distance) : 'away';
      panel.classList.toggle('is-active', i === index);
      panel.setAttribute('aria-pressed', String(i === index));
      panel.tabIndex = Math.abs(distance) <= 2 ? 0 : -1;
      panel.setAttribute('aria-hidden', String(Math.abs(distance) > 2));
    });
    waypoints.forEach((point) => {
      const active = point.dataset.city === hotel.city;
      point.classList.toggle('is-active', active);
      point.setAttribute('aria-pressed', String(active));
    });
    const point = waypoints.find(item => item.dataset.city === hotel.city);
    const x = parseFloat(point.style.getPropertyValue('--x')) * 12;
    const y = parseFloat(point.style.getPropertyValue('--y')) * 3.6;
    route.setAttribute('d', `M ${x} ${y} C ${x + (600 - x) * .42} ${Math.min(y + 115, 320)}, 460 225, 600 360`);
    document.getElementById('hotel-location').textContent = hotel.place;
    document.getElementById('hotel-name').textContent = hotel.title;
    const inCity = cityHotels.map((item, i) => ({item, i})).filter(({item}) => item.city === hotel.city);
    const selector = document.getElementById('city-properties');
    selector.hidden = inCity.length < 2;
    selector.innerHTML = inCity.length < 2 ? '' : `<span>Hotels in ${hotel.city[0].toUpperCase() + hotel.city.slice(1)}</span>${inCity.map(({item, i}) => `<button type="button" data-hotel="${i}" aria-pressed="${i === index}">${item.title}</button>`).join('')}`;
  };
  const select = (index, updateUrl = false) => {
    committed = index;
    preview = null;
    show(index);
    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set('city', cityHotels[index].city);
      url.hash = 'hotels';
      history.replaceState(null, '', url);
    }
  };
  const currentCity = () => new URLSearchParams(window.location.search).get('city')?.toLowerCase();
  select(Math.max(0, cityHotels.findIndex(hotel => hotel.city === currentCity())));
  waypoints.forEach((point) => {
    const index = cityHotels.findIndex(hotel => hotel.city === point.dataset.city);
    point.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { preview = index; show(index); } });
    point.addEventListener('pointerleave', () => { if (preview !== null) { preview = null; show(committed); } });
    point.addEventListener('focus', () => { preview = index; show(index); });
    point.addEventListener('blur', () => { if (preview !== null) { preview = null; show(committed); } });
    point.addEventListener('click', () => select(index, true));
  });
  panels.forEach((panel, index) => panel.addEventListener('click', () => select(index, true)));
  view.addEventListener('click', event => {
    const property = event.target.closest('[data-hotel]');
    const arrow = event.target.closest('[data-step]');
    if (property) select(Number(property.dataset.hotel), true);
    if (arrow) select((committed + Number(arrow.dataset.step) + cityHotels.length) % cityHotels.length, true);
  });
  view.addEventListener('keydown', event => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    select((committed + (event.key === 'ArrowRight' ? 1 : -1) + cityHotels.length) % cityHotels.length, true);
  });
  let touchX = null;
  view.addEventListener('touchstart', event => { touchX = event.touches[0].clientX; }, {passive:true});
  view.addEventListener('touchend', event => {
    if (touchX === null) return;
    const delta = event.changedTouches[0].clientX - touchX;
    if (Math.abs(delta) > 45) select((committed + (delta < 0 ? 1 : -1) + cityHotels.length) % cityHotels.length, true);
    touchX = null;
  }, {passive:true});
  window.addEventListener('popstate', () => select(Math.max(0, cityHotels.findIndex(hotel => hotel.city === currentCity()))));
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
      const progress = section.classList.contains('hotels')
        ? clamp((height - bounds.top - document.getElementById('site-nav').getBoundingClientRect().height) / (height * (mobile ? .5 : .55)))
        : clamp((height - bounds.top) / (height * (mobile ? .62 : .72)));
      const eased = progress * progress * (3 - 2 * progress);
      const remaining = 1 - eased;
      section.style.setProperty('--portal-progress', eased.toFixed(4));
      if (section.classList.contains('hotels')) {
        section.style.setProperty('--city-portal-shift', `${(14 * remaining).toFixed(2)}px`);
        section.style.setProperty('--city-portal-scale', (1 - .055 * remaining).toFixed(4));
        section.style.setProperty('--city-portal-color', remaining.toFixed(4));
        section.style.setProperty('--city-portal-opacity', (1 - .58 * remaining).toFixed(4));
      }
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
