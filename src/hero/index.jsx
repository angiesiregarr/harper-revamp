import React, { useEffect, useRef, useState } from 'react';
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
  { src: './assets/harper-room-06.jpg', hotel: 'Harper Kuta Bali', place: 'Kuta, Bali', alt: 'Harper Kuta Bali guest room and lounge', position: '28% center' },
  { src: './assets/harper-room-09.jpg', hotel: 'Harper Perintis', place: 'Makassar', alt: 'Harper Perintis suite seating area', position: '22% center' },
];

function RusticOrbit() {
  const [active, setActive] = useState(0);
  const [width, setWidth] = useState(window.innerWidth);
  const touch = useRef(null);
  const suppressClick = useRef(false);
  useEffect(() => {
    const resize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  const maxVisible = width < 640 ? 1 : width < 900 ? 2 : 3;
  const go = delta => setActive(index => (index + delta + rooms.length) % rooms.length);
  const positions = width < 640
    ? [[0, 0, 1], [59, 22, .52]]
    : width < 900
      ? [[0, 0, 1], [37, 22, .52], [52, -70, .33]]
      : [[0, 0, 1], [31, 22, .52], [46, -72, .34], [49, -124, .25]];

  return (
    <div className="rustic-orbit" role="region" aria-roledescription="carousel" aria-label="Harper hotel room carousel" tabIndex={0}
      onClickCapture={event => {
        if (!suppressClick.current) return;
        event.preventDefault();
        event.stopPropagation();
        suppressClick.current = false;
      }}
      onKeyDown={event => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault(); go(event.key === 'ArrowRight' ? 1 : -1);
        }
        if (event.key === 'Home') { event.preventDefault(); setActive(0); }
        if (event.key === 'End') { event.preventDefault(); setActive(rooms.length - 1); }
      }}
      onTouchStart={event => { touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
      onTouchEnd={event => {
        if (!touch.current) return;
        const dx = event.changedTouches[0].clientX - touch.current.x;
        const dy = event.changedTouches[0].clientY - touch.current.y;
        if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.2) {
          suppressClick.current = true;
          setTimeout(() => { suppressClick.current = false; }, 350);
          go(dx < 0 ? 1 : -1);
        }
        touch.current = null;
      }}>
      <svg className="rustic-orbit__lines" viewBox="0 0 1440 370" preserveAspectRatio="none" aria-hidden="true">
        <ellipse cx="720" cy="195" rx="780" ry="153" />
        <ellipse cx="720" cy="195" rx="694" ry="117" />
        <circle cx="85" cy="120" r="5"/><circle cx="340" cy="335" r="4"/><circle cx="1120" cy="84" r="4"/><circle cx="1370" cy="264" r="5"/>
      </svg>
      {rooms.map((room, index) => {
        let offset = index - active;
        if (offset > rooms.length / 2) offset -= rooms.length;
        if (offset < -rooms.length / 2) offset += rooms.length;
        const distance = Math.abs(offset);
        const visible = distance <= maxVisible;
        const [x, y, scale] = positions[Math.min(distance, maxVisible)];
        const side = Math.sign(offset);
        return <button type="button" key={index}
          className={`rustic-orbit__card${distance === 0 ? ' is-featured' : ''}`}
          style={{ '--orbit-x': `${x * side}vw`, '--orbit-y': `${y}px`, '--orbit-scale': scale, '--orbit-opacity': visible ? 1 : 0, zIndex: 10 - distance }}
          onClick={() => setActive(index)}
          tabIndex={visible ? 0 : -1}
          aria-hidden={visible ? undefined : true}
          aria-current={distance === 0 ? 'true' : undefined}
          aria-label={`Show ${room.hotel} room in ${room.place}${distance === 0 ? ', featured' : ''}`}>
          <img src={room.src} alt={room.alt} style={{ objectPosition: room.position }} draggable="false" loading={distance <= 2 ? 'eager' : 'lazy'} />
        </button>;
      })}
      <span className="visually-hidden" aria-live="polite">Featured room: {rooms[active].hotel}, {rooms[active].place}. Use left and right arrow keys or select a surrounding room.</span>
    </div>
  );
}

const mount = document.getElementById('hero-orbit');
if (mount) createRoot(mount).render(<RusticOrbit />);
