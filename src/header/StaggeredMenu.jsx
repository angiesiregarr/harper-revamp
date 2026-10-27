// Adapted from the supplied React Bits StaggeredMenu (JavaScript + CSS).
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import './StaggeredMenu.css';

const socials = [
  ['Facebook', 'https://www.facebook.com/HARPERHotels', 'facebook'],
  ['Instagram', 'https://www.instagram.com/harperhotels/', 'instagram'],
  ['TikTok', 'https://www.tiktok.com/@harperhotels', 'tiktok'],
  ['X', 'https://twitter.com/harperhotels', 'x'],
  ['YouTube', 'https://www.youtube.com/@HarperHotels', 'youtube']
];

export default function StaggeredMenu({ items, onMenuToggle, onLanguageClick, languageOpen }) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const trigger = useRef(null), overlay = useRef(null), panel = useRef(null), closeButton = useRef(null);
  const timeline = useRef(null), restoreFocus = useRef(true);
  const close = (restore = true) => { restoreFocus.current = restore; setOpen(false); };

  useEffect(() => { onMenuToggle(open || shown); }, [open, shown, onMenuToggle]);
  useEffect(() => () => onMenuToggle(false), [onMenuToggle]);
  useLayoutEffect(() => {
    if (!shown) return;
    const root = overlay.current;
    const ctx = gsap.context(() => {
      const layers = [...root.querySelectorAll('.sm-prelayer')];
      const labels = [...root.querySelectorAll('.sm-panel-itemLabel')];
      const details = [...root.querySelectorAll('.sm-detail')];
      gsap.set([...layers, panel.current], { xPercent: 100 });
      gsap.set(labels, { yPercent: 125, rotate: 6 });
      gsap.set(details, { opacity: 0, y: 16 });
      timeline.current = gsap.timeline({ paused: true })
        .to(layers, { xPercent: 0, duration: .5, ease: 'power4.out', stagger: .07 }, 0)
        .to(panel.current, { xPercent: 0, duration: .65, ease: 'power4.out' }, .15)
        .to(labels, { yPercent: 0, rotate: 0, duration: .7, ease: 'power4.out', stagger: .075 }, .25)
        .to(details, { opacity: 1, y: 0, duration: .45, ease: 'power3.out', stagger: .045 }, .4);
    }, root);
    return () => { timeline.current?.kill(); timeline.current = null; ctx.revert(); };
  }, [shown]);

  useLayoutEffect(() => {
    if (!shown) return;
    const root = overlay.current, layers = [...root.querySelectorAll('.sm-prelayer')];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const finish = () => {
      setShown(false);
      if (restoreFocus.current) requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true }));
    };
    let exit;
    if (open) {
      timeline.current?.pause(0);
      if (reduced.matches) timeline.current?.progress(1);
      else timeline.current?.play(0);
      closeButton.current?.focus({ preventScroll: true });
    } else {
      timeline.current?.pause();
      if (reduced.matches) finish();
      else exit = gsap.to([...layers, panel.current], { xPercent: 100, duration: .32, ease: 'power3.in', onComplete: finish });
    }
    const changeMotion = () => {
      if (!reduced.matches) return;
      if (open) timeline.current?.progress(1).pause();
      else { exit?.kill(); finish(); }
    };
    reduced.addEventListener('change', changeMotion);
    return () => { exit?.kill(); reduced.removeEventListener('change', changeMotion); };
  }, [open, shown]);

  useLayoutEffect(() => {
    if (!shown) return;
    // Keep the page at its current position; only the full-screen panel scrolls.
    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;
    const siblings = [...document.body.children].filter(el => el !== overlay.current && !el.matches('script,style,.header-language-menu'));
    const inertBefore = siblings.map(el => el.inert);
    siblings.forEach(el => { el.inert = true; });
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const key = event => {
      if (document.querySelector('.header-language-menu')) return;
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key !== 'Tab') return;
      const focusable = [...overlay.current.querySelectorAll('a[href],button:not([disabled])')];
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus({ preventScroll: true }); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus({ preventScroll: true }); }
    };
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('keydown', key);
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
      siblings.forEach((el, i) => { el.inert = inertBefore[i]; });
    };
  }, [shown]);

  function follow(item, event) {
    if (item.kind === 'language') { onLanguageClick(item, 7, event); return; }
    // Release scroll locking before existing booking and section navigation run.
    restoreFocus.current = false;
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    close(false);
    if (item.kind === 'booking') {
      // The hero form is inert until the overlay finishes closing.
      setTimeout(() => document.querySelector('[data-hero-field="destination"]')?.focus({ preventScroll: true }), matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 340);
    }
  }
  const utilities = items.slice(5);
  return <>
    <button ref={trigger} className="sm-mobile-trigger" type="button" aria-label="Open menu" aria-expanded={open} aria-controls="staggered-menu-panel" onClick={() => { setShown(true); setOpen(true); }}><span aria-hidden="true" /><span aria-hidden="true" /></button>
    {shown && createPortal(<div ref={overlay} className="staggered-menu-wrapper" data-open={open || undefined} role="dialog" aria-modal="true" aria-label="HARPER navigation">
      <div className="sm-prelayers" aria-hidden="true"><div className="sm-prelayer sm-layer-orange" /><div className="sm-prelayer sm-layer-grey" /></div>
      <aside ref={panel} className="staggered-menu-panel" id="staggered-menu-panel">
        <div className="staggered-menu-header">
          <a href="#main" aria-label="HARPER home" onClick={() => close(false)}><img src="./assets/harper-logo-white.png" alt="HARPER by ASTON" /></a>
          <div className="sm-header-actions">
            <button className="sm-language" type="button" data-kind="language" aria-label={utilities[2].ariaLabel} aria-haspopup="menu" aria-controls="nav-language-menu" aria-expanded={languageOpen} onClick={event => follow(utilities[2], event)}>{utilities[2].icon}</button>
            <button ref={closeButton} className="sm-close" type="button" aria-label="Close menu" onClick={() => close()}><span className="sm-close-icon" aria-hidden="true">×</span></button>
          </div>
        </div>
        <div className="sm-panel-inner">
          <nav aria-label="Mobile navigation"><ul className="sm-panel-list">{items.slice(0, 5).map((item, i) => <li className="sm-panel-itemWrap" key={item.label}><a className="sm-panel-item" href={item.href} target={item.href.startsWith('https:') ? '_blank' : undefined} rel={item.href.startsWith('https:') ? 'noopener noreferrer' : undefined} onClick={event => follow(item, event)}><span className="sm-panel-itemLabel"><span className="sm-item-number" aria-hidden="true">0{i + 1}</span><span>{item.label}</span></span></a></li>)}</ul></nav>
          <a className="sm-membership sm-detail" href="#membership" aria-label="Archipelago Membership" onClick={event => follow(utilities[1], event)}>
            <img className="header-membership-logo" src="./assets/archipelago-membership-white.svg" alt="" aria-hidden="true" />
            <span className="sm-membership-copy"><span>Archipelago Membership</span><small>Member rates and rewards</small></span>
            <span className="sm-membership-arrow" aria-hidden="true">→</span>
          </a>
          <div className="sm-menu-footer sm-detail">
            <a className="sm-book nav-book" href="#booking-form" data-booking-open onClick={event => follow(utilities[0], event)}>Book Now</a>
            <div className="sm-socials" aria-label="Harper social profiles"><ul className="sm-socials-list">{socials.map(([label, href, icon]) => <li key={label}><a className="sm-socials-link" href={href} aria-label={`Harper on ${label}`} target="_blank" rel="noopener noreferrer"><img src={`./assets/footer-social/${icon}.png`} alt="" /></a></li>)}</ul></div>
          </div>
        </div>
      </aside>
    </div>, document.body)}
  </>;
}
