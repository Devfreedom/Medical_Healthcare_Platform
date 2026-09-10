import { useEffect, useState } from 'react';

const navItems = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#care-categories' },
  // Stories and Team do not have dedicated sections/pages yet, so keep them on the homepage until those destinations are implemented.
  { label: 'Stories', href: '/' },
  { label: 'Team', href: '/' },
];

const mobileDrawerItems = [...navItems, { label: 'Contact us', href: '#contact-section' }];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = isOpen ? 'hidden' : '';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const closeDrawer = () => setIsOpen(false);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-nb-ink/20 transition-opacity duration-300 lg:hidden ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-hidden={!isOpen}
        onClick={closeDrawer}
      />

      <header className="sticky top-0 z-50 border-b border-nb-line bg-nb-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-content items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-nb-teal text-sm font-semibold text-white">
              NH
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-nb-teal">Northbridge Health</div>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium text-nb-ink/80 lg:flex">
            {navItems.map(({ label, href }) => (
              <a key={label} href={href} className="transition hover:text-nb-teal">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a href="#contact-section" className="hidden rounded-full bg-nb-teal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-nb-ink sm:inline-flex">
              Contact us
            </a>
            <button
              type="button"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation-drawer"
              onClick={() => setIsOpen((open) => !open)}
              className="inline-flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-nb-line bg-white text-nb-teal lg:hidden"
            >
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
            </button>
          </div>
        </div>
      </header>

      <aside
        id="mobile-navigation-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={`fixed right-0 top-0 z-50 h-full w-[82vw] max-w-[320px] border-l border-nb-line bg-nb-paper p-5 shadow-[0_20px_40px_rgba(19,42,44,0.18)] transition-transform duration-300 ease-out lg:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="text-base font-semibold text-nb-teal">Menu</div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeDrawer}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-nb-line bg-white text-lg text-nb-ink"
          >
            ×
          </button>
        </div>

        <nav className="flex flex-col gap-2 text-base font-medium text-nb-ink" aria-label="Mobile navigation links">
          {mobileDrawerItems.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={closeDrawer}
              className="rounded-xl px-3 py-2.5 transition hover:bg-nb-sand hover:text-nb-teal"
            >
              {label}
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
}
