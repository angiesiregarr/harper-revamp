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
];

function RusticOrbit() {
  const [active, setActive] = useState(0);
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  const touch = useRef(null);
  const suppressClick = useRef(false);
  useEffect(() => {
    const resize = () => { setWidth(window.innerWidth); setHeight(window.innerHeight); };
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  const maxVisible = width < 640 ? 1 : width < 1050 ? 2 : 3;
  const go = delta => setActive(index => (index + delta + rooms.length) % rooms.length);
  // Distinct card sizes put the smaller rooms farther back on the elliptical path.
  const positions = width < 640
    ? [[0, 0, Math.min(width * .76, 390), 245], [44, -24, 120, 145]]
    : width < 1050
      ? [[0, 0, Math.min(width * .57, 510), 305], [39, 16, 180, 195], [44, -128, 112, 115]]
      : [[0, 0, Math.min(width * .36, 600), height < 820 ? 290 : 332], [31, 4, 242, 250], [23.5, -188, 132, 115], [40.5, -122, 178, 168]];

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
        <ellipse cx="720" cy="194" rx="704" ry="147" />
        <ellipse cx="720" cy="194" rx="793" ry="117" />
        <circle cx="72" cy="250" r="4"/><circle cx="430" cy="335" r="3.5"/><circle cx="1180" cy="89" r="3.5"/><circle cx="1367" cy="254" r="4"/>
      </svg>
      {rooms.map((room, index) => {
        let offset = index - active;
        if (offset > rooms.length / 2) offset -= rooms.length;
        if (offset < -rooms.length / 2) offset += rooms.length;
        const distance = Math.abs(offset);
        const visible = distance <= maxVisible;
        const [x, y, cardWidth, cardHeight] = positions[Math.min(distance, maxVisible)];
        const side = Math.sign(offset);
        const pathX = width >= 1050 && distance === 1 && side > 0 ? 29.3
          : width >= 1050 && distance === 3 ? (side > 0 ? 42 : 38.5) : x;
        return <button type="button" key={index}
          className={`rustic-orbit__card${distance === 0 ? ' is-featured' : ''}`}
          style={{ '--orbit-x': `${pathX * side}vw`, '--orbit-y': `${y}px`, '--card-width': `${cardWidth}px`, '--card-height': `${cardHeight}px`, '--orbit-opacity': visible ? 1 : 0, zIndex: 10 - distance }}
          onClick={() => setActive(index)}
          tabIndex={visible ? 0 : -1}
          aria-hidden={visible ? undefined : true}
          aria-current={distance === 0 ? 'true' : undefined}
          aria-label={`Show ${room.hotel} room in ${room.place}${distance === 0 ? ', featured' : ''}`}>
          <img src={room.src} alt={room.alt} style={{ objectPosition: room.position }} draggable="false" loading={distance <= 2 ? 'eager' : 'lazy'} />
          {distance === 0 && <span className="rustic-orbit__caption" aria-hidden="true"><span className="rustic-orbit__hotel"><svg className="rustic-orbit__pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M19 9c0 5-7 12-7 12S5 14 5 9a7 7 0 0 1 14 0Z"/><circle cx="12" cy="9" r="2.3"/></svg><span><small>{room.place}, Indonesia</small><strong>{room.hotel}</strong></span></span><span className="rustic-orbit__count">{String(active + 1).padStart(2, '0')} / {String(rooms.length).padStart(2, '0')}</span></span>}
        </button>;
      })}
      <button className="rustic-orbit__arrow rustic-orbit__arrow--previous" type="button" onClick={() => go(-1)} aria-label="Previous hotel room"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 4.5-7.5 7.5 7.5 7.5"/></svg></button>
      <button className="rustic-orbit__arrow rustic-orbit__arrow--next" type="button" onClick={() => go(1)} aria-label="Next hotel room"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 4.5 7.5 7.5-7.5 7.5"/></svg></button>
      <span className="visually-hidden" aria-live="polite">Featured room: {rooms[active].hotel}, {rooms[active].place}. Use left and right arrow keys or select a surrounding room.</span>
    </div>
  );
}

const mount = document.getElementById('hero-orbit');
if (mount) createRoot(mount).render(<RusticOrbit />);
