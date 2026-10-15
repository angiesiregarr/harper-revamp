/* Booking stays available from the navbar without occupying the hero. */
(() => {
  const form = document.getElementById('booking-form');
  const nav = document.getElementById('site-nav');
  const sheet = document.getElementById('booking-sheet');
  const popup = document.getElementById('booking-popover');
  const results = document.getElementById('booking-results');
  const fields = [...form.querySelectorAll('[data-field]')];
  const hotels = [
    { name: 'Harper Malioboro', city: 'Yogyakarta', image: 'hero-exterior.png', url: 'https://malioboro.harperhotels.com/' },
    { name: 'Harper Cawang', city: 'Jakarta', image: 'hotel-cawang.png', url: 'https://harperhotels.com/' },
    { name: 'Harper Pasteur', city: 'Bandung', image: 'hotel-pasteur.png', url: 'https://harperhotels.com/' },
    { name: 'Harper Perintis', city: 'Makassar', image: 'hotel-perintis.png', url: 'https://harperhotels.com/' },
    { name: 'Harper Cikarang', city: 'Bekasi', image: 'hero-dining.png', url: 'https://harperhotels.com/' },
    { name: 'Reserva Real Harper', city: 'Dominican Republic', image: 'hero-room.png', url: 'https://harperhotels.com/' },
  ];
  const state = { destination: '', checkin: '', checkout: '', rooms: 1, adults: 2, children: 0 };
  let active = '', anchor = null, opener = null, month = new Date(), frame = 0;
  const iso = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const today = () => iso(new Date());
  const parse = value => new Date(`${value}T12:00:00`);
  const nextDay = value => { const date = parse(value); date.setDate(date.getDate()+1); return iso(date); };
  const pretty = value => value ? parse(value).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : 'Select date';
  function updateLabels() {
    document.getElementById('destination-value').textContent = state.destination || 'Where feels like home?';
    document.getElementById('checkin-value').textContent = pretty(state.checkin);
    document.getElementById('checkout-value').textContent = pretty(state.checkout);
    document.getElementById('guests-value').textContent = `${state.rooms} ${state.rooms===1?'room':'rooms'} · ${state.adults+state.children} guests`;
  }
  function closeField(focus = false) {
    popup.hidden = true; fields.forEach(button => button.setAttribute('aria-expanded','false'));
    if (focus) anchor?.focus(); active = ''; anchor = null;
  }
  function positionPopup() { /* The popover flows inside the booking dialog. */ }
  function placeForm() {
    frame = 0;
    nav.classList.toggle('is-compact', window.scrollY > 48);
    const height = nav.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--top-nav-height',`${height}px`);
    document.documentElement.style.setProperty('--booking-offset','0px');
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(placeForm); }
  function openBooking(event) {
    event?.preventDefault(); opener = event?.currentTarget || document.activeElement;
    if (!sheet.open) sheet.showModal();
    openField('destination');
  }
  function openField(name) {
    active = name; anchor = fields.find(button => button.dataset.field === name);
    fields.forEach(button => button.setAttribute('aria-expanded',String(button===anchor)));
    popup.hidden = false; popup.setAttribute('aria-label',anchor.querySelector('span').textContent);
    if (name==='destination') renderDestination();
    else if (name==='guests') renderGuests();
    else { month = parse(state[name] || (name==='checkout' && state.checkin ? nextDay(state.checkin) : today())); month.setDate(1); renderCalendar(); }
    positionPopup();
    (popup.querySelector('[data-date][aria-pressed=true]:not(:disabled)') || popup.querySelector('[data-date]:not(:disabled)') || popup.querySelector('input,button:not(:disabled)'))?.focus({preventScroll:true});
    popup.scrollIntoView({block:'nearest',behavior:'instant'});
  }
  function renderDestination() {
    popup.innerHTML = '<h3>Where would you like to stay?</h3><label for="destination-search">Find a hotel or city</label><input id="destination-search" type="search" autocomplete="off" placeholder="Try Jakarta or Harper Malioboro"><div class="destination-options"></div>';
    const input = popup.querySelector('input'), list = popup.querySelector('.destination-options');
    const choices = [...new Set(hotels.map(hotel=>hotel.city)),...hotels.map(hotel=>hotel.name)];
    const draw = () => {
      list.replaceChildren();
      const matches = choices.filter(value=>value.toLowerCase().includes(input.value.toLowerCase().trim()));
      for (const value of matches) {
        const button = document.createElement('button'); button.type='button'; button.textContent=value;
        button.addEventListener('click',()=>{ state.destination=value; updateLabels(); closeField(true); }); list.append(button);
      }
      if (!matches.length) list.textContent='No matching destination. Try a different hotel or city.';
      positionPopup();
    };
    input.addEventListener('input',draw); input.addEventListener('keydown',event=>{ if(event.key==='ArrowDown'){event.preventDefault();list.querySelector('button')?.focus();} }); draw();
  }
  function renderCalendar() {
    const minimum = active==='checkout' && state.checkin ? nextDay(state.checkin) : today();
    popup.innerHTML = '<div class="calendar-header"><button type="button" data-month="-1" aria-label="Previous month">‹</button><strong aria-live="polite"></strong><button type="button" data-month="1" aria-label="Next month">›</button></div><div class="calendar-grid"></div>';
    popup.querySelector('strong').textContent=month.toLocaleDateString('en-GB',{month:'long',year:'numeric'});
    const grid=popup.querySelector('.calendar-grid');
    ['Mo','Tu','We','Th','Fr','Sa','Su'].forEach(day=>{ const label=document.createElement('span');label.textContent=day;grid.append(label); });
    const offset=(month.getDay()+6)%7;
    for(let i=0;i<offset;i++) grid.append(document.createElement('i'));
    const count=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
    for(let day=1;day<=count;day++) {
      const value=iso(new Date(month.getFullYear(),month.getMonth(),day));
      const button=document.createElement('button');button.type='button';button.textContent=day;button.dataset.date=value;button.disabled=value<minimum;
      button.setAttribute('aria-label',pretty(value));button.setAttribute('aria-pressed',String(state[active]===value));
      button.addEventListener('click',()=>{const chosen=active;state[chosen]=value;if(chosen==='checkin' && state.checkout<=value)state.checkout='';updateLabels();closeField(true);if(chosen==='checkin')openField('checkout');});grid.append(button);
    }
    popup.querySelectorAll('[data-month]').forEach(button=>{
      const direction=Number(button.dataset.month),target=new Date(month.getFullYear(),month.getMonth()+direction,1);
      button.disabled=direction<0 && new Date(target.getFullYear(),target.getMonth()+1,0)<parse(minimum);
      button.addEventListener('click',()=>{month=target;renderCalendar();positionPopup();popup.querySelector(`[data-month="${direction}"]`).focus();});
    });
    grid.addEventListener('keydown',event=>{const delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7}[event.key];if(!delta || !event.target.dataset.date)return;event.preventDefault();const date=parse(event.target.dataset.date);date.setDate(date.getDate()+delta);grid.querySelector(`[data-date="${iso(date)}"]:not(:disabled)`)?.focus();});
  }
  function renderGuests() {
    popup.innerHTML='<h3>Make room for everyone</h3>';
    [['rooms','Rooms',1,8],['adults','Adults',1,16],['children','Children',0,8]].forEach(([key,label,min,max])=>{
      const row=document.createElement('div');row.className='guest-row';
      row.innerHTML=`<span>${label}</span><div class="guest-stepper"><button type="button" aria-label="Fewer ${label.toLowerCase()}">−</button><output aria-live="polite" aria-label="${label}">${state[key]}</output><button type="button" aria-label="More ${label.toLowerCase()}">+</button></div>`;
      const buttons=row.querySelectorAll('button');
      const refresh=()=>{row.querySelector('output').textContent=state[key];buttons[0].disabled=state[key]<=min;buttons[1].disabled=state[key]>=max;updateLabels();};
      buttons.forEach((button,index)=>button.addEventListener('click',()=>{state[key]=Math.max(min,Math.min(max,state[key]+(index?1:-1)));refresh();}));refresh();popup.append(row);
    });
    const done=document.createElement('button');done.type='button';done.className='booking-done';done.textContent='Done';done.addEventListener('click',()=>closeField(true));popup.append(done);
  }
  fields.forEach(button=>button.addEventListener('click',()=>active===button.dataset.field?closeField(true):openField(button.dataset.field)));
  document.querySelectorAll('[data-booking-open]').forEach(button=>button.addEventListener('click',openBooking));
  document.addEventListener('pointerdown',event=>{if(!popup.contains(event.target) && !fields.some(button=>button.contains(event.target)))closeField();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape' && !popup.hidden){event.preventDefault();event.stopPropagation();closeField(true);}},true);
  sheet.addEventListener('cancel',()=>closeField());
  sheet.addEventListener('close',()=>{closeField();opener?.focus({preventScroll:true});});
  form.querySelector('.booking-close').addEventListener('click',()=>sheet.close());
  results.querySelector('.booking-close').addEventListener('click',()=>results.close());
  form.addEventListener('submit',event=>{
    event.preventDefault();const error=document.getElementById('booking-error');let message='',field='';
    if(!state.destination){message='Choose a hotel or city.';field='destination';}
    else if(!state.checkin || state.checkin<today()){message='Choose a check-in date today or later.';field='checkin';}
    else if(!state.checkout || state.checkout<=state.checkin){message='Check-out must be after check-in.';field='checkout';}
    else if(state.adults<state.rooms){message='Please include at least one adult per room.';field='guests';}
    error.textContent=message;
    if(message){openField(field);return;}
    closeField();if(sheet.open)sheet.close();
    const matching=hotels.filter(hotel=>hotel.city===state.destination || hotel.name===state.destination);
    document.getElementById('booking-summary').textContent=`${state.destination} · ${pretty(state.checkin)} – ${pretty(state.checkout)} · ${state.rooms} room(s), ${state.adults} adult(s), ${state.children} child(ren)`;
    const list=document.getElementById('booking-matches');list.replaceChildren();
    matching.forEach(hotel=>{const article=document.createElement('article');article.className='booking-match';article.innerHTML=`<img src="./assets/${hotel.image}" alt="${hotel.name}"><div><h3>${hotel.name}</h3><p>${hotel.city}</p><a href="${hotel.url}" target="_blank" rel="noopener noreferrer">Continue to official booking</a></div>`;list.append(article);});
    results.showModal();
  });
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
  new ResizeObserver(schedule).observe(nav);new ResizeObserver(schedule).observe(form);
  document.fonts?.ready.then(schedule);schedule();
})();
