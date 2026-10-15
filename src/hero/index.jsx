import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import CircularCarousel from './CircularCarousel.jsx';

const items = [
  { src: './assets/orbit-breakfast.webp', alt: 'Breakfast and coffee beside a sunlit window', title: 'Morning rituals', subtitle: 'A warm welcome' },
  { src: './assets/orbit-guest-room.webp', alt: 'Sunlit guest room with warm ivory linen', title: 'Room to unwind', subtitle: 'Stay a little longer' },
  { src: './assets/orbit-lounge.webp', alt: 'Comfortable lounge chair with a book and iced tea', title: 'Unhurried moments', subtitle: 'Feel at home' },
  { src: './assets/orbit-dining.webp', alt: 'A warmly lit table set for dinner', title: 'Around the table', subtitle: 'Share the moment' },
  { src: './assets/orbit-welcome.webp', alt: 'Orange flowers and a welcome drink on a reception counter', title: 'Thoughtful details', subtitle: 'From arrival onward' }
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
      cardWidth={width <= 600 ? 190 : 220}
      aspectRatio={1}
      gap={width <= 600 ? 55 : width <= 800 ? 100 : 170}
      tilt={-34}
      perspective={1900}
      autoplay="drift"
      speed={14}
      momentum={0.59}
      stretch={0.21}
      fadeColor="#4b494d"
      innerShade={0.52}
      cornerRadius={13}
      captions
    />
  );
}
if (mount) {
  createRoot(mount).render(<HeroOrbit />);
}
