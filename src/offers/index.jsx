import { createRoot } from 'react-dom/client';
import PixelCard from './PixelCard';

const list = document.querySelector('.offer-list');

if (list) {
  // The HTML cards remain a complete fallback when JavaScript is unavailable.
  const cards = [...list.querySelectorAll('.offer-card')].map(card => ({
    html: card.innerHTML,
  }));

  createRoot(list).render(cards.map((card, index) => (
    <PixelCard
      key={index}
      className="offer-card"
      colors={['#f08b1d', '#f7bb70', '#ffffff']}
      glowColor="#f7bb70"
      shape="diamond"
      origin="pointer"
      gap={8}
      pixelSize={3}
      speed={20}
      revealDuration={650}
      spotlight={0.3}
      glow={0.22}
      opacity={0.48}
      fade={0.76}
      trigger="hover"
      radius={22}
      intro
      introDelay={index * 100}
      theme="light"
    >
      <article className="offer-card-content" dangerouslySetInnerHTML={{ __html: card.html }} />
    </PixelCard>
  )));
}
