/* Harper Reels. User-supplied permalinks; local editorial covers are not Reel stills. */
(() => {
  const section = document.getElementById('moments');
  if (!section) return;
  const stage = document.getElementById('reels-stage');
  const orbit = document.getElementById('reels-orbit');
  const center = document.getElementById('reels-center');
  const social = document.getElementById('reels-social');
  const empty = document.getElementById('reels-empty');
  const controls = document.getElementById('reels-controls');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const icons = {
    instagram: '<rect x="2.5" y="2.5" width="19" height="19" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="18" cy="6.3" r="1" fill="currentColor" stroke="none"/>',
    facebook: '<path d="M14.4 21v-8h2.7l.4-3.2h-3.1V7.7c0-.9.3-1.5 1.6-1.5h1.7V3.3a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3v2.3H8.3V13H11v8z" fill="currentColor" stroke="none"/>',
    x: '<path d="M3.5 3.5h3.8l13.2 17h-3.8zM20.5 3.5l-17 17"/>'
  };
  let cards = [], items = [], state = 'idle';
  let visible = false, hover = false, focused = false, dragging = false, angle = -.2, velocity = 0, spreadAt = 0;
  let holdElapsed = 0, last = 0, raf = 0, pointerX = 0, pointerAt = 0, pointerStart = 0, pointerActive = false, suppressClickUntil = 0;
  let geometry = {x:0,y:0,w:0,h:0}, stepFrom = 0, stepTo = 0, stepAt = 0;
  const ease = t => { t = Math.max(0, Math.min(1,t)); return t*t*(3-2*t); };
  const setState = next => { state = next; section.dataset.reelsState = next; social.inert = next === 'idle'; };
  social.inert = true;
  const valid = item => item && typeof item.alt === 'string' && item.alt.trim() &&
    (item.preview === true
      ? item.url === 'https://www.instagram.com/harperhotels/reels/' && typeof item.cover === 'string'
      : /^https:\/\/www\.instagram\.com\/(?:harperhotels\/)?reel\/[\w-]+\/?(?:\?.*)?$/.test(item.url || ''));
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
    const w = Math.min(mobile ? 82 : 124, Math.max(64, box.width * (mobile ? .21 : .14)));
    const h = w * 340 / 190;
    geometry = {w,h,x:Math.max(0,Math.min(box.width*(mobile ? .38 : cards.length === 2 ? .3 : .38),box.width/2-w/2-22)),y:Math.max(0,Math.min(box.height*.38,box.height/2-h/2-22))};
    stage.style.setProperty('--reels-orbit-width', `${geometry.x*2}px`);
    stage.style.setProperty('--reels-orbit-height', `${geometry.y*2}px`);
    render(performance.now());
  }
  function renderCards() {
    orbit.replaceChildren();
    cards = items.map((item,i) => {
      const link = document.createElement('a');
      link.className = 'reels-card'; link.href = item.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', item.preview ? `Browse Harper Reels on Instagram. Preview photo: ${item.alt}` : `Watch Harper Reel on Instagram. Preview photo: ${item.alt}`);
      if (item.cover || item.thumbnail) {
        const img = document.createElement('img'); img.src = item.cover || item.thumbnail; img.alt = item.alt; img.loading = i < 2 ? 'eager' : 'lazy'; img.decoding = 'async';
        link.append(img);
        const badge = document.createElement('span');
        badge.className = 'reels-card-badge';
        badge.setAttribute('aria-hidden', 'true');
        badge.innerHTML = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 5l3 5M15 5l3 5"/><path d="m10 13 5 2.5-5 2.5z" fill="currentColor" stroke="none"/></svg>';
        link.append(badge);
      } else {
        const placeholder = document.createElement('span'); placeholder.className = 'reels-card-placeholder';
        placeholder.innerHTML = '<span class="reels-card-play" aria-hidden="true"><svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor"><path d="M6 3.5v13l10-6.5z"/></svg></span><span>Watch this Reel</span><small>On Instagram ↗</small>';
        link.append(placeholder);
      }
      orbit.append(link);
      link.addEventListener('click', e => { if (performance.now() < suppressClickUntil) e.preventDefault(); });
      return link;
    });
    measure();
  }
  function render(now) {
    if (!cards.length) return;
    const spread = reduced.matches ? 1 : state === 'holding' || state === 'idle' ? 0 : state === 'spreading' ? ease((now-spreadAt)/900) : 1;
    const centerProgress = reduced.matches ? 1 : state === 'spreading' ? ease((now-spreadAt-100)/1050) : state === 'spinning' ? 1 : 0;
    const compact = geometry.w < 100;
    center.style.setProperty('--reels-center-y', `${((compact ? 38 : 68)*(1-centerProgress)).toFixed(1)}px`);
    center.style.setProperty('--reels-center-scale', (1-(compact ? .18 : .37)*(1-centerProgress)).toFixed(3));
    const n = cards.length;
    cards.forEach((card,i) => {
      const phase = i * Math.PI*2/n + (n === 2 ? 0 : -Math.PI/2) + angle;
      const stagger = reduced.matches ? 1 : state === 'spreading' ? ease((now-spreadAt-i*55)/900) : spread;
      const radius = i === 0 ? spread : stagger;
      const x = Math.cos(phase)*geometry.x*radius;
      const y = Math.sin(phase)*geometry.y*radius;
      card.style.width = `${geometry.w}px`;
      card.style.height = `${geometry.h}px`;
      const scale = i === 0 ? 1 + (1-spread)*Math.min(.65, Math.max(.35, 210/geometry.w-1)) : .72 + .28*stagger;
      card.style.transform = `translate(-50%,-50%) translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${scale.toFixed(3)})`;
      card.style.opacity = i === 0 || reduced.matches ? '1' : String(stagger);
      card.style.zIndex = String(Math.round(100+y));
      card.tabIndex = i === 0 || spread >= .95 ? 0 : -1;
    });
  }
  function frame(now) {
    const dt = Math.min(250,Math.max(0,now-last)); last=now;
    if (state === 'holding' && visible && !document.hidden) {holdElapsed += dt; if(holdElapsed >= 5000){setState('spreading');spreadAt=now;}}
    if (state === 'spreading' && now-spreadAt > Math.max(1250,900+(cards.length-1)*55)){setState('spinning');}
    if (stepAt) {
      const progress = reduced.matches ? 1 : ease((now-stepAt)/650);
      angle = stepFrom+(stepTo-stepFrom)*progress;
      if (progress >= 1) stepAt = 0;
    } else if (state === 'spinning' && visible && !document.hidden && !dragging && !reduced.matches) {
      if (Math.abs(velocity) > .00008) {angle += velocity*dt;velocity *= Math.exp(-dt*.014);}
      else {velocity=0;if (!hover && !focused) angle += dt * (5*Math.PI/180)/1000;}
    }
    render(now);
    raf=requestAnimationFrame(frame);
  }
  function start() {
    if (state !== 'idle') return;
    if (reduced.matches) setState('spinning');
    else setState('holding');
  }
  function initialize(data) {
    items=(data.items || []).filter(valid);
    renderSocial(data.profiles);
    if (!items.length) {empty.hidden=false;setState('empty');return;}
    controls.hidden=false;renderCards();
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();},{threshold:.35});observer.observe(stage);
    document.addEventListener('visibilitychange',()=>{last=performance.now();});
    orbit.addEventListener('pointerover',e=>{if(e.target.closest('.reels-card'))hover=true;});
    orbit.addEventListener('pointerout',e=>{if(e.target.closest('.reels-card') && !e.relatedTarget?.closest?.('.reels-card'))hover=false;});
    stage.addEventListener('focusin',()=>{focused=true;});stage.addEventListener('focusout',()=>{focused=stage.contains(document.activeElement);});
    orbit.addEventListener('pointerdown',e=>{if(state!=='spinning'||e.button!==0)return;pointerActive=true;stepAt=0;pointerStart=e.clientX;pointerX=e.clientX;pointerAt=performance.now();velocity=0;});
    orbit.addEventListener('pointermove',e=>{
      if (!pointerActive || e.buttons!==1 || state!=='spinning') return;
      if (!dragging && Math.abs(e.clientX-pointerStart)>7) {dragging=true;orbit.setPointerCapture(e.pointerId);}
      if (!dragging) return;
      const dx=e.clientX-pointerX, elapsed=Math.max(1,performance.now()-pointerAt);
      const delta=dx/Math.max(110,stage.clientWidth*.38);
      angle+=delta;velocity=delta/elapsed*.25;pointerX=e.clientX;pointerAt=performance.now();
    });
    const finish=()=>{if(dragging)suppressClickUntil=performance.now()+350;dragging=false;pointerActive=false;};
    orbit.addEventListener('pointerup',finish);orbit.addEventListener('pointercancel',finish);
    const step = dir => {if(state!=='spinning'||cards.length<2)return;stepFrom=angle;stepTo=angle+dir*2*Math.PI/cards.length;stepAt=performance.now();velocity=0;};
    controls.querySelectorAll('[data-reels-step]').forEach(button=>button.addEventListener('click',()=>step(Number(button.dataset.reelsStep))));
    orbit.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();step(e.key==='ArrowRight'?1:-1);}});
    addEventListener('resize',measure);
    reduced.addEventListener('change',()=>{if(reduced.matches)setState('spinning');render(performance.now());});
    last=performance.now();raf=requestAnimationFrame(frame);
  }
  fetch('./data/reels.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Reel manifest unavailable');return r.json();}).then(initialize).catch(()=>initialize({profiles:{instagram:'https://www.instagram.com/harperhotels/reels/'},items:[]}));
})();
