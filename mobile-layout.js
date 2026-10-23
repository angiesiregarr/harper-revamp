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
  region.append(slides, controls);
  book.before(region);
  let current = 0, touch = null, suppressClickUntil = 0;
  function show(index) {
    current = Math.max(0, Math.min(stories.length - 1, index));
    stories.forEach((story, i) => { story.hidden = i !== current; });
    controls.querySelector('span').textContent = `${String(current + 1).padStart(2,'0')} / ${String(stories.length).padStart(2,'0')}`;
    controls.querySelector('[data-story-step="-1"]').disabled = current === 0;
    controls.querySelector('[data-story-step="1"]').disabled = current === stories.length - 1;
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
