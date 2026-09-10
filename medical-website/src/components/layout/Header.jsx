import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

const navItems = [
  { label: 'Why Us', href: '#about' },
  { label: 'Programs', href: '#care-categories' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Stories', href: '#stories' },
];

const mobileDrawerItems = [...navItems, { label: 'Get care', href: '#appointment-form' }];

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
      <div className="bg-maven-pine-dark text-center text-[13px] font-medium text-maven-paper">
        <div className="mx-auto flex max-w-content items-center justify-center gap-2 px-4 py-2.5 sm:px-6 lg:px-8">
          <span className="hidden rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] sm:inline">New</span>
          <p className="truncate">
            Now offering 24/7 virtual care + same-week appointments
            <a href="#appointment-form" className="ml-2 inline-flex items-center gap-1 font-semibold underline decoration-maven-clay decoration-2 underline-offset-4">
              Get care
            </a>
          </p>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-maven-pine-dark/30 transition-opacity duration-300 lg:hidden ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-hidden={!isOpen}
        onClick={closeDrawer}
      />

      <header className="sticky top-0 z-50 border-b border-maven-line/70 bg-maven-paper/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-maven-pine font-serif text-sm font-bold text-white">
              N
            </div>
            <div className="leading-tight">
              <div className="font-serif text-[19px] font-semibold tracking-tight text-maven-pine">Northbridge Health</div>
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-maven-moss">Women + Family Care</div>
            </div>
          </a>

          <nav className="hidden items-center gap-7 text-[15px] font-medium text-maven-pine/80 lg:flex">
            {navItems.map(({ label, href }) => (
              <a key={label} href={href} className="transition hover:text-maven-pine">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <a href="#contact-section" className="hidden text-sm font-semibold text-maven-pine underline-offset-4 hover:underline md:inline-flex">
              Log in
            </a>
            <a href="#appointment-form" className="hidden rounded-full bg-maven-clay px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(232,93,63,0.3)] transition hover:-translate-y-0.5 hover:bg-maven-clay-dark sm:inline-flex">
              Get care
            </a>
            <button
              type="button"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation-drawer"
              onClick={() => setIsOpen((open) => !open)}
              className="inline-flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-maven-line bg-white text-maven-pine lg:hidden"
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
        className={`fixed right-0 top-0 z-50 h-full w-[84vw] max-w-[340px] border-l border-maven-line bg-maven-paper p-5 shadow-[0_20px_40px_rgba(6,42,32,0.22)] transition-transform duration-300 ease-out lg:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="font-serif text-lg font-semibold text-maven-pine">Menu</div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeDrawer}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-maven-line bg-white text-lg text-maven-pine"
          >
            ×
          </button>
        </div>

        <nav className="flex flex-col gap-1.5 text-[16px] font-medium text-maven-pine" aria-label="Mobile navigation links">
          {mobileDrawerItems.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={closeDrawer}
              className="rounded-2xl px-4 py-3 transition hover:bg-maven-sand"
            >
              {label}
            </a>
          ))}
        </nav>

        <a href="#appointment-form" onClick={closeDrawer} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-maven-clay px-6 py-3.5 text-sm font-semibold text-white">
          Get care <ArrowRight className="h-4 w-4" />
        </a>
        <p className="mt-4 text-center text-xs leading-5 text-maven-pine/60">Free with many employers + health plans</p>
      </aside>
    </>
  );
}
