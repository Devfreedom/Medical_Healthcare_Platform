const companyLinks = [
  { label: 'Why us', href: '#about' },
  { label: 'Careers (soon)', href: null },
  { label: 'Press (soon)', href: null },
  { label: 'Providers (soon)', href: null },
];
const serviceLinks = [
  { label: 'Primary Care', href: '#care-categories' },
  { label: 'Maternity & Newborn', href: '#care-categories' },
  { label: 'Parenting & Pediatrics', href: '#care-categories' },
  { label: "Women's Health", href: '#care-categories' },
];
const quickLinks = [
  { label: 'Get care', href: '/register' },
  { label: 'Explore platform', href: '#care-categories' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Sign in', href: '/login' },
];

const socialIcons = [
  { label: 'Instagram', symbol: '◎' },
  { label: 'Facebook', symbol: 'f' },
  { label: 'LinkedIn', symbol: 'in' },
  { label: 'X', symbol: 'x' },
];

function FooterLink({ label, href }) {
  if (!href) {
    return <span className="text-white/40">{label}</span>;
  }
  if (href.startsWith('/')) {
    return (
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault();
          window.history.pushState({}, '', href);
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}
        className="hover:text-white"
      >
        {label}
      </a>
    );
  }
  return (
    <a href={href} className="hover:text-white">
      {label}
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="bg-maven-pine-dark text-white/75">
      <div className="mx-auto max-w-content px-4 pb-8 pt-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <div className="mb-4 font-serif text-2xl font-semibold tracking-tight text-white">Northbridge Health</div>
            <p className="max-w-xs text-sm leading-6 text-white/70">
              General healthcare for everyone — personal, proven, all in one place.
            </p>
            <a
              href="/register"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/register');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-maven-clay px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-maven-clay-dark"
            >
              Get care →
            </a>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Company</h3>
            <ul className="space-y-3 text-sm text-white/70">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink label={link.label} href={link.href} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Programs</h3>
            <ul className="space-y-3 text-sm text-white/70">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink label={link.label} href={link.href} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Quick Links</h3>
            <ul className="space-y-3 text-sm text-white/70">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink label={link.label} href={link.href} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Contact</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li>hello@northbridgehealth.com</li>
              <li>+1 (415) 288-4200</li>
            </ul>
            <div className="mt-5 flex items-center gap-3">
              {socialIcons.map(({ label, symbol }) => (
                <span
                  key={label}
                  aria-label={`${label} (coming soon)`}
                  title="Coming soon"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xs font-semibold text-white/80"
                >
                  {symbol}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-white/60">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>© 2026 Northbridge Health. All rights reserved.</div>
            <div>Frontend prototype — backend connection coming soon.</div>
          </div>
        </div>

        <div className="mt-6 text-center text-[clamp(2.4rem,7vw,7rem)] font-serif leading-none tracking-[-0.06em] text-white/10">
          Northbridge Health
        </div>
      </div>
    </footer>
  );
}
