import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

const navItems = [
  { label: 'Why Us', href: '#about' },
  { label: 'Programs', href: '#care-categories' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Stories', href: '#stories' },
];

const mobileDrawerItems = [...navItems];

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
      <div className="bg-nb-teal-dark text-nb-paper">
        <div className="mx-auto flex max-w-content flex-col items-center justify-center gap-1 px-6 py-2 text-center sm:flex-row sm:justify-between sm:gap-6 sm:px-8 sm:text-left">
          <p className="min-w-0 text-[12.5px] font-normal leading-5 tracking-[0.02em] text-white/85">
            Now welcoming new patients across our care programs
          </p>
          <a href="#care-categories" className="shrink-0 text-[12.5px] font-medium tracking-[0.02em] text-white/85 underline decoration-white/30 underline-offset-4 transition hover:text-white hover:decoration-white">
            Explore programs
          </a>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-nb-teal-dark/30 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-hidden={!isOpen}
        onClick={closeDrawer}
      />

      <header className="sticky top-0 z-50 border-b border-nb-line/70 bg-white/95 shadow-[0_12px_30px_rgba(6,42,32,0.06)] backdrop-blur-md">
        <div className="mx-auto grid max-w-content grid-cols-[1fr_auto] items-center gap-4 px-6 py-4 sm:px-8 lg:grid-cols-[1fr_auto_1fr] lg:gap-8 lg:px-10 lg:py-5">
          <a href="#top" aria-label="Northbridge Health — home" className="flex items-center gap-3 justify-self-start rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-nb-teal">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-nb-teal font-serif text-sm font-bold text-white shadow-[0_8px_18px_rgba(10,60,46,0.22)]">
              N
            </span>
            <span className="leading-tight">
              <span className="block font-serif text-[19px] font-semibold tracking-tight text-nb-teal">Northbridge Health</span>
              <span className="block text-[11px] font-medium uppercase tracking-[0.18em] text-nb-sage">Women + Family Care</span>
            </span>
          </a>

          <nav aria-label="Primary" className="hidden items-center justify-center gap-10 text-[15px] font-medium tracking-[0.01em] text-nb-ink/70 lg:flex lg:justify-self-center">
            {navItems.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="relative rounded-sm px-1 py-2 transition-colors duration-200 hover:text-nb-teal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-nb-teal after:absolute after:inset-x-1 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-nb-teal after:transition-transform after:duration-200 hover:after:scale-x-100 focus-visible:after:scale-x-100"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3 justify-self-end">
            <a
              href="#contact-section"
              className="hidden rounded-full bg-nb-teal px-7 py-3 text-[14px] font-semibold tracking-[0.01em] text-white shadow-[0_10px_24px_rgba(10,60,46,0.22)] transition-all duration-200 hover:-translate-y-px hover:bg-nb-teal-dark hover:shadow-[0_14px_28px_rgba(10,60,46,0.26)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nb-teal lg:inline-flex"
            >
              Contact Us
            </a>
            <button
              type="button"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation-drawer"
              onClick={() => setIsOpen((open) => !open)}
              className="inline-flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-nb-line bg-white text-nb-teal shadow-[0_6px_16px_rgba(6,42,32,0.08)] transition hover:border-nb-teal/30 hover:bg-nb-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nb-teal lg:hidden"
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
        aria-hidden={!isOpen}
        className={`fixed right-0 top-0 z-50 flex h-full w-[84vw] max-w-[340px] flex-col border-l border-nb-line/70 bg-white shadow-[0_20px_40px_rgba(6,42,32,0.22)] transition-all duration-300 ease-out lg:hidden ${isOpen ? 'visible translate-x-0 opacity-100' : 'invisible translate-x-full opacity-0'}`}
      >
        <div className="flex items-center justify-between border-b border-nb-line/60 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-nb-teal font-serif text-[13px] font-bold text-white">
              N
            </span>
            <span className="block font-serif text-[17px] font-semibold tracking-tight text-nb-teal">Northbridge Health</span>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeDrawer}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-nb-line bg-white text-xl leading-none text-nb-teal transition hover:bg-nb-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nb-teal"
          >
            ×
          </button>
        </div>

        <nav className="flex flex-col gap-1.5 px-5 pb-2 pt-5 text-[16px] font-medium text-nb-ink" aria-label="Mobile navigation links">
          {mobileDrawerItems.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={closeDrawer}
              className="rounded-2xl px-4 py-3.5 transition-colors duration-200 hover:bg-nb-sand/70 hover:text-nb-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nb-teal"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="mt-auto px-5 pb-6 pt-4">
          <a href="#contact-section" onClick={closeDrawer} className="flex w-full items-center justify-center gap-2 rounded-full bg-nb-teal px-6 py-3.5 text-sm font-semibold tracking-[0.01em] text-white shadow-[0_10px_24px_rgba(10,60,46,0.22)] transition hover:bg-nb-teal-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nb-teal">
            Contact Us <ArrowRight className="h-4 w-4" />
          </a>
          <p className="mt-4 text-center text-xs leading-5 text-nb-ink/55">Coordinated care for women and families</p>
        </div>
      </aside>
    </>
  );
}
