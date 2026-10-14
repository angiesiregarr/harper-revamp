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

function setupStories() {
  const stories = {
    table: { title: 'Gather around the table', body: 'A shared meal gives every journey a place to pause. Come together over familiar flavours and make space for a conversation that lasts longer than dinner.' },
    recognition: { title: 'Recognition, shared with you', body: 'Every warm welcome begins with the people behind it. This moment belongs to the teams who bring care and attention to each stay.' },
    taste: { title: 'A taste of togetherness', body: 'Food is one of the simplest ways to feel at home somewhere new. Pull up a chair and enjoy the moments that happen around the table.' },
  };
  const dialog = document.getElementById('story-dialog');
  const closeButton = dialog.querySelector('.dialog-close');
  document.querySelectorAll('.story-open').forEach((button) => button.addEventListener('click', () => {
    const story = stories[button.dataset.story];
    document.getElementById('story-dialog-title').textContent = story.title;
    document.getElementById('story-dialog-body').textContent = story.body;
    dialog.showModal();
  }));
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
}

function setupMoments() {
  const track = document.getElementById('moments-track');
  [...track.children].forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.tabIndex = -1;
    track.appendChild(clone);
  });
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

function setupHeroCards() {
  const container = document.querySelector('.hero-scenes');
  const cards = [...container.querySelectorAll('.hero-scene')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let phase = 0, previous = 0, frame = 0, hovered = false, focused = false, visible = true;
  const clear = () => cards.forEach(card => card.setAttribute('aria-pressed', 'false'));
  const draw = () => {
    const step = Math.min(container.clientHeight / 4.2, cards[0].offsetHeight * .62) + 8;
    cards.forEach((card, index) => {
      // Wrap only at the fully faded ends; the middle card stays bright and foremost.
      const position = ((index - phase + 2.5 + cards.length * 100) % cards.length) - 2.5;
      const distance = Math.abs(position);
      const scale = 1 - Math.min(distance, 2.5) * .16;
      card.style.transform = `translateY(calc(-50% + ${position * step}px)) scale(${scale})`;
      card.style.opacity = String(Math.min(1, Math.max(0, (2.5 - distance) * 2)));
      card.style.zIndex = String(10 - Math.round(distance * 3));
      card.style.setProperty('--card-light', String(1 - Math.min(distance, 2) * .24));
    });
  };
  const tick = time => {
    const paused = hovered || focused || cards.some(card => card.getAttribute('aria-pressed') === 'true');
    if (previous && !paused) phase = (phase + Math.min(time - previous, 50) / 9000) % cards.length;
    previous = time;
    draw();
    frame = requestAnimationFrame(tick);
  };
  const playback = () => {
    cancelAnimationFrame(frame);
    previous = 0;
    container.classList.toggle('is-static', reduced.matches);
    if (!reduced.matches) {
      draw();
      if (visible && !document.hidden) frame = requestAnimationFrame(tick);
    }
  };
  container.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') hovered = true; });
  container.addEventListener('pointerleave', () => { hovered = false; });
  container.addEventListener('focusin', event => {
    focused = true;
    // A keyboard user can reach every card, including those at the faded loop edge.
    if (event.target.matches(':focus-visible') && !reduced.matches) {
      phase = cards.indexOf(event.target);
      draw();
    }
  });
  container.addEventListener('focusout', () => { focused = false; });
  cards.forEach(card => card.addEventListener('click', () => {
    const open = card.getAttribute('aria-pressed') !== 'true';
    clear();
    card.setAttribute('aria-pressed', String(open));
  }));
  document.addEventListener('pointerdown', event => {
    if (!event.target.closest('.hero-scene')) clear();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') clear(); });
  new ResizeObserver(() => { if (!reduced.matches) draw(); }).observe(container);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; playback(); }).observe(container);
  document.addEventListener('visibilitychange', playback);
  reduced.addEventListener('change', playback);
  playback();
}

function setupHeroMapMotion() {
  const hero = document.querySelector('.hero');
  const maps = [...hero.querySelectorAll('.hero-map img')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Figma component 245:15233: five Smart Animate states, in prototype order.
  // Image coordinates are relative to the 446 × 315 clipped, gradient-masked frame.
  const states = [[2, 0, 444, 333], [2, 0, 726, 545], [-25, -50, 726, 545],
    [-280, -77, 726, 545], [-268, -239, 726, 545]];
  const holds = [800, 10, 10, 10, 800];
  const transition = 1022.0937728881836;
  const duration = holds.reduce((sum, hold) => sum + hold + transition, 0);
  const transform = ([x, y, w, h]) =>
    `translate(${x / 444 * 100}%, ${y / 333 * 100}%) scale(${w / 444}, ${h / 333})`;
  // Sample a gentle, lightly damped spring; preserve the recorded transition duration.
  const spring = t => 1 - Math.exp(-7.5 * t) *
    (Math.cos(Math.sqrt(43.75) * t) + 7.5 / Math.sqrt(43.75) * Math.sin(Math.sqrt(43.75) * t));
  const frames = [{ offset: 0, transform: transform(states[0]) }];
  let elapsed = 0;
  states.forEach((state, index) => {
    elapsed += holds[index];
    frames.push({ offset: elapsed / duration, transform: transform(state) });
    const next = states[(index + 1) % states.length];
    for (let sample = 1; sample <= 64; sample++) {
      const progress = sample === 64 ? 1 : spring(sample / 64 * transition / 1000);
      frames.push({ offset: (elapsed + transition * sample / 64) / duration,
        transform: transform(state.map((value, i) => value + (next[i] - value) * progress)) });
    }
    elapsed += transition;
  });
  let animations = [];
  let visible = true;
  const syncPlayback = () => animations.forEach(animation => {
    if (visible && !document.hidden) animation.play();
    else animation.pause();
  });
  const refresh = () => {
    animations.forEach(animation => animation.cancel());
    animations = [];
    if (reduced.matches || !maps[0]?.animate) return;
    animations = maps.map(map => map.animate(frames, { duration, iterations: Infinity, easing: 'linear' }));
    const start = document.timeline.currentTime;
    animations.forEach(animation => { animation.startTime = start; });
    syncPlayback();
  };
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    syncPlayback();
  }).observe(hero);
  document.addEventListener('visibilitychange', syncPlayback);
  reduced.addEventListener('change', refresh);
  refresh();
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
setupStories();
setupMoments();
setupReveals();
setupHeroCards();
setupHeroMapMotion();
setupScrollMotion();
document.getElementById('year').textContent = new Date().getFullYear();
