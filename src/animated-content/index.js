import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// DOM adapter for React Bits AnimatedContent. The site keeps its existing DOM
// because the Journal, city gallery, Reels, and phone own their click/drag state.
// The same scroll timeline plays in either direction. A short scrub catch-up
// keeps a single mouse-wheel step from skipping every visible in-between frame.
const groups = [
  ['.offers-intro', ':scope > .section-kicker, :scope > h2, :scope > p:not(.section-kicker), :scope > .scroll-cue'],
  ['.offer-card', ':scope > .offer-body'],
  ['.news-heading > div:first-child', ':scope > .journal-eyebrow, :scope > h2, :scope > .journal-intro'],
  ['.membership-content', ':scope > .section-kicker, :scope > h2, :scope > .membership-description, :scope > .membership-benefits, :scope > .membership-stores'],
  ['.footer-contact', ':scope > div, :scope > .footer-availability'],
  ['.footer-navigation', ':scope > .footer-identity, :scope > .footer-links'],
  ['.footer-corporate', ':scope > .footer-corporate-heading, :scope > .footer-corporate-content'],
  ['.footer-corporate-links', ':scope > div'],
  ['.footer-certifications', ':scope > figure'],
  ['.footer-bottom', ':scope > *']
];

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let owned = [];

function clear() {
  owned.forEach(({ trigger, timeline, targets }) => {
    trigger.kill();
    timeline.kill();
    targets.forEach(target => {
      target.classList.remove('animated-content-item');
      target.style.removeProperty('--ac-progress');
    });
  });
  owned = [];
}

function mount() {
  clear();
  if (reduced.matches) return;
  const mobile = innerWidth <= 700;
  groups.forEach(([selector, children]) => {
    document.querySelectorAll(selector).forEach(group => {
      const targets = [...group.querySelectorAll(children)];
      if (!targets.length) return;
      targets.forEach(target => {
        target.classList.add('animated-content-item');
        target.style.setProperty('--ac-distance', mobile ? '20px' : '40px');
        target.style.setProperty('--ac-progress', '0');
      });
      const timeline = gsap.timeline({ paused: true }).to(targets, {
        '--ac-progress': 1,
        duration: 1.1,
        ease: 'none',
        stagger: { each: 0.08, from: 'start' }
      });
      const trigger = ScrollTrigger.create({
        trigger: group,
        start: 'top 80%',
        end: 'top 0%',
        animation: timeline,
        scrub: 0.55,
        invalidateOnRefresh: true
      });
      owned.push({ trigger, timeline, targets });
    });
  });
  ScrollTrigger.refresh();
}

mount();
reduced.addEventListener('change', mount);
addEventListener('resize', () => {
  const mobile = innerWidth <= 700;
  owned.forEach(({ targets }) => targets.forEach(target => {
    target.style.setProperty('--ac-distance', mobile ? '20px' : '40px');
  }));
});
document.fonts?.ready.then(() => ScrollTrigger.refresh());
addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
