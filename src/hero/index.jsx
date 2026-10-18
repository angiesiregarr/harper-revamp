import React, { useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

// These files are verified Harper room photographs bundled with the site.
const rooms = [
  { src: './assets/harper-room-01.jpg', hotel: 'Harper Kuta Bali', place: 'Kuta, Bali', alt: 'Harper Kuta Bali guest room opening toward a terrace', position: '53% center' },
  { src: './assets/harper-room-02.jpg', hotel: 'Harper Malioboro Yogyakarta', place: 'Yogyakarta', alt: 'Guest room at Harper Malioboro Yogyakarta', position: '51% center' },
  { src: './assets/harper-room-03.jpg', hotel: 'Harper MT Haryono', place: 'Jakarta', alt: 'Suite at Harper MT Haryono', position: '54% center' },
  { src: './assets/harper-room-04.jpg', hotel: 'Harper Perintis', place: 'Makassar', alt: 'Deluxe room at Harper Perintis', position: '50% center' },
  { src: './assets/harper-room-05.jpg', hotel: 'Harper Palembang', place: 'Palembang', alt: 'Guest room at Harper Palembang', position: '52% center' },
  { src: './assets/harper-room-06.jpg', hotel: 'Harper Kuta Bali', place: 'Kuta, Bali', alt: 'Harper Kuta Bali guest room with lounge', position: '48% center' },
  { src: './assets/harper-room-07.jpg', hotel: 'Harper Banjarmasin', place: 'Banjarmasin', alt: 'Twin guest room at Harper Banjarmasin', position: '52% center' },
  { src: './assets/harper-room-08.jpg', hotel: 'Harper Kupang', place: 'Kupang', alt: 'Guest room at Harper Kupang', position: '50% center' },
  { src: './assets/harper-room-09.jpg', hotel: 'Harper Perintis', place: 'Makassar', alt: 'Executive suite at Harper Perintis', position: '54% center' },
  { src: './assets/harper-room-10.jpg', hotel: 'Harper MT Haryono', place: 'Jakarta', alt: 'Guest room at Harper MT Haryono', position: '50% center' },
];

const mod = (value, length) => ((value % length) + length) % length;
const mix = (a, b, t) => a + (b - a) * t;

// The near, outer and far points form one closed oval. Hidden top points let
// cards travel behind the headline without appearing over the lettering.
function makeGeometry(width, height) {
  const mobile = width < 640, tablet = width < 1050;
  const frontWidth = mobile ? Math.min(width * .76, 390) : tablet ? Math.min(width * .57, 510) : Math.min(width * .36, 600);
  const frontHeight = mobile ? 235 : tablet ? 285 : height < 820 ? 270 : 312;
  const nearX = width * (mobile ? .44 : tablet ? .39 : .30);
  const outerX = width * (mobile ? .52 : tablet ? .47 : .42);
  const upperX = width * (mobile ? .29 : tablet ? .31 : .235);
  const visibleOuter = mobile ? 0 : 1;
  const visibleUpper = mobile || tablet ? 0 : 1;
  const points = [
    [0, 0, frontWidth, frontHeight, 1],
    [nearX, mobile ? -17 : 5, mobile ? 120 : tablet ? 180 : 242, mobile ? 140 : tablet ? 185 : 245, 1],
    [outerX, -65, mobile ? 100 : tablet ? 122 : 176, mobile ? 118 : tablet ? 126 : 163, visibleOuter],
    [upperX, mobile ? -100 : -108, mobile ? 88 : 132, mobile ? 102 : 112, visibleUpper],
    [width * .12, mobile ? -119 : -137, 100, 86, 0],
    [0, mobile ? -125 : -145, 100, 86, 0],
    [-width * .12, mobile ? -119 : -137, 100, 86, 0],
    [-upperX, mobile ? -100 : -108, mobile ? 88 : 132, mobile ? 102 : 112, visibleUpper],
    [-outerX * .93, -65, mobile ? 100 : tablet ? 122 : 176, mobile ? 118 : tablet ? 126 : 163, visibleOuter],
    [-nearX * 1.04, mobile ? -17 : 5, mobile ? 120 : tablet ? 180 : 242, mobile ? 140 : tablet ? 185 : 245, 1],
  ];
  const sample = phase => {
    const t = mod(phase, points.length), i = Math.floor(t), u = t - i;
    const previous = points[mod(i - 1, points.length)], a = points[i], b = points[(i + 1) % points.length], next = points[(i + 2) % points.length];
    const curve = dimension => .5 * ((2 * a[dimension]) + (-previous[dimension] + b[dimension]) * u + (2 * previous[dimension] - 5 * a[dimension] + 4 * b[dimension] - next[dimension]) * u * u + (-previous[dimension] + 3 * a[dimension] - 3 * b[dimension] + next[dimension]) * u * u * u);
    const ease = u * u * (3 - 2 * u);
    return [curve(0), curve(1), mix(a[2], b[2], ease), mix(a[3], b[3], ease), Math.max(0, mix(a[4], b[4], ease))];
  };
  const steps = 1000, distances = [0];
  let previous = sample(0), total = 0;
  for (let step = 1; step <= steps; step++) {
    const current = sample(step * points.length / steps);
    total += Math.hypot(current[0] - previous[0], current[1] - previous[1]);
    distances.push(total); previous = current;
  }
  return { sample, distances, total, steps, count: points.length };
}

function distanceAt(phase, geometry) {
  const revolutions = Math.floor(phase / geometry.count);
  const within = mod(phase, geometry.count) * geometry.steps / geometry.count;
  const index = Math.floor(within), fraction = within - index;
  return revolutions * geometry.total + mix(geometry.distances[index], geometry.distances[index + 1], fraction);
}

function phaseAt(distance, geometry) {
  const revolutions = Math.floor(distance / geometry.total);
  const within = distance - revolutions * geometry.total;
  let low = 0, high = geometry.steps;
  while (low + 1 < high) {
    const middle = (low + high) >> 1;
    if (geometry.distances[middle] <= within) low = middle; else high = middle;
  }
  const segment = geometry.distances[low + 1] - geometry.distances[low];
  const fraction = segment ? (within - geometry.distances[low]) / segment : 0;
  return revolutions * geometry.count + (low + fraction) * geometry.count / geometry.steps;
}

function RusticOrbit() {
  const [active, setActive] = useState(0);
  const cardRefs = useRef([]), orbitRef = useRef(null), controller = useRef(null), touch = useRef(null), suppressClick = useRef(false);
  const paused = useRef({ hover: false, focus: false, touch: false, offscreen: false });

  useLayoutEffect(() => {
    let geometry, distance = 0, lastTime = 0, frame, move = null, currentActive = 0;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const paint = phase => {
      const nearest = mod(Math.round(phase), rooms.length);
      if (nearest !== currentActive) { currentActive = nearest; setActive(nearest); }
      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const pathPosition = mod(index - phase, rooms.length);
        const shortest = Math.min(pathPosition, rooms.length - pathPosition);
        const [x, y, width, height, opacity] = geometry.sample(pathPosition);
        card.style.width = `${width}px`;
        card.style.height = `${height}px`;
        card.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px)`;
        // Keep the card surface solid while it crosses the left woven arc.
        const leftEdge = orbitRef.current.clientWidth / 2 + x - width / 2;
        const rattanOpacity = orbitRef.current.clientWidth < 640 && x < 0
          ? Math.max(0, Math.min(1, (98 - leftEdge) / 30)) : 0;
        const visibleOpacity = Math.max(opacity, rattanOpacity);
        card.style.opacity = visibleOpacity;
        card.style.zIndex = String(20 - Math.round(shortest * 2));
        const gray = Math.min(1, Math.max(0, (shortest - .38) / .82));
        const blur = Math.min(2.7, Math.max(0, shortest - .42) * .85);
        card.querySelector('img').style.filter = `grayscale(${gray}) saturate(${1 - gray * .82}) blur(${blur}px)`;
        const visible = visibleOpacity > .12;
        card.tabIndex = visible ? 0 : -1;
        if (visible) card.removeAttribute('aria-hidden'); else card.setAttribute('aria-hidden', 'true');
        card.classList.toggle('is-featured', index === nearest);
        if (index === nearest) card.setAttribute('aria-current', 'true'); else card.removeAttribute('aria-current');
      });
    };
    const resize = () => {
      const phase = geometry ? phaseAt(distance, geometry) : 0;
      const { width, height } = orbitRef.current.getBoundingClientRect();
      geometry = makeGeometry(width, window.innerHeight);
      const line = orbitRef.current.querySelector('.rustic-orbit__lines');
      const samples = 240;
      const points = Array.from({ length: samples }, (_, index) => {
        const [x, y] = geometry.sample(index * geometry.count / samples);
        return `${index ? 'L' : 'M'}${(width / 2 + x).toFixed(2)} ${(height / 2 + y).toFixed(2)}`;
      });
      line.setAttribute('viewBox', `0 0 ${width} ${height}`);
      line.querySelector('path').setAttribute('d', `${points.join(' ')} Z`);
      distance = distanceAt(phase, geometry);
      paint(phase);
    };
    const moveTo = target => {
      const phase = phaseAt(distance, geometry);
      move = { from: distance, to: distanceAt(target, geometry), start: performance.now(), duration: motion.matches ? 0 : 850 };
      if (motion.matches) { distance = move.to; move = null; paint(target); }
    };
    controller.current = {
      step(delta) { moveTo(Math.round(phaseAt(distance, geometry)) + delta); },
      select(index) {
        const phase = phaseAt(distance, geometry), current = Math.round(phase);
        let difference = mod(index - mod(current, rooms.length), rooms.length);
        if (difference > rooms.length / 2) difference -= rooms.length;
        moveTo(current + difference);
      },
    };
    const visibility = new IntersectionObserver(entries => { paused.current.offscreen = !entries[0].isIntersecting; });
    visibility.observe(document.querySelector('.hero-orbit-stage'));
    const tick = now => {
      const elapsed = lastTime ? Math.min((now - lastTime) / 1000, .05) : 0;
      lastTime = now;
      let changed = false;
      if (move) {
        const ratio = move.duration ? Math.min(1, (now - move.start) / move.duration) : 1;
        const eased = ratio * ratio * (3 - 2 * ratio);
        distance = mix(move.from, move.to, eased);
        changed = true;
        if (ratio === 1) move = null;
      } else if (!motion.matches && !document.hidden && !Object.values(paused.current).some(Boolean)) {
        distance += 28 * elapsed; changed = true; // CSS pixels of arc length per second.
      }
      if (changed) paint(phaseAt(distance, geometry));
      frame = requestAnimationFrame(tick);
    };
    resize(); frame = requestAnimationFrame(tick);
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(frame); visibility.disconnect(); window.removeEventListener('resize', resize); controller.current = null; };
  }, []);

  return (
    <div ref={orbitRef} className="rustic-orbit" role="region" aria-roledescription="carousel" aria-label="Harper hotel room carousel" tabIndex={0}
      onMouseEnter={() => { paused.current.hover = true; }}
      onMouseLeave={() => { paused.current.hover = false; }}
      onFocusCapture={() => { paused.current.focus = true; }}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) paused.current.focus = false; }}
      onClickCapture={event => {
        if (!suppressClick.current) return;
        event.preventDefault(); event.stopPropagation(); suppressClick.current = false;
      }}
      onKeyDown={event => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault(); controller.current?.step(event.key === 'ArrowRight' ? 1 : -1);
        }
        if (event.key === 'Home') { event.preventDefault(); controller.current?.select(0); }
        if (event.key === 'End') { event.preventDefault(); controller.current?.select(rooms.length - 1); }
      }}
      onTouchStart={event => { paused.current.touch = true; touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
      onTouchCancel={() => { paused.current.touch = false; touch.current = null; }}
      onTouchEnd={event => {
        paused.current.touch = false;
        if (!touch.current) return;
        const dx = event.changedTouches[0].clientX - touch.current.x;
        const dy = event.changedTouches[0].clientY - touch.current.y;
        if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.2) {
          suppressClick.current = true;
          setTimeout(() => { suppressClick.current = false; }, 350);
          controller.current?.step(dx < 0 ? 1 : -1);
        }
        touch.current = null;
      }}>
      <svg className="rustic-orbit__lines" aria-hidden="true"><path /></svg>
      {rooms.map((room, index) => <button type="button" key={index} ref={element => { cardRefs.current[index] = element; }}
        className={`rustic-orbit__card${index === active ? ' is-featured' : ''}`}
        onClick={() => controller.current?.select(index)}
        tabIndex={index === active ? 0 : -1}
        aria-hidden={index === active ? undefined : true}
        aria-current={index === active ? 'true' : undefined}
        aria-label={`Show ${room.hotel} room in ${room.place}${index === active ? ', featured' : ''}`}>
        <img src={room.src} alt={room.alt} style={{ objectPosition: room.position }} draggable="false" loading="eager" />
        {index === active && <span className="rustic-orbit__caption" aria-hidden="true"><span className="rustic-orbit__hotel"><svg className="rustic-orbit__pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M19 9c0 5-7 12-7 12S5 14 5 9a7 7 0 0 1 14 0Z"/><circle cx="12" cy="9" r="2.3"/></svg><span><small>{room.place}, Indonesia</small><strong>{room.hotel}</strong></span></span></span>}
      </button>)}
      <span className="visually-hidden" aria-live="polite">Featured room: {rooms[active].hotel}, {rooms[active].place}. Use left and right arrow keys or select a surrounding room.</span>
    </div>
  );
}

const mount = document.getElementById('hero-orbit');
if (mount) createRoot(mount).render(<RusticOrbit />);
