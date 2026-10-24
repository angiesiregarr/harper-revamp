import React, { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import PillNav from './PillNav';
import './HarperHeader.css';

const Chevron = () => <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m5 7.5 5 5 5-5" /></svg>;
const HeaderLink = forwardRef(function HeaderLink({ href, className = '', ...props }, ref) {
  const external = href?.startsWith('https://');
  const booking = href === '#booking-form';
  return <a ref={ref} href={href} {...props} className={`${className}${booking ? ' nav-book' : ''}`} data-booking-open={booking ? '' : undefined} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} />;
});

function HeaderNavigation() {
  const [collapsed, setCollapsed] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [activeHref, setActiveHref] = useState(location.hash);
  const [languagePosition, setLanguagePosition] = useState({});
  const languageTrigger = useRef(null);
  const languageMenu = useRef(null);
  const menuChange = useCallback(open => {
    const nav = document.getElementById('site-nav');
    nav.toggleAttribute('data-menu-open', open);
    if (open) nav.classList.remove('is-mobile-hidden');
    if (!open) setLanguageOpen(false);
  }, []);
  const closeLanguage = useCallback((restore = false) => {
    setLanguageOpen(false);
    if (restore) languageTrigger.current?.focus({ preventScroll: true });
  }, []);
  const choose = useCallback((item, index, event) => {
    if (item.kind === 'language') {
      event.preventDefault();
      languageTrigger.current = event.currentTarget;
      const r = event.currentTarget.getBoundingClientRect();
      setLanguagePosition({ left: Math.max(14, Math.min(r.right - 160, innerWidth - 174)), top: Math.min(r.bottom + 8, innerHeight - 62) });
      setLanguageOpen(open => !open);
    } else closeLanguage();
  }, [closeLanguage]);
  useEffect(() => {
    const key = event => {
      const trigger = event.target.closest?.('[data-kind="language"]');
      if (trigger && event.key === 'ArrowDown' && !languageOpen) {
        event.preventDefault();
        choose({ kind: 'language' }, 7, { preventDefault() {}, currentTarget: trigger });
      }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [languageOpen, choose]);
  useEffect(() => {
    const sync = () => setActiveHref(location.hash);
    addEventListener('hashchange', sync);
    return () => removeEventListener('hashchange', sync);
  }, []);
  useLayoutEffect(() => {
    if (languageOpen) languageMenu.current?.querySelector('button')?.focus({ preventScroll: true });
  }, [languageOpen]);
  useEffect(() => {
    if (!languageOpen) return;
    const pointer = event => { if (!languageMenu.current?.contains(event.target) && !languageTrigger.current?.contains(event.target)) closeLanguage(); };
    const key = event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); closeLanguage(true); }
    };
    const scroll = () => closeLanguage();
    document.addEventListener('pointerdown', pointer);
    document.addEventListener('keydown', key, true);
    addEventListener('scroll', scroll, { passive: true });
    addEventListener('resize', scroll);
    return () => { document.removeEventListener('pointerdown', pointer); document.removeEventListener('keydown', key, true); removeEventListener('scroll', scroll); removeEventListener('resize', scroll); };
  }, [languageOpen, closeLanguage]);

  const items = [
    { label: 'Hotels', href: '#hotels' },
    { label: 'Deals', href: '#offers' },
    { label: 'Meetings', href: 'https://www.harperhotels.com/meetings' },
    { label: 'Weddings', href: 'https://www.harperhotels.com/en/weddings' },
    { label: 'News', href: '#journal' },
    { label: 'Book Now', href: '#booking-form', kind: 'booking' },
    { label: '', href: '#membership', kind: 'membership', ariaLabel: 'Archipelago Membership', icon: <img className="header-membership-logo" src="./assets/membership-mark.png" alt="" aria-hidden="true" /> },
    { label: '', kind: 'language', ariaLabel: 'Language: English', popup: 'menu', controls: 'nav-language-menu', expanded: languageOpen, keepMenuOpen: true, icon: <span className="header-language-label">EN <Chevron /></span> }
  ];
  return <div className="header-nav-content">
    {collapsed && <a className="header-book-shortcut nav-book" href="#booking-form" data-booking-open>Book Now</a>}
    <PillNav items={items} activeHref={activeHref} linkComponent={HeaderLink} theme="light" layout="split" itemStyle="pill" hoverEffect="fill" indicator="none" surface="glass" size="md" intro={false} collapse="auto" highlightColor="#f08b1d" highlightTextColor="#242424" textColor="#242424" barColor="#fff8ef" onItemClick={choose} onMenuToggle={menuChange} onCollapseChange={setCollapsed} ariaLabel="Main navigation" style={{ '--pn-h': '48px', '--pn-inner': '40px', '--pn-x': '14px', '--pn-font': '14px', '--pn-surface': 'rgba(255,248,239,.96)', '--pn-blur': 'blur(12px)', '--pn-tile': '#fffaf3', '--pn-tile-rim': 'inset 0 0 0 1px rgba(128,130,133,.16), inset 0 1px 0 #fff', '--pn-shadow': '0 3px 14px #574c3d0a', '--pn-edge': '#80828526', '--pn-rim': '#ffffff80', '--pn-ring': '#a64c00', '--pn-row-hover': '#f08b1d14' }}>
      {languageOpen && <div ref={languageMenu} className="header-language-menu" id="nav-language-menu" role="menu" aria-label="Choose language" style={languagePosition}><button type="button" role="menuitemradio" aria-checked="true" onClick={() => { document.documentElement.lang = 'en'; closeLanguage(true); }}>English <span aria-hidden="true">✓</span></button></div>}
    </PillNav>
  </div>;
}

const mount = document.getElementById('primary-links');
if (mount) flushSync(() => createRoot(mount).render(<HeaderNavigation />));
