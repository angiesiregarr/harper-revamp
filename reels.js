/* Reels gallery. Verified Instagram clips and original covers: data/reels-sources.json. */
(() => {
  const section = document.getElementById('moments');
  if (!section) return;
  const stage = document.getElementById('reels-stage');
  const orbit = document.getElementById('reels-orbit');
  const center = document.getElementById('reels-center');
  const social = document.getElementById('reels-social');
  const empty = document.getElementById('reels-empty');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const phone = matchMedia('(max-width: 700px)');
  let mobileControls = null, mobileScrollFrame = 0, mobileTouch = null;
  const icons = {
    instagram: '<rect x="2.5" y="2.5" width="19" height="19" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="18" cy="6.3" r="1" fill="currentColor" stroke="none"/>',
    facebook: '<path d="M14.4 21v-8h2.7l.4-3.2h-3.1V7.7c0-.9.3-1.5 1.6-1.5h1.7V3.3a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3v2.3H8.3V13H11v8z" fill="currentColor" stroke="none"/>',
    x: '<path d="M3.5 3.5h3.8l13.2 17h-3.8zM20.5 3.5l-17 17"/>'
  };
  let cards = [], items = [], state = 'idle';
  let playbackPaused = false, manualPreview = false, player = null, featuredIndex = 0, focusIndex = -1, stepIndex = -1;
  let updateMobile = () => {};
  function syncPlayback() {
    const playing = visible && !document.hidden && !player?.open && (manualPreview || (!reduced.matches && !playbackPaused));
    cards.forEach((card,index) => {
      const video = card.querySelector('video');
      if (!video) return;
      if (playing && index === featuredIndex) video.play().catch(() => {});
      else video.pause();
    });
  }
  function highlight(index) {
    if (featuredIndex !== index) { featuredIndex = index; manualPreview = false; syncPlayback(); }
    cards.forEach((card,i) => {
      card.classList.toggle('is-highlighted',i === index);
      if (i === index) card.setAttribute('aria-current','true'); else card.removeAttribute('aria-current');
    });
    if (mobileControls) mobileControls.querySelector('span').setAttribute('aria-live',phone.matches||focused?'polite':'off');
    if (mobileControls && !phone.matches) {
      mobileControls.querySelector('span').textContent = `${String(index+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
      mobileControls.querySelectorAll('button').forEach(button => {button.disabled = state !== 'spinning' || currentSpread < .95;});
    }
  }
  function alignTo(index) {
    if (phone.matches || currentSpread < .95) return;
    stepIndex = index;
    const target = Math.PI/2-index*2*Math.PI/cards.length;
    stepFrom=angle;stepTo=angle+Math.atan2(Math.sin(target-angle),Math.cos(target-angle));stepAt=performance.now();velocity=0;
  }
  function openVideo(item) {
    stepAt=0;velocity=0;
    if (!player) {
      player = document.createElement('dialog');
      player.className = 'reel-player';
      player.setAttribute('aria-label','Watch this Moment');
      player.innerHTML = '<div class="reel-player-heading"><h3>Moments at Harper</h3><button type="button" aria-label="Close video">×</button></div><video controls playsinline preload="metadata"></video><a target="_blank" rel="noopener noreferrer">View original Reel on Instagram ↗</a>';
      document.body.append(player);
      player.querySelector('button').addEventListener('click',()=>player.close());
      player.addEventListener('close',()=>{const video=player.querySelector('video');video.pause();video.removeAttribute('src');video.load();syncPlayback();});
      player.addEventListener('click',event=>{if(event.target===player){const r=player.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)player.close();}});
    }
    const video = player.querySelector('video');
    video.src = item.video; video.poster = item.cover || item.thumbnail;
    video.setAttribute('aria-label',item.alt);
    player.querySelector('a').href = item.url;
    player.showModal(); syncPlayback();
    if (!reduced.matches) video.play().catch(()=>{});
  }
  let visible = false, hover = false, focused = false, dragging = false, angle = -.2, velocity = 0, spreadAt = 0, currentSpread = 0;
  let holdElapsed = 0, last = 0, raf = 0, pointerX = 0, pointerAt = 0, pointerStart = 0, pointerActive = false, suppressClickUntil = 0;
  let geometry = {x:0,y:0,w:0,h:0,titleShift:0,socialShift:0}, stepFrom = 0, stepTo = 0, stepAt = 0;
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
    stage.setAttribute('aria-description', phone.matches ? 'Swipe to browse Moments. Use the previous and next controls, or open a cover to watch on Instagram.' : 'Drag to rotate the covers, or focus a cover and use the left and right arrow keys');
    const box = stage.getBoundingClientRect();
    const mobile = box.width < 650;
    const w = Math.min(mobile ? 82 : 124, Math.max(64, box.width * (mobile ? .21 : .14)));
    const h = w * 340 / 190;
    const scale = 1 + Math.min(.65, Math.max(.35, 210/w-1));
    const centerHeight = center.offsetHeight;
    const titleHeight = center.querySelector('h2').offsetHeight;
    const socialHeight = social.offsetHeight;
    const socialMargin = parseFloat(getComputedStyle(social).marginTop) || 0;
    const cardTop = box.height/2 - h*scale/2;
    const cardBottom = box.height/2 + h*scale/2;
    const titleBottom = box.height/2 - centerHeight/2 + titleHeight;
    const socialTop = titleBottom + socialMargin;
    geometry = {w,h,x:Math.max(0,Math.min(box.width*(mobile ? .38 : cards.length === 2 ? .3 : .38),box.width/2-w/2-22)),y:Math.max(0,Math.min(box.height*.32,box.height/2-h*1.4/2-32)),titleShift:cardTop-14-titleBottom,socialShift:cardBottom-socialHeight-Math.max(20,h*scale*.1)-socialTop};
    stage.style.setProperty('--reels-orbit-width', `${geometry.x*2}px`);
    stage.style.setProperty('--reels-orbit-height', `${geometry.y*2}px`);
    render(performance.now());
  }
  function renderCards() {
    orbit.replaceChildren();
    cards = items.map((item,i) => {
      const link = document.createElement('a');
      link.className = 'reels-card'; link.href = item.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', item.preview ? `Browse Harper Reels on Instagram. Preview photo: ${item.alt}` : `Watch Reel on Instagram. Cover: ${item.alt}`);
      if (item.cover || item.thumbnail) {
        if (/^\.\/assets\/reels\/[\w-]+\.mp4$/.test(item.video || '')) {
          const video = document.createElement('video');
          video.muted = true; video.defaultMuted = true; video.autoplay = false; video.loop = true; video.playsInline = true;
          video.setAttribute('muted', ''); video.setAttribute('playsinline', '');
          video.poster = item.cover || item.thumbnail; video.preload = 'none';
          video.setAttribute('aria-hidden', 'true'); video.src = item.video;
          link.classList.add('has-video'); link.append(video);
        } else {
          const img = document.createElement('img'); img.src = item.cover || item.thumbnail; img.alt = item.alt; img.loading = i < 2 ? 'eager' : 'lazy'; img.decoding = 'async';
          link.append(img);
        }
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
      link.setAttribute('aria-description', 'Press Space to play or pause the preview. Press Enter to open the video player.');
      link.addEventListener('click', e => {
        if (performance.now() < suppressClickUntil) { e.preventDefault(); return; }
        if (item.video && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) { e.preventDefault(); openVideo(item); }
      });
      link.addEventListener('focus', () => { focusIndex = i; alignTo(i); highlight(i); syncPlayback(); });
      link.addEventListener('keydown', e => {
        if (e.code !== 'Space' || !link.querySelector('video')) return;
        e.preventDefault();
        if (reduced.matches) manualPreview = !manualPreview; else playbackPaused = !playbackPaused;
        syncPlayback();
      });
      return link;
    });
    measure();
  }
  function render(now) {
    if (!cards.length) return;
    if (phone.matches) {
      social.inert = false;
      cards.forEach(card => { card.tabIndex = 0; });
      return;
    }
    const scrollDriven = section.classList.contains('motion-ready') && !reduced.matches;
    const sectionProgress = parseFloat(section.style.getPropertyValue('--handoff-enter')) || 0;
    const timedSpread = state === 'holding' || state === 'idle' ? 0 : state === 'spreading' ? ease((now-spreadAt)/900) : 1;
    const spread = reduced.matches ? 1 : timedSpread * (scrollDriven ? ease((sectionProgress - .12) / .82) : 1);
    currentSpread = spread;
    const centerProgress = reduced.matches ? 1 : ease((spread - .18) / .77);
    social.inert = state === 'idle' || (spread < .9 && !social.contains(document.activeElement));
    center.style.setProperty('--reels-title-y', `${(geometry.titleShift*(1-centerProgress)).toFixed(1)}px`);
    center.style.setProperty('--reels-social-y', `${(geometry.socialShift*(1-centerProgress)).toFixed(1)}px`);
    const n = cards.length;
    // Highlight at the side of the orbit so the headline and socials stay clear.
    let front = 0, frontX = -Infinity;
    cards.forEach((card,i) => {const x=Math.cos(i*Math.PI*2/n+(n===2?0:-Math.PI/2)+angle);if(x>frontX){front=i;frontX=x;}});
    highlight(focusIndex >= 0 ? focusIndex : spread < .8 ? 0 : stepAt ? stepIndex : front);
    cards.forEach((card,i) => {
      const phase = i * Math.PI*2/n + (n === 2 ? 0 : -Math.PI/2) + angle;
      const stagger = reduced.matches ? 1 : ease((spread - i * .045) / Math.max(.65, 1 - i * .045));
      const radius = i === 0 ? spread : stagger;
      const x = Math.cos(phase)*geometry.x*radius;
      const y = Math.sin(phase)*geometry.y*radius;
      card.style.width = `${geometry.w}px`;
      card.style.height = `${geometry.h}px`;
      const scale = i === featuredIndex ? 1.4 + (1-spread)*.2 : .72 + .08*stagger;
      card.style.transform = `translate(-50%,-50%) translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${scale.toFixed(3)})`;
      card.style.opacity = i === 0 || reduced.matches ? '1' : String(stagger);
      card.style.zIndex = String(Math.round(100+y));
      card.tabIndex = i === 0 || spread >= .95 ? 0 : -1;
    });
  }
  function frame(now) {
    if (phone.matches) { render(now); raf = 0; return; }
    const dt = Math.min(250,Math.max(0,now-last)); last=now;
    if (state === 'holding' && visible && !document.hidden) {holdElapsed += dt; if(holdElapsed >= 2000){setState('spreading');spreadAt=now;}}
    if (state === 'spreading' && now-spreadAt > Math.max(1250,900+(cards.length-1)*55)){setState('spinning');}
    if (stepAt) {
      const progress = reduced.matches ? 1 : ease((now-stepAt)/650);
      angle = stepFrom+(stepTo-stepFrom)*progress;
      if (progress >= 1) stepAt = 0;
    } else if (state === 'spinning' && visible && currentSpread >= .98 && !document.hidden && !dragging && !player?.open && !reduced.matches) {
      if (Math.abs(velocity) > .00008) {angle += velocity*dt;velocity *= Math.exp(-dt*.014);}
      else {velocity=0;if (!hover && !focused) angle += dt * (5*Math.PI/180)/1000;}
    }
    render(now);
    raf=requestAnimationFrame(frame);
  }
  function start() {
    if (state !== 'idle') return;
    setState(reduced.matches ? 'spinning' : 'holding');
  }
  function initialize(data) {
    items=(data.items || []).filter(valid);
    renderSocial(data.profiles);
    if (!items.length) {empty.hidden=false;setState('empty');return;}
    renderCards();
    mobileControls = document.createElement('div');
    mobileControls.className = 'mobile-pager mobile-reels-controls';
    mobileControls.innerHTML = '<button type="button" data-reel-step="-1" aria-label="Previous moment">←</button><span aria-live="polite"></span><button type="button" data-reel-step="1" aria-label="Next moment">→</button>';
    orbit.after(mobileControls);
    const mobileIndex = () => Math.max(0, Math.min(cards.length - 1, Math.round(orbit.scrollLeft / (cards[0].offsetWidth + 12))));
    updateMobile = () => {
      mobileScrollFrame = 0;
      const index = mobileIndex();
      highlight(index);
      mobileControls.querySelector('span').textContent = `${String(index + 1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
      mobileControls.querySelector('[data-reel-step="-1"]').disabled = index === 0;
      mobileControls.querySelector('[data-reel-step="1"]').disabled = index === cards.length - 1;
    };
    const moveMobile = direction => {
      const index = Math.max(0, Math.min(cards.length - 1, mobileIndex() + direction));
      orbit.scrollTo({left:index * (cards[0].offsetWidth + 12),behavior:reduced.matches?'instant':'smooth'});
    };
    mobileControls.addEventListener('click', event => {
      const button = event.target.closest('[data-reel-step]');
      if (button) { if(phone.matches) moveMobile(Number(button.dataset.reelStep)); else step(Number(button.dataset.reelStep)); }
    });
    orbit.addEventListener('scroll', () => { if (phone.matches && !mobileScrollFrame) mobileScrollFrame = requestAnimationFrame(updateMobile); }, {passive:true});
    orbit.addEventListener('touchstart', event => { if (phone.matches) mobileTouch = [event.touches[0].clientX, event.touches[0].clientY]; }, {passive:true});
    orbit.addEventListener('touchend', event => {
      if (mobileTouch && Math.abs(event.changedTouches[0].clientX - mobileTouch[0]) > 10) suppressClickUntil = performance.now() + 400;
      mobileTouch = null;
    }, {passive:true});
    phone.addEventListener('change', () => {
      render(performance.now());
      if(phone.matches) updateMobile(); else { focusIndex=-1;render(performance.now()); }
      syncPlayback();
      if (!phone.matches && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    });
    if(phone.matches)updateMobile();
    const observer=new IntersectionObserver(entries=>{visible=entries[0].intersectionRatio >= .25;if(visible)start();syncPlayback();},{threshold:[0,.25]});observer.observe(stage);
    document.addEventListener('visibilitychange',()=>{last=performance.now();syncPlayback();});
    orbit.addEventListener('pointerover',e=>{if(e.target.closest('.reels-card'))hover=true;});
    orbit.addEventListener('pointerout',e=>{if(e.target.closest('.reels-card') && !e.relatedTarget?.closest?.('.reels-card'))hover=false;});
    stage.addEventListener('focusin',()=>{focused=true;});stage.addEventListener('focusout',()=>{queueMicrotask(()=>{focused=stage.contains(document.activeElement);if(!document.activeElement.closest?.('.reels-card')){focusIndex=-1;manualPreview=false;}syncPlayback();});});
    orbit.addEventListener('pointerdown',e=>{if(phone.matches||state!=='spinning'||currentSpread<.95||e.button!==0)return;pointerActive=true;stepAt=0;pointerStart=e.clientX;pointerX=e.clientX;pointerAt=performance.now();velocity=0;});
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
    const step = dir => {
      if(state!=='spinning'||currentSpread<.95||cards.length<2)return;
      focusIndex=-1;
      alignTo((featuredIndex+dir+cards.length)%cards.length);
    };
    orbit.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();if(phone.matches)moveMobile(e.key==='ArrowRight'?1:-1);else {step(e.key==='ArrowRight'?1:-1);if(stepIndex>=0)cards[stepIndex].focus({preventScroll:true});}}});
    addEventListener('resize',measure);
    reduced.addEventListener('change',()=>{manualPreview=false;if(reduced.matches)setState('spinning');render(performance.now());syncPlayback();});
    last=performance.now();raf=requestAnimationFrame(frame);
  }
  fetch('./data/reels.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Reel manifest unavailable');return r.json();}).then(initialize).catch(()=>initialize({profiles:{instagram:'https://www.instagram.com/harperhotels/reels/'},items:[]}));
})();
