import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// Keep the opening scene and all interactive controls in their existing DOM.
// The smoother only changes how the document follows the native scroll position;
// each short pin supplies room for the section's existing scroll-linked reveal.
const sections = ['hotels', 'journal', 'moments', 'membership'];
const media = gsap.matchMedia();

media.add('(min-width: 961px) and (prefers-reduced-motion: no-preference)', () => {
  const nav = document.getElementById('site-nav');
  const main = document.getElementById('main');
  const footer = document.getElementById('footer');
  const wrapper = document.createElement('div');
  const content = document.createElement('div');
  wrapper.id = 'smooth-wrapper';
  content.id = 'smooth-content';
  main.before(wrapper);
  wrapper.append(content);
  content.append(main, footer);
  document.documentElement.classList.add('has-scroll-smoother');

  const smoother = ScrollSmoother.create({
    wrapper,
    content,
    smooth: 1.15,
    effects: false,
    normalizeScroll: true,
    smoothTouch: 0
  });
  const pins = [];
  for (const id of sections) {
    const section = document.getElementById(id);
    section.classList.add('motion-pinned');
    const timeline = gsap.timeline({ paused: true }).fromTo(section,
      { '--pin-progress': 0 },
      { '--pin-progress': 1, duration: 1, ease: 'none' }
    );
    const trigger = ScrollTrigger.create({
      trigger: section,
      pin: section,
      pinSpacing: true,
      start: () => `top top+=${nav.getBoundingClientRect().height}`,
      end: () => `+=${Math.round(innerHeight * (id === 'moments' ? .62 : id === 'journal' ? .42 : .48))}`,
      animation: timeline,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true
    });
    pins.push({ section, timeline, trigger });
  }
  const refresh = () => ScrollTrigger.refresh();
  addEventListener('load', refresh, { once: true });
  document.fonts?.ready.then(refresh);
  requestAnimationFrame(refresh);

  return () => {
    pins.forEach(({ section, timeline, trigger }) => {
      trigger.kill(true);
      timeline.kill();
      section.classList.remove('motion-pinned');
      section.style.removeProperty('--pin-progress');
    });
    smoother.kill();
    wrapper.before(main, footer);
    wrapper.remove();
    document.documentElement.classList.remove('has-scroll-smoother');
    ScrollTrigger.refresh();
  };
});

addEventListener('pagehide', () => media.revert(), { once: true });
