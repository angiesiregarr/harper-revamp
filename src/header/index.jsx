import React, { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync, createPortal } from 'react-dom';
import PillNav from './PillNav';
import StaggeredMenu from './StaggeredMenu';
import './HarperHeader.css';

const languages = [{ code: 'id', label: 'Indonesia', short: 'ID' }, { code: 'en', label: 'English', short: 'EN' }, { code: 'es', label: 'Español', short: 'ES' }];
const Chevron = () => <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m5 7.5 5 5 5-5" /></svg>;
const HeaderLink = forwardRef(function HeaderLink({ href, className = '', ...props }, ref) {
  const external = href?.startsWith('https://');
  const booking = href === '#booking-form';
  return <a ref={ref} href={href} {...props} className={`${className}${booking ? ' nav-book' : ''}`} data-booking-open={booking ? '' : undefined} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} />;
});

function HeaderNavigation() {
  const [collapsed, setCollapsed] = useState(false);
  const [phone, setPhone] = useState(() => matchMedia('(max-width:700px)').matches);
  useEffect(() => {
    const query = matchMedia('(max-width:700px)');
    const sync = () => { setPhone(query.matches); setLanguageOpen(false); };
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [language, setLanguage] = useState(() => {
    try { return languages.find(item => item.code === localStorage.getItem('harper-language')) || languages[1]; } catch { return languages[1]; }
  });
  const selectLanguage = option => {
    setLanguage(option);
    try { localStorage.setItem('harper-language', option.code); } catch {}
    dispatchEvent(new CustomEvent('harper-language-change', { detail: { language: option.code } }));
    closeLanguage(true);
  };
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
      setLanguagePosition({ left: Math.max(14, Math.min(r.right - 160, innerWidth - 174)), top: Math.min(r.bottom + 8, innerHeight - 156) });
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
    if (languageOpen) languageMenu.current?.querySelector('[aria-checked="true"]')?.focus({ preventScroll: true });
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
    { label: 'Offers', href: '#offers' },
    { label: 'Meetings', href: 'https://www.harperhotels.com/meetings' },
    { label: 'Weddings', href: 'https://www.harperhotels.com/en/weddings' },
    { label: 'News', href: '#journal' },
    { label: 'Book Now', href: '#booking-form', kind: 'booking' },
    { label: '', href: '#membership', kind: 'membership', ariaLabel: 'Archipelago Membership', icon: <img className="header-membership-logo" src="./assets/archipelago-membership-nav.svg" alt="" aria-hidden="true" /> },
    { label: '', kind: 'language', ariaLabel: `Language: ${language.label}`, popup: 'menu', controls: 'nav-language-menu', expanded: languageOpen, keepMenuOpen: true, icon: <span className="header-language-label">{language.short} <Chevron /></span> }
  ];
  return <div className="header-nav-content">
    {!phone && collapsed && <a className="header-book-shortcut nav-book" href="#booking-form" data-booking-open>Book Now</a>}
    {phone ? <StaggeredMenu items={items} onMenuToggle={menuChange} onLanguageClick={choose} languageOpen={languageOpen} /> : <PillNav items={items} activeHref={activeHref} linkComponent={HeaderLink} theme="light" layout="split" itemStyle="plain" hoverEffect="fill" indicator="none" surface="none" size="md" intro={false} collapse="auto" centerItemsCount={5} highlightColor="#f08b1d" highlightTextColor="#ffffff" textColor="#242424" barColor="#fff8ef" onItemClick={choose} onMenuToggle={menuChange} onCollapseChange={setCollapsed} ariaLabel="Main navigation" style={{ '--pn-h': '48px', '--pn-inner': '40px', '--pn-x': '14px', '--pn-font': '14px', '--pn-surface': 'transparent', '--pn-blur': 'none', '--pn-text': '#242424', '--pn-tile': 'transparent', '--pn-tile-rim': 'none', '--pn-shadow': 'none', '--pn-edge': 'transparent', '--pn-rim': 'transparent', '--pn-ring': '#f08b1d', '--pn-row-hover': '#f08b1d'  }}>

    </PillNav>}
      {languageOpen && createPortal(<div ref={languageMenu} className={`header-language-menu${phone ? ' header-language-menu--sidebar' : ''}`} id="nav-language-menu" role="menu" aria-label="Choose language" style={languagePosition} onKeyDown={event => {
        const buttons = [...languageMenu.current.querySelectorAll('button')];
        const index = buttons.indexOf(document.activeElement);
        if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Tab'].includes(event.key)) {
          event.preventDefault();
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey) ? -1 : 1) + buttons.length) % buttons.length;
          buttons[next].focus({ preventScroll: true });
        }
      }}>{languages.map(option => <button key={option.code} type="button" role="menuitemradio" aria-checked={language.code === option.code} onClick={() => selectLanguage(option)}>{option.label}<span aria-hidden="true">{language.code === option.code ? '✓' : ''}</span></button>)}</div>, document.body)}
  </div>;
}

const mount = document.getElementById('primary-links');
if (mount) flushSync(() => createRoot(mount).render(<HeaderNavigation />));
