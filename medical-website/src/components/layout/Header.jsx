const navItems = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#care-categories' },
  // Stories and Team do not have dedicated sections/pages yet, so keep them on the homepage until those destinations are implemented.
  { label: 'Stories', href: '/' },
  { label: 'Team', href: '/' },
];

export default function Header() {
  return (
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
            aria-label="Open menu"
            className="inline-flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-nb-line bg-white text-nb-teal lg:hidden"
          >
            <span className="block h-0.5 w-5 rounded-full bg-current" />
            <span className="block h-0.5 w-5 rounded-full bg-current" />
            <span className="block h-0.5 w-5 rounded-full bg-current" />
          </button>
        </div>
      </div>

      <div className="border-t border-nb-line px-4 py-3 lg:hidden">
        <div className="flex flex-col gap-3 text-sm font-medium text-nb-ink">
          {navItems.map(({ label, href }) => (
            <a key={label} href={href} className="py-1 hover:text-nb-teal">
              {label}
            </a>
          ))}
          <a href="#contact-section" className="mt-2 rounded-full bg-nb-teal px-5 py-2.5 font-semibold text-white text-center">
            Contact us
          </a>
        </div>
      </div>
    </header>
  );
}
