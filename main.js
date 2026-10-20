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
  routeHost.innerHTML = cityHotels.map((hotel,index) => {
    const [px,py] = positions[index];
    const x = px * 16 + 6;
    const y = py * 2.4;
    const endX = Math.max(610,Math.min(990,x));
    return `<path class="city-route" data-city="${hotel.city}" pathLength="1" d="M ${x.toFixed(1)} ${y.toFixed(1)} L ${endX.toFixed(1)} 240" />`;
  }).join('');
  view.innerHTML = `<div class="prism-gallery" aria-label="Explore Harper hotels">${cityHotels.map((hotel, i) => `<button class="prism-card" type="button" data-index="${i}" aria-label="Show ${hotel.title} in ${hotel.place}"><img src="${hotel.src}" alt="${hotel.alt}" width="900" height="600" loading="lazy" /></button>`).join('')}</div><div class="prism-footer"><button class="prism-arrow" type="button" data-step="-1" aria-label="Previous hotel"><span aria-hidden="true">←</span></button><div class="prism-caption"><p id="hotel-location"></p><h3 id="hotel-name"></h3><div class="city-properties" id="city-properties" aria-label="Hotels in selected city"></div></div><button class="prism-arrow" type="button" data-step="1" aria-label="Next hotel"><span aria-hidden="true">→</span></button></div>`;
  const panels = [...view.querySelectorAll('.prism-card')];
  const imagePreloader = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    panels.forEach(panel => { panel.querySelector('img').loading = 'eager'; });
    imagePreloader.disconnect();
  }, {rootMargin: '600px'});
  imagePreloader.observe(document.getElementById('hotels'));
  const waypoints = [...waypointHost.querySelectorAll('.city-waypoint')];
  const routes = [...routeHost.querySelectorAll('.city-route')];
  let committed = 0;
  let hovered = null;
  let focused = null;
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
    routes.forEach((route, routeIndex) => {
      if (routeIndex === index) return;
      route.getAnimations().forEach(animation => animation.cancel());
      route.classList.remove('is-active');
    });
    routes[index].getAnimations().forEach(animation => animation.cancel());
    routes[index].classList.add('is-active');
    document.getElementById('hotel-location').textContent = hotel.place;
    document.getElementById('hotel-name').textContent = hotel.title;
    const inCity = cityHotels.map((item, i) => ({item, i})).filter(({item}) => item.city === hotel.city);
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
  select(Math.max(0, cityHotels.findIndex(hotel => hotel.city === currentCity())));
  const showPreview = () => show(hovered ?? focused ?? committed);
  waypoints.forEach((point) => {
    const index = cityHotels.findIndex(hotel => hotel.city === point.dataset.city);
    point.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovered = index; showPreview(); } });
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
  const section = document.getElementById('journal');
  const book = document.getElementById('journal-book');
  if (!section || !book) return;
  const spreads = [...book.querySelectorAll('[data-journal-spread]')];
  const sheet = book.querySelector('.journal-turn-sheet');
  const frontFace = sheet.querySelector('.journal-turn-front');
  const backFace = sheet.querySelector('.journal-turn-back');
  const cover = book.querySelector('.journal-cover');
  const openButton = document.getElementById('journal-open');
  const prevButton = document.getElementById('journal-prev');
  const nextButton = document.getElementById('journal-next');
  const pageCount = document.getElementById('journal-page-count');
  const cursor = section.querySelector('.journal-drag-hint');
  const nav = document.getElementById('site-nav');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 620px)');
  let current = 0;
  let turning = false;
  let drag = null;
  let coverAnimation = null;
  let hideCursor = () => {};
  const headerBottom = () => nav?.getBoundingClientRect().bottom || 0;
  const measureHeader = () => section.style.setProperty('--journal-header-clearance', `${Math.max(0, headerBottom()).toFixed(1)}px`);
  const placeBookmark = () => {
    const page = spreads[current]?.querySelector('.journal-page-right');
    if (!page) return;
    const pageRect = page.getBoundingClientRect();
    const bookRect = book.getBoundingClientRect();
    book.style.setProperty('--journal-ribbon-x', `${pageRect.left - bookRect.left + pageRect.width * .43}px`);
    book.style.setProperty('--journal-ribbon-y', `${pageRect.top - bookRect.top}px`);
  };
  const showPage = index => {
    current = index;
    spreads.forEach((spread, i) => {
      spread.classList.toggle('is-current', i === index);
      spread.toggleAttribute('inert', i !== index);
      spread.setAttribute('aria-hidden', String(i !== index));
    });
    pageCount.textContent = `${String(index + 1).padStart(2, '0')} / ${String(spreads.length).padStart(2, '0')}`;
    prevButton.disabled = index === 0;
    nextButton.disabled = index === spreads.length - 1;
    placeBookmark();
  };
  const open = (immediate = false) => {
    if (book.classList.contains('is-open') || book.classList.contains('is-opening')) return;
    hideCursor();
    coverAnimation?.cancel();
    book.classList.remove('is-closed', 'is-opening');
    book.tabIndex = 0;
    cover.tabIndex = -1;
    spreads[current].removeAttribute('inert');
    spreads[current].setAttribute('aria-hidden','false');
    if (immediate || reduced.matches || mobile.matches) {
      cover.style.transform = '';
      cover.style.opacity = '';
      book.classList.add('is-open');
      section.classList.add('journal-is-open');
      showPage(current);
      return;
    }
    book.classList.add('is-opening');
    coverAnimation = cover.animate([
      {transform:'rotateY(0deg)',opacity:1},
      {transform:'rotateY(-165deg)',opacity:0}
    ],{duration:1600,easing:'cubic-bezier(.2,.7,.2,1)',fill:'forwards'});
    coverAnimation.finished.catch(() => {}).then(() => {
      if (!book.classList.contains('is-opening')) return;
      coverAnimation?.cancel();
      cover.style.transform = '';
      cover.style.opacity = '';
      book.classList.remove('is-opening');
      book.classList.add('is-open');
      section.classList.add('journal-is-open');
      showPage(current);
    });
  };
  showPage(0);
  measureHeader();
  if (reduced.matches || mobile.matches) {
    open(true);
  } else {
    book.classList.add('is-closed');
    book.tabIndex = -1;
    spreads[0].setAttribute('inert','');
    spreads[0].setAttribute('aria-hidden','true');
    nextButton.disabled = true;
  }
  const update = () => {
    measureHeader();
    placeBookmark();
  };
  addEventListener('scroll', () => requestAnimationFrame(update), {passive:true});
  addEventListener('harper:booking-position', update);
  addEventListener('resize', update);
  reduced.addEventListener('change', () => { if (reduced.matches) open(true); });
  mobile.addEventListener('change', () => { if (mobile.matches) open(true); });
  openButton.addEventListener('click', () => open(false));
  cover.addEventListener('click', () => open(false));
  const turnTransform = (direction, progress) => `rotateY(${(direction > 0 ? -1 : 1)*180*progress}deg)`;
  const turnShadow = progress => `${(sheet.dataset.direction === 'next' ? -1 : 1)*Math.round(8+22*Math.sin(Math.PI*progress))}px 9px ${Math.round(18+24*Math.sin(Math.PI*progress))}px rgba(57,40,27,${(.12+.18*Math.sin(Math.PI*progress)).toFixed(3)})`;
  const clearSheet = () => {
    sheet.classList.remove('is-turning');
    frontFace.replaceChildren(); backFace.replaceChildren();
    book.querySelectorAll('.is-under-page,.is-lifting-page').forEach(el => el.classList.remove('is-under-page','is-lifting-page'));
    turning = false;
  };
  const turn = async (direction, fromDrag = false) => {
    if (!book.classList.contains('is-open') || turning || current + direction < 0 || current + direction >= spreads.length) return;
    if (reduced.matches || mobile.matches) { showPage(current + direction); return; }
    turning = true;
    const source = spreads[current].querySelector(direction > 0 ? '.journal-page-right' : '.journal-page-left');
    const destination = spreads[current + direction].querySelector(direction > 0 ? '.journal-page-left' : '.journal-page-right');
    const bookBox = book.getBoundingClientRect();
    const spreadBox = spreads[current].getBoundingClientRect();
    const pageWidth = spreadBox.width / 2;
    const gutter = spreadBox.left + pageWidth;
    const clonePage = page => {
      const clone = page.cloneNode(true);
      clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      clone.querySelectorAll('a').forEach(el => { el.removeAttribute('href'); el.tabIndex = -1; });
      return clone;
    };
    frontFace.replaceChildren(clonePage(source));
    backFace.replaceChildren(clonePage(destination));
    sheet.style.left = `${(direction > 0 ? gutter : spreadBox.left) - bookBox.left}px`;
    sheet.style.top = `${spreadBox.top - bookBox.top}px`;
    sheet.style.width = `${pageWidth}px`;
    sheet.style.height = `${spreadBox.height}px`;
    sheet.style.transformOrigin = direction > 0 ? 'left center' : 'right center';
    sheet.dataset.direction = direction > 0 ? 'next' : 'prev';
    sheet.style.transform = turnTransform(direction,0);
    sheet.style.boxShadow = turnShadow(0);
    sheet.classList.add('is-turning');
    const from = current;
    spreads[current + direction].classList.add('is-under-page');
    source.classList.add('is-lifting-page');
    if (fromDrag) return {from, direction, width:pageWidth};
    try { await sheet.animate([{transform:turnTransform(direction,0),boxShadow:turnShadow(0)},{transform:turnTransform(direction,1),boxShadow:turnShadow(1)}],{duration:1300,easing:'cubic-bezier(.2,.7,.2,1)'}).finished; } catch {}
    showPage(from + direction);
    clearSheet();
  };
  prevButton.addEventListener('click', () => turn(-1));
  nextButton.addEventListener('click', () => turn(1));
  book.addEventListener('keydown', event => {
    if (event.target.closest('a,button')) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      turn(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  book.querySelectorAll('.journal-turn-zone').forEach(zone => {
    const direction = zone.classList.contains('journal-turn-zone-next') ? 1 : -1;
    zone.addEventListener('pointermove', event => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      const travel = direction > 0 ? drag.x - event.clientX : event.clientX - drag.x;
      const vertical = Math.abs(event.clientY - drag.y);
      if (vertical > Math.abs(travel) * 1.2 && vertical > 18) return;
      drag.progress = Math.max(0, Math.min(1, travel / drag.width));
      sheet.style.transform = turnTransform(direction,drag.progress);
      sheet.style.boxShadow = turnShadow(drag.progress);
    });
    zone.addEventListener('pointerdown', async event => {
      if (!book.classList.contains('is-open') || turning || (direction > 0 && current === spreads.length - 1) || (direction < 0 && current === 0)) return;
      event.preventDefault();
      zone.setPointerCapture(event.pointerId);
      const state = await turn(direction, true);
      if (!state) return;
      drag = {pointerId:event.pointerId,x:event.clientX,y:event.clientY,time:performance.now(),progress:0,...state};
      book.classList.add('is-dragging');
    });
    const finish = async event => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      const state = drag;
      drag = null;
      book.classList.remove('is-dragging');
      const distance = direction > 0 ? state.x - event.clientX : event.clientX - state.x;
      const speed = distance / Math.max(1, performance.now() - state.time);
      const complete = event.type !== 'pointercancel' && (state.progress >= .26 || (distance > 35 && speed > .55));
      const endProgress = complete ? 1 : 0;
      try { await sheet.animate([{transform:sheet.style.transform,boxShadow:sheet.style.boxShadow},{transform:turnTransform(direction,endProgress),boxShadow:turnShadow(endProgress)}],{duration:Math.max(360,1300*Math.abs(endProgress-state.progress)),easing:'cubic-bezier(.2,.7,.2,1)'}).finished; } catch {}
      if (complete) showPage(state.from + direction);
      clearSheet();
    };
    zone.addEventListener('pointerup', finish);
    zone.addEventListener('pointercancel', finish);
  });
  let touchStart = null;
  book.addEventListener('touchstart', event => {
    if (event.touches.length !== 1 || event.target.closest('button')) return;
    const touch = event.touches[0];
    touchStart = {x: touch.clientX, y: touch.clientY};
  }, {passive:true});
  book.addEventListener('touchend', event => {
    if (!touchStart || !event.changedTouches.length) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) < 62 || Math.abs(dx) < Math.abs(dy) * 1.35) return;
    event.preventDefault();
    turn(dx < 0 ? 1 : -1);
  }, {passive:false});
  if (cursor) {
    document.body.append(cursor);
    const label = cursor.querySelector('.journal-drag-label');
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    const point = {x:0,y:0,vx:0,vy:0};
    const caption = {x:0,y:0,vx:0,vy:0};
    let targetX = 0, targetY = 0, labelX = 0, labelY = 0;
    let active = false, pressed = false, frame = 0, previous = 0;
    const spring = (body, x, y, stiffness, damping, mass, dt) => {
      body.vx += ((x - body.x) * stiffness - body.vx * damping) / mass * dt;
      body.vy += ((y - body.y) * stiffness - body.vy * damping) / mass * dt;
      body.x += body.vx * dt;
      body.y += body.vy * dt;
    };
    const draw = time => {
      frame = 0;
      if (!active) return;
      const dt = Math.min((time - (previous || time)) / 1000, .032);
      previous = time;
      if (reduced.matches) {
        point.x = targetX; point.y = targetY;
        caption.x = labelX; caption.y = labelY;
      } else {
        spring(point, targetX, targetY, 450, 34, .60, dt);
        spring(caption, labelX, labelY, 220, 26, .70, dt);
      }
      cursor.style.transform = `translate3d(${point.x}px,${point.y}px,0) scale(${pressed ? .88 : 1})`;
      label.style.transform = `translate3d(${caption.x - point.x}px,${caption.y - point.y}px,0)`;
      frame = requestAnimationFrame(draw);
    };
    const move = event => {
      if (!finePointer.matches || event.pointerType === 'touch') return;
      const overCover = book.classList.contains('is-closed') && event.target.closest('.journal-cover');
      const overEdge = book.classList.contains('is-open') && event.target.closest('.journal-turn-zone');
      if (!overCover && !overEdge) { hide(); return; }
      label.textContent = overCover ? 'Click me' : 'Drag me';
      targetX = event.clientX; targetY = event.clientY;
      labelX = targetX + (targetX > innerWidth - 145 ? -127 : 30);
      labelY = targetY + (targetY > innerHeight - 48 ? -38 : 8);
      if (!active) {
        active = true;
        point.x = targetX; point.y = targetY;
        caption.x = labelX; caption.y = labelY;
        cursor.classList.add('is-visible');
        section.classList.add('has-journal-cursor');
        previous = 0;
        frame = requestAnimationFrame(draw);
      }
    };
    const hide = () => {
      active = false; pressed = false;
      cursor.classList.remove('is-visible');
      section.classList.remove('has-journal-cursor');
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };
    hideCursor = hide;
    section.addEventListener('pointerenter', move);
    section.addEventListener('pointermove', move, {passive:true});
    section.addEventListener('pointerleave', hide);
    section.addEventListener('pointerdown', () => { pressed = true; });
    addEventListener('pointerup', () => { pressed = false; });
    addEventListener('pointercancel', () => { pressed = false; });
    finePointer.addEventListener('change', () => { if (!finePointer.matches) hide(); });
  }
  update();
  setTimeout(update, 120);
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

function setupHeroCityHandoff() {
  const hero = document.querySelector('.hero-orbit-stage');
  const city = document.getElementById('hotels');
  const nav = document.getElementById('site-nav');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
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
  let layer, fromImage, toImage, sourceCaption, geometry, frame = 0, ready = false;
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
    const start = Math.max(0, heroBottom - innerHeight);
    const end = Math.max(start + innerHeight * .55, cityTop - compactHeader - 2);
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
    const progress = clamp((scrollY - geometry.start) / (geometry.end - geometry.start));
    const mobile = innerWidth <= 800;
    const inFlight = progress >= .06 && progress < 1;
    document.body.classList.toggle('handoff-in-flight', inFlight);
    document.body.classList.toggle('handoff-mobile', mobile && inFlight);
    layer.classList.toggle('is-focus-handoff', inFlight && !!hero.querySelector(':focus-visible'));
    document.body.style.setProperty('--handoff-hero-title', (1 - .9 * phase(.06, .36, progress)).toFixed(4));
    document.body.style.setProperty('--handoff-hero-rise', `${(-20 * phase(.06, .36, progress)).toFixed(2)}px`);
    document.body.style.setProperty('--handoff-orbit', (1 - .86 * phase(.28, .76, progress)).toFixed(4));
    city.style.setProperty('--handoff-heading', phase(.54, .79, progress).toFixed(4));
    city.style.setProperty('--handoff-map', phase(.48, .86, progress).toFixed(4));
    city.style.setProperty('--handoff-neighbors', phase(.68, .93, progress).toFixed(4));
    city.style.setProperty('--handoff-caption', phase(.78, .98, progress).toFixed(4));
    city.style.setProperty('--handoff-marker', phase(.74, .85, progress).toFixed(4));
    city.style.setProperty('--handoff-route', phase(.86, .99, progress).toFixed(4));
    city.style.setProperty('--handoff-real-card', (mobile ? phase(.64, .9, progress) : phase(.94, 1, progress)).toFixed(4));
    city.style.setProperty('--handoff-mobile-scale', (1 - .07 * (1 - phase(.6, .93, progress))).toFixed(4));
    city.querySelectorAll('.city-waypoint').forEach((waypoint, index) => {
      waypoint.style.setProperty('--handoff-label', phase(.62 + index * .012, .84 + index * .012, progress).toFixed(4));
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
    window.addEventListener('harper:booking-position', refresh);
    window.addEventListener('scroll', schedule, { passive: true });
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
setupMembershipMotion();
setupMoments();
setupSectionPortalMotion();
setupReveals();
setupTextAnimations();
setupScrollMotion();
setupHeroCityHandoff();
document.getElementById('year').textContent = new Date().getFullYear();
