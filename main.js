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

function setupHeroMovement() {
  const hero = document.querySelector('.hero');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!window.matchMedia('(pointer:fine)').matches) return;
  hero.addEventListener('pointermove', (event) => {
    if (reducedMotion.matches) return;
    const x = (event.clientX / window.innerWidth - .5) * 14;
    hero.style.setProperty('--hero-shift', `${x.toFixed(1)}px`);
  });
  hero.addEventListener('pointerleave', () => hero.style.setProperty('--hero-shift', '0px'));
  reducedMotion.addEventListener('change', () => hero.style.setProperty('--hero-shift', '0px'));
}

function setupScrollMotion() {
  const nav = document.getElementById('site-nav');
  const photo = document.querySelector('.membership-photo');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer:fine)');
  let scheduled = false;

  const update = () => {
    scheduled = false;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    nav.style.setProperty('--scroll-progress', scrollable > 0 ? String(Math.min(1, window.scrollY / scrollable)) : '0');

    if (reducedMotion.matches || !finePointer.matches || window.innerWidth <= 600) {
      photo.style.setProperty('--member-shift', '0px');
      return;
    }
    const bounds = photo.getBoundingClientRect();
    if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;
    const progress = (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height);
    photo.style.setProperty('--member-shift', `${((progress - .5) * 40).toFixed(1)}px`);
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(update);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  reducedMotion.addEventListener('change', schedule);
  finePointer.addEventListener('change', schedule);
  schedule();
}

renderCity();
setupMenu();
setupStories();
setupMoments();
setupReveals();
setupHeroMovement();
setupScrollMotion();
document.getElementById('year').textContent = new Date().getFullYear();
