const officialSite = 'https://harperhotels.com/';
const cityHotels = [
  { city: 'jakarta', label: 'Jakarta', place: 'Jakarta, Indonesia', title: 'Harper MT Haryono (Cawang)', src: './assets/harper-room-03.jpg', alt: 'Guest suite at Harper MT Haryono in Jakarta' },
  { city: 'bali', label: 'Bali', place: 'Kuta, Bali, Indonesia', title: 'Harper Kuta Bali', src: './assets/harper-room-01.jpg', alt: 'Guest room at Harper Kuta Bali' },
  { city: 'yogyakarta', label: 'Yogyakarta', place: 'Yogyakarta, Indonesia', title: 'Harper Malioboro Yogyakarta', src: './assets/harper-room-02.jpg', alt: 'Guest room at Harper Malioboro Yogyakarta' },
  { city: 'cikarang', label: 'Cikarang', place: 'Cikarang, Indonesia', title: 'Harper Cikarang', src: './assets/city-cikarang-illustrative.webp', alt: 'Illustrative twin guest room representing a stay in Cikarang' },
  { city: 'purwakarta', label: 'Purwakarta', place: 'Purwakarta, Indonesia', title: 'Harper Purwakarta', src: './assets/city-purwakarta-illustrative.webp', alt: 'Illustrative guest room representing a stay in Purwakarta' },
  { city: 'palembang', place: 'Palembang, Indonesia', title: 'Harper Palembang', src: './assets/harper-room-05.jpg', alt: 'Guest room at Harper Palembang' },
  { city: 'medan', label: 'Medan', place: 'Medan, Indonesia', title: 'Harper Wahid Hasyim - Medan', src: './assets/city-medan-illustrative.webp', alt: 'Illustrative guest room representing a stay in Medan' },
  { city: 'banjarmasin', place: 'Banjarmasin, Indonesia', title: 'Harper Banjarmasin', src: './assets/harper-room-07.jpg', alt: 'Twin guest room at Harper Banjarmasin' },
  { city: 'makassar', place: 'Makassar, Indonesia', title: 'Harper Perintis - Makassar', src: './assets/harper-room-04.jpg', alt: 'Twin guest room at Harper Perintis in Makassar' },
  { city: 'kupang', place: 'Kupang, Indonesia', title: 'Harper Kupang', src: './assets/harper-room-08.jpg', alt: 'Guest room at Harper Kupang' },
  { city: 'batam', label: 'Batam', place: 'Batam, Indonesia', title: 'Harper Premier Nagoya Batam', src: './assets/city-batam-illustrative.webp', alt: 'Illustrative guest room representing a stay in Batam' },
  { city: 'punta-cana', label: 'Punta Cana', place: 'Punta Cana, Dominican Republic', title: 'Reserva Real by Harper', src: './assets/city-punta-cana-illustrative.webp', alt: 'Illustrative Caribbean suite representing a stay in Punta Cana' },
];

function renderCity() {
  const view = document.getElementById('city-view');
  const waypointHost = document.getElementById('city-waypoints');
  const positions = [[8,16],[24,61],[49,23],[43,70],[65,71],[75,35],[8,76],[29,9],[83,13],[91,75],[59,6],[79,59]];
  waypointHost.innerHTML = cityHotels.map((hotel,index) => `<button class="city-waypoint" type="button" data-city="${hotel.city}" style="--x:${positions[index][0]}%;--y:${positions[index][1]}%" aria-label="Preview ${hotel.title} in ${hotel.label || hotel.city[0].toUpperCase() + hotel.city.slice(1)}"><span class="city-point" aria-hidden="true"></span><span class="city-label">${hotel.label || hotel.city[0].toUpperCase() + hotel.city.slice(1)}</span></button>`).join('');
  const routeHost = document.querySelector('.city-routes');
  const routePoints = cityHotels.map((hotel,index) => {
    const [px,py] = positions[index];
    const x = px * 16 + 6;
    const y = py * 2.4;
    const endX = Math.max(610,Math.min(990,x));
    const span = endX - x;
    return [x,y,x + span * .2,y + (240-y) * .46,endX - span * .28,240 - (240-y) * .3,endX,240];
  });
  routeHost.innerHTML = '<defs><mask id="city-route-label-mask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse"><rect width="1600" height="240" fill="white"/><rect class="city-route-label-gap" fill="black" width="0" height="0"/></mask></defs><path class="city-route is-active" pathLength="1" mask="url(#city-route-label-mask)" />';
  const route = routeHost.querySelector('.city-route');
  const routeMask = routeHost.querySelector('#city-route-label-mask');
  routeMask.querySelector('.city-route-label-gap').remove();
  const reducedRouteMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let routeCurrent = null, routeTarget = null, routeFrame = 0, routeBend = 0;
  const routePath = values => `M ${values[0].toFixed(1)} ${values[1].toFixed(1)} C ${values[2].toFixed(1)} ${values[3].toFixed(1)}, ${values[4].toFixed(1)} ${values[5].toFixed(1)}, ${values[6].toFixed(1)} ${values[7].toFixed(1)}`;
  function animateRoute() {
    routeFrame = 0;
    const moving = routeCurrent.some((value, index) => Math.abs(routeTarget[index] - value) > .08);
    routeCurrent = routeCurrent.map((value, index) => {
      const difference = routeTarget[index] - value;
      return Math.abs(difference) > .08 ? value + difference * .18 : routeTarget[index];
    });
    route.setAttribute('d', routePath(routeCurrent));
    if (moving) routeFrame = requestAnimationFrame(animateRoute);
  }
  function setRoute(index, bend = 0) {
    routeBend = bend;
    routeTarget = [...routePoints[index]];
    routeTarget[2] += bend * 18;
    routeTarget[4] += bend * 35;
    if (!routeCurrent || reducedRouteMotion.matches) {
      cancelAnimationFrame(routeFrame);
      routeFrame = 0;
      routeCurrent = [...routeTarget];
      route.setAttribute('d', routePath(routeCurrent));
    } else if (!routeFrame) routeFrame = requestAnimationFrame(animateRoute);
  }
  view.innerHTML = `<div class="prism-gallery" aria-label="Explore Harper hotels">${cityHotels.map((hotel, i) => `<button class="prism-card" type="button" data-index="${i}" aria-label="Show ${hotel.title} in ${hotel.place}"><img src="${hotel.src}" alt="${hotel.alt}" width="900" height="600" loading="lazy" /></button>`).join('')}</div><div class="prism-footer"><button class="prism-arrow" type="button" data-step="-1" aria-label="Previous hotel"><span aria-hidden="true">←</span></button><div class="prism-caption"><p id="hotel-location"></p><h3 id="hotel-name"></h3><div class="city-properties" id="city-properties" aria-label="Hotels in selected city"></div></div><button class="prism-arrow" type="button" data-step="1" aria-label="Next hotel"><span aria-hidden="true">→</span></button></div>`;
  const panels = [...view.querySelectorAll('.prism-card')];
  const imagePreloader = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    panels.forEach(panel => { panel.querySelector('img').loading = 'eager'; });
    imagePreloader.disconnect();
  }, {rootMargin: '600px'});
  imagePreloader.observe(document.getElementById('hotels'));
  const waypoints = [...waypointHost.querySelectorAll('.city-waypoint')];
  const mobileCities = matchMedia('(max-width: 700px)');
  let cityPage = 0;
  const cityPager = document.createElement('div');
  cityPager.className = 'mobile-city-controls';
  cityPager.setAttribute('role', 'group');
  cityPager.setAttribute('aria-label', 'City pages');
  cityPager.innerHTML = Array.from({length:Math.ceil(waypoints.length / 4)}, (_, i) => `<button type="button" data-city-page="${i}" aria-label="City page ${i + 1}"><span aria-hidden="true"></span></button>`).join('');
  waypointHost.after(cityPager);
  function showCityPage(index = visibleIndex, followSelection = false) {
    if (followSelection && index !== null) cityPage = Math.floor(index / 4);
    waypoints.forEach((point, i) => point.classList.toggle('is-mobile-hidden', Math.floor(i / 4) !== cityPage));
    cityPager.querySelectorAll('[data-city-page]').forEach((dot, i) => {
      if (i === cityPage) dot.setAttribute('aria-current','page'); else dot.removeAttribute('aria-current');
    });
  }
  cityPager.addEventListener('click', event => {
    const dot = event.target.closest('[data-city-page]');
    if (dot) { cityPage = Number(dot.dataset.cityPage); showCityPage(); }
  });
  let citySwipe = null, citySuppressClickUntil = 0;
  waypointHost.addEventListener('touchstart', event => { citySwipe = [event.touches[0].clientX,event.touches[0].clientY]; }, {passive:true});
  waypointHost.addEventListener('touchend', event => {
    if (!mobileCities.matches || !citySwipe) return;
    const dx = event.changedTouches[0].clientX - citySwipe[0], dy = event.changedTouches[0].clientY - citySwipe[1];
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) { citySuppressClickUntil = performance.now() + 400; cityPage = Math.max(0, Math.min(Math.ceil(waypoints.length / 4) - 1, cityPage + (dx < 0 ? 1 : -1))); showCityPage(); }
    citySwipe = null;
  }, {passive:true});
  waypointHost.addEventListener('click', event => { if (performance.now() < citySuppressClickUntil) { event.preventDefault(); event.stopPropagation(); } }, true);
  let committed = null;
  let hovered = null;
  let focused = null;
  let visibleIndex = null;
  const updateRouteMask = () => {
    const svg = routeHost.getBoundingClientRect();
    if (!svg.width || !svg.height) return;
    // Protect every label, including neighbouring cities crossed during a route morph.
    routeMask.querySelectorAll('.city-route-label-gap').forEach(gap => gap.remove());
    waypoints.forEach(point => {
      const box = point.querySelector('.city-label').getBoundingClientRect();
      if (!box.width || !box.height) return;
      const gap = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      gap.classList.add('city-route-label-gap');
      gap.setAttribute('fill', 'black');
      gap.setAttribute('x', ((box.left - svg.left - 8) / svg.width * 1600).toFixed(1));
      gap.setAttribute('y', ((box.top - svg.top - 4) / svg.height * 240).toFixed(1));
      gap.setAttribute('width', ((box.width + 16) / svg.width * 1600).toFixed(1));
      gap.setAttribute('height', ((box.height + 8) / svg.height * 240).toFixed(1));
      routeMask.append(gap);
    });
  };
  new ResizeObserver(updateRouteMask).observe(routeHost);
  waypoints.forEach(point => new ResizeObserver(updateRouteMask).observe(point.querySelector('.city-label')));
  addEventListener('resize', updateRouteMask);
  document.fonts?.ready.then(updateRouteMask);
  const show = (index) => {
    visibleIndex = index;
    const hotel = index == null ? null : cityHotels[index];
    const layoutIndex = index ?? 0;
    panels.forEach((panel, i) => {
      let distance = (i - layoutIndex + panels.length) % panels.length;
      if (distance > panels.length / 2) distance -= panels.length;
      panel.dataset.slot = Math.abs(distance) <= 2 ? String(distance) : 'away';
      panel.classList.toggle('is-active', i === index && hotel !== null);
      panel.setAttribute('aria-pressed', String(i === index && hotel !== null));
      panel.tabIndex = Math.abs(distance) <= 2 ? 0 : -1;
      panel.setAttribute('aria-hidden', String(Math.abs(distance) > 2));
    });
    waypoints.forEach((point) => {
      const active = hotel !== null && point.dataset.city === hotel.city;
      point.classList.toggle('is-active', active);
      point.setAttribute('aria-pressed', String(active));
    });
    requestAnimationFrame(updateRouteMask);
    route.classList.toggle('is-active', hotel !== null);
    if (hotel) setRoute(index, hovered === index ? routeBend : 0);
    document.getElementById('hotel-location').textContent = hotel?.place || '';
    document.getElementById('hotel-name').textContent = hotel?.title || 'Choose a city to explore';
    showCityPage(index, true);
    const inCity = hotel ? cityHotels.map((item, i) => ({item, i})).filter(({item}) => item.city === hotel.city) : [];
    const selector = document.getElementById('city-properties');
    selector.hidden = inCity.length < 2;
    selector.innerHTML = inCity.length < 2 ? '' : `<span>Hotels in ${hotel.city[0].toUpperCase() + hotel.city.slice(1)}</span>${inCity.map(({item, i}) => `<button type="button" data-hotel="${i}" aria-pressed="${i === index}">${item.title}</button>`).join('')}`;
    window.dispatchEvent(new Event('harper:city-change'));
  };
  const select = (index, updateUrl = false) => {
    committed = index;
    hovered = null;
    show(index);
    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set('city', cityHotels[index].city);
      url.hash = 'hotels';
      history.replaceState(null, '', url);
    }
  };
  const currentCity = () => new URLSearchParams(window.location.search).get('city')?.toLowerCase();
  const selectedFromUrl = () => { const index = cityHotels.findIndex(hotel => hotel.city === currentCity()); return index < 0 ? null : index; };
  select(selectedFromUrl() ?? (mobileCities.matches ? 0 : null));
  mobileCities.addEventListener('change', () => { if (mobileCities.matches && committed === null) select(0); showCityPage(visibleIndex, true); });
  const showPreview = () => show(hovered ?? focused ?? committed);
  waypoints.forEach((point) => {
    const index = cityHotels.findIndex(hotel => hotel.city === point.dataset.city);
    point.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse' && !mobileCities.matches) { hovered = index; routeBend = 0; showPreview(); } });
    point.addEventListener('pointermove', event => {
      if (mobileCities.matches || event.pointerType !== 'mouse' || hovered !== index) return;
      const bounds = point.getBoundingClientRect();
      setRoute(index, Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1)));
    });
    point.addEventListener('pointerleave', () => { if (hovered === index) { hovered = null; showPreview(); } });
    point.addEventListener('focus', () => { focused = index; showPreview(); });
    point.addEventListener('blur', () => { if (focused === index) { focused = null; showPreview(); } });
    point.addEventListener('click', () => select(index, true));
  });
  panels.forEach((panel, index) => panel.addEventListener('click', () => select(index, true)));
  view.addEventListener('click', event => {
    const property = event.target.closest('[data-hotel]');
    const arrow = event.target.closest('[data-step]');
    if (property) select(Number(property.dataset.hotel), true);
    if (arrow) select(((committed ?? (Number(arrow.dataset.step) > 0 ? -1 : 0)) + Number(arrow.dataset.step) + cityHotels.length) % cityHotels.length, true);
  });
  view.addEventListener('keydown', event => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    select(((committed ?? (event.key === 'ArrowRight' ? -1 : 0)) + (event.key === 'ArrowRight' ? 1 : -1) + cityHotels.length) % cityHotels.length, true);
  });
  let touchX = null;
  view.addEventListener('touchstart', event => { touchX = event.touches[0].clientX; }, {passive:true});
  view.addEventListener('touchend', event => {
    if (touchX === null) return;
    const delta = event.changedTouches[0].clientX - touchX;
    if (Math.abs(delta) > 45) select(((committed ?? (delta < 0 ? -1 : 0)) + (delta < 0 ? 1 : -1) + cityHotels.length) % cityHotels.length, true);
    touchX = null;
  }, {passive:true});
  window.addEventListener('popstate', () => select(selectedFromUrl()));
}

function setupMenu() {
  if (document.querySelector('.site-nav.has-pill-nav')) return; // PillNav owns its responsive menu.
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
  const section = document.getElementById('journal');
  const book = document.getElementById('journal-book');
  if (!section || !book) return;
  const stories = [...book.querySelectorAll('[data-journal-spread] .news-card')];
  const previous = document.getElementById('journal-prev');
  const next = document.getElementById('journal-next');
  const count = document.getElementById('journal-page-count');
  section.append(section.querySelector('.journal-controls'));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const icon = name => `<svg class="journal-icon" aria-hidden="true" focusable="false"><use href="./assets/journal-icons.svg#${name}" /></svg>`;
  section.classList.add('journal-editorial');
  book.className = 'journal-book editorial-stories';
  book.setAttribute('aria-label', 'HARPER stories');
  book.removeAttribute('tabindex');
  section.querySelector('.journal-drag-hint')?.remove();
  document.getElementById('journal-open')?.remove();
  stories.forEach(story => {
    story.className = 'news-card editorial-story';
    story.querySelector('.news-read').innerHTML = `Read story ${icon('arrow-up-right')}`;
  });
  book.replaceChildren();
  const pages = [];
  for (let offset = 0; offset < stories.length; offset += 3) {
    const page = document.createElement('div');
    page.className = 'editorial-spread';
    const feature = document.createElement('div');
    feature.className = 'editorial-feature';
    feature.append(stories[offset]);
    const supporting = document.createElement('div');
    supporting.className = 'editorial-supporting';
    supporting.append(...stories.slice(offset + 1, offset + 3));
    page.append(feature, supporting);
    book.append(page);
    pages.push(page);
  }
  previous.innerHTML = icon('arrow-left');
  next.innerHTML = icon('arrow-right');
  previous.setAttribute('aria-label', 'Previous stories');
  next.setAttribute('aria-label', 'Next stories');
  let current = 0, animation;
  function show(index, animate = false) {
    if (index < 0 || index >= pages.length) return;
    animation?.cancel();
    current = index;
    pages.forEach((page, i) => { page.hidden = i !== current; page.inert = i !== current; });
    count.textContent = `${String(current + 1).padStart(2,'0')} / ${String(pages.length).padStart(2,'0')}`;
    previous.disabled = current === 0;
    next.disabled = current === pages.length - 1;
    if (animate && !reduced.matches) animation = pages[current].animate([{opacity:0,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:'ease-out'});
  }
  previous.addEventListener('click', () => show(current - 1, true));
  next.addEventListener('click', () => show(current + 1, true));
  reduced.addEventListener('change', () => animation?.cancel());
  show(0);
}
function setupSectionAnchors() {
  const nav = document.getElementById('site-nav');
  document.querySelectorAll('a[href="#journal"], a[href="#membership"]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    const section = document.querySelector(link.getAttribute('href'));
    const clearance = nav.getBoundingClientRect().height + 16;
    const top = window.scrollY + section.getBoundingClientRect().top - clearance;
    history.pushState(null, '', link.getAttribute('href'));
    if (link.getAttribute('href') === '#journal') dispatchEvent(new Event('harper:journal-direct'));
    window.scrollTo({top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }));
}

function setupCityViewport() {
  const section = document.getElementById('hotels');
  const nav = document.getElementById('site-nav');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  const clearance = () => Math.max(0,nav.getBoundingClientRect().bottom);
  const update = () => {
    frame = 0;
    document.documentElement.style.setProperty('--city-header-clearance', `${clearance().toFixed(1)}px`);
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  const align = behavior => {
    update();
    const targetClearance = clearance();
    const top = scrollY + section.getBoundingClientRect().top - targetClearance - 2;
    scrollTo({top, behavior});
  };
  document.querySelectorAll('a[href="#hotels"]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    history.pushState(null, '', '#hotels');
    align(reduced.matches ? 'instant' : 'smooth');
  }));
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  addEventListener('harper:booking-position', schedule);
  new ResizeObserver(schedule).observe(nav);
  if (location.hash === '#hotels') {
    const alignAfterNavSettles = () => requestAnimationFrame(() => {
      align('instant');
      requestAnimationFrame(() => align('instant'));
    });
    alignAfterNavSettles();
    addEventListener('load', alignAfterNavSettles, {once:true});
  }
  update();
}

function setupMembershipOrbit() {
  const visual = document.querySelector('.membership-visual');
  if (!visual) return;
  const cards = [...visual.querySelectorAll('.membership-print')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let activeCards = [], radiusX = 0, radiusY = 0;
  let angle = 0, last = 0, frame = 0, visible = false;

  function draw() {
    const count = activeCards.length;
    activeCards.forEach((card, index) => {
      const phase = angle - Math.PI / 2 + index * Math.PI * 2 / count;
      const x = Math.cos(phase) * radiusX;
      const y = Math.sin(phase) * radiusY;
      // Positions orbit one center. The cards themselves never rotate.
      card.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(.90)`;
      card.style.zIndex = String(Math.round(y + radiusY));
      // Cards recede into the gray atmosphere as they rise behind the phone.
      card.style.opacity = (Math.min(1, Math.max(0, 1 + y / Math.max(radiusY, 1))) * .75 + .25).toFixed(3);
    });
  }

  function measure() {
    activeCards = cards.filter(card => getComputedStyle(card).display !== 'none');
    if (!activeCards.length) return;
    const card = activeCards[0];
    radiusX = Math.max(0, Math.min(visual.clientWidth * .30, visual.clientWidth / 2 - card.offsetWidth * .45 - 12));
    radiusY = Math.max(0, Math.min(visual.clientHeight * .30, visual.clientHeight / 2 - card.offsetHeight * .45 - 12));
    draw();
  }

  function tick(now) {
    frame = 0;
    if (!visible || motion.matches || document.hidden) return;
    if (last) angle = (angle + Math.min(now - last, 64) * Math.PI / 18000) % (Math.PI * 2);
    last = now;
    draw();
    frame = requestAnimationFrame(tick);
  }

  function updatePlayback() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    if (motion.matches) { angle = 0; draw(); }
    else if (visible && !document.hidden) frame = requestAnimationFrame(tick);
  }

  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    updatePlayback();
  }, { threshold: .05 }).observe(visual);
  window.addEventListener('resize', measure);
  document.addEventListener('visibilitychange', updatePlayback);
  motion.addEventListener('change', updatePlayback);
  measure();
}

function setupMembershipDevice() {
  const device = document.getElementById('membership-device');
  if (!device) return;
  const phone = device.querySelector('.membership-phone');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let dragging = false, startX = 0, startY = 0, x = 8, y = 0, vx = 0, vy = 0, lastX = 0, lastY = 0, lastTime = 0;
  let settleFrame = 0, nudgeTimer = 0;
  const clamp = (value, limit) => Math.max(-limit, Math.min(limit, value));
  function render() {
    phone.style.setProperty('--phone-x', `${x.toFixed(2)}deg`);
    phone.style.setProperty('--phone-y', `${y.toFixed(2)}deg`);
    phone.style.setProperty('--phone-reflection', `${(50 + y * 1.2).toFixed(1)}%`);
  }
  function settle() {
    if (reduced.matches) return;
    cancelAnimationFrame(settleFrame);
    const step = () => {
      vx = (vx + (8 - x) * .045) * .81;
      vy = (vy - y * .045) * .81;
      x += vx; y += vy;
      render();
      if (Math.abs(x - 8) + Math.abs(y) + Math.abs(vx) + Math.abs(vy) > .08) settleFrame = requestAnimationFrame(step);
      else { x = 8; y = 0; render(); }
    };
    settleFrame = requestAnimationFrame(step);
  }
  device.addEventListener('pointerdown', event => {
    if (reduced.matches) return;
    dragging = true;
    cancelAnimationFrame(settleFrame);
    device.setPointerCapture(event.pointerId);
    startX = event.clientX; startY = event.clientY;
    lastX = event.clientX; lastY = event.clientY; lastTime = performance.now();
    vx = 0; vy = 0;
    device.classList.add('is-dragging');
  });
  device.addEventListener('pointermove', event => {
    if (reduced.matches) return;
    if (dragging) {
      const now = performance.now();
      const elapsed = Math.max(8, now - lastTime);
      const nextX = clamp(8 - (event.clientY - startY) * .18, 28);
      const nextY = clamp((event.clientX - startX) * .20, 32);
      vx = clamp((lastY - event.clientY) * .18 * 16 / elapsed, 3);
      vy = clamp((event.clientX - lastX) * .20 * 16 / elapsed, 3);
      x = nextX; y = nextY;
      lastX = event.clientX; lastY = event.clientY; lastTime = now;
      render();
    } else if (event.pointerType === 'mouse') {
      const bounds = device.getBoundingClientRect();
      x = 8 - ((event.clientY - bounds.top) / bounds.height - .5) * 12;
      y = ((event.clientX - bounds.left) / bounds.width - .5) * 16;
      render();
    }
  });
  const release = () => { if (!dragging) return; dragging = false; device.classList.remove('is-dragging'); settle(); };
  device.addEventListener('pointerup', release);
  device.addEventListener('pointercancel', release);
  device.addEventListener('lostpointercapture', release);
  device.addEventListener('pointerleave', () => { if (!dragging) settle(); });
  device.addEventListener('click', event => {
    if (reduced.matches || Math.abs(event.clientX - startX) + Math.abs(event.clientY - startY) > 8) return;
    clearTimeout(nudgeTimer);
    const bounds = device.getBoundingClientRect();
    y = event.clientX < bounds.left + bounds.width / 2 ? -10 : 10;
    render(); nudgeTimer = setTimeout(settle, 170);
  });
  device.addEventListener('keydown', event => {
    if (reduced.matches) return;
    const delta = {ArrowLeft:[0,-8],ArrowRight:[0,8],ArrowUp:[-8,0],ArrowDown:[8,0]}[event.key];
    if (delta) { event.preventDefault(); cancelAnimationFrame(settleFrame); x = clamp(x + delta[0], 28); y = clamp(y + delta[1], 32); render(); clearTimeout(nudgeTimer); nudgeTimer = setTimeout(settle, 450); }
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); cancelAnimationFrame(settleFrame); y = y >= 0 ? -10 : 10; render(); clearTimeout(nudgeTimer); nudgeTimer = setTimeout(settle, 450); }
    if (event.key === 'Escape') { x = 8; y = 0; render(); }
  });
  new IntersectionObserver((entries, observer) => {
    if (entries[0].isIntersecting) { device.classList.add('is-awake'); observer.disconnect(); }
  }, {threshold:.2}).observe(device);
  reduced.addEventListener('change', () => { if (reduced.matches) { cancelAnimationFrame(settleFrame); x = 8; y = 0; render(); device.classList.add('is-awake'); } });
  render();
}

function setupSectionPortalMotion() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const nav = document.getElementById('site-nav');
  const city = document.getElementById('hotels');
  const sections = ['offers', 'journal', 'moments', 'membership', 'footer']
    .map(id => document.getElementById(id)).filter(Boolean);
  const cloud = document.querySelector('.journal-cloud-transition');
  const marquee = document.querySelector('.footer-brand-marquee');
  const offerText = [...document.querySelectorAll('.offers-intro .section-kicker, #offers-title, .offers-intro > p:not(.section-kicker)')];
  const journalText = [...document.querySelectorAll('.news-heading .section-kicker, #journal-title')];
  const membershipVisual = document.querySelector('.membership-visual');
  const footerNavigation = document.querySelector('.footer-navigation');
  const footerColumns = [...document.querySelectorAll('.footer-links > div')];
  const initialTarget = ['#offers', '#journal', '#moments', '#membership', '#footer'].includes(location.hash)
    ? document.querySelector(location.hash) : null;
  city.classList.add('portal-ready');
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  const set = (element, name, value) => element.style.setProperty(name, value.toFixed(4));
  let frame = 0;
  function update() {
    frame = 0;
    if (reduced.matches) {
      city.style.removeProperty('--portal-progress');
      city.style.removeProperty('--swipe-city-exit');
      city.querySelector('.hotel-content').inert = false;
      ['--swipe-heading', '--swipe-cards', '--swipe-overlap', '--swipe-radius'].forEach(name => sections[0].style.removeProperty(name));
      [city, ...sections, cloud].filter(Boolean).forEach(section => {
        section.style.removeProperty('--handoff-enter');
        section.style.removeProperty('--handoff-enter-late');
        section.style.removeProperty('--handoff-exit');
      });
      return;
    }
    // Measure the visible area below any header surface that actually remains on screen.
    let top = Math.max(0, nav.getBoundingClientRect().bottom);
    const booking = document.getElementById('booking-form');
    if (booking && !booking.closest('dialog:not([open])')) {
      const style = getComputedStyle(booking);
      const rect = booking.getBoundingClientRect();
      if ((style.position === 'fixed' || style.position === 'sticky') && rect.top <= top + 2 && rect.bottom > top) top = rect.bottom;
    }
    const usable = Math.max(320, innerHeight - top);
    const mobile = innerWidth <= 800;
    const span = usable * (mobile ? .67 : .78);
    const bounds = [city, ...sections].map(section => section.getBoundingClientRect());
    const cityProgress = ease((innerHeight - bounds[0].top - top) / (usable * (mobile ? .5 : .55)));
    set(city, '--portal-progress', cityProgress);
    const offersArrival = ease((innerHeight - bounds[1].top) / span);
    const cityExit = ease((offersArrival - .73) / .27);
    set(city, '--handoff-exit', cityExit);
    set(city, '--map-exit-opacity', 1 - .18 * cityExit);
    // The leading edge starts just below the viewport and reaches the sticky
    // navigation over one viewport of native scroll. Every part of this handoff
    // reads the same progress, so scrolling up reverses it without a tween lag.
    if (innerWidth > 960) {
      const offers = sections[0];
      const overlap = Math.min(120, Math.max(80, innerWidth * .08));
      const swipe = clamp((innerHeight + overlap - bounds[1].top) / Math.max(1, innerHeight - top));
      const hotelExit = ease(swipe / .20);
      set(city, '--swipe-city-exit', hotelExit);
      city.querySelector('.hotel-content').inert = hotelExit >= .99;
      set(offers, '--swipe-heading', ease((swipe - .52) / .26));
      set(offers, '--swipe-cards', ease((swipe - .68) / .27));
      offers.style.setProperty('--swipe-overlap', `${overlap.toFixed(1)}px`);
      offers.style.setProperty('--swipe-radius', `${(overlap * (1 - ease((swipe - .45) / .55))).toFixed(1)}px`);
    } else {
      city.style.removeProperty('--swipe-city-exit');
      city.querySelector('.hotel-content').inert = false;
      ['--swipe-heading', '--swipe-cards', '--swipe-overlap', '--swipe-radius'].forEach(name => sections[0].style.removeProperty(name));
    }
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const enter = ease((innerHeight - bounds[i + 1].top) / span);
      const late = ease((enter - .18) / .76);
      const nextTop = bounds[i + 2]?.top;
      set(section, '--handoff-enter', enter);
      set(section, '--handoff-enter-late', late);
      set(section, '--handoff-exit', nextTop === undefined ? 0 : ease((innerHeight - nextTop) / span));
    }
    // Individual elements use the same viewport measurements, so their stagger also rewinds.
    // The offer-card enhancement replaces its original nodes after startup.
    [...document.querySelectorAll('.offers .offer-card')].forEach((card, index) => {
      card.classList.add('scroll-reveal');
      const rect = card.getBoundingClientRect();
      set(card, '--item-enter', ease((innerHeight - rect.top - index * (mobile ? 8 : 18)) / (usable * .32)));
    });
    offerText.forEach((element, index) => set(element, '--text-enter', ease((offersArrival - index * .10) / .62)));
    const journalArrival = Number(sections[1].style.getPropertyValue('--handoff-enter'));
    journalText.forEach((element, index) => set(element, '--text-enter', ease((journalArrival - index * .12) / .63)));
    if (membershipVisual) {
      const visual = membershipVisual.getBoundingClientRect();
      const photo = ease((innerHeight - visual.top) / (usable * .62));
      const phoneTop = visual.top + visual.height * .18;
      const phone = ease((innerHeight - phoneTop) / (usable * .5));
      const membership = sections.find(section => section.id === 'membership');
      set(membership, '--photo-enter', photo);
      set(membership, '--phone-enter', phone);
      set(membership, '--phone-wake', ease((phone - .28) / .6));
    }
    if (footerNavigation) {
      const progress = ease((innerHeight - footerNavigation.getBoundingClientRect().top) / (usable * .58));
      set(footerNavigation, '--navigation-enter', progress);
      footerColumns.forEach((column, index) => set(column, '--column-enter', ease((progress - index * .075) / (1 - index * .075))));
    }
    if (cloud) {
      const paper = ease((innerHeight - cloud.getBoundingClientRect().top) / (usable * .8));
      set(cloud, '--handoff-enter', paper);
      set(cloud, '--portal-cloud-opacity', 1 - .65 * ease((paper - .3) / .7));
    }
    if (marquee) marquee.classList.toggle('is-in-view', marquee.getBoundingClientRect().top < innerHeight && marquee.getBoundingClientRect().bottom > top);
    [city, ...sections].forEach(section => section.classList.add('motion-ready'));
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  addEventListener('harper:booking-position', schedule);
  reduced.addEventListener('change', schedule);
  new ResizeObserver(schedule).observe(nav);
  document.fonts?.ready.then(schedule);
  addEventListener('load', schedule, {once:true});
  if (initialTarget) {
    const alignInitial = () => {
      const top = scrollY + initialTarget.getBoundingClientRect().top - nav.getBoundingClientRect().bottom - 2;
      scrollTo({top, behavior:'instant'});
      schedule();
    };
    requestAnimationFrame(alignInitial);
    addEventListener('load', alignInitial, {once:true});
    document.fonts?.ready.then(alignInitial);
  }
  schedule();
}

function setupReveals() {
  const items = [...document.querySelectorAll('.reveal')];
  const scrollItems = items.filter(item => item.closest('.offers'));
  scrollItems.forEach(item => item.classList.add('is-visible', 'scroll-reveal'));
  const observed = items.filter(item => !item.closest('.offers'));
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    observed.forEach((item) => item.classList.add('is-visible'));
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
  observed.forEach((item) => observer.observe(item));
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

function setupHeroCityHandoff() {
  const hero = document.querySelector('.hero-orbit-stage');
  const city = document.getElementById('hotels');
  const nav = document.getElementById('site-nav');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // A ruler has no flow height. The hero remains content-sized while the
  // handoff keeps its scroll range stable as mobile browser bars collapse.
  const mobileViewport = document.createElement('div');
  mobileViewport.setAttribute('aria-hidden', 'true');
  mobileViewport.style.cssText = 'position:fixed;inset:0 auto auto 0;width:0;height:100svh;visibility:hidden;pointer-events:none';
  document.body.append(mobileViewport);
  new IntersectionObserver(entries => {
    if (!reduced.matches) return;
    for (const entry of entries) city.classList.toggle('handoff-reduced-enter', entry.isIntersecting);
  }, { threshold: .12 }).observe(city);
  const clamp = value => Math.min(1, Math.max(0, value));
  const phase = (from, to, value) => {
    const t = clamp((value - from) / (to - from));
    return t * t * (3 - 2 * t);
  };
  const documentRect = element => {
    const rect = element.getBoundingClientRect();
    return { x: rect.left, y: rect.top + scrollY, width: rect.width, height: rect.height };
  };
  let layer, fromImage, toImage, sourceCaption, geometry, frame = 0, ready = false, cityInteracted = false;
  const overlay = () => {
    layer = document.createElement('div');
    layer.className = 'hero-city-handoff';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = '<img class="hero-city-handoff__source" alt="" /><img class="hero-city-handoff__destination" alt="" /><span class="hero-city-handoff__caption"><small></small><strong></strong></span>';
    [fromImage, toImage] = layer.querySelectorAll('img');
    sourceCaption = layer.querySelector('.hero-city-handoff__caption');
    document.body.append(layer);
  };
  const measure = () => {
    if (!ready) return;
    const source = hero.querySelector('.rustic-orbit__card.is-featured');
    const destination = city.querySelector('.prism-card.is-active');
    if (!source || !destination) return;
    const heroBottom = hero.getBoundingClientRect().bottom + scrollY;
    const cityTop = city.getBoundingClientRect().top + scrollY;
    const compactHeader = nav.getBoundingClientRect().height;
    const timelineHeight = innerWidth <= 700 ? mobileViewport.getBoundingClientRect().height : innerHeight;
    const start = Math.max(0, heroBottom - timelineHeight);
    const end = Math.max(start + timelineHeight * .55, cityTop - compactHeader - 2);
    geometry = { start, end, source: documentRect(source), destination: documentRect(destination) };
    const sourceUrl = source.querySelector('img')?.currentSrc || source.querySelector('img')?.src;
    const destinationUrl = destination.querySelector('img')?.currentSrc || destination.querySelector('img')?.src;
    if (sourceUrl && fromImage.src !== sourceUrl) fromImage.src = sourceUrl;
    if (destinationUrl && toImage.src !== destinationUrl) toImage.src = destinationUrl;
    fromImage.style.objectPosition = getComputedStyle(source.querySelector('img')).objectPosition;
    toImage.style.objectPosition = getComputedStyle(destination.querySelector('img')).objectPosition;
    sourceCaption.querySelector('small').textContent = source.querySelector('.rustic-orbit__hotel small')?.textContent || '';
    sourceCaption.querySelector('strong').textContent = source.querySelector('.rustic-orbit__hotel strong')?.textContent || '';
  };
  const update = () => {
    frame = 0;
    if (!ready || !geometry) return;
    if (reduced.matches) {
      document.body.classList.remove('handoff-in-flight', 'handoff-mobile');
      layer.style.display = 'none';
      return;
    }
    const scrollProgress = clamp((scrollY - geometry.start) / (geometry.end - geometry.start));
    if (scrollProgress < .1) cityInteracted = false;
    const progress = cityInteracted && scrollProgress > .4 ? 1 : scrollProgress;
    const mobile = innerWidth <= 800;
    const inFlight = progress >= .06 && progress < 1;
    document.body.classList.toggle('handoff-in-flight', inFlight);
    document.body.classList.toggle('handoff-mobile', mobile && inFlight);
    layer.classList.toggle('is-focus-handoff', inFlight && !!hero.querySelector(':focus-visible'));
    document.body.style.setProperty('--handoff-hero-title', (1 - .9 * phase(.06, .36, progress)).toFixed(4));
    document.body.style.setProperty('--handoff-hero-rise', `${(-20 * phase(.06, .36, progress)).toFixed(2)}px`);
    document.body.style.setProperty('--handoff-orbit', (1 - .86 * phase(.28, .76, progress)).toFixed(4));
    let headingReveal = mobile ? phase(.20, .40, progress) : phase(.54, .79, progress);
    if (innerWidth <= 700) {
      // The existing 60px form-to-heading gap is already compact. Do not leave
      // the heading invisible when natural flow puts it on a tall first screen.
      const heading = city.querySelector('.city-heading').getBoundingClientRect();
      const viewport = window.visualViewport;
      const visibleBottom = viewport ? viewport.height + viewport.offsetTop : innerHeight;
      headingReveal = Math.max(headingReveal, phase(0, Math.min(64, heading.height), visibleBottom - heading.top));
    }
    city.style.setProperty('--handoff-heading', headingReveal.toFixed(4));
    city.style.setProperty('--handoff-map', phase(.48, .86, progress).toFixed(4));
    city.style.setProperty('--handoff-neighbors', phase(.68, .93, progress).toFixed(4));
    city.style.setProperty('--handoff-caption', phase(.78, .98, progress).toFixed(4));
    city.style.setProperty('--handoff-marker', phase(.74, .85, progress).toFixed(4));
    city.style.setProperty('--handoff-route', phase(.86, .99, progress).toFixed(4));
    city.style.setProperty('--handoff-real-card', (mobile ? phase(.64, .9, progress) : phase(.94, 1, progress)).toFixed(4));
    city.style.setProperty('--handoff-mobile-scale', (1 - .07 * (1 - phase(.6, .93, progress))).toFixed(4));
    city.querySelectorAll('.city-waypoint').forEach((waypoint, index) => {
      waypoint.style.setProperty('--handoff-label', (mobile ? phase(.28 + index * .008, .48 + index * .008, progress) : phase(.62 + index * .012, .84 + index * .012, progress)).toFixed(4));
    });
    if (!inFlight || mobile) { layer.style.display = 'none'; return; }
    const travel = phase(.06, .94, progress);
    const source = geometry.source, destination = geometry.destination;
    const x = source.x + (destination.x - source.x) * travel;
    const y = source.y + (destination.y - source.y) * travel - scrollY;
    const width = source.width + (destination.width - source.width) * travel;
    const height = source.height + (destination.height - source.height) * travel;
    layer.style.display = 'block';
    layer.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
    layer.style.width = `${width.toFixed(2)}px`;
    layer.style.height = `${height.toFixed(2)}px`;
    layer.style.opacity = (1 - phase(.94, 1, progress)).toFixed(4);
    toImage.style.opacity = phase(.61, .76, progress).toFixed(4);
    sourceCaption.style.opacity = (1 - phase(.48, .61, progress)).toFixed(4);
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  const refresh = () => { requestAnimationFrame(() => { measure(); schedule(); }); };
  const initialize = () => {
    if (ready || !hero.querySelector('.rustic-orbit__card.is-featured')) return;
    ready = true;
    overlay();
    document.body.classList.add('hero-city-handoff-enabled');
    measure();
    update();
    new ResizeObserver(refresh).observe(hero);
    new ResizeObserver(refresh).observe(city);
    new ResizeObserver(refresh).observe(nav);
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh, { once: true });
    hero.addEventListener('load', refresh, true);
    city.addEventListener('load', refresh, true);
    window.addEventListener('resize', () => { refresh(); setTimeout(refresh, 100); });
    window.addEventListener('orientationchange', refresh);
    window.addEventListener('harper:hero-change', refresh);
    window.addEventListener('harper:city-change', () => { refresh(); setTimeout(refresh, 650); });
    city.addEventListener('pointerdown', () => { cityInteracted = true; schedule(); }, {passive:true});
    city.addEventListener('focusin', () => { cityInteracted = true; schedule(); });
    window.addEventListener('harper:booking-position', refresh);
    window.addEventListener('scroll', schedule, { passive: true });
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
    reduced.addEventListener('change', () => { refresh(); schedule(); });
  };
  if (!hero.querySelector('.rustic-orbit__card.is-featured')) {
    const observer = new MutationObserver(() => { if (hero.querySelector('.rustic-orbit__card.is-featured')) { observer.disconnect(); initialize(); } });
    observer.observe(document.getElementById('hero-orbit'), { childList: true, subtree: true });
  } else initialize();
}

renderCity();
setupMenu();
setupNews();
setupSectionAnchors();
setupCityViewport();

setupSectionPortalMotion();
setupMembershipOrbit();
setupMembershipDevice();
setupReveals();
setupScrollMotion();
setupHeroCityHandoff();
document.getElementById('year').textContent = new Date().getFullYear();
