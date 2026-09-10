import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, X } from 'lucide-react';
import { categories } from '../../data/categories';

const ANNOUNCEMENT_TEXT =
  'LIVE AMA - SEPT 16 | Countdown to Unbundling: What You Need to Know for 2027 | Register now \u2192';
const forYouCards = categories.slice(0, 4);

const whyInfoLinks = [
  { label: 'Why Us', href: '#about' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Stories', href: '#stories' },
  { label: 'Book a visit', href: '#appointment-form' },
];
const whyProgramLinks = categories.map((c) => ({ label: c.title, href: '#care-categories' }));
const whyExtensionLinks = [
  { label: 'For Employers', href: '#contact-section' },
  { label: 'For Health Plans', href: '#contact-section' },
  { label: 'For Individuals', href: '#appointment-form' },
  { label: 'Contact Us', href: '#contact-section' },
];
const resourceLinks = [
  { label: 'Care guides', href: '#care-categories', desc: 'Fertility, maternity and more' },
  { label: 'How it works', href: '#how-it-works', desc: 'Getting started' },
  { label: 'Member stories', href: '#stories', desc: 'Real family experiences' },
  { label: 'Why Northbridge', href: '#about', desc: 'Our clinical approach' },
];
const mobileDrawerItems = [
  { label: 'For You', href: '#care-categories' },
  { label: 'Why Northbridge', href: '#about' },
  { label: 'Resources', href: '#stories' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Stories', href: '#stories' },
];

export default function Header() {
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [displayedDropdown, setDisplayedDropdown] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const closeTimer = useRef(null);
  const hideTimer = useRef(null);

  const openMenu = (name) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setDisplayedDropdown(name);
    setOpenDropdown(name);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    closeTimer.current = setTimeout(() => {
      setOpenDropdown(null);
      hideTimer.current = setTimeout(() => setDisplayedDropdown(null), 200);
    }, 160);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
  };

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        if (hideTimer.current) clearTimeout(hideTimer.current);
        setOpenDropdown(null);
        setDisplayedDropdown(null);
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    },
    [],
  );

  const closeDrawer = () => setIsOpen(false);
  const closeMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setOpenDropdown(null);
    setDisplayedDropdown(null);
  };
  const toggleMenu = (name) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (openDropdown === name) {
      setOpenDropdown(null);
      setDisplayedDropdown(null);
    } else {
      setDisplayedDropdown(name);
      setOpenDropdown(name);
    }
  };
  const triggerClass = (name) =>
    `relative flex items-center gap-1.5 rounded-sm px-1 py-2 text-[14px] font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B6B5D] after:absolute after:inset-x-1 after:-bottom-0.5 after:h-0.5 after:origin-left after:transition-transform after:duration-200 ${
      openDropdown === name
        ? 'text-[#0B6B5D] after:scale-x-100 after:bg-[#0B6B5D]'
        : 'text-[#111827] after:scale-x-0 after:bg-[#0B6B5D] hover:text-[#0B6B5D]'
    }`;

  return (
    <>
      {announcementVisible && (
        <div className="relative flex h-10 items-center justify-center overflow-hidden bg-[#8ED8F8] px-10 text-center">
          <p className="max-w-[1180px] truncate whitespace-nowrap text-[12px] font-bold leading-5 tracking-[0.01em] text-[#0A2E28]">
            {ANNOUNCEMENT_TEXT}
          </p>
          <button
            type="button"
            aria-label="Dismiss announcement"
            onClick={() => setAnnouncementVisible(false)}
            className="absolute right-4 inline-flex h-6 w-6 items-center justify-center rounded-full text-[#0A2E28] transition hover:bg-black/10"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div
        className={`fixed inset-0 z-40 bg-[#0A2E28]/30 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-hidden={!isOpen}
        onClick={closeDrawer}
      />

      <div className="sticky top-0 z-50 -mb-[76px] overflow-visible bg-transparent px-4 pt-3 sm:px-6 sm:pt-3">
        <header className="relative z-50 mx-auto flex h-16 w-[92%] max-w-[1180px] items-center justify-between gap-3 rounded-[8px] border border-[#E5E7EB] bg-white py-0 pl-5 pr-3 shadow-[0_4px_24px_rgba(0,0,0,0.08)] sm:pr-5 md:w-[80%]">
          <a href="#top" aria-label="Northbridge Health — home" className="flex shrink-0 items-center gap-2.5 rounded-lg">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A3D36] font-serif text-[13px] font-bold text-white">
              N
            </span>
            <span className="leading-tight">
              <span className="block font-serif text-[17px] font-semibold tracking-tight text-[#0A2E28]">Northbridge Health</span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-[#0B6B5D]">Women + Family Care</span>
            </span>
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex" onMouseLeave={scheduleClose}>
            <div onMouseEnter={() => openMenu('for-you')}>
              <button type="button" aria-expanded={openDropdown === 'for-you'} onClick={() => toggleMenu('for-you')} className={triggerClass('for-you')}>
                For You <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
            <div onMouseEnter={() => openMenu('why')}>
              <button type="button" aria-expanded={openDropdown === 'why'} onClick={() => toggleMenu('why')} className={triggerClass('why')}>
                Why Northbridge <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
            <div onMouseEnter={() => openMenu('resources')}>
              <button type="button" aria-expanded={openDropdown === 'resources'} onClick={() => toggleMenu('resources')} className={triggerClass('resources')}>
                Resources <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
            <a href="#how-it-works" onMouseEnter={() => openMenu(null)} className="px-1 py-2 text-[14px] font-medium text-[#111827] hover:text-[#0B6B5D]">How it works</a>
            <a href="#stories" onMouseEnter={() => openMenu(null)} className="px-1 py-2 text-[14px] font-medium text-[#111827] hover:text-[#0B6B5D]">Stories</a>
          </nav>

          <div className="hidden shrink-0 items-center gap-2.5 lg:flex">
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/login');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="rounded-full border border-[#0B6B5D] px-5 py-2 text-[14px] font-medium text-[#0B6B5D] transition hover:bg-[#0B6B5D] hover:text-white"
            >
              Login
            </a>
            <a href="#appointment-form" className="rounded-[6px] bg-[#0B7A69] px-5 py-2 text-[14px] font-semibold text-white transition hover:bg-[#0A3D36]">Get care</a>
          </div>
            <button
              type="button"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation-drawer"
              onClick={() => setIsOpen((open) => !open)}
              className="inline-flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white text-[#0A2E28] lg:hidden"
            >
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
          </button>
          <div onMouseEnter={cancelClose} onMouseLeave={scheduleClose} onFocus={cancelClose} className={`absolute left-1/2 top-full hidden w-max max-w-[calc(100vw-3rem)] -translate-x-1/2 pt-3 transition-all duration-200 ease-out lg:block ${openDropdown ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0 pointer-events-none'}`}>
            {displayedDropdown === 'for-you' && (
              <div className="w-[800px] max-w-[calc(100vw-3rem)] rounded-[12px] bg-white p-4 shadow-2xl ring-1 ring-black/5">
                <div className="flex items-center justify-between px-2 pb-3 pt-1">
                  <p className="font-serif text-[13px] italic text-[#0B6B5D]">Care by life stage</p>
                  <p className="font-serif text-[13px] italic text-[#0B6B5D]">Popular right now</p>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {forYouCards.map((card, i) => (
                    <a key={card.id} href="#care-categories" onClick={closeMenu} style={{ animationDelay: `${i * 30}ms` }} className="nb-drop-item group relative block h-[220px] w-full max-w-[180px] justify-self-center overflow-hidden rounded-[8px] bg-[#0A2E28] transition-all duration-200 hover:-translate-y-0.5">
                      <img src={card.image} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                      <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#0A3D36] px-2.5 py-1 text-[10px] font-semibold text-[#7AF0C0]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#7AF0C0]" />
                        {card.badge || 'Care'}
                      </span>
                      <span className="absolute inset-x-3 bottom-3 block text-[14px] font-semibold leading-5 text-white">{card.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {displayedDropdown === 'why' && (
              <div className="w-[720px] max-w-[calc(100vw-3rem)] rounded-[12px] bg-white p-5 shadow-2xl ring-1 ring-black/5">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">Northbridge</p>
                    <ul>
                      {whyInfoLinks.map((link) => (
                        <li key={link.label}><a href={link.href} onClick={closeMenu} className="block px-2 py-1.5 text-[14px] leading-8 text-[#111827] hover:text-[#0B6B5D]">{link.label}</a></li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">Programs / Care Areas</p>
                    <ul>
                      {whyProgramLinks.map((link) => (
                        <li key={link.label}><a href={link.href} onClick={closeMenu} className="block px-2 py-1.5 text-[14px] leading-8 text-[#111827] hover:text-[#0B6B5D]">{link.label}</a></li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">Program Extensions</p>
                    <ul>
                      {whyExtensionLinks.map((link) => (
                        <li key={link.label}><a href={link.href} onClick={closeMenu} className="block px-2 py-1.5 text-[14px] leading-8 text-[#111827] hover:text-[#0B6B5D]">{link.label}</a></li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            {displayedDropdown === 'resources' && (
              <div className="w-[640px] max-w-[calc(100vw-3rem)] rounded-[12px] bg-white p-5 shadow-2xl ring-1 ring-black/5">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">Resources</p>
                    <ul>
                      {resourceLinks.map((link) => (
                        <li key={link.label}><a href={link.href} onClick={closeMenu} className="block rounded-xl px-3 py-2.5 hover:bg-[#0B6B5D]/5"><span className="block text-[14px] font-medium text-[#111827]">{link.label}</span><span className="block text-[13px] text-[#6B7280]">{link.desc}</span></a></li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl bg-[#FFFBF4] p-4 ring-1 ring-[#E5E7EB]">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">Featured Resource</p>
                    <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=240&q=60" alt="Featured Northbridge care guide" loading="lazy" width={120} height={80} className="mt-3 h-[80px] w-[120px] rounded-[6px] object-cover" />
                    <p className="mt-3 text-[14px] font-semibold leading-6 text-[#111827]">Your guide to coordinated family care</p>
                    <a href="#about" onClick={closeMenu} className="mt-1 inline-flex items-center gap-1 text-[14px] font-semibold text-[#0B6B5D] hover:underline">Read the guide <ArrowRight className="h-3.5 w-3.5" /></a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>
      </div>
      <style>{`
        .nb-drop-item { opacity: 0; transform: translateY(6px); animation: nb-drop-in 200ms ease-out forwards; }
        @keyframes nb-drop-in { to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) { .nb-drop-item { opacity: 1; transform: none; animation: none; } }
      `}</style>

      <aside
        id="mobile-navigation-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        aria-hidden={!isOpen}
        className={`fixed right-0 top-0 z-50 flex h-full w-[84vw] max-w-[340px] flex-col border-l border-[#E5E7EB] bg-white shadow-[0_20px_40px_rgba(6,42,32,0.22)] transition-all duration-300 ease-out lg:hidden ${isOpen ? 'visible translate-x-0 opacity-100' : 'invisible translate-x-full opacity-0'}`}
      >
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A3D36] font-serif text-[13px] font-bold text-white">
              N
            </span>
            <span className="block font-serif text-[17px] font-semibold tracking-tight text-[#0A2E28]">Northbridge Health</span>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeDrawer}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-xl leading-none text-[#0A2E28] transition hover:bg-[#FFFBF4]"
          >
            ×
          </button>
        </div>

        <nav className="flex flex-col gap-1.5 px-5 pb-2 pt-5 text-[16px] font-medium text-[#111827]" aria-label="Mobile navigation links">
          {mobileDrawerItems.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={closeDrawer}
              className="rounded-2xl px-4 py-3.5 transition-colors duration-200 hover:bg-[#0B6B5D]/5 hover:text-[#0B6B5D]"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="mt-auto px-5 pb-6 pt-4">
          <a href="#appointment-form" onClick={closeDrawer} className="flex w-full items-center justify-center gap-2 rounded-[6px] bg-[#0B7A69] px-6 py-3.5 text-sm font-semibold tracking-[0.01em] text-white transition hover:bg-[#0A3D36]">
            Get care <ArrowRight className="h-4 w-4" />
          </a>
          <p className="mt-4 text-center text-xs leading-5 text-[#111827]/55">Coordinated care for women and families</p>
        </div>
      </aside>
    </>
  );
}
