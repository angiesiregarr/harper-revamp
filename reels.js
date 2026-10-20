/* Harper Reels. Only entries with a verified Instagram permalink and thumbnail render. */
(() => {
  const section = document.getElementById('moments');
  if (!section) return;
  const stage = document.getElementById('reels-stage');
  const orbit = document.getElementById('reels-orbit');
  const center = document.getElementById('reels-center');
  const social = document.getElementById('reels-social');
  const empty = document.getElementById('reels-empty');
  const controls = document.getElementById('reels-controls');
  const count = document.getElementById('reels-count');
  const pageControls = document.getElementById('reels-page-controls');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const icons = {
    instagram: '<rect x="2.5" y="2.5" width="19" height="19" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="18" cy="6.3" r="1" fill="currentColor" stroke="none"/>',
    facebook: '<path d="M14.4 21v-8h2.7l.4-3.2h-3.1V7.7c0-.9.3-1.5 1.6-1.5h1.7V3.3a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3v2.3H8.3V13H11v8z" fill="currentColor" stroke="none"/>',
    x: '<path d="M3.5 3.5h3.8l13.2 17h-3.8zM20.5 3.5l-17 17"/>'
  };
  let cards = [], items = [], page = 0, pageSize = 7, state = 'idle';
  let visible = false, hover = false, focused = false, dragging = false, angle = 0, velocity = 0, spreadAt = 0;
  let holdElapsed = 0, revealAt = 0, last = 0, raf = 0, pointerX = 0, pointerAt = 0, dragDistance = 0;
  let geometry = {x:0,y:0,w:0,h:0};
  const ease = t => { t = Math.max(0, Math.min(1,t)); return t*t*(3-2*t); };
  const setState = next => { state = next; section.dataset.reelsState = next; };
  const valid = item => item && /^https:\/\/www\.instagram\.com\/reel\/[\w-]+\/?(?:\?.*)?$/.test(item.url || '') && typeof item.thumbnail === 'string' && item.thumbnail.trim() && typeof item.alt === 'string' && item.alt.trim();
  function renderSocial(profiles) {
    social.replaceChildren();
    for (const name of ['instagram','facebook','x']) {
      const url = profiles?.[name];
      const icon = document.createElement(url ? 'a' : 'span');
      icon.className = 'reels-social-icon' + (url ? '' : ' is-unlinked');
      icon.setAttribute('aria-label', url ? `Harper on ${name === 'x' ? 'X' : name}` : `${name === 'x' ? 'X' : name} profile link pending verification`);
      icon.title = icon.getAttribute('aria-label');
      if (url) { icon.href = url; icon.target = '_blank'; icon.rel = 'noopener noreferrer'; }
      icon.innerHTML = `<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
      social.append(icon);
    }
  }
  function measure() {
    const box = stage.getBoundingClientRect();
    const mobile = box.width < 650;
    const w = Math.min(mobile ? 82 : 108, Math.max(64, box.width * (mobile ? .21 : .14)));
    const h = w * 340 / 190;
    geometry = {w,h,x:Math.max(0,Math.min(box.width*.38,box.width/2-w/2-22)),y:Math.max(0,Math.min(box.height*.38,box.height/2-h/2-22))};
    render(performance.now());
  }
  function setPage(index) {
    page = Math.max(0, Math.min(Math.ceil(items.length/pageSize)-1,index));
    orbit.replaceChildren();
    const start = page*pageSize;
    cards = items.slice(start,start+pageSize).map((item,i) => {
      const link = document.createElement('a');
      link.className = 'reels-card'; link.href = item.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', `Watch Harper Reel: ${item.alt}`);
      const img = document.createElement('img'); img.src = item.thumbnail; img.alt = item.alt; img.loading = i < 2 ? 'eager' : 'lazy'; img.decoding = 'async';
      link.append(img); orbit.append(link);
      link.addEventListener('click', e => { if (dragDistance > 7) e.preventDefault(); });
      return link;
    });
    count.textContent = `${String(start+1).padStart(2,'0')}–${String(start+cards.length).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}`;
    pageControls.hidden = items.length <= pageSize;
    pageControls.querySelector('[data-reels-page="-1"]').disabled = page === 0;
    pageControls.querySelector('[data-reels-page="1"]').disabled = (page+1)*pageSize >= items.length;
    measure();
  }
  function render(now) {
    if (!cards.length) return;
    const spread = reduced.matches ? 1 : state === 'holding' || state === 'idle' ? 0 : state === 'spreading' ? ease((now-spreadAt)/900) : 1;
    const n = cards.length;
    cards.forEach((card,i) => {
      const phase = i * Math.PI*2/n - Math.PI/2 + angle;
      const stagger = reduced.matches ? 1 : state === 'spreading' ? ease((now-spreadAt-i*55)/900) : spread;
      const radius = i === 0 ? spread : stagger;
      const x = Math.cos(phase)*geometry.x*radius;
      const y = Math.sin(phase)*geometry.y*radius;
      card.style.width = `${geometry.w}px`;
      card.style.height = `${geometry.h}px`;
      card.style.transform = `translate(-50%,-50%) translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
      card.style.opacity = i === 0 || reduced.matches ? '1' : String(stagger);
      card.style.zIndex = String(Math.round(100+y));
      card.tabIndex = i === 0 || spread >= .95 ? 0 : -1;
    });
    if (state === 'revealing') {
      const title = ease((now-revealAt)/500);
      center.style.setProperty('--reels-title-opacity', String(title));
      center.style.setProperty('--reels-social-opacity', String(ease((now-revealAt-300)/500)));
    }
  }
  function frame(now) {
    const dt = Math.min(50,Math.max(0,now-last)); last=now;
    if (state === 'holding' && visible && !document.hidden) {holdElapsed += dt; if(holdElapsed >= 20000){setState('spreading');spreadAt=now;}}
    if (state === 'spreading' && now-spreadAt > 900+(cards.length-1)*55){setState('revealing');revealAt=now;}
    if (state === 'revealing' && now-revealAt > 900){setState('spinning');}
    if (state === 'spinning' && visible && !document.hidden && !dragging && !reduced.matches) {
      if (Math.abs(velocity) > .00008) {angle += velocity*dt;velocity *= Math.exp(-dt*.014);}
      else {velocity=0;if (!hover && !focused) angle += dt * (5*Math.PI/180)/1000;}
    }
    render(now);
    raf=requestAnimationFrame(frame);
  }
  function start() {
    if (state !== 'idle') return;
    if (reduced.matches) {setState('spinning');center.style.setProperty('--reels-title-opacity','1');center.style.setProperty('--reels-social-opacity','1');}
    else setState('holding');
  }
  function initialize(data) {
    const verified = (data.items || []).filter(valid);
    items=verified;pageSize=Math.max(1,Math.min(innerWidth<650?5:7,Number(data.pageSize)||7));
    renderSocial(data.profiles);
    if (!items.length) {empty.hidden=false;section.dataset.reelsState='empty';center.style.setProperty('--reels-title-opacity','1');center.style.setProperty('--reels-social-opacity','1');return;}
    controls.hidden=false;setPage(0);
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();},{threshold:.5});observer.observe(section);
    document.addEventListener('visibilitychange',()=>{last=performance.now();});
    stage.addEventListener('pointerenter',()=>{hover=true;});stage.addEventListener('pointerleave',()=>{hover=false;});
    stage.addEventListener('focusin',()=>{focused=true;});stage.addEventListener('focusout',()=>{focused=stage.contains(document.activeElement);});
    orbit.addEventListener('pointerdown',e=>{if(state!=='spinning')return;dragging=true;dragDistance=0;pointerX=e.clientX;pointerAt=performance.now();velocity=0;orbit.setPointerCapture(e.pointerId);});
    orbit.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-pointerX;const elapsed=Math.max(1,performance.now()-pointerAt);const delta=dx/Math.max(110,stage.clientWidth*.38);angle+=delta;velocity=delta/elapsed*.25;dragDistance+=Math.abs(dx);pointerX=e.clientX;pointerAt=performance.now();});
    const finish=()=>{dragging=false;};orbit.addEventListener('pointerup',finish);orbit.addEventListener('pointercancel',finish);
    controls.querySelectorAll('[data-reels-step]').forEach(button=>button.addEventListener('click',()=>{const dir=Number(button.dataset.reelsStep);if(cards.length>1)angle+=dir*2*Math.PI/cards.length;else setPage(page+dir);}));
    pageControls.querySelectorAll('[data-reels-page]').forEach(button=>button.addEventListener('click',()=>setPage(page+Number(button.dataset.reelsPage))));
    orbit.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();angle+=(e.key==='ArrowRight'?1:-1)*2*Math.PI/cards.length;}});
    addEventListener('resize',()=>{const nextSize=Math.max(1,Math.min(innerWidth<650?5:7,Number(data.pageSize)||7));if(nextSize!==pageSize){const first=page*pageSize;pageSize=nextSize;setPage(Math.floor(first/pageSize));}else measure();});reduced.addEventListener('change',()=>{if(reduced.matches){setState('spinning');center.style.setProperty('--reels-title-opacity','1');center.style.setProperty('--reels-social-opacity','1');}render(performance.now());});
    last=performance.now();raf=requestAnimationFrame(frame);
  }
  fetch('./data/reels.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Reel manifest unavailable');return r.json();}).then(initialize).catch(()=>initialize({profiles:{instagram:'https://www.instagram.com/harperhotels/reels/'},items:[]}));
})();
