/* Phone-only Journal presentation. The desktop book keeps its own page controls. */
(() => {
  const phone = matchMedia('(max-width: 700px)');
  const section = document.getElementById('journal');
  const book = document.getElementById('journal-book');
  if (!section || !book) return;
  const sources = [...book.querySelectorAll('[data-journal-spread] .news-card')];
  const region = document.createElement('div');
  region.className = 'mobile-journal';
  region.setAttribute('role', 'region');
  region.setAttribute('aria-label', 'Harper Journal stories');
  const slides = document.createElement('div');
  slides.className = 'mobile-journal-slides';
  const stories = sources.map((source, index) => {
    const article = document.createElement('article');
    article.className = 'mobile-journal-story';
    article.setAttribute('aria-label', `Story ${index + 1} of ${sources.length}`);
    const link = document.createElement('a');
    link.href = source.getAttribute('href');
    const image = document.createElement('div');
    image.className = 'mobile-story-image';
    image.append(source.querySelector('img').cloneNode(true));
    const copy = document.createElement('div');
    copy.className = 'mobile-story-copy';
    const meta = document.createElement('p');
    meta.className = 'mobile-story-meta';
    meta.innerHTML = source.querySelector('.news-meta').innerHTML;
    const title = document.createElement('h3');
    title.textContent = source.querySelector('h3').textContent;
    const excerpt = document.createElement('p');
    excerpt.className = 'mobile-story-excerpt';
    excerpt.textContent = source.querySelector('.news-excerpt').textContent;
    const read = document.createElement('span');
    read.className = 'mobile-story-read';
    read.textContent = 'READ STORY ↗';
    copy.append(meta, title, excerpt, read);
    link.append(image, copy);
    article.append(link);
    slides.append(article);
    return article;
  });
  const controls = document.createElement('div');
  controls.className = 'mobile-pager mobile-journal-controls';
  controls.innerHTML = '<button type="button" data-story-step="-1">← Previous</button><span aria-live="polite"></span><button type="button" data-story-step="1">Next story →</button>';
  const frame = document.createElement('div');
  frame.className = 'mobile-journal-book';
  const content = document.createElement('div');
  content.className = 'mobile-journal-content';
  content.inert = true;
  content.setAttribute('aria-hidden','true');
  content.append(slides, controls);
  const cover = document.createElement('button');
  cover.type = 'button';
  cover.className = 'mobile-journal-cover';
  cover.setAttribute('aria-label','Open the Harper Journal');
  cover.innerHTML = '<img src="./assets/harper-logo-white.png" alt="Harper by Aston" /><span class="mobile-cover-title">The<br>Journal</span><span class="mobile-cover-description">Something new at Harper.<br>Stories worth staying for.</span><span class="mobile-cover-open">Tap to open <span aria-hidden="true">↗</span></span>';
  const edge = document.createElement('span');
  edge.className = 'mobile-journal-edge';
  edge.setAttribute('aria-hidden','true');
  frame.append(content);
  cover.hidden = true;
  content.inert = false;
  content.removeAttribute('aria-hidden');
  frame.classList.add('is-open');
  region.append(frame);
  let opening = false, coverMotion = null;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  cover.addEventListener('click', async () => {
    if (opening || cover.hidden) return;
    opening = true;
    if (!reduced.matches) {
      coverMotion = cover.animate([{transform:'rotateY(0deg)',opacity:1},{transform:'rotateY(-105deg)',opacity:0}],{duration:520,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
      try { await coverMotion.finished; } catch {}
    }
    cover.hidden = true;
    coverMotion?.cancel();
    content.inert = false;
    content.removeAttribute('aria-hidden');
    frame.classList.add('is-open');
    controls.querySelector('[data-story-step="1"]').focus({preventScroll:true});
    opening = false;
  });
  reduced.addEventListener('change', () => { if (reduced.matches) coverMotion?.finish(); });
  book.before(region);
  let current = 0, touch = null, suppressClickUntil = 0;
  function show(index) {
    current = Math.max(0, Math.min(Math.ceil(stories.length / 4) - 1, index));
    stories.forEach((story, i) => {
      story.hidden = Math.floor(i / 4) !== current;
      story.classList.toggle('is-featured', i === current * 4);
    });
    controls.querySelector('span').textContent = `${String(current + 1).padStart(2,'0')} / ${String(Math.ceil(stories.length / 4)).padStart(2,'0')}`;
    controls.querySelector('[data-story-step="-1"]').disabled = current === 0;
    controls.querySelector('[data-story-step="1"]').disabled = current === Math.ceil(stories.length / 4) - 1;
  }
  controls.addEventListener('click', event => {
    const button = event.target.closest('[data-story-step]');
    if (button) show(current + Number(button.dataset.storyStep));
  });
  slides.addEventListener('touchstart', event => { touch = [event.touches[0].clientX, event.touches[0].clientY]; }, {passive:true});
  slides.addEventListener('touchend', event => {
    if (!touch) return;
    const dx = event.changedTouches[0].clientX - touch[0], dy = event.changedTouches[0].clientY - touch[1];
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      suppressClickUntil = performance.now() + 400;
      show(current + (dx < 0 ? 1 : -1));
    }
    touch = null;
  }, {passive:true});
  slides.addEventListener('click', event => { if (performance.now() < suppressClickUntil) event.preventDefault(); }, true);
  function sync() { region.inert = !phone.matches; }
  phone.addEventListener('change', sync);
  show(0);
  sync();
})();

/* Hide the phone header by transform, leaving its flow height unchanged. */
(() => {
  const nav = document.getElementById('site-nav');
  const phone = matchMedia('(max-width:700px)');
  let lastY = scrollY, travel = 0, direction = 0, frame = 0;
  function update() {
    frame = 0;
    const y = Math.max(0,scrollY), delta = y - lastY;
    const nextDirection = Math.sign(delta);
    if (nextDirection && nextDirection !== direction) { travel = 0; direction = nextDirection; }
    travel += Math.abs(delta);
    lastY = y;
    if (!phone.matches || y < 90 || nav.hasAttribute('data-menu-open') || nav.contains(document.activeElement)) {
      nav.classList.remove('is-mobile-hidden'); travel = 0; return;
    }
    if (direction > 0 && travel > 12) nav.classList.add('is-mobile-hidden');
    if (direction < 0 && travel > 6) nav.classList.remove('is-mobile-hidden');
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  addEventListener('scroll',schedule,{passive:true});
  phone.addEventListener('change',()=>{lastY=scrollY;travel=0;update();});
  nav.addEventListener('focusin',()=>nav.classList.remove('is-mobile-hidden'));
  new MutationObserver(schedule).observe(nav,{attributes:true,attributeFilter:['data-menu-open']});
  update();
})();
/* Keep download links after the phone in reading and keyboard order on phones. */
(() => {
  const stage = document.querySelector('.membership-stage');
  const content = stage.querySelector('.membership-content');
  const stores = stage.querySelector('.membership-stores');
  const phone = matchMedia('(max-width:700px)');
  function arrange() {
    const focused = stores.contains(document.activeElement) ? document.activeElement : null;
    (phone.matches ? stage : content).append(stores);
    focused?.focus({preventScroll:true});
  }
  phone.addEventListener('change',arrange);
  arrange();
})();
