import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import CircularCarousel from './CircularCarousel.jsx';
import Grainient from './Grainient.jsx';

const items = [
  { src: './assets/harper-room-01.jpg', alt: 'Guest room with terrace at Harper Kuta Bali', title: 'Harper Kuta Bali', subtitle: 'Kuta, Indonesia', position: '53% center' },
  { src: './assets/harper-room-02.jpg', alt: 'Guest room at Harper Malioboro Yogyakarta', title: 'Harper Malioboro Yogyakarta', subtitle: 'Yogyakarta, Indonesia', position: '51% center' },
  { src: './assets/harper-room-03.jpg', alt: 'Suite at Harper MT Haryono', title: 'Harper MT Haryono', subtitle: 'Jakarta, Indonesia', position: '54% center' },
  { src: './assets/harper-room-04.jpg', alt: 'Deluxe guest room at Harper Perintis', title: 'Harper Perintis', subtitle: 'Makassar, Indonesia', position: '50% center' },
  { src: './assets/harper-room-05.jpg', alt: 'Guest room at Harper Palembang', title: 'Harper Palembang', subtitle: 'Palembang, Indonesia', position: '52% center' },
  { src: './assets/harper-room-06.jpg', alt: 'Guest room with lounge at Harper Kuta Bali', title: 'Harper Kuta Bali', subtitle: 'Kuta, Indonesia', position: '48% center' },
  { src: './assets/harper-room-07.jpg', alt: 'Twin guest room at Harper Banjarmasin', title: 'Harper Banjarmasin', subtitle: 'Banjarmasin, Indonesia', position: '52% center' },
  { src: './assets/harper-room-08.jpg', alt: 'Guest room at Harper Kupang', title: 'Harper Kupang', subtitle: 'Kupang, Indonesia', position: '50% center' },
  { src: './assets/harper-room-09.jpg', alt: 'Executive suite at Harper Perintis', title: 'Harper Perintis', subtitle: 'Makassar, Indonesia', position: '54% center' },
  { src: './assets/harper-room-10.jpg', alt: 'Guest room at Harper MT Haryono', title: 'Harper MT Haryono', subtitle: 'Jakarta, Indonesia', position: '50% center' }
];

const mount = document.getElementById('hero-orbit');
function HeroOrbit() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return (
    <CircularCarousel
      items={items}
      preset="orbit"
      intro="rise"
      cardWidth={width <= 600 ? 170 : width <= 900 ? 230 : 300}
      aspectRatio={0.75}
      gap={width <= 600 ? 4 : 8}
      tilt={width <= 600 ? -17 : -19}
      perspective={1900}
      autoplay="step"
      interval={5}
      momentum={0.59}
      stretch={0.21}
      fadeColor="#595653"
      innerShade={0.26}
      cornerRadius={13}
      captions
    />
  );
}
if (mount) {
  createRoot(mount).render(<HeroOrbit />);
}

const background = document.getElementById('hero-grainient');
if (background) {
  createRoot(background).render(
    <Grainient
      colors={['#d5d5d5', '#f38a18', '#F3A24A', '#F08B1D']}
      angle={41}
      flow={0.8}
      silk={0.35}
      grainAmount={0.08}
      grainSize={0.6}
      lightMode
      interactive={false}
      clickSwirl={false}
    />
  );
}
